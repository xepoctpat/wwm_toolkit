import { describe, expect, it } from "vitest";

import {
    createToolkitFoundationSnapshot,
    hydrateToolkitFoundationState,
    parseLegacyToolkitState,
    type ToolkitFoundationSnapshot,
    type ToolkitPersistenceAdapter,
} from "../app/src/lib/storage/toolkitPersistence";

class MemoryAdapter implements ToolkitPersistenceAdapter {
    kind: "indexeddb" | "localstorage";
    private snapshot: unknown | null;

    constructor(kind: "indexeddb" | "localstorage" = "indexeddb", initialSnapshot: unknown | null = null) {
        this.kind = kind;
        this.snapshot = initialSnapshot;
    }

    async load() {
        return this.snapshot;
    }

    async save(snapshot: ToolkitFoundationSnapshot) {
        this.snapshot = JSON.parse(JSON.stringify(snapshot)) as ToolkitFoundationSnapshot;
    }
}

describe("toolkit persistence bridge", () => {
    it("sanitizes legacy localStorage payloads before migration", () => {
        const legacyState = parseLegacyToolkitState(
            JSON.stringify({
                favorites: ["npc-merchant", "npc-merchant", "  npc-bard  ", ""],
                npcProgress: {
                    "npc-merchant": "working",
                    "": "solved",
                    "npc-invalid": "unknown",
                },
                npcNotes: {
                    "npc-merchant": "Bring extra incense.",
                    "npc-empty": "   ",
                },
                customMaps: {
                    Qinghe: "data:image/png;base64,abc123",
                    Hexi: "",
                },
            }),
        );

        expect(legacyState).toEqual({
            favorites: ["npc-merchant", "npc-bard"],
            npcProgress: {
                "npc-merchant": "working",
            },
            npcNotes: {
                "npc-merchant": "Bring extra incense.",
            },
            customMaps: {
                Qinghe: "data:image/png;base64,abc123",
            },
        });
    });

    it("imports legacy data into an empty persistence backend", async () => {
        const adapter = new MemoryAdapter("indexeddb");
        const result = await hydrateToolkitFoundationState({
            adapter,
            legacyStateRaw: JSON.stringify({
                favorites: ["npc-merchant", "npc-bard"],
                npcProgress: { "npc-merchant": "working", "npc-bard": "solved" },
                npcNotes: { "npc-merchant": "Visit after sunset." },
                customMaps: { Qinghe: "data:image/png;base64,abc123" },
            }),
            now: "2026-04-16T12:00:00.000Z",
        });

        expect(result.status).toBe("imported");
        expect(result.backend).toBe("indexeddb");
        expect(result.counts).toEqual({
            favoriteCount: 2,
            trackedNpcCount: 2,
            noteCount: 1,
            customMapCount: 1,
        });
        expect(result.snapshot.importedAt).toBe("2026-04-16T12:00:00.000Z");
    });

    it("reuses an existing foundation snapshot unless a forced re-import is requested", async () => {
        const persistedSnapshot = createToolkitFoundationSnapshot({
            legacyState: {
                favorites: ["npc-persisted"],
                npcProgress: {},
                npcNotes: {},
                customMaps: {},
            },
            now: "2026-04-16T10:00:00.000Z",
        });
        const adapter = new MemoryAdapter("indexeddb", persistedSnapshot);

        const result = await hydrateToolkitFoundationState({
            adapter,
            legacyStateRaw: JSON.stringify({
                favorites: ["npc-fresh"],
                npcProgress: {},
                npcNotes: {},
                customMaps: {},
            }),
            now: "2026-04-16T12:00:00.000Z",
        });

        expect(result.status).toBe("hydrated");
        expect(result.snapshot.favorites).toEqual(["npc-persisted"]);
        expect(result.snapshot.importedAt).toBe("2026-04-16T10:00:00.000Z");
    });

    it("auto-imports legacy data when the persisted foundation snapshot is still empty", async () => {
        const adapter = new MemoryAdapter(
            "indexeddb",
            createToolkitFoundationSnapshot({
                now: "2026-04-16T09:00:00.000Z",
            }),
        );

        const result = await hydrateToolkitFoundationState({
            adapter,
            legacyStateRaw: JSON.stringify({
                favorites: ["npc-returning"],
                npcProgress: { "npc-returning": "working" },
                npcNotes: {},
                customMaps: {},
            }),
            now: "2026-04-16T12:30:00.000Z",
        });

        expect(result.status).toBe("imported");
        expect(result.snapshot.favorites).toEqual(["npc-returning"]);
        expect(result.snapshot.importedAt).toBe("2026-04-16T12:30:00.000Z");
    });

    it("can force a fresh legacy re-import over an existing snapshot", async () => {
        const adapter = new MemoryAdapter(
            "localstorage",
            createToolkitFoundationSnapshot({
                legacyState: {
                    favorites: ["npc-old"],
                    npcProgress: {},
                    npcNotes: {},
                    customMaps: {},
                },
                now: "2026-04-16T08:00:00.000Z",
            }),
        );

        const result = await hydrateToolkitFoundationState({
            adapter,
            forceLegacyImport: true,
            legacyStateRaw: JSON.stringify({
                favorites: ["npc-new"],
                npcProgress: { "npc-new": "working" },
                npcNotes: { "npc-new": "Re-imported note" },
                customMaps: {},
            }),
            now: "2026-04-16T13:00:00.000Z",
        });

        expect(result.status).toBe("reimported");
        expect(result.backend).toBe("localstorage");
        expect(result.snapshot.favorites).toEqual(["npc-new"]);
        expect(result.snapshot.importedAt).toBe("2026-04-16T13:00:00.000Z");
    });
});
