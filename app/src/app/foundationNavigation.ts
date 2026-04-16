import type { QuestFlowchartDefinition } from "../lib/flowcharts/questFlowcharts";
import {
    getCodexDocumentById,
    type CodexDomain,
    type CodexQuestDocument,
    type CodexQuestType,
    type CodexSearchDocument,
} from "../lib/search/codexSearch";

export interface CodexSyncTarget {
    query: string;
    domain: CodexDomain | "all";
    regionId: string | "all";
    questType: CodexQuestType | "all";
    selectedEntryId: string | null;
}

function getLinkedDocuments(definition: QuestFlowchartDefinition, documents: CodexSearchDocument[]) {
    return definition.linkedEntryIds
        .map((entryId) => getCodexDocumentById(documents, entryId))
        .filter((document): document is CodexSearchDocument => Boolean(document));
}

function getFirstRegionId(definition: QuestFlowchartDefinition) {
    return definition.regionIds[0] ?? "all";
}

function getFirstCampaignQuest(documents: CodexSearchDocument[], regionId: string | "all") {
    return documents.find(
        (document): document is CodexQuestDocument =>
            document.domain === "quests" &&
            document.questType === "campaign" &&
            (regionId === "all" || document.regionIds.includes(regionId)),
    );
}

function getFirstMainQuest(documents: CodexSearchDocument[], regionId: string | "all") {
    return documents.find(
        (document): document is CodexQuestDocument =>
            document.domain === "quests" &&
            document.questType === "main" &&
            (regionId === "all" || document.regionIds.includes(regionId)),
    );
}

export function getCodexSyncTargetForFlowchartDefinition(
    definition: QuestFlowchartDefinition,
    documents: CodexSearchDocument[],
): CodexSyncTarget {
    const linkedDocuments = getLinkedDocuments(definition, documents);
    const firstRegionId = getFirstRegionId(definition);
    const firstRegionDocument = linkedDocuments.find(
        (document) => document.domain === "regions" && document.id === firstRegionId,
    );
    const firstStorylineDocument = linkedDocuments.find((document) => document.domain === "storylines") ?? null;

    if (definition.kind === "campaign") {
        const primaryDocument =
            getFirstCampaignQuest(linkedDocuments, firstRegionId) ??
            firstRegionDocument ??
            firstStorylineDocument ??
            linkedDocuments[0] ??
            null;
        const isCampaignQuest = primaryDocument?.domain === "quests" && primaryDocument.questType === "campaign";

        return {
            query: "",
            domain: isCampaignQuest ? "quests" : "all",
            regionId: firstRegionId,
            questType: isCampaignQuest ? "campaign" : "all",
            selectedEntryId: primaryDocument?.id ?? null,
        };
    }

    if (definition.kind === "storyline") {
        const primaryDocument = firstStorylineDocument ?? linkedDocuments[0] ?? null;

        return {
            query: "",
            domain: primaryDocument?.domain === "storylines" ? "storylines" : "all",
            regionId: firstRegionId,
            questType: "all",
            selectedEntryId: primaryDocument?.id ?? null,
        };
    }

    if (definition.regionIds.length > 1) {
        const primaryDocument = firstRegionDocument ?? linkedDocuments.find((document) => document.domain === "regions") ?? linkedDocuments[0] ?? null;

        return {
            query: "",
            domain: primaryDocument?.domain === "regions" ? "regions" : "all",
            regionId: "all",
            questType: "all",
            selectedEntryId: primaryDocument?.id ?? null,
        };
    }

    const primaryDocument =
        getFirstMainQuest(linkedDocuments, firstRegionId) ??
        firstStorylineDocument ??
        firstRegionDocument ??
        linkedDocuments[0] ??
        null;

    return {
        query: "",
        domain: "all",
        regionId: firstRegionId,
        questType: "all",
        selectedEntryId: primaryDocument?.id ?? null,
    };
}

export function getPreferredFlowchartDefinitionIdForCodexDocument(
    document: CodexSearchDocument,
    definitions: QuestFlowchartDefinition[],
) {
    const findLinkedDefinition = (id: string) =>
        definitions.find((definition) => definition.id === id && definition.linkedEntryIds.includes(document.id)) ?? null;

    const findFirstContainingDefinition = () =>
        definitions.find((definition) => definition.linkedEntryIds.includes(document.id)) ?? null;

    if (document.domain === "storylines") {
        return findLinkedDefinition(`${document.id}-flowchart`)?.id ?? findFirstContainingDefinition()?.id ?? null;
    }

    if (document.domain === "regions") {
        if (document.id === "qinghe") {
            return (
                findLinkedDefinition("progression-qinghe-onboarding-route")?.id ??
                findLinkedDefinition("progression-region-level-overview")?.id ??
                findFirstContainingDefinition()?.id ??
                null
            );
        }

        return (
            findLinkedDefinition("progression-region-level-overview")?.id ??
            findLinkedDefinition(`campaign-branches-${document.id}`)?.id ??
            findFirstContainingDefinition()?.id ??
            null
        );
    }

    if (document.domain === "quests") {
        const primaryRegionId = document.regionIds[0] ?? null;

        if (document.questType === "campaign" && primaryRegionId) {
            return (
                findLinkedDefinition(`campaign-branches-${primaryRegionId}`)?.id ??
                findFirstContainingDefinition()?.id ??
                null
            );
        }

        if (
            document.regionIds.includes("qinghe") &&
            ["main", "exploration", "jianghu-legacy"].includes(document.questType)
        ) {
            const qingheRoute = findLinkedDefinition("progression-qinghe-onboarding-route");

            if (qingheRoute) {
                return qingheRoute.id;
            }
        }

        for (const storylineId of document.storylineIds) {
            const storylineDefinition = findLinkedDefinition(`${storylineId}-flowchart`);

            if (storylineDefinition) {
                return storylineDefinition.id;
            }
        }

        return (
            findLinkedDefinition("progression-region-level-overview")?.id ??
            findFirstContainingDefinition()?.id ??
            null
        );
    }

    return findFirstContainingDefinition()?.id ?? null;
}

export function getKeyboardNavigationTargetIndex(currentIndex: number, itemCount: number, key: string) {
    if (itemCount <= 0 || currentIndex < 0 || currentIndex >= itemCount) {
        return null;
    }

    switch (key) {
        case "ArrowDown":
        case "ArrowRight":
            return Math.min(currentIndex + 1, itemCount - 1);
        case "ArrowUp":
        case "ArrowLeft":
            return Math.max(currentIndex - 1, 0);
        case "Home":
            return 0;
        case "End":
            return itemCount - 1;
        default:
            return null;
    }
}