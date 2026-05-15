import type { QuestEntry, QuestPack } from "../../data/schemas/quest";
import type { RegionPack } from "../../data/schemas/region";
import type { StorylinePack } from "../../data/schemas/storyline";
import {
    createQuestGraphDefinition,
    createQuestGraphEdge,
    createQuestGraphNode,
    type QuestGraphDefinition,
    type QuestGraphNodeType,
} from "./questFlowchartModel";
import { renderQuestGraphDefinitionAsMermaid } from "./renderers/mermaidQuestFlowchartAdapter";

export type QuestFlowchartKind = "progression" | "storyline" | "campaign";

export type QuestFlowchartModuleTone = "main" | "exploration" | "legacy" | "campaign" | "gate";

export interface QuestFlowchartModule {
    id: string;
    title: string;
    summary: string;
    tone: QuestFlowchartModuleTone;
    linkedEntryIds: string[];
    focusEntryId: string;
    relatedDefinitionId?: string;
}

export interface QuestFlowchartDefinition {
    id: string;
    title: string;
    kind: QuestFlowchartKind;
    summary: string;
    regionIds: string[];
    linkedEntryIds: string[];
    modules?: QuestFlowchartModule[];
    graph: QuestGraphDefinition;
    mermaid: string;
}

function formatDisplayLabel(value: string) {
    return value
        .split(/[-_]/g)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");
}

function toNodeId(prefix: string, value: string) {
    return `${prefix}_${value.replace(/[^a-zA-Z0-9]+/g, "_")}`;
}

function uniqueIds(values: string[]) {
    return [...new Set(values.filter(Boolean))];
}

function createFlowchartDefinition(definition: Omit<QuestFlowchartDefinition, "mermaid">): QuestFlowchartDefinition {
    return {
        ...definition,
        linkedEntryIds: uniqueIds(definition.linkedEntryIds),
        modules: definition.modules?.map((module) => ({
            ...module,
            linkedEntryIds: uniqueIds(module.linkedEntryIds),
        })),
        mermaid: renderQuestGraphDefinitionAsMermaid(definition.graph),
    };
}

function buildQingheProgressionModules(ids: {
    storylineId: string;
    anotherNewWingId: string;
    whiteBirdId: string;
    shamelessId: string;
    horseNeighsId: string;
    meridianTouchId: string;
    dustMirrorId: string;
    finaleId: string;
    stillShoreId: string;
    bodhiSeaId?: string;
    gleamingAbyssId?: string;
    palaceOfAnnalsId?: string;
    blissfulRetreatId?: string;
    haloPeakId?: string;
}): QuestFlowchartModule[] {
    return [
        {
            id: "qinghe-main-spine",
            title: "Main spine",
            summary: "The Chapter 1 route through Qinghe stays the backbone: open with Another New Wing, pivot through A Horse Neighs in the Forest, then bridge into the late-Chapter 1 finale.",
            tone: "main",
            linkedEntryIds: [
                ids.storylineId,
                ids.anotherNewWingId,
                ids.horseNeighsId,
                ids.dustMirrorId,
                ids.finaleId,
            ],
            focusEntryId: ids.anotherNewWingId,
        },
        {
            id: "qinghe-exploration-loop",
            title: "Exploration loop",
            summary: "White Bird Shooting and The Shameless currently form the clearest reviewed optional loop off Another New Wing, so they should stay grouped together until deeper route normalization lands.",
            tone: "exploration",
            linkedEntryIds: [ids.anotherNewWingId, ids.whiteBirdId, ids.shamelessId],
            focusEntryId: ids.whiteBirdId,
        },
        {
            id: "qinghe-meridian-detour",
            title: "Meridian detour",
            summary: "Meridian Touch is a short but important Jianghu Legacy link off A Horse Neighs in the Forest, and it deserves to read as a named detour instead of a generic side branch.",
            tone: "legacy",
            linkedEntryIds: [ids.horseNeighsId, ids.meridianTouchId],
            focusEntryId: ids.meridianTouchId,
        },
        {
            id: "qinghe-campaign-ladder",
            title: "Campaign ladder",
            summary: "Still Shore is only the opening gate. The reviewed Qinghe campaign ladder continues through Moonveil and Sundara, so keep that follow-through explicit even when the progression chart only shows the entry point.",
            tone: "campaign",
            linkedEntryIds: uniqueIds([
                ids.horseNeighsId,
                ids.stillShoreId,
                ids.bodhiSeaId ?? "",
                ids.gleamingAbyssId ?? "",
                ids.palaceOfAnnalsId ?? "",
                ids.blissfulRetreatId ?? "",
                ids.haloPeakId ?? "",
            ]),
            focusEntryId: ids.stillShoreId,
            relatedDefinitionId: "campaign-branches-qinghe",
        },
    ];
}

function buildQingheCampaignModules(ids: {
    horseNeighsId: string;
    stillShoreId: string;
    bodhiSeaId: string;
    gleamingAbyssId: string;
    palaceOfAnnalsId: string;
    finaleId: string;
    blissfulRetreatId: string;
    haloPeakId: string;
}): QuestFlowchartModule[] {
    return [
        {
            id: "qinghe-campaign-entry-gate",
            title: "Opening gate",
            summary: "Still Shore is anchored to A Horse Neighs in the Forest, so the first Qinghe campaign branch should always stay visibly tied to that main-story checkpoint.",
            tone: "campaign",
            linkedEntryIds: [ids.horseNeighsId, ids.stillShoreId],
            focusEntryId: ids.stillShoreId,
        },
        {
            id: "qinghe-moonveil-loop",
            title: "Moonveil loop",
            summary: "The current reviewed Qinghe ladder loops through Bodhi Sea, Gleaming Abyss, and Palace of Annals before the later Chapter 1 re-entry. Treat it as a campaign module, not a string of isolated side quests.",
            tone: "campaign",
            linkedEntryIds: [ids.stillShoreId, ids.bodhiSeaId, ids.gleamingAbyssId, ids.palaceOfAnnalsId],
            focusEntryId: ids.bodhiSeaId,
        },
        {
            id: "qinghe-late-chapter-link",
            title: "Late-Chapter 1 link",
            summary: "Blissful Retreat reconnects the Qinghe campaign ladder to the For Whom Does He Return window, so the late-story link should be visible instead of buried in notes.",
            tone: "campaign",
            linkedEntryIds: [ids.finaleId, ids.blissfulRetreatId],
            focusEntryId: ids.blissfulRetreatId,
            relatedDefinitionId: "storyline-heaven-has-no-pier-flowchart",
        },
        {
            id: "qinghe-sundara-capstone",
            title: "Sundara capstone",
            summary: "Halo Peak is the current reviewed end of Qinghe's campaign route, so it works as the modular capstone until the broader post-Qinghe structure is normalized.",
            tone: "campaign",
            linkedEntryIds: [ids.blissfulRetreatId, ids.haloPeakId],
            focusEntryId: ids.haloPeakId,
        },
    ];
}

function buildRegionLevelProgressionFlowchartDefinition(
    regionPack: RegionPack,
    questPack: QuestPack,
    storylinePack: StorylinePack,
) {
    const regionById = new Map(regionPack.entries.map((entry) => [entry.id, entry]));
    const storylineById = new Map(storylinePack.entries.map((entry) => [entry.id, entry]));
    const questById = new Map(questPack.entries.map((entry) => [entry.id, entry]));
    const qinghe = regionById.get("qinghe");
    const kaifeng = regionById.get("kaifeng");
    const hexi = regionById.get("hexi");
    const qingheStoryline = storylineById.get("storyline-heaven-has-no-pier");
    const kaifengStoryline = storylineById.get("storyline-universal-furnace");
    const hexiStoryline = storylineById.get("storyline-a-lonely-moon-over-changan");
    const whiteBird = questById.get("quest-white-bird-shooting");
    const shameless = questById.get("quest-the-shameless");
    const meridianTouch = questById.get("quest-meridian-touch");
    const stillShore = questById.get("quest-still-shore");

    if (
        !qinghe ||
        !kaifeng ||
        !hexi ||
        !qingheStoryline ||
        !kaifengStoryline ||
        !hexiStoryline ||
        !whiteBird ||
        !shameless ||
        !meridianTouch ||
        !stillShore
    ) {
        return null;
    }

    const qingheNodeId = toNodeId("region", qinghe.id);
    const qingheStoryNodeId = toNodeId("storyline", qingheStoryline.id);
    const qingheHiddenNodeId = toNodeId("opportunity", "qinghe-hidden-exploration-and-mystic");
    const kaifengGateNodeId = toNodeId("gate", "kaifeng-level-gate");
    const kaifengNodeId = toNodeId("region", kaifeng.id);
    const kaifengStoryNodeId = toNodeId("storyline", kaifengStoryline.id);
    const stillShoreNodeId = toNodeId("campaign", stillShore.id);
    const hexiGateNodeId = toNodeId("gate", "hexi-level-gate");
    const hexiNodeId = toNodeId("region", hexi.id);
    const hexiStoryNodeId = toNodeId("storyline", hexiStoryline.id);
    const graph = createQuestGraphDefinition();

    graph.nodes.push(
        createQuestGraphNode({
            id: qingheNodeId,
            nodeType: "region",
            lines: ["Region 1", qinghe.title, "Start"],
            entryId: qinghe.id,
        }),
        createQuestGraphNode({
            id: qingheStoryNodeId,
            nodeType: "storyline",
            lines: [qingheStoryline.chapterLabel, qingheStoryline.title],
            entryId: qingheStoryline.id,
        }),
        createQuestGraphNode({
            id: qingheHiddenNodeId,
            nodeType: "opportunity",
            lines: ["Qinghe optional routes", `${whiteBird.title} / ${shameless.title}`, meridianTouch.title],
        }),
        createQuestGraphNode({
            id: kaifengGateNodeId,
            nodeType: "gate",
            lines: ["Level 32 + world level", "Complete Chapter 1"],
        }),
        createQuestGraphNode({
            id: kaifengNodeId,
            nodeType: "region",
            lines: ["Region 2", kaifeng.title],
            entryId: kaifeng.id,
        }),
        createQuestGraphNode({
            id: kaifengStoryNodeId,
            nodeType: "storyline",
            lines: [kaifengStoryline.chapterLabel, kaifengStoryline.title],
            entryId: kaifengStoryline.id,
        }),
        createQuestGraphNode({
            id: stillShoreNodeId,
            nodeType: "campaign",
            lines: [stillShore.title, "(Campaign side-quest gate)"],
            entryId: stillShore.id,
        }),
        createQuestGraphNode({
            id: hexiGateNodeId,
            nodeType: "gate",
            lines: ["Level 14 + Still Shore", "Bamboo Abode mural"],
        }),
        createQuestGraphNode({
            id: hexiNodeId,
            nodeType: "region",
            lines: ["Region 3", hexi.title],
            entryId: hexi.id,
        }),
        createQuestGraphNode({
            id: hexiStoryNodeId,
            nodeType: "storyline",
            lines: [hexiStoryline.chapterLabel, hexiStoryline.title],
            entryId: hexiStoryline.id,
        }),
    );

    graph.edges.push(
        createQuestGraphEdge({
            sourceId: qingheNodeId,
            targetId: qingheStoryNodeId,
            edgeType: "main-path",
            style: "solid",
        }),
        createQuestGraphEdge({
            sourceId: qingheStoryNodeId,
            targetId: qingheHiddenNodeId,
            edgeType: "related-route",
            style: "dashed",
            label: "hidden exploration + mystic arts",
        }),
        createQuestGraphEdge({
            sourceId: qingheStoryNodeId,
            targetId: kaifengGateNodeId,
            edgeType: "gate",
            style: "solid",
        }),
        createQuestGraphEdge({
            sourceId: kaifengGateNodeId,
            targetId: kaifengNodeId,
            edgeType: "gate",
            style: "solid",
        }),
        createQuestGraphEdge({
            sourceId: kaifengNodeId,
            targetId: kaifengStoryNodeId,
            edgeType: "main-path",
            style: "solid",
        }),
        createQuestGraphEdge({
            sourceId: qingheStoryNodeId,
            targetId: stillShoreNodeId,
            edgeType: "campaign-chain",
            style: "dashed",
            label: "campaign gate in Qinghe",
        }),
        createQuestGraphEdge({
            sourceId: qingheNodeId,
            targetId: hexiGateNodeId,
            edgeType: "gate",
            style: "dashed",
            label: "mural route starts here",
        }),
        createQuestGraphEdge({
            sourceId: stillShoreNodeId,
            targetId: hexiGateNodeId,
            edgeType: "gate",
            style: "solid",
        }),
        createQuestGraphEdge({
            sourceId: hexiGateNodeId,
            targetId: hexiNodeId,
            edgeType: "gate",
            style: "solid",
        }),
        createQuestGraphEdge({
            sourceId: hexiNodeId,
            targetId: hexiStoryNodeId,
            edgeType: "main-path",
            style: "solid",
        }),
    );

    return createFlowchartDefinition({
        id: "progression-region-level-overview",
        title: "Region and level gate overview",
        kind: "progression" as const,
        summary:
            "Published region order plus the currently reviewed character-level and quest gates. This stays honest about mixed gating: Kaifeng uses the documented level-32 Chapter 1 route, while Hexi uses a separate level-14 plus Still Shore and Bamboo Abode mural path. Literal encounter pins stay separate from first-class exploration and Jianghu Legacy / mystic-art routes.",
        regionIds: [qinghe.id, kaifeng.id, hexi.id],
        linkedEntryIds: uniqueIds([
            qinghe.id,
            qingheStoryline.id,
            whiteBird.id,
            shameless.id,
            meridianTouch.id,
            stillShore.id,
            kaifeng.id,
            kaifengStoryline.id,
            hexi.id,
            hexiStoryline.id,
        ]),
        graph,
    });
}

function buildQingheProgressionFlowchartDefinition(questPack: QuestPack, storylinePack: StorylinePack) {
    const questById = new Map(questPack.entries.map((entry) => [entry.id, entry]));
    const storyline = storylinePack.entries.find((entry) => entry.id === "storyline-heaven-has-no-pier");
    const anotherNewWing = questById.get("quest-another-new-wing");
    const whiteBird = questById.get("quest-white-bird-shooting");
    const shameless = questById.get("quest-the-shameless");
    const horseNeighs = questById.get("quest-a-horse-neighs-in-the-forest");
    const meridianTouch = questById.get("quest-meridian-touch");
    const dustMirror = questById.get("quest-dust-on-the-rhombus-mirror");
    const finale = questById.get("quest-for-whom-does-he-return");
    const stillShore = questById.get("quest-still-shore");
    const bodhiSea = questById.get("quest-bodhi-sea");
    const gleamingAbyss = questById.get("quest-gleaming-abyss");
    const palaceOfAnnals = questById.get("quest-palace-of-annals");
    const blissfulRetreat = questById.get("quest-blissful-retreat");
    const haloPeak = questById.get("quest-halo-peak");

    if (!storyline || !anotherNewWing || !whiteBird || !shameless || !horseNeighs || !meridianTouch || !dustMirror || !finale || !stillShore) {
        return null;
    }

    const regionNodeId = toNodeId("region", "qinghe");
    const storylineNodeId = toNodeId("storyline", storyline.id);
    const anotherNodeId = toNodeId("quest", anotherNewWing.id);
    const horseNodeId = toNodeId("quest", horseNeighs.id);
    const dustNodeId = toNodeId("quest", dustMirror.id);
    const finaleNodeId = toNodeId("quest", finale.id);
    const stillShoreNodeId = toNodeId("campaign", stillShore.id);
    const whiteBirdNodeId = toNodeId("quest", whiteBird.id);
    const shamelessNodeId = toNodeId("quest", shameless.id);
    const meridianNodeId = toNodeId("quest", meridianTouch.id);
    const graph = createQuestGraphDefinition();

    graph.nodes.push(
        createQuestGraphNode({
            id: regionNodeId,
            nodeType: "region",
            lines: ["Region", "Qinghe"],
            entryId: "qinghe",
        }),
        createQuestGraphNode({
            id: storylineNodeId,
            nodeType: "storyline",
            lines: [storyline.chapterLabel, storyline.title],
            entryId: storyline.id,
        }),
        createQuestGraphNode({ id: anotherNodeId, nodeType: "main", lines: [anotherNewWing.title], entryId: anotherNewWing.id }),
        createQuestGraphNode({ id: horseNodeId, nodeType: "main", lines: [horseNeighs.title], entryId: horseNeighs.id }),
        createQuestGraphNode({ id: dustNodeId, nodeType: "main", lines: [dustMirror.title], entryId: dustMirror.id }),
        createQuestGraphNode({ id: finaleNodeId, nodeType: "main", lines: [finale.title], entryId: finale.id }),
        createQuestGraphNode({
            id: whiteBirdNodeId,
            nodeType: "opportunity",
            lines: [whiteBird.title, "(Exploration route)"],
            entryId: whiteBird.id,
        }),
        createQuestGraphNode({
            id: shamelessNodeId,
            nodeType: "opportunity",
            lines: [shameless.title, "(Exploration route)"],
            entryId: shameless.id,
        }),
        createQuestGraphNode({
            id: meridianNodeId,
            nodeType: "legacy",
            lines: [meridianTouch.title, "(Jianghu Legacy / Mystic Art)"],
            entryId: meridianTouch.id,
        }),
        createQuestGraphNode({
            id: stillShoreNodeId,
            nodeType: "campaign",
            lines: [stillShore.title, "(Campaign side quest)"],
            entryId: stillShore.id,
        }),
    );

    graph.edges.push(
        createQuestGraphEdge({ sourceId: regionNodeId, targetId: storylineNodeId, edgeType: "main-path", style: "solid" }),
        createQuestGraphEdge({ sourceId: storylineNodeId, targetId: anotherNodeId, edgeType: "main-path", style: "solid" }),
        createQuestGraphEdge({ sourceId: anotherNodeId, targetId: horseNodeId, edgeType: "main-path", style: "solid" }),
        createQuestGraphEdge({ sourceId: horseNodeId, targetId: dustNodeId, edgeType: "main-path", style: "solid" }),
        createQuestGraphEdge({ sourceId: dustNodeId, targetId: finaleNodeId, edgeType: "main-path", style: "solid" }),
        createQuestGraphEdge({
            sourceId: anotherNodeId,
            targetId: whiteBirdNodeId,
            edgeType: "optional-branch",
            style: "dashed",
            label: "reviewed exploration route",
        }),
        createQuestGraphEdge({
            sourceId: anotherNodeId,
            targetId: shamelessNodeId,
            edgeType: "optional-branch",
            style: "dashed",
            label: "reviewed exploration route",
        }),
        createQuestGraphEdge({
            sourceId: horseNodeId,
            targetId: meridianNodeId,
            edgeType: "related-route",
            style: "dashed",
            label: "Jianghu Legacy detour on the road home",
        }),
        createQuestGraphEdge({
            sourceId: horseNodeId,
            targetId: stillShoreNodeId,
            edgeType: "campaign-chain",
            style: "dashed",
            label: "optional campaign during main quest",
        }),
    );

    return createFlowchartDefinition({
        id: "progression-qinghe-onboarding-route",
        title: "Qinghe onboarding route",
        kind: "progression" as const,
        summary:
            "A Qinghe-first route that respects natural progression: the Chapter 1 spine stays primary, while first-class exploration routes, Jianghu Legacy mystic-art unlocks, and campaign detours begin intertwining almost immediately. Literal encounter pins stay separate until their triggers are normalized.",
        regionIds: ["qinghe"],
        linkedEntryIds: uniqueIds([
            "qinghe",
            storyline.id,
            anotherNewWing.id,
            whiteBird.id,
            shameless.id,
            horseNeighs.id,
            meridianTouch.id,
            dustMirror.id,
            finale.id,
            stillShore.id,
        ]),
        modules: buildQingheProgressionModules({
            storylineId: storyline.id,
            anotherNewWingId: anotherNewWing.id,
            whiteBirdId: whiteBird.id,
            shamelessId: shameless.id,
            horseNeighsId: horseNeighs.id,
            meridianTouchId: meridianTouch.id,
            dustMirrorId: dustMirror.id,
            finaleId: finale.id,
            stillShoreId: stillShore.id,
            bodhiSeaId: bodhiSea?.id,
            gleamingAbyssId: gleamingAbyss?.id,
            palaceOfAnnalsId: palaceOfAnnals?.id,
            blissfulRetreatId: blissfulRetreat?.id,
            haloPeakId: haloPeak?.id,
        }),
        graph,
    });
}

function getStorylineBranchPresentation(quest: QuestEntry) {
    switch (quest.questType) {
        case "campaign":
            return { nodeType: "campaign" as const, label: "Campaign side quest" };
        case "exploration":
            return { nodeType: "opportunity" as const, label: "Exploration" };
        case "jianghu-legacy":
            return { nodeType: "legacy" as const, label: "Jianghu Legacy" };
        default:
            return { nodeType: "opportunity" as const, label: formatDisplayLabel(quest.questType) };
    }
}

function getStorylineOptionalBranches(storylineId: string, storylineQuestIds: string[], questPack: QuestPack) {
    const storylineQuestIdSet = new Set(storylineQuestIds);

    const resolveAnchorQuestId = (quest: QuestEntry) => {
        return (
            quest.prerequisiteQuestIds.find((questId) => storylineQuestIdSet.has(questId)) ??
            quest.relatedEntryIds.find((entryId) => storylineQuestIdSet.has(entryId)) ??
            storylineQuestIds[storylineQuestIds.length - 1] ??
            null
        );
    };

    return questPack.entries
        .filter((quest) => {
            if (!["campaign", "exploration", "jianghu-legacy"].includes(quest.questType)) {
                return false;
            }

            return (
                quest.storylineIds.includes(storylineId) ||
                quest.prerequisiteQuestIds.some((questId) => storylineQuestIdSet.has(questId)) ||
                quest.relatedEntryIds.some((entryId) => storylineQuestIdSet.has(entryId)) ||
                quest.relatedEntryIds.includes(storylineId)
            );
        })
        .map((quest) => ({
            quest,
            anchorQuestId: resolveAnchorQuestId(quest),
        }))
        .sort((left, right) => {
            const leftIndex = left.anchorQuestId ? storylineQuestIds.indexOf(left.anchorQuestId) : Number.MAX_SAFE_INTEGER;
            const rightIndex = right.anchorQuestId ? storylineQuestIds.indexOf(right.anchorQuestId) : Number.MAX_SAFE_INTEGER;

            if (leftIndex !== rightIndex) {
                return leftIndex - rightIndex;
            }

            return left.quest.title.localeCompare(right.quest.title);
        });
}

function buildStorylineFlowchartDefinition(storylinePack: StorylinePack, questPack: QuestPack, storylineId: string) {
    const storyline = storylinePack.entries.find((entry) => entry.id === storylineId);

    if (!storyline) {
        return null;
    }

    const questById = new Map(questPack.entries.map((entry) => [entry.id, entry]));
    const quests = storyline.questIds
        .map((questId) => questById.get(questId))
        .filter((quest): quest is QuestEntry => Boolean(quest));
    const optionalBranches = getStorylineOptionalBranches(storyline.id, storyline.questIds, questPack);
    const regionId = storyline.regionIds[0] ?? "unknown-region";
    const regionNodeId = toNodeId("region", regionId);
    const storylineNodeId = toNodeId("storyline", storyline.id);
    const graph = createQuestGraphDefinition();

    graph.nodes.push(
        createQuestGraphNode({
            id: regionNodeId,
            nodeType: "region",
            lines: ["Region", formatDisplayLabel(regionId)],
            entryId: regionId,
        }),
        createQuestGraphNode({
            id: storylineNodeId,
            nodeType: "storyline",
            lines: [storyline.chapterLabel, storyline.title],
            entryId: storyline.id,
        }),
    );

    graph.edges.push(
        createQuestGraphEdge({ sourceId: regionNodeId, targetId: storylineNodeId, edgeType: "main-path", style: "solid" }),
    );

    quests.forEach((quest, index) => {
        const nodeId = toNodeId("quest", quest.id);
        graph.nodes.push(
            createQuestGraphNode({ id: nodeId, nodeType: "main", lines: [quest.title], entryId: quest.id }),
        );

        if (index === 0) {
            graph.edges.push(
                createQuestGraphEdge({
                    sourceId: storylineNodeId,
                    targetId: nodeId,
                    edgeType: "main-path",
                    style: "solid",
                }),
            );
        } else {
            const previousNodeId = toNodeId("quest", quests[index - 1].id);
            graph.edges.push(
                createQuestGraphEdge({
                    sourceId: previousNodeId,
                    targetId: nodeId,
                    edgeType: "main-path",
                    style: "solid",
                }),
            );
        }
    });

    optionalBranches.forEach(({ quest, anchorQuestId }) => {
        const presentation = getStorylineBranchPresentation(quest);
        const nodeId = toNodeId("campaign", quest.id);
        const anchorNodeId = toNodeId("quest", anchorQuestId ?? storyline.questIds[storyline.questIds.length - 1] ?? storyline.id);
        graph.nodes.push(
            createQuestGraphNode({
                id: nodeId,
                nodeType: presentation.nodeType as QuestGraphNodeType,
                lines: [quest.title, `(${presentation.label})`],
                entryId: quest.id,
            }),
        );
        graph.edges.push(
            createQuestGraphEdge({
                sourceId: anchorNodeId,
                targetId: nodeId,
                edgeType: "optional-branch",
                style: "dashed",
                label: "optional",
            }),
        );
    });

    return createFlowchartDefinition({
        id: `${storyline.id}-flowchart`,
        title: `${storyline.chapterLabel} flowchart`,
        kind: "storyline" as const,
        summary:
            optionalBranches.length > 0
                ? `Main-story spine for ${storyline.title}, with optional reviewed campaign, exploration, and Jianghu Legacy branches where the current seed can anchor them honestly.`
                : `Main-story spine for ${storyline.title}, using the current reviewed chapter ordering without inventing unsupported branch detail.`,
        regionIds: storyline.regionIds,
        linkedEntryIds: uniqueIds([
            ...storyline.regionIds,
            storyline.id,
            ...storyline.questIds,
            ...optionalBranches.map((branch) => branch.quest.id),
        ]),
        graph,
    });
}

function buildCampaignRegionFlowchartDefinitions(regionPack: RegionPack, storylinePack: StorylinePack, questPack: QuestPack) {
    const questById = new Map(questPack.entries.map((entry) => [entry.id, entry]));

    return regionPack.entries
        .map((region) => {
            const campaignQuests = questPack.entries.filter(
                (quest) => quest.questType === "campaign" && quest.regionIds.includes(region.id),
            );

            if (campaignQuests.length === 0) {
                return null;
            }

            const storyline = storylinePack.entries.find((entry) => entry.regionIds.includes(region.id)) ?? null;
            const regionNodeId = toNodeId("region", region.id);
            const storylineNodeId = storyline ? toNodeId("storyline", storyline.id) : null;
            const graph = createQuestGraphDefinition();

            graph.nodes.push(
                createQuestGraphNode({
                    id: regionNodeId,
                    nodeType: "region",
                    lines: ["Region", region.title],
                    entryId: region.id,
                }),
            );

            if (storyline && storylineNodeId) {
                graph.nodes.push(
                    createQuestGraphNode({
                        id: storylineNodeId,
                        nodeType: "storyline",
                        lines: [storyline.chapterLabel, storyline.title],
                        entryId: storyline.id,
                    }),
                );
                graph.edges.push(
                    createQuestGraphEdge({
                        sourceId: regionNodeId,
                        targetId: storylineNodeId,
                        edgeType: "main-path",
                        style: "solid",
                    }),
                );
            }

            const anchorQuestIds = [...new Set(campaignQuests.flatMap((quest) => [...quest.prerequisiteQuestIds, ...quest.relatedEntryIds]))]
                .map((questId) => questById.get(questId))
                .filter((quest): quest is QuestEntry => Boolean(quest) && quest.regionIds.includes(region.id));

            anchorQuestIds.forEach((quest) => {
                const nodeId = toNodeId("anchor", quest.id);
                graph.nodes.push(
                    createQuestGraphNode({ id: nodeId, nodeType: "main", lines: [quest.title], entryId: quest.id }),
                );

                if (storylineNodeId) {
                    graph.edges.push(
                        createQuestGraphEdge({
                            sourceId: storylineNodeId,
                            targetId: nodeId,
                            edgeType: "anchor",
                            style: "dashed",
                            label: "anchor",
                        }),
                    );
                } else {
                    graph.edges.push(
                        createQuestGraphEdge({
                            sourceId: regionNodeId,
                            targetId: nodeId,
                            edgeType: "anchor",
                            style: "dashed",
                            label: "anchor",
                        }),
                    );
                }
            });

            campaignQuests.forEach((quest) => {
                const nodeId = toNodeId("campaign", quest.id);
                const anchorQuest = anchorQuestIds.find(
                    (candidate) =>
                        quest.prerequisiteQuestIds.includes(candidate.id) || quest.relatedEntryIds.includes(candidate.id),
                );
                const sourceNodeId = anchorQuest
                    ? toNodeId("anchor", anchorQuest.id)
                    : (storylineNodeId ?? regionNodeId);

                graph.nodes.push(
                    createQuestGraphNode({
                        id: nodeId,
                        nodeType: "campaign",
                        lines: [quest.title, "(Campaign side quest)"],
                        entryId: quest.id,
                    }),
                );
                graph.edges.push(
                    createQuestGraphEdge({
                        sourceId: sourceNodeId,
                        targetId: nodeId,
                        edgeType: "optional-branch",
                        style: "dashed",
                        label: "optional",
                    }),
                );
            });

            return createFlowchartDefinition({
                id: `campaign-branches-${region.id}`,
                title: `${region.title} campaign side-quest branches`,
                kind: "campaign" as const,
                summary:
                    "Optional campaign side-quest branches currently supported by the reviewed seed. This is intentionally not a full side-quest atlas yet — only the branches the dataset can justify today.",
                regionIds: [region.id],
                linkedEntryIds: uniqueIds([
                    region.id,
                    ...(storyline ? [storyline.id] : []),
                    ...anchorQuestIds.map((quest) => quest.id),
                    ...campaignQuests.map((quest) => quest.id),
                ]),
                modules:
                    region.id === "qinghe"
                        ? (() => {
                              const horseNeighs = questById.get("quest-a-horse-neighs-in-the-forest");
                              const stillShore = questById.get("quest-still-shore");
                              const bodhiSea = questById.get("quest-bodhi-sea");
                              const gleamingAbyss = questById.get("quest-gleaming-abyss");
                              const palaceOfAnnals = questById.get("quest-palace-of-annals");
                              const finale = questById.get("quest-for-whom-does-he-return");
                              const blissfulRetreat = questById.get("quest-blissful-retreat");
                              const haloPeak = questById.get("quest-halo-peak");

                              return horseNeighs &&
                                  stillShore &&
                                  bodhiSea &&
                                  gleamingAbyss &&
                                  palaceOfAnnals &&
                                  finale &&
                                  blissfulRetreat &&
                                  haloPeak
                                  ? buildQingheCampaignModules({
                                        horseNeighsId: horseNeighs.id,
                                        stillShoreId: stillShore.id,
                                        bodhiSeaId: bodhiSea.id,
                                        gleamingAbyssId: gleamingAbyss.id,
                                        palaceOfAnnalsId: palaceOfAnnals.id,
                                        finaleId: finale.id,
                                        blissfulRetreatId: blissfulRetreat.id,
                                        haloPeakId: haloPeak.id,
                                    })
                                  : [];
                          })()
                        : [],
                graph,
            });
        })
        .filter((definition): definition is QuestFlowchartDefinition => Boolean(definition));
}

export function buildQuestFlowchartDefinitions(packs: {
    regionPack: RegionPack;
    questPack: QuestPack;
    storylinePack: StorylinePack;
}) {
    const progressionDefinitions = [
        buildRegionLevelProgressionFlowchartDefinition(packs.regionPack, packs.questPack, packs.storylinePack),
        buildQingheProgressionFlowchartDefinition(packs.questPack, packs.storylinePack),
    ].filter((definition): definition is QuestFlowchartDefinition => Boolean(definition));
    const storylineDefinitions = packs.storylinePack.entries
        .map((storyline) => buildStorylineFlowchartDefinition(packs.storylinePack, packs.questPack, storyline.id))
        .filter((definition): definition is QuestFlowchartDefinition => Boolean(definition));
    const campaignDefinitions = buildCampaignRegionFlowchartDefinitions(
        packs.regionPack,
        packs.storylinePack,
        packs.questPack,
    );

    return [...progressionDefinitions, ...storylineDefinitions, ...campaignDefinitions];
}

export function getQuestFlowchartDefinitionById(definitions: QuestFlowchartDefinition[], id: string | null) {
    if (!id) {
        return null;
    }

    return definitions.find((definition) => definition.id === id) ?? null;
}