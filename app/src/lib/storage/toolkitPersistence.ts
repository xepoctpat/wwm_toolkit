import { z } from "zod";

export const LEGACY_TOOLKIT_STORAGE_KEYS = ["wwm-toolkit-state-v4", "wwm-toolkit-state-v3"] as const;
export const LEGACY_TOOLKIT_STORAGE_KEY = LEGACY_TOOLKIT_STORAGE_KEYS[0];
export const FOUNDATION_LOCAL_STORAGE_KEY = "wwm-toolkit-foundation-state-v1";

const FOUNDATION_INDEXED_DB_NAME = "wwm-toolkit-foundation";
const FOUNDATION_INDEXED_DB_VERSION = 1;
const FOUNDATION_INDEXED_DB_STORE = "snapshots";
const FOUNDATION_INDEXED_DB_KEY = "foundation";
const MAX_CUSTOM_MAP_DATA_URL_LENGTH = 5_000_000;
const SAFE_CUSTOM_MAP_DATA_URL_PATTERN = /^data:image\/(?:png|jpe?g|webp|gif|avif);base64,[a-z0-9+/]+=*$/i;

const progressStatusSchema = z.enum(["untracked", "working", "solved"]);
const stringArraySchema = z.array(z.string());
const stringRecordSchema = z.record(z.string());
const npcProgressSchema = z.record(progressStatusSchema);

const rawLegacyToolkitStateSchema = z
    .object({
        favorites: z.array(z.unknown()).default([]),
        npcProgress: z.record(z.unknown()).default({}),
        npcNotes: z.record(z.unknown()).default({}),
        customMaps: z.record(z.unknown()).default({}),
    })
    .passthrough();

const toolkitFoundationSnapshotSchema = z.object({
    schemaVersion: z.literal(1),
    importedAt: z.string().nullable(),
    lastSyncedAt: z.string(),
    source: z.enum(["legacy-localstorage", "foundation-defaults"]),
    favorites: stringArraySchema,
    npcProgress: npcProgressSchema,
    npcNotes: stringRecordSchema,
    customMaps: stringRecordSchema,
});

export type ToolkitProgressStatus = z.infer<typeof progressStatusSchema>;
export type ToolkitFoundationSnapshot = z.infer<typeof toolkitFoundationSnapshotSchema>;
export type ToolkitPersistenceKind = "indexeddb" | "localstorage" | "none";

export interface LegacyToolkitState {
    favorites: string[];
    npcProgress: Record<string, ToolkitProgressStatus>;
    npcNotes: Record<string, string>;
    customMaps: Record<string, string>;
}

export interface ToolkitPersistenceAdapter {
    kind: Exclude<ToolkitPersistenceKind, "none">;
    load(): Promise<unknown | null>;
    save(snapshot: ToolkitFoundationSnapshot): Promise<void>;
}

export interface ToolkitStateCounts {
    favoriteCount: number;
    trackedNpcCount: number;
    noteCount: number;
    customMapCount: number;
}

export interface ToolkitMigrationSummary {
    backend: ToolkitPersistenceKind;
    status: "hydrated" | "imported" | "reimported" | "empty";
    legacyStateDetected: boolean;
    legacyStorageKey: string | null;
    snapshot: ToolkitFoundationSnapshot;
    counts: ToolkitStateCounts;
    message: string;
    warning?: string;
}

interface HydrateToolkitFoundationStateOptions {
    adapter: ToolkitPersistenceAdapter | null;
    legacyStateRaw?: string | null;
    legacyStorageKey?: string | null;
    now?: string;
    forceLegacyImport?: boolean;
}

interface ToolkitBrowserWindow {
    indexedDB?: IDBFactory;
    localStorage?: Storage;
}

function sanitizeStringArray(values: unknown[]) {
    return [
        ...new Set(
            values
                .filter((value): value is string => typeof value === "string")
                .map((value) => value.trim())
                .filter(Boolean),
        ),
    ];
}

function sanitizeNpcProgress(values: Record<string, unknown>) {
    return Object.fromEntries(
        Object.entries(values).filter(
            (entry): entry is [string, ToolkitProgressStatus] =>
                entry[0].trim().length > 0 && progressStatusSchema.safeParse(entry[1]).success,
        ),
    );
}

function sanitizeStringRecord(values: Record<string, unknown>) {
    return Object.fromEntries(
        Object.entries(values).filter(
            (entry): entry is [string, string] =>
                entry[0].trim().length > 0 && typeof entry[1] === "string" && entry[1].trim().length > 0,
        ),
    );
}

function isSafeCustomMapDataUrl(value: unknown): value is string {
    return (
        typeof value === "string" &&
        value.length > 0 &&
        value.length <= MAX_CUSTOM_MAP_DATA_URL_LENGTH &&
        SAFE_CUSTOM_MAP_DATA_URL_PATTERN.test(value)
    );
}

function sanitizeCustomMapRecord(values: Record<string, unknown>) {
    return Object.fromEntries(
        Object.entries(values).filter(
            (entry): entry is [string, string] => entry[0].trim().length > 0 && isSafeCustomMapDataUrl(entry[1]),
        ),
    );
}

export function normalizeLegacyToolkitState(input: z.infer<typeof rawLegacyToolkitStateSchema>): LegacyToolkitState {
    return {
        favorites: sanitizeStringArray(input.favorites),
        npcProgress: sanitizeNpcProgress(input.npcProgress),
        npcNotes: sanitizeStringRecord(input.npcNotes),
        customMaps: sanitizeCustomMapRecord(input.customMaps),
    };
}

export function parseLegacyToolkitState(raw: string | null | undefined): LegacyToolkitState | null {
    if (!raw) {
        return null;
    }

    try {
        const result = rawLegacyToolkitStateSchema.safeParse(JSON.parse(raw) as unknown);

        if (!result.success) {
            return null;
        }

        return normalizeLegacyToolkitState(result.data);
    } catch {
        return null;
    }
}

export function parseToolkitFoundationSnapshot(snapshot: unknown): ToolkitFoundationSnapshot | null {
    const result = toolkitFoundationSnapshotSchema.safeParse(snapshot);

    if (!result.success) {
        return null;
    }

    return {
        ...result.data,
        favorites: sanitizeStringArray(result.data.favorites),
        npcProgress: sanitizeNpcProgress(result.data.npcProgress),
        npcNotes: sanitizeStringRecord(result.data.npcNotes),
        customMaps: sanitizeCustomMapRecord(result.data.customMaps),
    };
}

export function createToolkitFoundationSnapshot(options?: {
    legacyState?: LegacyToolkitState | null;
    now?: string;
}): ToolkitFoundationSnapshot {
    const now = options?.now ?? new Date().toISOString();
    const legacyState = options?.legacyState ?? null;

    if (legacyState) {
        return {
            schemaVersion: 1,
            importedAt: now,
            lastSyncedAt: now,
            source: "legacy-localstorage",
            favorites: legacyState.favorites,
            npcProgress: legacyState.npcProgress,
            npcNotes: legacyState.npcNotes,
            customMaps: legacyState.customMaps,
        };
    }

    return {
        schemaVersion: 1,
        importedAt: null,
        lastSyncedAt: now,
        source: "foundation-defaults",
        favorites: [],
        npcProgress: {},
        npcNotes: {},
        customMaps: {},
    };
}

export function summarizeToolkitFoundationSnapshot(snapshot: ToolkitFoundationSnapshot): ToolkitStateCounts {
    return {
        favoriteCount: snapshot.favorites.length,
        trackedNpcCount: Object.keys(snapshot.npcProgress).length,
        noteCount: Object.keys(snapshot.npcNotes).length,
        customMapCount: Object.keys(snapshot.customMaps).length,
    };
}

function describeBackend(backend: ToolkitPersistenceKind) {
    switch (backend) {
        case "indexeddb":
            return "IndexedDB";
        case "localstorage":
            return "localStorage fallback";
        default:
            return "in-memory storage";
    }
}

function buildToolkitMigrationMessage(summary: {
    backend: ToolkitPersistenceKind;
    status: ToolkitMigrationSummary["status"];
    snapshot: ToolkitFoundationSnapshot;
    legacyStateDetected: boolean;
}) {
    const backendLabel = describeBackend(summary.backend);

    switch (summary.status) {
        case "imported":
            return `Imported the legacy prototype state into ${backendLabel}. Future foundation modules can reuse the same persisted snapshot.`;
        case "reimported":
            return `Re-imported the current legacy prototype state into ${backendLabel}. This is useful after changing favorites, notes, or custom maps in the root prototype.`;
        case "hydrated":
            if (summary.snapshot.importedAt) {
                return `Loaded the previously migrated toolkit snapshot from ${backendLabel}.`;
            }

            return `Initialized ${backendLabel} and kept an empty foundation snapshot ready for future modules.`;
        case "empty":
            if (summary.backend === "none") {
                return "No durable browser storage is available in this context, so the foundation is running with an in-memory snapshot only.";
            }

            if (summary.legacyStateDetected) {
                return `The legacy prototype state was detected, but the foundation snapshot was reset in ${backendLabel}.`;
            }

            return `No legacy prototype state was found yet. The foundation initialized an empty snapshot in ${backendLabel}.`;
    }
}

function createToolkitMigrationSummary(options: {
    backend: ToolkitPersistenceKind;
    status: ToolkitMigrationSummary["status"];
    snapshot: ToolkitFoundationSnapshot;
    legacyStateDetected: boolean;
    legacyStorageKey?: string | null;
    warning?: string;
}): ToolkitMigrationSummary {
    return {
        backend: options.backend,
        status: options.status,
        legacyStateDetected: options.legacyStateDetected,
        legacyStorageKey: options.legacyStorageKey ?? null,
        snapshot: options.snapshot,
        counts: summarizeToolkitFoundationSnapshot(options.snapshot),
        message: buildToolkitMigrationMessage(options),
        warning: options.warning,
    };
}

export async function hydrateToolkitFoundationState(
    options: HydrateToolkitFoundationStateOptions,
): Promise<ToolkitMigrationSummary> {
    const legacyState = parseLegacyToolkitState(options.legacyStateRaw ?? null);
    const now = options.now ?? new Date().toISOString();

    if (options.adapter && !options.forceLegacyImport) {
        const persistedSnapshot = parseToolkitFoundationSnapshot(await options.adapter.load());

        if (persistedSnapshot) {
            const shouldImportIntoEmptySnapshot = legacyState !== null && persistedSnapshot.importedAt === null;

            if (shouldImportIntoEmptySnapshot) {
                const snapshot = createToolkitFoundationSnapshot({ legacyState, now });
                await options.adapter.save(snapshot);

                return createToolkitMigrationSummary({
                    backend: options.adapter.kind,
                    status: "imported",
                    snapshot,
                    legacyStateDetected: true,
                    legacyStorageKey: options.legacyStorageKey,
                });
            }

            return createToolkitMigrationSummary({
                backend: options.adapter.kind,
                status: "hydrated",
                snapshot: persistedSnapshot,
                legacyStateDetected: legacyState !== null,
                legacyStorageKey: options.legacyStorageKey,
            });
        }
    }

    if (legacyState) {
        const snapshot = createToolkitFoundationSnapshot({ legacyState, now });
        await options.adapter?.save(snapshot);

        return createToolkitMigrationSummary({
            backend: options.adapter?.kind ?? "none",
            status: options.forceLegacyImport ? "reimported" : "imported",
            snapshot,
            legacyStateDetected: true,
            legacyStorageKey: options.legacyStorageKey,
        });
    }

    const snapshot = createToolkitFoundationSnapshot({ now });
    await options.adapter?.save(snapshot);

    return createToolkitMigrationSummary({
        backend: options.adapter?.kind ?? "none",
        status: "empty",
        snapshot,
        legacyStateDetected: false,
        legacyStorageKey: options.legacyStorageKey,
    });
}

function safeStorageRead(storage: Storage | undefined, key: string) {
    if (!storage) {
        return null;
    }

    try {
        return storage.getItem(key);
    } catch {
        return null;
    }
}

function findLegacyStorageEntry(storage: Storage | undefined) {
    for (const key of LEGACY_TOOLKIT_STORAGE_KEYS) {
        const raw = safeStorageRead(storage, key);

        if (raw) {
            return { key, raw };
        }
    }

    return { key: null, raw: null };
}

function createLocalStoragePersistenceAdapter(storage: Storage | undefined): ToolkitPersistenceAdapter | null {
    if (!storage) {
        return null;
    }

    return {
        kind: "localstorage",
        async load() {
            const raw = safeStorageRead(storage, FOUNDATION_LOCAL_STORAGE_KEY);

            if (!raw) {
                return null;
            }

            try {
                return JSON.parse(raw) as unknown;
            } catch {
                return null;
            }
        },
        async save(snapshot) {
            storage.setItem(FOUNDATION_LOCAL_STORAGE_KEY, JSON.stringify(snapshot));
        },
    };
}

function openFoundationDatabase(indexedDBFactory: IDBFactory) {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDBFactory.open(FOUNDATION_INDEXED_DB_NAME, FOUNDATION_INDEXED_DB_VERSION);

        request.onupgradeneeded = () => {
            const database = request.result;

            if (!database.objectStoreNames.contains(FOUNDATION_INDEXED_DB_STORE)) {
                database.createObjectStore(FOUNDATION_INDEXED_DB_STORE);
            }
        };

        request.onerror = () => {
            reject(request.error ?? new Error("Unable to open the foundation IndexedDB database."));
        };

        request.onsuccess = () => {
            resolve(request.result);
        };
    });
}

function createIndexedDbPersistenceAdapter(indexedDBFactory: IDBFactory): ToolkitPersistenceAdapter {
    return {
        kind: "indexeddb",
        async load() {
            const database = await openFoundationDatabase(indexedDBFactory);

            try {
                return await new Promise<unknown | null>((resolve, reject) => {
                    const transaction = database.transaction(FOUNDATION_INDEXED_DB_STORE, "readonly");
                    const store = transaction.objectStore(FOUNDATION_INDEXED_DB_STORE);
                    const request = store.get(FOUNDATION_INDEXED_DB_KEY);

                    request.onerror = () => {
                        reject(request.error ?? new Error("Unable to read the foundation snapshot from IndexedDB."));
                    };

                    request.onsuccess = () => {
                        resolve((request.result as unknown | undefined) ?? null);
                    };

                    transaction.onabort = () => {
                        reject(transaction.error ?? new Error("The IndexedDB read transaction was aborted."));
                    };
                });
            } finally {
                database.close();
            }
        },
        async save(snapshot) {
            const database = await openFoundationDatabase(indexedDBFactory);

            try {
                await new Promise<void>((resolve, reject) => {
                    const transaction = database.transaction(FOUNDATION_INDEXED_DB_STORE, "readwrite");
                    const store = transaction.objectStore(FOUNDATION_INDEXED_DB_STORE);

                    store.put(snapshot, FOUNDATION_INDEXED_DB_KEY);

                    transaction.oncomplete = () => {
                        resolve();
                    };

                    transaction.onerror = () => {
                        reject(transaction.error ?? new Error("Unable to persist the foundation snapshot to IndexedDB."));
                    };

                    transaction.onabort = () => {
                        reject(transaction.error ?? new Error("The IndexedDB write transaction was aborted."));
                    };
                });
            } finally {
                database.close();
            }
        },
    };
}

export async function loadToolkitMigrationSummary(options?: {
    browserWindow?: ToolkitBrowserWindow;
    forceLegacyImport?: boolean;
    now?: string;
}): Promise<ToolkitMigrationSummary> {
    const browserWindow = options?.browserWindow ?? window;
    const legacyEntry = findLegacyStorageEntry(browserWindow.localStorage);
    const localStorageAdapter = createLocalStoragePersistenceAdapter(browserWindow.localStorage);

    const hydrateWith = async (adapter: ToolkitPersistenceAdapter | null, warning?: string) => {
        const summary = await hydrateToolkitFoundationState({
            adapter,
            legacyStateRaw: legacyEntry.raw,
            legacyStorageKey: legacyEntry.key,
            forceLegacyImport: options?.forceLegacyImport,
            now: options?.now,
        });

        return warning ? { ...summary, warning } : summary;
    };

    if (browserWindow.indexedDB) {
        try {
            return await hydrateWith(createIndexedDbPersistenceAdapter(browserWindow.indexedDB));
        } catch {
            if (localStorageAdapter) {
                try {
                    return await hydrateWith(
                        localStorageAdapter,
                        "IndexedDB was unavailable in this browser context, so the foundation is using a localStorage fallback for now.",
                    );
                } catch {
                    return hydrateWith(
                        null,
                        "Browser persistence is blocked in this context, so the foundation is running with an in-memory snapshot only.",
                    );
                }
            }
        }
    }

    if (localStorageAdapter) {
        try {
            return await hydrateWith(
                localStorageAdapter,
                "IndexedDB is unavailable in this browser context, so the foundation is using a localStorage fallback for now.",
            );
        } catch {
            return hydrateWith(
                null,
                "Browser persistence is blocked in this context, so the foundation is running with an in-memory snapshot only.",
            );
        }
    }

    return hydrateWith(
        null,
        "No browser persistence API is available in this context, so the foundation is running with an in-memory snapshot only.",
    );
}
