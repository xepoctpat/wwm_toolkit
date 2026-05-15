import { questPack } from "../data/content/quests";
import { regionPack } from "../data/content/regions";
import { sourcePack } from "../data/content/sources";
import { storylinePack } from "../data/content/storylines";
import { phasePlan } from "../features/phases/phasePlan";
import {
    getCodexSyncTargetForFlowchartDefinition,
    getKeyboardNavigationTargetIndex,
    getPreferredFlowchartDefinitionIdForCodexDocument,
} from "./foundationNavigation";
import {
    buildQuestFlowchartDefinitions,
    getQuestFlowchartDefinitionById,
    type QuestFlowchartDefinition,
    type QuestFlowchartKind,
    type QuestFlowchartModule,
} from "../lib/flowcharts/questFlowcharts";
import { renderQuestGraphDefinitionAsHtml } from "../lib/flowcharts/renderers/vanillaQuestFlowchartRenderer";
import {
    buildCodexSearchDocuments,
    getCodexDocumentById,
    getCodexFilterOptions,
    groupCodexResultsByDomain,
    searchCodexDocuments,
    type CodexDomain,
    type CodexQuestType,
    type CodexSearchDocument,
} from "../lib/search/codexSearch";
import {
    FOUNDATION_LOCAL_STORAGE_KEY,
    LEGACY_TOOLKIT_STORAGE_KEYS,
    loadToolkitMigrationSummary,
    type ToolkitMigrationSummary,
} from "../lib/storage/toolkitPersistence";

const codexDocuments = buildCodexSearchDocuments({
    regionPack,
    questPack,
    storylinePack,
    sourcePack,
});

const codexFilterOptions = getCodexFilterOptions(codexDocuments);
const regionById = new Map(regionPack.entries.map((entry) => [entry.id, entry]));
const questById = new Map(questPack.entries.map((entry) => [entry.id, entry]));
const storylineById = new Map(storylinePack.entries.map((entry) => [entry.id, entry]));
const sourceById = new Map(sourcePack.entries.map((entry) => [entry.id, entry]));
const flowchartDefinitions = buildQuestFlowchartDefinitions({
    regionPack,
    questPack,
    storylinePack,
});
const flowchartRegionFilterOptions = [...new Set(flowchartDefinitions.flatMap((definition) => definition.regionIds))];

let mermaidInitialized = false;
let flowchartRenderVersion = 0;
let mermaidModulePromise: Promise<typeof import("mermaid")> | null = null;

interface CodexUiState {
    query: string;
    domain: CodexDomain | "all";
    regionId: string | "all";
    questType: CodexQuestType | "all";
    selectedEntryId: string | null;
}

interface FlowchartUiState {
    selectedDefinitionId: string | null;
    rendererMode: FlowchartRendererMode;
    selectorKind: QuestFlowchartKind | "all";
    selectorRegionId: string | "all";
    activeModuleId: string | null;
}

type FlowchartRendererMode = "graph" | "mermaid";

type QingheGuideAction =
    | "qinghe-overview"
    | "qinghe-main-route"
    | "qinghe-exploration-routes"
    | "qinghe-jianghu-legacy"
    | "qinghe-campaign-gate"
    | "next-region-gates";

const SAFE_EXTERNAL_PROTOCOLS = new Set(["http:", "https:"]);

function escapeHtml(value: string | number | null | undefined) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function sanitizeExternalUrl(value: string) {
    try {
        const parsedUrl = new URL(value, globalThis.location?.href ?? "https://example.invalid/");
        return SAFE_EXTERNAL_PROTOCOLS.has(parsedUrl.protocol) ? parsedUrl.href : null;
    } catch {
        return null;
    }
}

function renderSafeExternalLink(label: string, url: string, className = "inline-link") {
    const safeUrl = sanitizeExternalUrl(url);

    if (!safeUrl) {
        return `<span class="${className}">${escapeHtml(label)}</span>`;
    }

    return `<a class="${className}" href="${escapeHtml(safeUrl)}" target="_blank" rel="noreferrer noopener">${escapeHtml(label)}</a>`;
}

function formatTimestamp(value: string | null) {
    if (!value) {
        return "not imported yet";
    }

    try {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(value));
    } catch {
        return value;
    }
}

function formatDisplayLabel(value: string) {
    return value
        .split(/[-_]/g)
        .filter(Boolean)
        .map((segment) => {
            if (segment.toLowerCase() === "id") {
                return "ID";
            }

            return segment.charAt(0).toUpperCase() + segment.slice(1);
        })
        .join(" ");
}

function formatDomainLabel(domain: CodexDomain) {
    switch (domain) {
        case "regions":
            return "Regions";
        case "quests":
            return "Quests";
        case "storylines":
            return "Storylines";
        case "sources":
            return "Sources";
    }
}

function formatDomainSingular(domain: CodexDomain) {
    switch (domain) {
        case "regions":
            return "Region";
        case "quests":
            return "Quest";
        case "storylines":
            return "Storyline";
        case "sources":
            return "Source";
    }
}

function formatQuestTypeLabel(questType: CodexQuestType) {
    switch (questType) {
        case "campaign":
            return "Campaign side quest";
        case "exploration":
            return "Exploration route";
        case "jianghu-legacy":
            return "Jianghu Legacy";
        default:
            return formatDisplayLabel(questType);
    }
}

function formatListDisplay(values: string[]) {
    return values.length > 0 ? values.map(formatDisplayLabel).join(", ") : "None";
}

function createInitialCodexUiState(): CodexUiState {
    return {
        query: "",
        domain: "all",
        regionId: "all",
        questType: "all",
        selectedEntryId: getCodexDocumentById(codexDocuments, "qinghe")?.id ?? codexDocuments[0]?.id ?? null,
    };
}

function createInitialFlowchartUiState(): FlowchartUiState {
    return {
        selectedDefinitionId:
            getQuestFlowchartDefinitionById(flowchartDefinitions, "progression-qinghe-onboarding-route")?.id ??
            flowchartDefinitions[0]?.id ??
            null,
        rendererMode: "graph",
        selectorKind: "progression",
        selectorRegionId: "qinghe",
        activeModuleId: null,
    };
}

function resetCodexState(codexState: CodexUiState) {
    codexState.query = "";
    codexState.domain = "all";
    codexState.regionId = "all";
    codexState.questType = "all";
    codexState.selectedEntryId = null;
}

function applyCodexSyncTarget(codexState: CodexUiState, syncTarget: ReturnType<typeof getCodexSyncTargetForFlowchartDefinition>) {
    codexState.query = syncTarget.query;
    codexState.domain = syncTarget.domain;
    codexState.regionId = syncTarget.regionId;
    codexState.questType = syncTarget.questType;
    codexState.selectedEntryId = syncTarget.selectedEntryId;
}

function syncCodexStateToFlowchartSelection(codexState: CodexUiState, flowchartState: FlowchartUiState) {
    const definition = getQuestFlowchartDefinitionById(flowchartDefinitions, flowchartState.selectedDefinitionId);

    if (!definition) {
        return;
    }

    flowchartState.activeModuleId = null;
    applyCodexSyncTarget(codexState, getCodexSyncTargetForFlowchartDefinition(definition, codexDocuments));
}

function syncFlowchartStateToCodexSelection(codexState: CodexUiState, flowchartState: FlowchartUiState) {
    const selectedDocument = getCodexDocumentById(codexDocuments, codexState.selectedEntryId);

    if (!selectedDocument) {
        return;
    }

    const preferredDefinitionId = getPreferredFlowchartDefinitionIdForCodexDocument(
        selectedDocument,
        flowchartDefinitions,
    );

    if (preferredDefinitionId) {
        const preferredDefinition = getQuestFlowchartDefinitionById(flowchartDefinitions, preferredDefinitionId);

        flowchartState.selectedDefinitionId = preferredDefinitionId;

        if (preferredDefinition) {
            syncFlowchartFiltersToDefinition(flowchartState, preferredDefinition);
        }

        flowchartState.activeModuleId = null;
    }
}

function getFlowchartViewModel(flowchartState: FlowchartUiState) {
    const filteredDefinitions = flowchartDefinitions.filter((definition) => {
        const matchesKind = flowchartState.selectorKind === "all" || definition.kind === flowchartState.selectorKind;
        const matchesRegion =
            flowchartState.selectorRegionId === "all" || definition.regionIds.includes(flowchartState.selectorRegionId);

        return matchesKind && matchesRegion;
    });
    const selectedDefinition =
        getQuestFlowchartDefinitionById(filteredDefinitions, flowchartState.selectedDefinitionId) ??
        filteredDefinitions[0] ??
        null;
    const activeModule = selectedDefinition?.modules?.find((module) => module.id === flowchartState.activeModuleId) ?? null;

    flowchartState.selectedDefinitionId = selectedDefinition?.id ?? null;
    flowchartState.activeModuleId = activeModule?.id ?? null;

    return {
        definitions: flowchartDefinitions,
        filteredDefinitions,
        selectedDefinition,
        activeModule,
        hasActiveFilters: flowchartState.selectorKind !== "all" || flowchartState.selectorRegionId !== "all",
    };
}

function getCodexViewModel(codexState: CodexUiState) {
    const results = searchCodexDocuments(codexDocuments, {
        query: codexState.query,
        filters: {
            domain: codexState.domain,
            regionId: codexState.regionId,
            questType: codexState.questType,
        },
    });

    const selectedEntryId = results.some((result) => result.document.id === codexState.selectedEntryId)
        ? codexState.selectedEntryId
        : (results[0]?.document.id ?? null);

    codexState.selectedEntryId = selectedEntryId;

    return {
        results,
        groupedResults: groupCodexResultsByDomain(results),
        selectedDocument: getCodexDocumentById(codexDocuments, selectedEntryId),
        totalCount: results.length,
        hasActiveFilters:
            codexState.domain !== "all" || codexState.regionId !== "all" || codexState.questType !== "all",
    };
}

function getCodexReferenceDocuments(ids: string[]) {
    return ids
        .map((id) => getCodexDocumentById(codexDocuments, id))
        .filter((document): document is CodexSearchDocument => Boolean(document));
}

function getQuestReferenceIdsByType(ids: string[], questType: CodexQuestType) {
    return ids.filter((id) => {
        const document = getCodexDocumentById(codexDocuments, id);
        return document?.domain === "quests" && document.questType === questType;
    });
}

function renderCodexReferenceSection(title: string, ids: string[]) {
    const documents = getCodexReferenceDocuments(ids);

    if (documents.length === 0) {
        return "";
    }

    return `
        <section class="detail-section">
            <h3 class="detail-section__title">${escapeHtml(title)}</h3>
            <ul class="link-list">
                ${documents
                    .map(
                        (document) => `
                            <li>
                                <button class="text-link-button" type="button" data-codex-navigation-id="${escapeHtml(document.id)}">
                                    ${escapeHtml(document.title)}
                                </button>
                            </li>
                        `,
                    )
                    .join("")}
            </ul>
        </section>
    `;
}

function renderSourceReferenceSection(sourceIds: string[]) {
    const sources = sourceIds.map((sourceId) => sourceById.get(sourceId)).filter(Boolean);

    if (sources.length === 0) {
        return "";
    }

    return `
        <section class="detail-section">
            <h3 class="detail-section__title">Sources</h3>
            <ul class="link-list">
                ${sources
                    .map(
                        (source) => `
                            <li>
                                ${renderSafeExternalLink(source.title, source.url)}
                            </li>
                        `,
                    )
                    .join("")}
            </ul>
        </section>
    `;
}

function renderTextListSection(title: string, items: string[]) {
    if (items.length === 0) {
        return "";
    }

    return `
        <section class="detail-section">
            <h3 class="detail-section__title">${escapeHtml(title)}</h3>
            <ul class="link-list">
                ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
        </section>
    `;
}

function renderGuideLinkList(ids: string[]) {
    const documents = getCodexReferenceDocuments(ids);

    if (documents.length === 0) {
        return "";
    }

    return `
        <ul class="link-list guide-link-list">
            ${documents
                .map(
                    (document) => `
                        <li>
                            <button class="text-link-button" type="button" data-codex-navigation-id="${escapeHtml(document.id)}">
                                ${escapeHtml(document.title)}
                            </button>
                        </li>
                    `,
                )
                .join("")}
        </ul>
    `;
}

function renderQingheGuideSection() {
    const qinghe = regionById.get("qinghe");
    const kaifeng = regionById.get("kaifeng");
    const hexi = regionById.get("hexi");
    const chapterOne = storylineById.get("storyline-heaven-has-no-pier");
    const anotherNewWing = questById.get("quest-another-new-wing");
    const whiteBird = questById.get("quest-white-bird-shooting");
    const shameless = questById.get("quest-the-shameless");
    const horseNeighs = questById.get("quest-a-horse-neighs-in-the-forest");
    const meridianTouch = questById.get("quest-meridian-touch");
    const dustMirror = questById.get("quest-dust-on-the-rhombus-mirror");
    const finale = questById.get("quest-for-whom-does-he-return");
    const stillShore = questById.get("quest-still-shore");

    if (
        !qinghe ||
        !kaifeng ||
        !hexi ||
        !chapterOne ||
        !anotherNewWing ||
        !whiteBird ||
        !shameless ||
        !horseNeighs ||
        !meridianTouch ||
        !dustMirror ||
        !finale ||
        !stillShore
    ) {
        return "";
    }

    return `
        <section class="panel panel--spotlight">
            <div class="panel__header">
                <div>
                    <p class="eyebrow">Qinghe-first guide</p>
                    <h2>Start with the opening region, then branch on purpose</h2>
                </div>
                <span class="pill">Reviewed early-game lane</span>
            </div>
            <p>
                The current reviewed seed is finally strong enough to lead with the route a player actually follows:
                Qinghe's Chapter 1 spine, its first-class exploration detours, Meridian Touch as a separate Jianghu
                Legacy unlock, and the later gates those routes feed.
            </p>

            <div class="guide-layout">
                <div class="guide-overview">
                    <div class="result-card__meta guide-meta-row">
                        <span class="meta-pill">${escapeHtml(qinghe.subregions.length)} subregions</span>
                        <span class="meta-pill">${escapeHtml(String(qinghe.questIds.length))} reviewed quest anchors</span>
                        <span class="meta-pill">Literal encounters stay separate</span>
                    </div>

                    <p>${escapeHtml(qinghe.traversalSummary)}</p>

                    <div class="guide-actions">
                        <button class="action-button" type="button" data-guide-action="qinghe-overview">Open Qinghe overview</button>
                        <button class="action-button action-button--secondary" type="button" data-guide-action="qinghe-main-route">Focus Chapter 1 main route</button>
                        <button class="action-button action-button--secondary" type="button" data-guide-action="qinghe-exploration-routes">Show exploration routes</button>
                        <button class="action-button action-button--secondary" type="button" data-guide-action="qinghe-jianghu-legacy">Show Meridian Touch</button>
                        <button class="action-button action-button--secondary" type="button" data-guide-action="qinghe-campaign-gate">Show Still Shore gate</button>
                        <button class="action-button action-button--secondary" type="button" data-guide-action="next-region-gates">Compare later gates</button>
                    </div>

                    <div class="callout">
                        Quick actions update the flowchart and codex below, so the page behaves more like an opening-region route guide and less like an enthusiastic pile of internal status cards.
                    </div>
                </div>

                <div class="guide-rail">
                    <article class="guide-card">
                        <p class="eyebrow">Main story spine</p>
                        <h3>${escapeHtml(chapterOne.title)}</h3>
                        <p>
                            Qinghe's main path is still the primary route. Optional content matters because it branches off this spine cleanly,
                            not because it replaces it.
                        </p>
                        ${renderGuideLinkList([
                            chapterOne.id,
                            anotherNewWing.id,
                            horseNeighs.id,
                            dustMirror.id,
                            finale.id,
                        ])}
                        <button class="action-button action-button--secondary" type="button" data-guide-action="qinghe-main-route">Focus main route in codex</button>
                    </article>

                    <article class="guide-card">
                        <p class="eyebrow">Optional exploration</p>
                        <h3>Hidden routes beside Another New Wing</h3>
                        <p>
                            ${escapeHtml(whiteBird.title)} and ${escapeHtml(shameless.title)} are now modeled as real exploration entries, while still staying conservative about unsupported walkthrough detail.
                        </p>
                        ${renderGuideLinkList([whiteBird.id, shameless.id])}
                        <button class="action-button action-button--secondary" type="button" data-guide-action="qinghe-exploration-routes">Focus exploration routes</button>
                    </article>

                    <article class="guide-card">
                        <p class="eyebrow">Mystic-art detour</p>
                        <h3>${escapeHtml(meridianTouch.title)}</h3>
                        <p>
                            ${escapeHtml(meridianTouch.summary)}
                        </p>
                        ${renderGuideLinkList([meridianTouch.id, horseNeighs.id])}
                        <button class="action-button action-button--secondary" type="button" data-guide-action="qinghe-jianghu-legacy">Focus Jianghu Legacy route</button>
                    </article>

                    <article class="guide-card">
                        <p class="eyebrow">What Qinghe unlocks later</p>
                        <h3>Later gates diverge on purpose</h3>
                        <p>
                            Kaifeng uses the published level-32 plus Chapter 1 gate, while Hexi uses a different route through ${escapeHtml(stillShore.title)} and the Bamboo Abode mural. Nice and gloriously non-monotonic.
                        </p>
                        ${renderGuideLinkList([stillShore.id, kaifeng.id, hexi.id])}
                        <button class="action-button action-button--secondary" type="button" data-guide-action="next-region-gates">Compare later gates</button>
                    </article>
                </div>
            </div>
        </section>
    `;
}

function renderCodexResultMeta(document: CodexSearchDocument) {
    const pills = [
        formatDomainSingular(document.domain),
        ...(document.domain === "regions"
            ? [
                  `${document.subregions.length} subregion${document.subregions.length === 1 ? "" : "s"}`,
                  ...(document.requiredCharacterLevel ? [`Lvl ${document.requiredCharacterLevel}+`] : []),
              ]
            : []),
        ...(document.domain === "quests" ? [formatQuestTypeLabel(document.questType)] : []),
        ...(document.domain === "storylines" ? [document.chapterLabel] : []),
        ...(document.domain === "sources" ? [formatDisplayLabel(document.tier)] : []),
        ...document.regionIds.map(formatDisplayLabel),
    ];

    return pills
        .map(
            (pill) => `
                <span class="meta-pill">${escapeHtml(pill)}</span>
            `,
        )
        .join("");
}

function renderCodexResultGroups(codexState: CodexUiState) {
    const viewModel = getCodexViewModel(codexState);
    const hasQuery = codexState.query.trim().length > 0;

    if (viewModel.totalCount === 0) {
        return `
            <div class="empty-state">
                No codex entries match the current query and filters. Try a broader region, clear the quest-type filter, or search for a chapter title instead.
            </div>
        `;
    }

    return viewModel.groupedResults
        .map(
            (group) => `
                <section class="result-group">
                    <div class="result-group__header">
                        <h3>${escapeHtml(formatDomainLabel(group.domain))}</h3>
                        <span class="pill">${group.results.length}</span>
                    </div>
                    <div class="result-stack">
                        ${group.results
                            .map(
                                (result) => `
                                    <button
                                        class="result-card ${codexState.selectedEntryId === result.document.id ? "is-active" : ""}"
                                        type="button"
                                        aria-pressed="${codexState.selectedEntryId === result.document.id ? "true" : "false"}"
                                        data-codex-entry-id="${escapeHtml(result.document.id)}"
                                    >
                                        <div class="result-card__meta">
                                            ${renderCodexResultMeta(result.document)}
                                        </div>
                                        <h3>${escapeHtml(result.document.title)}</h3>
                                        <p>${escapeHtml(result.document.summary)}</p>
                                        ${hasQuery && result.matchedTerms.length > 0
                                            ? `<p class="result-card__match">Matched on: ${escapeHtml(result.matchedTerms.slice(0, 4).join(", "))}</p>`
                                            : ""}
                                    </button>
                                `,
                            )
                            .join("")}
                    </div>
                </section>
            `,
        )
        .join("");
}

function renderCodexDetailPanel(document: CodexSearchDocument | null) {
    if (!document) {
        return `
            <article class="detail-panel__body">
                <p class="eyebrow">Selected entry</p>
                <h3>No result selected</h3>
                <p>
                    Pick a result from the left to inspect its regions, related entries, source links, and verification metadata.
                </p>
            </article>
        `;
    }

    const regionMainQuestIds = document.domain === "regions" ? getQuestReferenceIdsByType(document.questIds, "main") : [];
    const regionExplorationQuestIds =
        document.domain === "regions" ? getQuestReferenceIdsByType(document.questIds, "exploration") : [];
    const regionJianghuLegacyQuestIds =
        document.domain === "regions" ? getQuestReferenceIdsByType(document.questIds, "jianghu-legacy") : [];
    const regionOtherQuestIds =
        document.domain === "regions"
            ? document.questIds.filter((id) => {
                  const quest = getCodexDocumentById(codexDocuments, id);

                  return (
                      quest?.domain === "quests" &&
                      !["main", "exploration", "jianghu-legacy", "campaign"].includes(quest.questType)
                  );
              })
            : [];

    const metadataRows = [
        { label: "Domain", value: formatDomainSingular(document.domain) },
        ...(document.regionIds.length > 0 ? [{ label: "Regions", value: formatListDisplay(document.regionIds) }] : []),
        ...(document.domain === "regions"
            ? [{ label: "Region order", value: String(document.regionOrder) }]
            : []),
        ...(document.domain === "regions" && document.requiredCharacterLevel
            ? [{ label: "Character level gate", value: `Level ${document.requiredCharacterLevel}+` }]
            : []),
        ...(document.domain === "regions" && document.unlockRequirement
            ? [{ label: "Unlock", value: document.unlockRequirement }]
            : []),
        ...(document.domain === "regions"
            ? [{ label: "Subregions", value: formatListDisplay(document.subregions) }]
            : []),
        ...(document.domain === "regions"
            ? [{ label: "Landmarks", value: String(document.landmarkNames.length) }]
            : []),
        ...(document.domain === "regions"
            ? [{ label: "Quest anchors", value: String(document.questIds.length) }]
            : []),
        ...(document.domain === "quests" ? [{ label: "Quest type", value: formatQuestTypeLabel(document.questType) }] : []),
        ...(document.domain === "quests" && document.locationHint
            ? [{ label: "Location", value: document.locationHint }]
            : []),
        ...(document.domain === "storylines" ? [{ label: "Chapter", value: document.chapterLabel }] : []),
        ...(document.domain === "storylines" && typeof document.chapterNumber === "number"
            ? [{ label: "Chapter number", value: String(document.chapterNumber) }]
            : []),
        ...(document.domain === "sources" ? [{ label: "Tier", value: formatDisplayLabel(document.tier) }] : []),
        ...(document.domain === "sources" ? [{ label: "Last reviewed", value: document.lastReviewed }] : []),
        ...(document.domain !== "sources" && document.confidence
            ? [{ label: "Confidence", value: formatDisplayLabel(document.confidence) }]
            : []),
        ...(document.domain !== "sources" && document.verificationStatus
            ? [{ label: "Verification", value: formatDisplayLabel(document.verificationStatus) }]
            : []),
        ...(document.domain !== "sources" && document.evidenceType
            ? [{ label: "Evidence", value: formatDisplayLabel(document.evidenceType) }]
            : []),
        ...(document.domain !== "sources" ? [{ label: "Source refs", value: String(document.sourceIds.length) }] : []),
    ];

    const sourceBacklinks =
        document.domain === "sources"
            ? codexDocuments.filter((entry) => entry.sourceIds.includes(document.id)).map((entry) => entry.id)
            : [];

    return `
        <article class="detail-panel__body">
            <div class="result-card__meta">
                ${renderCodexResultMeta(document)}
            </div>
            <h3>${escapeHtml(document.title)}</h3>
            <p>${escapeHtml(document.summary)}</p>

            ${document.domain === "sources"
                ? `<p>${renderSafeExternalLink("Open source page", document.url)}</p>`
                : ""}

            <dl class="detail-list">
                ${metadataRows
                    .map(
                        (row) => `
                            <div>
                                <dt>${escapeHtml(row.label)}</dt>
                                <dd>${escapeHtml(row.value)}</dd>
                            </div>
                        `,
                    )
                    .join("")}
            </dl>

            ${document.verificationNotes
                ? `
                    <section class="detail-section">
                        <h3 class="detail-section__title">Verification notes</h3>
                        <p>${escapeHtml(document.verificationNotes)}</p>
                    </section>
                `
                : ""}

            ${document.domain === "regions"
                ? `
                    <section class="detail-section">
                        <h3 class="detail-section__title">Traversal summary</h3>
                        <p>${escapeHtml(document.traversalSummary)}</p>
                    </section>
                `
                : ""}

            ${document.domain === "regions" ? renderTextListSection("Subregions", document.subregions) : ""}
            ${document.domain === "regions" ? renderTextListSection("Landmarks", document.landmarkNames) : ""}
            ${document.domain === "regions"
                ? renderTextListSection("Activity highlights", document.activityHighlights)
                : ""}
            ${document.domain === "regions" ? renderCodexReferenceSection("Storyline anchors", document.storylineIds) : ""}
            ${document.domain === "regions"
                ? renderCodexReferenceSection("Progression gates", document.progressionGateEntryIds)
                : ""}
            ${document.domain === "regions" ? renderCodexReferenceSection("Main-story anchors", regionMainQuestIds) : ""}
            ${document.domain === "regions"
                ? renderCodexReferenceSection("Exploration routes", regionExplorationQuestIds)
                : ""}
            ${document.domain === "regions"
                ? renderCodexReferenceSection("Jianghu Legacy / mystic-art routes", regionJianghuLegacyQuestIds)
                : ""}
            ${document.domain === "regions"
                ? renderCodexReferenceSection("Campaign quest anchors", document.campaignQuestIds)
                : ""}
            ${document.domain === "regions" ? renderCodexReferenceSection("Other quest anchors", regionOtherQuestIds) : ""}

            ${document.domain !== "regions" ? renderCodexReferenceSection("Regions", document.regionIds) : ""}
            ${document.domain === "quests" ? renderCodexReferenceSection("Storylines", document.storylineIds) : ""}
            ${document.domain === "quests"
                ? renderCodexReferenceSection("Prerequisites", document.prerequisiteQuestIds)
                : ""}
            ${document.domain === "quests"
                ? renderCodexReferenceSection("Follow-up quests", document.followUpQuestIds)
                : ""}
            ${document.domain === "storylines" ? renderCodexReferenceSection("Quest spine", document.questIds) : ""}
            ${document.relatedEntryIds.length > 0 ? renderCodexReferenceSection("Related entries", document.relatedEntryIds) : ""}
            ${document.domain !== "sources" ? renderSourceReferenceSection(document.sourceIds) : ""}
            ${document.domain === "sources" ? renderCodexReferenceSection("Referenced by", sourceBacklinks) : ""}
        </article>
    `;
}

function renderCodexSearchSection(codexState: CodexUiState) {
    const viewModel = getCodexViewModel(codexState);
    const resultLabel =
        codexState.query.trim().length > 0 || viewModel.hasActiveFilters
            ? `${viewModel.totalCount} matching entr${viewModel.totalCount === 1 ? "y" : "ies"}`
            : `${codexDocuments.length} indexed entr${codexDocuments.length === 1 ? "y" : "ies"}`;

    return `
        <section class="panel">
            <div class="panel__header">
                <div>
                    <p class="eyebrow">Phase 2A</p>
                    <h2>Search the reviewed codex</h2>
                </div>
                <span class="pill">${escapeHtml(resultLabel)}</span>
            </div>
            <p>
                Search across reviewed regions, quests, storylines, and source notes. This pass stays intentionally lean: useful ranking,
                focused filters, and a detail panel that proves the reviewed data graph is navigable instead of decorative.
            </p>
            <div class="callout callout--info">
                Keyboard: press <code>/</code> to jump to search, use arrow keys inside result cards, and use <code>Home</code> / <code>End</code> to jump through the list faster.
            </div>

            <div class="control-grid">
                <label class="control-field control-field--wide">
                    <span class="control-label">Search</span>
                    <input
                        class="search-input"
                        type="search"
                        placeholder="Try Qinghe, Sundara Land, Qianye, Heaven Has No Pier, or Game8"
                        value="${escapeHtml(codexState.query)}"
                        data-codex-control="query"
                    />
                </label>

                <label class="control-field">
                    <span class="control-label">Domain</span>
                    <select class="filter-select" data-codex-control="domain">
                        <option value="all" ${codexState.domain === "all" ? "selected" : ""}>All domains</option>
                        ${codexFilterOptions.domains
                            .map(
                                (domain) => `
                                    <option value="${domain}" ${codexState.domain === domain ? "selected" : ""}>${escapeHtml(formatDomainLabel(domain))}</option>
                                `,
                            )
                            .join("")}
                    </select>
                </label>

                <label class="control-field">
                    <span class="control-label">Region</span>
                    <select class="filter-select" data-codex-control="region">
                        <option value="all" ${codexState.regionId === "all" ? "selected" : ""}>All regions</option>
                        ${codexFilterOptions.regions
                            .map(
                                (regionId) => `
                                    <option value="${regionId}" ${codexState.regionId === regionId ? "selected" : ""}>${escapeHtml(formatDisplayLabel(regionId))}</option>
                                `,
                            )
                            .join("")}
                    </select>
                </label>

                <label class="control-field">
                    <span class="control-label">Quest type</span>
                    <select class="filter-select" data-codex-control="questType">
                        <option value="all" ${codexState.questType === "all" ? "selected" : ""}>All quest types</option>
                        ${codexFilterOptions.questTypes
                            .map(
                                (questType) => `
                                    <option value="${questType}" ${codexState.questType === questType ? "selected" : ""}>${escapeHtml(formatQuestTypeLabel(questType))}</option>
                                `,
                            )
                            .join("")}
                    </select>
                </label>
            </div>

            <div class="button-row button-row--compact">
                <button class="action-button action-button--secondary" type="button" data-codex-action="reset-search" ${
                    codexState.query.length === 0 && !viewModel.hasActiveFilters ? "disabled" : ""
                }>
                    Reset search
                </button>
                <span class="muted-inline">
                    Matching is currently based on title, tags, regions, summary text, and a small set of reviewed metadata fields.
                </span>
            </div>

            <div class="codex-layout">
                <div class="codex-results">
                    ${renderCodexResultGroups(codexState)}
                </div>
                <aside class="detail-panel">
                    ${renderCodexDetailPanel(viewModel.selectedDocument)}
                </aside>
            </div>
        </section>
    `;
}

function renderPhaseCards() {
    return phasePlan
        .map(
            (phase) => `
                <article class="phase-card">
                    <div class="phase-card__header">
                        <p class="eyebrow">${phase.kicker}</p>
                        <span class="status-badge status-badge--${phase.status}">${phase.statusLabel}</span>
                    </div>
                    <h3>${phase.title}</h3>
                    <p>${phase.summary}</p>
                    <ul>
                        ${phase.deliverables.map((deliverable) => `<li>${deliverable}</li>`).join("")}
                    </ul>
                </article>
            `,
        )
        .join("");
}

function renderDomainCards() {
    const domains = [
        {
            title: regionPack.meta.label,
            description: regionPack.meta.description,
            count: regionPack.entries.length,
            status: regionPack.meta.status,
        },
        {
            title: questPack.meta.label,
            description: questPack.meta.description,
            count: questPack.entries.length,
            status: questPack.meta.status,
        },
        {
            title: storylinePack.meta.label,
            description: storylinePack.meta.description,
            count: storylinePack.entries.length,
            status: storylinePack.meta.status,
        },
        {
            title: sourcePack.meta.label,
            description: sourcePack.meta.description,
            count: sourcePack.entries.length,
            status: sourcePack.meta.status,
        },
        {
            title: "Legacy NPC prototype",
            description:
                "The working static prototype remains in the repository root while the modular codex foundation is built in parallel.",
            count: 1,
            status: "migration-bridge",
        },
    ];

    return domains
        .map(
            (domain) => `
                <article class="domain-card">
                    <div class="domain-card__header">
                        <h3>${domain.title}</h3>
                        <span class="status-badge status-badge--neutral">${domain.status}</span>
                    </div>
                    <p>${domain.description}</p>
                    <strong>${domain.count} loaded item${domain.count === 1 ? "" : "s"}</strong>
                </article>
            `,
        )
        .join("");
}

function renderRegionSeedCards() {
    return regionPack.entries
        .map((region) => {
            const gateLabel = region.requiredCharacterLevel ? `lvl ${region.requiredCharacterLevel}+` : "start region";

            return `
                <article class="phase-card">
                    <div class="phase-card__header">
                        <p class="eyebrow">Region ${escapeHtml(region.regionOrder)} · ${escapeHtml(gateLabel)} · ${escapeHtml(region.subregions.length)} subregions</p>
                        <span class="status-badge status-badge--neutral">${escapeHtml(region.storylineIds.length)} storyline${region.storylineIds.length === 1 ? "" : "s"}</span>
                    </div>
                    <h3>${escapeHtml(region.title)}</h3>
                    <p>${escapeHtml(region.summary)}</p>
                    <ul>
                        <li><strong>Gate:</strong> ${escapeHtml(region.unlockRequirement ?? "Not documented")}</li>
                        <li><strong>Traversal:</strong> ${escapeHtml(region.traversalSummary)}</li>
                        <li><strong>Subregions:</strong> ${escapeHtml(region.subregions.join(", "))}</li>
                        <li><strong>Reviewed quest anchors:</strong> ${escapeHtml(String(region.questIds.length))}</li>
                    </ul>
                </article>
            `;
        })
        .join("");
}

function renderStorylineSeedCards() {
    return storylinePack.entries
        .map((storyline) => {
            const storylineQuests = storyline.questIds
                .map((questId) => questPack.entries.find((entry) => entry.id === questId))
                .filter((entry): entry is (typeof questPack.entries)[number] => Boolean(entry));

            return `
                <article class="phase-card">
                    <div class="phase-card__header">
                        <p class="eyebrow">${escapeHtml(storyline.chapterLabel)} · ${escapeHtml(formatListDisplay(storyline.regionIds))}</p>
                        <span class="status-badge status-badge--neutral">${storylineQuests.length} quests</span>
                    </div>
                    <h3>${escapeHtml(storyline.title)}</h3>
                    <p>${escapeHtml(storyline.summary)}</p>
                    <ul>
                        ${storylineQuests.map((quest) => `<li>${escapeHtml(quest.title)}</li>`).join("")}
                    </ul>
                </article>
            `;
        })
        .join("");
}

function renderCampaignSeedCards() {
    return questPack.entries
        .filter((quest) => quest.questType === "campaign")
        .map(
            (quest) => `
                <article class="domain-card">
                    <div class="domain-card__header">
                        <h3>${escapeHtml(quest.title)}</h3>
                        <span class="status-badge status-badge--neutral">${escapeHtml(formatListDisplay(quest.regionIds))}</span>
                    </div>
                    <p>${escapeHtml(quest.summary)}</p>
                    <strong>${escapeHtml(quest.locationHint ?? "Location pending")}</strong>
                </article>
            `,
        )
        .join("");
}

function renderOptionalRouteSeedCards() {
    return questPack.entries
        .filter(
            (quest) =>
                quest.regionIds.includes("qinghe") &&
                ["exploration", "jianghu-legacy"].includes(quest.questType),
        )
        .map(
            (quest) => `
                <article class="domain-card">
                    <div class="domain-card__header">
                        <h3>${escapeHtml(quest.title)}</h3>
                        <span class="status-badge status-badge--neutral">${escapeHtml(formatQuestTypeLabel(quest.questType))}</span>
                    </div>
                    <p>${escapeHtml(quest.summary)}</p>
                    <strong>${escapeHtml(quest.locationHint ?? "Location pending")}</strong>
                </article>
            `,
        )
        .join("");
}

function formatFlowchartKindLabel(kind: QuestFlowchartDefinition["kind"]) {
    switch (kind) {
        case "progression":
            return "Progression";
        case "storyline":
            return "Storyline";
        case "campaign":
            return "Campaign side quest";
    }
}

function formatFlowchartModuleToneLabel(tone: QuestFlowchartModule["tone"]) {
    switch (tone) {
        case "main":
            return "Main spine";
        case "exploration":
            return "Exploration loop";
        case "legacy":
            return "Legacy detour";
        case "campaign":
            return "Campaign ladder";
        case "gate":
            return "Gate / cross-link";
    }
}

function renderFlowchartFilterButtons(flowchartState: FlowchartUiState) {
    const kindOptions: Array<{ id: QuestFlowchartKind | "all"; label: string }> = [
        { id: "all", label: "All charts" },
        { id: "progression", label: "Progression" },
        { id: "storyline", label: "Storylines" },
        { id: "campaign", label: "Campaigns" },
    ];
    const regionOptions: Array<{ id: string | "all"; label: string }> = [
        { id: "all", label: "All regions" },
        ...flowchartRegionFilterOptions.map((regionId) => ({
            id: regionId,
            label: formatDisplayLabel(regionId),
        })),
    ];

    return `
        <div class="flowchart-filter-stack">
            <div class="flowchart-filter-group" role="group" aria-label="Filter charts by type">
                <span class="flowchart-filter-label">Chart type</span>
                <div class="flowchart-filter-buttons">
                    ${kindOptions
                        .map(
                            (option) => `
                                <button
                                    class="action-button action-button--secondary flowchart-filter-button ${flowchartState.selectorKind === option.id ? "is-active" : ""}"
                                    type="button"
                                    aria-pressed="${flowchartState.selectorKind === option.id ? "true" : "false"}"
                                    data-flowchart-filter-kind="${option.id}"
                                >
                                    ${escapeHtml(option.label)}
                                </button>
                            `,
                        )
                        .join("")}
                </div>
            </div>

            <div class="flowchart-filter-group" role="group" aria-label="Filter charts by region">
                <span class="flowchart-filter-label">Region</span>
                <div class="flowchart-filter-buttons">
                    ${regionOptions
                        .map(
                            (option) => `
                                <button
                                    class="action-button action-button--secondary flowchart-filter-button ${flowchartState.selectorRegionId === option.id ? "is-active" : ""}"
                                    type="button"
                                    aria-pressed="${flowchartState.selectorRegionId === option.id ? "true" : "false"}"
                                    data-flowchart-filter-region="${option.id}"
                                >
                                    ${escapeHtml(option.label)}
                                </button>
                            `,
                        )
                        .join("")}
                </div>
            </div>
        </div>
    `;
}

function renderFlowchartSelectorCards(definitions: QuestFlowchartDefinition[], flowchartState: FlowchartUiState) {
    if (definitions.length === 0) {
        return `
            <div class="empty-state">
                No charts match the current selector filters yet. Try broadening the chart type or region scope.
            </div>
        `;
    }

    return definitions
        .map(
            (definition) => `
                <button
                    class="flowchart-card flowchart-card--compact ${flowchartState.selectedDefinitionId === definition.id ? "is-active" : ""}"
                    type="button"
                    aria-pressed="${flowchartState.selectedDefinitionId === definition.id ? "true" : "false"}"
                    data-flowchart-id="${escapeHtml(definition.id)}"
                >
                    <div class="result-card__meta">
                        <span class="meta-pill">${escapeHtml(formatFlowchartKindLabel(definition.kind))}</span>
                        ${definition.regionIds.map((regionId) => `<span class="meta-pill">${escapeHtml(formatDisplayLabel(regionId))}</span>`).join("")}
                    </div>
                    <h3>${escapeHtml(definition.title)}</h3>
                    <p>${escapeHtml(definition.summary)}</p>
                </button>
            `,
        )
        .join("");
}

function renderFlowchartModuleCards(
    definition: QuestFlowchartDefinition,
    flowchartState: FlowchartUiState,
) {
    const modules = definition.modules ?? [];

    if (modules.length === 0) {
        return "";
    }

    return `
        <section class="detail-section flowchart-module-section">
            <h3 class="detail-section__title">Route modules</h3>
            <div class="route-module-grid">
                ${modules
                    .map((module) => {
                        const relatedDefinition = module.relatedDefinitionId
                            ? getQuestFlowchartDefinitionById(flowchartDefinitions, module.relatedDefinitionId)
                            : null;
                        const actionLabel =
                            relatedDefinition && relatedDefinition.id !== definition.id ? "Open linked chart" : "Focus module";

                        return `
                            <article class="route-module-card ${flowchartState.activeModuleId === module.id ? "is-active" : ""}">
                                <div class="result-card__meta">
                                    <span class="meta-pill">${escapeHtml(formatFlowchartModuleToneLabel(module.tone))}</span>
                                    ${relatedDefinition && relatedDefinition.id !== definition.id ? `<span class="meta-pill">${escapeHtml(relatedDefinition.title)}</span>` : ""}
                                </div>
                                <h4>${escapeHtml(module.title)}</h4>
                                <p>${escapeHtml(module.summary)}</p>
                                ${renderGuideLinkList(module.linkedEntryIds)}
                                <div class="button-row button-row--compact route-module-actions">
                                    <button
                                        class="action-button action-button--secondary"
                                        type="button"
                                        data-flowchart-module-id="${escapeHtml(module.id)}"
                                    >
                                        ${escapeHtml(actionLabel)}
                                    </button>
                                </div>
                            </article>
                        `;
                    })
                    .join("")}
            </div>
        </section>
    `;
}

function renderFlowchartRendererButtons(flowchartState: FlowchartUiState) {
    const renderers: Array<{ id: FlowchartRendererMode; label: string }> = [
        { id: "graph", label: "Graph prototype" },
        { id: "mermaid", label: "Mermaid fallback" },
    ];

    return renderers
        .map(
            (renderer) => `
                <button
                    class="action-button action-button--secondary flowchart-renderer-button ${flowchartState.rendererMode === renderer.id ? "is-active" : ""}"
                    type="button"
                    aria-pressed="${flowchartState.rendererMode === renderer.id ? "true" : "false"}"
                    data-flowchart-renderer="${renderer.id}"
                >
                    ${escapeHtml(renderer.label)}
                </button>
            `,
        )
        .join("");
}

function renderFlowchartGraphLegend() {
    return `
        <div class="graph-legend" aria-label="Graph legend">
            <span class="graph-legend__item">
                <span class="graph-legend__line graph-legend__line--main-path"></span>
                Main spine
            </span>
            <span class="graph-legend__item">
                <span class="graph-legend__line graph-legend__line--gate"></span>
                Gates / progression
            </span>
            <span class="graph-legend__item">
                <span class="graph-legend__line graph-legend__line--optional"></span>
                Optional / detour
            </span>
            <span class="graph-legend__item">
                <span class="graph-legend__swatch graph-legend__swatch--exploration"></span>
                Left lane: exploration
            </span>
            <span class="graph-legend__item">
                <span class="graph-legend__swatch graph-legend__swatch--detour"></span>
                Right lane: legacy + campaign
            </span>
        </div>
    `;
}

function renderFlowchartSection(flowchartState: FlowchartUiState) {
    const viewModel = getFlowchartViewModel(flowchartState);
    const definition = viewModel.selectedDefinition;
    const renderingLabel =
        flowchartState.rendererMode === "graph" ? "Vanilla graph prototype (HTML/SVG)" : "Mermaid SVG";
    const rendererHint =
        flowchartState.rendererMode === "graph"
            ? "Primary route stays centered while detours spread outward. Click a branch node to reveal just the relevant connection label."
            : "Mermaid remains the compatibility fallback while the graph prototype layout is iterated.";

    if (!definition) {
        return "";
    }

    return `
        <section class="panel panel--flowchart">
            <div class="panel__header">
                <div>
                    <p class="eyebrow">Flowchart pilot</p>
                    <h2>Open the route graph before the long-form notes</h2>
                </div>
                <span class="pill">${escapeHtml(String(viewModel.filteredDefinitions.length))}${viewModel.hasActiveFilters ? ` / ${escapeHtml(String(viewModel.definitions.length))}` : ""} chart${viewModel.filteredDefinitions.length === 1 ? "" : "s"}</span>
            </div>
            <p>
                Start with the graph itself: progression charts begin in Qinghe, then fold in reviewed gates, exploration routes,
                Jianghu Legacy / mystic-art detours, and the current campaign slices without pretending the dataset is already a complete walkthrough atlas.
            </p>
            <div class="callout callout--info">
                ${flowchartState.rendererMode === "graph"
                    ? "Graph prototype mode is active: click nodes to sync the codex without going through Mermaid, and use the toggle below to compare it against the current fallback renderer."
                    : "Mermaid fallback mode is active. Selecting a chart steers the codex pane below, and selecting a codex entry can pull the closest chart back into view."}
            </div>

            <div class="flowchart-layout">
                ${renderFlowchartFilterButtons(flowchartState)}

                <div class="flowchart-selector">
                    ${renderFlowchartSelectorCards(viewModel.filteredDefinitions, flowchartState)}
                </div>

                <article class="detail-panel__body flowchart-view">
                    <div class="flowchart-view__header">
                        <div class="flowchart-view__summary">
                            <div class="result-card__meta">
                                <span class="meta-pill">${escapeHtml(`${formatFlowchartKindLabel(definition.kind)} chart`)}</span>
                                <span class="meta-pill">${escapeHtml(String(definition.linkedEntryIds.length))} linked entr${definition.linkedEntryIds.length === 1 ? "y" : "ies"}</span>
                            </div>
                            <h3>${escapeHtml(definition.title)}</h3>
                            <p>${escapeHtml(definition.summary)}</p>
                        </div>

                        <div class="flowchart-view__controls">
                            <dl class="detail-list flowchart-detail-list">
                                <div>
                                    <dt>Regions</dt>
                                    <dd>${escapeHtml(formatListDisplay(definition.regionIds))}</dd>
                                </div>
                                <div>
                                    <dt>Linked entries</dt>
                                    <dd>${escapeHtml(String(definition.linkedEntryIds.length))}</dd>
                                </div>
                                <div>
                                    <dt>Rendering</dt>
                                    <dd>${escapeHtml(renderingLabel)}</dd>
                                </div>
                            </dl>

                            <div class="button-row button-row--compact flowchart-renderer-row">
                                <span class="muted-inline">Renderer spike</span>
                                ${renderFlowchartRendererButtons(flowchartState)}
                            </div>

                            <p class="muted-inline flowchart-renderer-hint">${escapeHtml(rendererHint)}</p>

                            ${flowchartState.rendererMode === "graph" ? renderFlowchartGraphLegend() : ""}
                        </div>
                    </div>

                    <div
                        class="flowchart-diagram ${flowchartState.rendererMode === "graph" ? "flowchart-diagram--graph" : ""}"
                        data-flowchart-render-target
                        data-flowchart-renderer-mode="${flowchartState.rendererMode}"
                    >
                        <p class="muted-inline">Rendering flowchart…</p>
                    </div>

                    <div class="flowchart-support">
                        ${renderFlowchartModuleCards(definition, flowchartState)}
                        ${renderCodexReferenceSection("Linked codex entries", definition.linkedEntryIds)}

                        <details class="flowchart-source">
                            <summary>Mermaid fallback source</summary>
                            <pre class="code-block">${escapeHtml(definition.mermaid)}</pre>
                        </details>
                    </div>
                </article>
            </div>
        </section>
    `;
}

function getBackendLabel(backend: ToolkitMigrationSummary["backend"]) {
    switch (backend) {
        case "indexeddb":
            return "IndexedDB active";
        case "localstorage":
            return "localStorage fallback";
        default:
            return "in-memory only";
    }
}

function getMigrationTone(summary: ToolkitMigrationSummary) {
    if (summary.backend === "indexeddb" && summary.snapshot.importedAt) {
        return "completed";
    }

    if (summary.warning) {
        return "in-progress";
    }

    return summary.status === "empty" ? "neutral" : "completed";
}

function getMigrationStatusLabel(summary: ToolkitMigrationSummary) {
    switch (summary.status) {
        case "imported":
            return "legacy imported";
        case "reimported":
            return "legacy re-imported";
        case "hydrated":
            return summary.snapshot.importedAt ? "snapshot ready" : "storage ready";
        case "empty":
            return summary.legacyStateDetected ? "storage reset" : "awaiting legacy data";
    }
}

function renderMigrationStatCards(summary: ToolkitMigrationSummary) {
    const stats = [
        { label: "Favorites", value: summary.counts.favoriteCount },
        { label: "Tracked NPCs", value: summary.counts.trackedNpcCount },
        { label: "Saved notes", value: summary.counts.noteCount },
        { label: "Custom maps", value: summary.counts.customMapCount },
    ];

    return stats
        .map(
            (stat) => `
                <article class="stat-card">
                    <p class="stat-card__label">${escapeHtml(stat.label)}</p>
                    <p class="stat-card__value">${escapeHtml(stat.value)}</p>
                </article>
            `,
        )
        .join("");
}

function renderMigrationPanel(summary: ToolkitMigrationSummary) {
    return `
        <section class="panel">
            <div class="panel__header">
                <div>
                    <p class="eyebrow">Persistence bridge</p>
                    <h2>IndexedDB migration layer</h2>
                </div>
                <div class="status-stack">
                    <span class="status-badge status-badge--${getMigrationTone(summary)}">${escapeHtml(getMigrationStatusLabel(summary))}</span>
                    <span class="pill">${escapeHtml(getBackendLabel(summary.backend))}</span>
                </div>
            </div>

            <p>
                ${escapeHtml(summary.message)}
            </p>

            ${summary.warning ? `<div class="callout callout--warning">${escapeHtml(summary.warning)}</div>` : ""}

            <div class="stat-grid">
                ${renderMigrationStatCards(summary)}
            </div>

            <dl class="detail-list">
                <div>
                    <dt>Detected legacy key</dt>
                    <dd><code>${escapeHtml(summary.legacyStorageKey ?? "none detected")}</code></dd>
                </div>
                <div>
                    <dt>Supported legacy keys</dt>
                    <dd>${LEGACY_TOOLKIT_STORAGE_KEYS.map((key) => `<code>${escapeHtml(key)}</code>`).join(" ")}</dd>
                </div>
                <div>
                    <dt>Fallback storage key</dt>
                    <dd><code>${escapeHtml(FOUNDATION_LOCAL_STORAGE_KEY)}</code></dd>
                </div>
                <div>
                    <dt>Imported at</dt>
                    <dd>${escapeHtml(formatTimestamp(summary.snapshot.importedAt))}</dd>
                </div>
                <div>
                    <dt>Last sync</dt>
                    <dd>${escapeHtml(formatTimestamp(summary.snapshot.lastSyncedAt))}</dd>
                </div>
                <div>
                    <dt>Legacy data found</dt>
                    <dd>${summary.legacyStateDetected ? "yes" : "not yet"}</dd>
                </div>
                <div>
                    <dt>Foundation schema</dt>
                    <dd>v${escapeHtml(summary.snapshot.schemaVersion)}</dd>
                </div>
            </dl>

            <div class="button-row">
                <button class="action-button" type="button" data-action="rerun-migration">Re-import legacy snapshot</button>
                <span class="muted-inline">
                    Use this after changing favorites, progress, notes, or custom maps in the root prototype.
                </span>
            </div>
        </section>
    `;
}

function renderFoundationMarkup(
    summary: ToolkitMigrationSummary,
    codexState: CodexUiState,
    flowchartState: FlowchartUiState,
) {
    return `
        <div class="shell">
            <header class="hero">
                <div class="hero__layout">
                    <div class="hero__content">
                        <p class="eyebrow">WWM Toolkit foundation</p>
                        <h1>Graph-first Qinghe codex guide</h1>
                        <p class="hero__lead">
                            The foundation now opens on the reviewed route graph instead of burying it under status cards,
                            then fans out into the Qinghe guide, codex search, and migration bridge for the broader toolkit rewrite.
                        </p>
                        <div class="hero__meta">
                            <span class="pill">Qinghe-first onboarding route</span>
                            <span class="pill">${escapeHtml(String(flowchartDefinitions.length))} reviewed charts</span>
                            <span class="pill">${escapeHtml(getBackendLabel(summary.backend))}</span>
                            <span class="pill">${escapeHtml(String(codexDocuments.length))} indexed codex entries</span>
                        </div>
                    </div>

                    <aside class="hero__launchpad">
                        <p class="eyebrow">Quick start</p>
                        <h2>Go straight to the graph workbench</h2>
                        <p>
                            The graph is now the first-class surface. Jump directly into route structure, then dip into guide context or search when you want supporting detail.
                        </p>
                        <div class="button-row hero__actions">
                            <a class="action-button" href="#flowchart-panel">Jump to flowcharts</a>
                            <a class="action-button action-button--secondary" href="#qinghe-guide-panel">Jump to Qinghe guide</a>
                            <a class="action-button action-button--secondary" href="#codex-search-panel">Jump to codex search</a>
                        </div>

                        <div class="hero__stat-grid">
                            <article class="hero-stat">
                                <p class="hero-stat__label">Charts</p>
                                <p class="hero-stat__value">${escapeHtml(String(flowchartDefinitions.length))}</p>
                            </article>
                            <article class="hero-stat">
                                <p class="hero-stat__label">Codex</p>
                                <p class="hero-stat__value">${escapeHtml(String(codexDocuments.length))}</p>
                            </article>
                            <article class="hero-stat">
                                <p class="hero-stat__label">Storage</p>
                                <p class="hero-stat__value hero-stat__value--compact">${escapeHtml(getBackendLabel(summary.backend))}</p>
                            </article>
                        </div>
                    </aside>
                </div>
            </header>

            <div id="flowchart-panel">
                ${renderFlowchartSection(flowchartState)}
            </div>

            <div id="qinghe-guide-panel">
                ${renderQingheGuideSection()}
            </div>

            <div id="codex-search-panel">
                ${renderCodexSearchSection(codexState)}
            </div>

            <section class="panel">
                <div class="panel__header">
                    <div>
                        <p class="eyebrow">Reviewed seed slice</p>
                        <h2>Regions, quests, and storylines are now cross-linked</h2>
                    </div>
                </div>
                <p>
                    The modular app now ships a deliberately small but genuinely connected reviewed slice: three first-class region entries,
                    three chapter-level storyline entries, ordered main-story quest anchors, the first first-class Qinghe optional-route entries,
                    and the reviewed Qinghe / Kaifeng campaign ladders plus the current Game8-backed Hexi campaign slice. It is intentionally modest, cross-linked, and honest about what is reviewed
                    versus what still needs deeper normalization.
                </p>
                <div class="phase-grid">
                    ${renderRegionSeedCards()}
                </div>
                <div class="panel__subsection">
                    <div class="panel__header">
                        <div>
                            <p class="eyebrow">Storyline spine</p>
                            <h3>Chapter coverage</h3>
                        </div>
                    </div>
                    <div class="phase-grid">
                        ${renderStorylineSeedCards()}
                    </div>
                </div>
                <div class="panel__subsection">
                    <div class="panel__header">
                        <div>
                            <p class="eyebrow">Campaign side-quest slice</p>
                            <h3>Reviewed gate-path campaign ladders</h3>
                        </div>
                    </div>
                    <div class="domain-grid">
                        ${renderCampaignSeedCards()}
                    </div>
                </div>
                <div class="panel__subsection">
                    <div class="panel__header">
                        <div>
                            <p class="eyebrow">Optional route slice</p>
                            <h3>Qinghe hidden exploration and mystic-art routes</h3>
                        </div>
                    </div>
                    <p>
                        These early Qinghe routes are now modeled as first-class quest entries instead of title-only flowchart notes, while still staying
                        separate from literal encounter activities.
                    </p>
                    <div class="domain-grid">
                        ${renderOptionalRouteSeedCards()}
                    </div>
                </div>
            </section>

            <section class="panel">
                <div class="panel__header">
                    <div>
                        <p class="eyebrow">Phase tracker</p>
                        <h2>Documented roadmap execution</h2>
                    </div>
                </div>
                <div class="phase-grid">
                    ${renderPhaseCards()}
                </div>
            </section>

            <section class="panel">
                <div class="panel__header">
                    <div>
                        <p class="eyebrow">Content foundation</p>
                        <h2>Verified domain packs</h2>
                    </div>
                </div>
                <div class="domain-grid">
                    ${renderDomainCards()}
                </div>
            </section>

            <section class="panel">
                <div class="panel__header">
                    <div>
                        <p class="eyebrow">Migration principle</p>
                        <h2>Non-destructive bridge</h2>
                    </div>
                </div>
                <p>
                    The existing static NPC toolkit remains intact while the new modular application architecture is built in parallel.
                    Phase 1 now includes a versioned persistence bridge so legacy favorites, progress, field notes, and custom maps can
                    move forward without forcing a risky big-bang rewrite.
                </p>
            </section>

            ${renderMigrationPanel(summary)}
        </div>
    `;
}

async function ensureMermaidInitialized() {
    if (!mermaidModulePromise) {
        mermaidModulePromise = import("mermaid");
    }

    const mermaidModule = await mermaidModulePromise;
    const mermaid = mermaidModule.default;

    if (!mermaidInitialized) {
        mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme: "base",
            themeVariables: {
                primaryColor: "#0f172a",
                primaryTextColor: "#e2e8f0",
                primaryBorderColor: "#60a5fa",
                lineColor: "#94a3b8",
                secondaryColor: "#172554",
                tertiaryColor: "#1f2937",
                fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            },
            flowchart: {
                curve: "basis",
                htmlLabels: true,
            },
        });

        mermaidInitialized = true;
    }

    return mermaid;
}

async function hydrateFlowchartVisualization(root: Element, codexState: CodexUiState, flowchartState: FlowchartUiState) {
    const renderTarget = root.querySelector<HTMLElement>("[data-flowchart-render-target]");
    const definition = getFlowchartViewModel(flowchartState).selectedDefinition;

    if (!renderTarget || !definition) {
        return;
    }

    const renderVersion = ++flowchartRenderVersion;

    if (flowchartState.rendererMode === "graph") {
        const computedStyle = globalThis.getComputedStyle(renderTarget);
        const paddingX = parseFloat(computedStyle.paddingLeft || "0") + parseFloat(computedStyle.paddingRight || "0");

        renderTarget.innerHTML = renderQuestGraphDefinitionAsHtml(definition.graph, {
            selectedEntryId: codexState.selectedEntryId,
            minimumWidth: Math.max(renderTarget.clientWidth - paddingX, 0),
        });
        return;
    }

    renderTarget.innerHTML = '<p class="muted-inline">Rendering flowchart…</p>';

    try {
        const mermaid = await ensureMermaidInitialized();
        const { svg, bindFunctions } = await mermaid.render(`wwm-flowchart-${renderVersion}`, definition.mermaid);

        if (renderVersion !== flowchartRenderVersion) {
            return;
        }

        renderTarget.innerHTML = svg;
        bindFunctions?.(renderTarget);
    } catch (error) {
        renderTarget.innerHTML = `
            <div class="callout callout--warning">
                ${escapeHtml(error instanceof Error ? error.message : "Flowchart rendering failed.")}
            </div>
            <pre class="code-block">${escapeHtml(definition.mermaid)}</pre>
        `;
    }
}

function renderLoadingState(root: Element) {
    root.innerHTML = `
        <div class="shell">
            <section class="hero">
                <p class="eyebrow">WWM Toolkit foundation</p>
                <h1>Hydrating the migration bridge…</h1>
                <p class="hero__lead">
                    Checking IndexedDB, loading the foundation snapshot, and importing any legacy prototype state that still needs a home.
                </p>
            </section>
        </div>
    `;
}

function renderErrorState(root: Element, errorMessage: string) {
    root.innerHTML = `
        <div class="shell">
            <section class="panel">
                <p class="eyebrow">Migration issue</p>
                <h2>Foundation storage could not be initialized</h2>
                <div class="callout callout--warning">${escapeHtml(errorMessage)}</div>
                <p>
                    The legacy prototype is still safe in the repository root. Once the storage error is resolved, the migration bridge can be re-run.
                </p>
            </section>
        </div>
    `;
}

function focusInteractiveElement(
    root: Element,
    focusSelector?: string,
    fallbackFocusSelector?: string,
    selectionStart?: number | null,
    selectionEnd?: number | null,
) {
    if (!focusSelector && !fallbackFocusSelector) {
        return;
    }

    const nextElement =
        (focusSelector ? root.querySelector<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>(focusSelector) : null) ??
        (fallbackFocusSelector
            ? root.querySelector<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>(fallbackFocusSelector)
            : null);

    nextElement?.focus();

    if (
        nextElement instanceof HTMLInputElement &&
        typeof selectionStart === "number" &&
        typeof selectionEnd === "number"
    ) {
        nextElement.setSelectionRange(selectionStart, selectionEnd);
    }
}

function rerenderLinkedPanels(
    root: Element,
    codexState: CodexUiState,
    flowchartState: FlowchartUiState,
    options?: {
        focusSelector?: string;
        fallbackFocusSelector?: string;
        scrollTargetSelector?: string;
        selectionStart?: number | null;
        selectionEnd?: number | null;
    },
) {
    const flowchartPanel = root.querySelector<HTMLElement>("#flowchart-panel");
    const codexPanel = root.querySelector<HTMLElement>("#codex-search-panel");

    if (flowchartPanel) {
        flowchartPanel.innerHTML = renderFlowchartSection(flowchartState);
    }

    if (codexPanel) {
        codexPanel.innerHTML = renderCodexSearchSection(codexState);
    }

    attachCodexHandlers(root, codexState, flowchartState);
    attachFlowchartHandlers(root, codexState, flowchartState);

    if (options?.scrollTargetSelector) {
        root.querySelector<HTMLElement>(options.scrollTargetSelector)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    focusInteractiveElement(
        root,
        options?.focusSelector,
        options?.fallbackFocusSelector,
        options?.selectionStart,
        options?.selectionEnd,
    );
}

function attachLinearKeyboardNavigation(buttons: HTMLButtonElement[]) {
    buttons.forEach((button, index) => {
        button.onkeydown = (event) => {
            const targetIndex = getKeyboardNavigationTargetIndex(index, buttons.length, event.key);

            if (targetIndex === null || targetIndex === index) {
                return;
            }

            event.preventDefault();
            buttons[targetIndex]?.focus();
        };
    });
}

function getCodexQuestTypeForFlowchartModuleTone(tone: QuestFlowchartModule["tone"]): CodexQuestType | null {
    switch (tone) {
        case "main":
            return "main";
        case "exploration":
            return "exploration";
        case "legacy":
            return "jianghu-legacy";
        case "campaign":
            return "campaign";
        default:
            return null;
    }
}

function syncFlowchartFiltersToDefinition(flowchartState: FlowchartUiState, definition: QuestFlowchartDefinition) {
    flowchartState.selectorKind = definition.kind;
    flowchartState.selectorRegionId = definition.regionIds.length === 1 ? (definition.regionIds[0] ?? "all") : "all";
}

function applyFlowchartModuleSelection(
    module: QuestFlowchartModule,
    currentDefinition: QuestFlowchartDefinition,
    codexState: CodexUiState,
    flowchartState: FlowchartUiState,
) {
    const targetDefinition = module.relatedDefinitionId
        ? getQuestFlowchartDefinitionById(flowchartDefinitions, module.relatedDefinitionId) ?? currentDefinition
        : currentDefinition;
    const targetQuestType = getCodexQuestTypeForFlowchartModuleTone(module.tone);

    flowchartState.selectedDefinitionId = targetDefinition.id;
    flowchartState.activeModuleId = targetDefinition.id === currentDefinition.id ? module.id : null;

    if (targetDefinition.id !== currentDefinition.id) {
        syncFlowchartFiltersToDefinition(flowchartState, targetDefinition);
    }

    resetCodexState(codexState);
    codexState.selectedEntryId = module.focusEntryId;

    if (targetDefinition.regionIds.length === 1) {
        codexState.regionId = targetDefinition.regionIds[0] ?? "all";
    }

    if (targetQuestType) {
        codexState.domain = "quests";
        codexState.questType = targetQuestType;
    }
}

function isTextEntryTarget(target: EventTarget | null) {
    return (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
    );
}

function attachFlowchartHandlers(root: Element, codexState: CodexUiState, flowchartState: FlowchartUiState) {
    const flowchartPanel = root.querySelector<HTMLElement>("#flowchart-panel");

    if (!flowchartPanel) {
        return;
    }

    const activeDefinition = getQuestFlowchartDefinitionById(flowchartDefinitions, flowchartState.selectedDefinitionId);
    const buttons = [...flowchartPanel.querySelectorAll<HTMLButtonElement>("[data-flowchart-id]")];
    const rendererButtons = [...flowchartPanel.querySelectorAll<HTMLButtonElement>("[data-flowchart-renderer]")];
    const kindFilterButtons = [...flowchartPanel.querySelectorAll<HTMLButtonElement>("[data-flowchart-filter-kind]")];
    const regionFilterButtons = [...flowchartPanel.querySelectorAll<HTMLButtonElement>("[data-flowchart-filter-region]")];
    const moduleButtons = [...flowchartPanel.querySelectorAll<HTMLButtonElement>("[data-flowchart-module-id]")];

    buttons.forEach((button) => {
        button.onclick = () => {
            flowchartState.selectedDefinitionId = button.dataset.flowchartId ?? null;
            flowchartState.activeModuleId = null;
            syncCodexStateToFlowchartSelection(codexState, flowchartState);
            rerenderLinkedPanels(root, codexState, flowchartState, {
                focusSelector: "[data-flowchart-id].is-active",
                fallbackFocusSelector: "[data-codex-entry-id].is-active",
            });
        };
    });

    kindFilterButtons.forEach((button) => {
        button.onclick = () => {
            const nextKind = button.dataset.flowchartFilterKind as QuestFlowchartKind | "all" | undefined;

            if (!nextKind) {
                return;
            }

            const previousSelectedDefinitionId = flowchartState.selectedDefinitionId;

            flowchartState.selectorKind = nextKind;
            flowchartState.activeModuleId = null;
            getFlowchartViewModel(flowchartState);

            if (flowchartState.selectedDefinitionId !== previousSelectedDefinitionId) {
                syncCodexStateToFlowchartSelection(codexState, flowchartState);
            }

            rerenderLinkedPanels(root, codexState, flowchartState, {
                focusSelector: `[data-flowchart-filter-kind="${nextKind}"]`,
                fallbackFocusSelector: "[data-flowchart-id].is-active",
            });
        };
    });

    regionFilterButtons.forEach((button) => {
        button.onclick = () => {
            const nextRegionId = button.dataset.flowchartFilterRegion ?? "all";
            const previousSelectedDefinitionId = flowchartState.selectedDefinitionId;

            flowchartState.selectorRegionId = nextRegionId;
            flowchartState.activeModuleId = null;
            getFlowchartViewModel(flowchartState);

            if (flowchartState.selectedDefinitionId !== previousSelectedDefinitionId) {
                syncCodexStateToFlowchartSelection(codexState, flowchartState);
            }

            rerenderLinkedPanels(root, codexState, flowchartState, {
                focusSelector: `[data-flowchart-filter-region="${nextRegionId}"]`,
                fallbackFocusSelector: "[data-flowchart-id].is-active",
            });
        };
    });

    moduleButtons.forEach((button) => {
        button.onclick = () => {
            const moduleId = button.dataset.flowchartModuleId;
            const module = activeDefinition?.modules?.find((candidate) => candidate.id === moduleId);

            if (!module || !activeDefinition) {
                return;
            }

            applyFlowchartModuleSelection(module, activeDefinition, codexState, flowchartState);
            rerenderLinkedPanels(root, codexState, flowchartState, {
                focusSelector: "[data-codex-entry-id].is-active",
                fallbackFocusSelector: "[data-flowchart-id].is-active",
            });
        };
    });

    rendererButtons.forEach((button) => {
        button.onclick = () => {
            const rendererMode = button.dataset.flowchartRenderer;

            if (rendererMode !== "graph" && rendererMode !== "mermaid") {
                return;
            }

            flowchartState.rendererMode = rendererMode;
            rerenderLinkedPanels(root, codexState, flowchartState, {
                focusSelector: `[data-flowchart-renderer="${rendererMode}"]`,
                fallbackFocusSelector: "[data-flowchart-id].is-active",
            });
        };
    });

    attachLinearKeyboardNavigation(buttons);
    attachLinearKeyboardNavigation(kindFilterButtons);
    attachLinearKeyboardNavigation(regionFilterButtons);
    attachLinearKeyboardNavigation(moduleButtons);
    attachLinearKeyboardNavigation(rendererButtons);

    void hydrateFlowchartVisualization(root, codexState, flowchartState).then(() => {
        const nodeButtons = [...flowchartPanel.querySelectorAll<HTMLButtonElement>("[data-flowchart-node-entry-id]")];

        nodeButtons.forEach((button) => {
            button.onclick = () => {
                const entryId = button.dataset.flowchartNodeEntryId ?? null;

                if (!entryId) {
                    return;
                }

                flowchartState.activeModuleId = null;
                resetCodexState(codexState);
                codexState.selectedEntryId = entryId;

                if (activeDefinition?.regionIds.length === 1) {
                    codexState.regionId = activeDefinition.regionIds[0] ?? "all";
                }

                rerenderLinkedPanels(root, codexState, flowchartState, {
                    focusSelector: `[data-flowchart-node-entry-id="${entryId}"]`,
                    fallbackFocusSelector: "[data-codex-entry-id].is-active",
                });
            };
        });

        attachLinearKeyboardNavigation(nodeButtons);
    });
}

function applyQingheGuideAction(
    action: QingheGuideAction,
    codexState: CodexUiState,
    flowchartState: FlowchartUiState,
) {
    resetCodexState(codexState);
    flowchartState.activeModuleId = null;

    switch (action) {
        case "qinghe-overview":
            codexState.domain = "regions";
            codexState.selectedEntryId = "qinghe";
            flowchartState.selectedDefinitionId = "progression-qinghe-onboarding-route";
            flowchartState.selectorKind = "progression";
            flowchartState.selectorRegionId = "qinghe";
            return { scrollTargetSelector: "#flowchart-panel" };
        case "qinghe-main-route":
            codexState.domain = "quests";
            codexState.regionId = "qinghe";
            codexState.questType = "main";
            codexState.selectedEntryId = "quest-another-new-wing";
            flowchartState.selectedDefinitionId = "progression-qinghe-onboarding-route";
            flowchartState.selectorKind = "progression";
            flowchartState.selectorRegionId = "qinghe";
            return { scrollTargetSelector: "#codex-search-panel" };
        case "qinghe-exploration-routes":
            codexState.domain = "quests";
            codexState.regionId = "qinghe";
            codexState.questType = "exploration";
            codexState.selectedEntryId = "quest-white-bird-shooting";
            flowchartState.selectedDefinitionId = "progression-qinghe-onboarding-route";
            flowchartState.selectorKind = "progression";
            flowchartState.selectorRegionId = "qinghe";
            return { scrollTargetSelector: "#codex-search-panel" };
        case "qinghe-jianghu-legacy":
            codexState.domain = "quests";
            codexState.regionId = "qinghe";
            codexState.questType = "jianghu-legacy";
            codexState.selectedEntryId = "quest-meridian-touch";
            flowchartState.selectedDefinitionId = "progression-qinghe-onboarding-route";
            flowchartState.selectorKind = "progression";
            flowchartState.selectorRegionId = "qinghe";
            return { scrollTargetSelector: "#codex-search-panel" };
        case "qinghe-campaign-gate":
            codexState.domain = "quests";
            codexState.regionId = "qinghe";
            codexState.questType = "campaign";
            codexState.selectedEntryId = "quest-still-shore";
            flowchartState.selectedDefinitionId = "campaign-branches-qinghe";
            flowchartState.selectorKind = "campaign";
            flowchartState.selectorRegionId = "qinghe";
            return { scrollTargetSelector: "#codex-search-panel" };
        case "next-region-gates":
            codexState.domain = "regions";
            codexState.selectedEntryId = "kaifeng";
            flowchartState.selectedDefinitionId = "progression-region-level-overview";
            flowchartState.selectorKind = "progression";
            flowchartState.selectorRegionId = "all";
            return { scrollTargetSelector: "#flowchart-panel" };
    }
}

function attachGuideHandlers(root: Element, codexState: CodexUiState, flowchartState: FlowchartUiState) {
    const buttons = root.querySelectorAll<HTMLButtonElement>("[data-guide-action]");
    attachLinearKeyboardNavigation([...buttons]);

    buttons.forEach((button) => {
        button.onclick = () => {
            const action = button.dataset.guideAction as QingheGuideAction | undefined;

            if (!action) {
                return;
            }

            const { scrollTargetSelector } = applyQingheGuideAction(action, codexState, flowchartState);
            rerenderLinkedPanels(root, codexState, flowchartState, {
                scrollTargetSelector,
                focusSelector:
                    scrollTargetSelector === "#flowchart-panel"
                        ? "[data-flowchart-id].is-active"
                        : "[data-codex-entry-id].is-active",
                fallbackFocusSelector:
                    scrollTargetSelector === "#flowchart-panel"
                        ? "[data-codex-entry-id].is-active"
                        : "[data-codex-control='query']",
            });
        };
    });
}

function attachCodexHandlers(root: Element, codexState: CodexUiState, flowchartState: FlowchartUiState) {
    const codexPanel = root.querySelector<HTMLElement>("#codex-search-panel");

    if (!codexPanel) {
        return;
    }

    const queryInput = root.querySelector<HTMLInputElement>("[data-codex-control='query']");
    const domainSelect = root.querySelector<HTMLSelectElement>("[data-codex-control='domain']");
    const regionSelect = root.querySelector<HTMLSelectElement>("[data-codex-control='region']");
    const questTypeSelect = root.querySelector<HTMLSelectElement>("[data-codex-control='questType']");
    const resetButton = root.querySelector<HTMLButtonElement>("[data-codex-action='reset-search']");
    const entryButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-codex-entry-id]")];
    const navigationButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-codex-navigation-id]")];

    attachLinearKeyboardNavigation(entryButtons);

    queryInput.oninput = (event) => {
        const target = event.currentTarget as HTMLInputElement;
        codexState.query = target.value;
        codexState.selectedEntryId = null;
        rerenderLinkedPanels(root, codexState, flowchartState, {
            focusSelector: "[data-codex-control='query']",
            selectionStart: target.selectionStart,
            selectionEnd: target.selectionEnd,
        });
    };

    queryInput.onkeydown = (event) => {
        if (event.key === "ArrowDown" && entryButtons.length > 0) {
            event.preventDefault();
            entryButtons[0]?.focus();
            return;
        }

        if (event.key === "Escape" && codexState.query.length > 0) {
            event.preventDefault();
            codexState.query = "";
            codexState.selectedEntryId = null;
            rerenderLinkedPanels(root, codexState, flowchartState, {
                focusSelector: "[data-codex-control='query']",
                selectionStart: 0,
                selectionEnd: 0,
            });
        }
    };

    domainSelect.onchange = (event) => {
        codexState.domain = (event.currentTarget as HTMLSelectElement).value as CodexDomain | "all";
        codexState.selectedEntryId = null;
        rerenderLinkedPanels(root, codexState, flowchartState, {
            focusSelector: "[data-codex-control='domain']",
        });
    };

    regionSelect.onchange = (event) => {
        codexState.regionId = (event.currentTarget as HTMLSelectElement).value;
        codexState.selectedEntryId = null;
        rerenderLinkedPanels(root, codexState, flowchartState, {
            focusSelector: "[data-codex-control='region']",
        });
    };

    questTypeSelect.onchange = (event) => {
        codexState.questType = (event.currentTarget as HTMLSelectElement).value as CodexQuestType | "all";
        codexState.selectedEntryId = null;
        rerenderLinkedPanels(root, codexState, flowchartState, {
            focusSelector: "[data-codex-control='questType']",
        });
    };

    resetButton.onclick = () => {
        resetCodexState(codexState);
        rerenderLinkedPanels(root, codexState, flowchartState, {
            focusSelector: "[data-codex-control='query']",
            selectionStart: 0,
            selectionEnd: 0,
        });
    };

    entryButtons.forEach((button) => {
        button.onclick = () => {
            codexState.selectedEntryId = button.dataset.codexEntryId ?? null;
            syncFlowchartStateToCodexSelection(codexState, flowchartState);
            rerenderLinkedPanels(root, codexState, flowchartState, {
                focusSelector: "[data-codex-entry-id].is-active",
                fallbackFocusSelector: "[data-codex-control='query']",
            });
        };
    });

    navigationButtons.forEach((button) => {
        button.onclick = () => {
            resetCodexState(codexState);
            codexState.selectedEntryId = button.dataset.codexNavigationId ?? null;
            syncFlowchartStateToCodexSelection(codexState, flowchartState);
            rerenderLinkedPanels(root, codexState, flowchartState, {
                focusSelector: "[data-codex-entry-id].is-active",
                fallbackFocusSelector: "[data-codex-control='query']",
            });
        };
    });
}

function attachPersistenceHandlers(root: Element, codexState: CodexUiState, flowchartState: FlowchartUiState) {
    const reimportButton = root.querySelector<HTMLButtonElement>("[data-action='rerun-migration']");

    reimportButton?.addEventListener("click", async () => {
        reimportButton.disabled = true;
        reimportButton.textContent = "Re-importing…";

        try {
            const summary = await loadToolkitMigrationSummary({ forceLegacyImport: true });
            root.innerHTML = renderFoundationMarkup(summary, codexState, flowchartState);
            attachAppHandlers(root, codexState, flowchartState);
        } catch (error) {
            renderErrorState(root, error instanceof Error ? error.message : "Unknown error while re-importing the legacy snapshot.");
        }
    });
}

function attachAppHandlers(root: Element, codexState: CodexUiState, flowchartState: FlowchartUiState) {
    root.onkeydown = (event) => {
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) {
            return;
        }

        if (event.key === "/" && !isTextEntryTarget(event.target)) {
            event.preventDefault();
            const queryInput = root.querySelector<HTMLInputElement>("[data-codex-control='query']");
            queryInput?.focus();
            queryInput?.select();
        }
    };

    attachPersistenceHandlers(root, codexState, flowchartState);
    attachGuideHandlers(root, codexState, flowchartState);
    attachCodexHandlers(root, codexState, flowchartState);
    attachFlowchartHandlers(root, codexState, flowchartState);
}

export async function renderFoundationApp(root: Element | null) {
    if (!root) {
        throw new Error("App root not found.");
    }

    renderLoadingState(root);
    const codexState = createInitialCodexUiState();
    const flowchartState = createInitialFlowchartUiState();

    try {
        const summary = await loadToolkitMigrationSummary();
        root.innerHTML = renderFoundationMarkup(summary, codexState, flowchartState);
        attachAppHandlers(root, codexState, flowchartState);
    } catch (error) {
        renderErrorState(root, error instanceof Error ? error.message : "Unknown error while loading the foundation app.");
    }
}
