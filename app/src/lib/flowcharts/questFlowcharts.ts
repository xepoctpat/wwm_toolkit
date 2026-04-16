import type { QuestEntry, QuestPack } from "../../data/schemas/quest";
import type { RegionPack } from "../../data/schemas/region";
import type { StorylinePack } from "../../data/schemas/storyline";

export type QuestFlowchartKind = "progression" | "storyline" | "campaign";

export interface QuestFlowchartDefinition {
    id: string;
    title: string;
    kind: QuestFlowchartKind;
    summary: string;
    regionIds: string[];
    linkedEntryIds: string[];
    mermaid: string;
}

function escapeMermaidText(value: string) {
    return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
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

function appendFlowchartTheme(lines: string[]) {
    lines.push("    classDef region fill:#0f172a,stroke:#34d399,color:#d1fae5,stroke-width:1.5px;");
    lines.push("    classDef storyline fill:#172554,stroke:#93c5fd,color:#eff6ff,stroke-width:1.5px;");
    lines.push("    classDef gate fill:#3f3f46,stroke:#f59e0b,color:#fef3c7,stroke-width:1.2px;");
    lines.push("    classDef main fill:#111827,stroke:#60a5fa,color:#e2e8f0,stroke-width:1.2px;");
    lines.push("    classDef campaign fill:#1f2937,stroke:#fbbf24,color:#fef3c7,stroke-width:1.2px;");
    lines.push("    classDef opportunity fill:#2e1065,stroke:#c084fc,color:#f5d0fe,stroke-width:1.2px;");
    lines.push("    classDef legacy fill:#052e2b,stroke:#5eead4,color:#ccfbf1,stroke-width:1.2px;");
    lines.push("");
}

function uniqueIds(values: string[]) {
    return [...new Set(values.filter(Boolean))];
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
    const lines = ["flowchart TD"];

    appendFlowchartTheme(lines);
    lines.push(`    ${qingheNodeId}["Region 1<br/>${escapeMermaidText(qinghe.title)}<br/>Start"]:::region`);
    lines.push(
        `    ${qingheStoryNodeId}["${escapeMermaidText(qingheStoryline.chapterLabel)}<br/>${escapeMermaidText(qingheStoryline.title)}"]:::storyline`,
    );
    lines.push(
        `    ${qingheHiddenNodeId}["Qinghe optional routes<br/>${escapeMermaidText(whiteBird.title)} / ${escapeMermaidText(shameless.title)}<br/>${escapeMermaidText(meridianTouch.title)}"]:::opportunity`,
    );
    lines.push(`    ${kaifengGateNodeId}["Level 32 + world level<br/>Complete Chapter 1"]:::gate`);
    lines.push(`    ${kaifengNodeId}["Region 2<br/>${escapeMermaidText(kaifeng.title)}"]:::region`);
    lines.push(
        `    ${kaifengStoryNodeId}["${escapeMermaidText(kaifengStoryline.chapterLabel)}<br/>${escapeMermaidText(kaifengStoryline.title)}"]:::storyline`,
    );
    lines.push(`    ${stillShoreNodeId}["${escapeMermaidText(stillShore.title)}<br/>(Campaign side-quest gate)"]:::campaign`);
    lines.push(`    ${hexiGateNodeId}["Level 14 + Still Shore<br/>Bamboo Abode mural"]:::gate`);
    lines.push(`    ${hexiNodeId}["Region 3<br/>${escapeMermaidText(hexi.title)}"]:::region`);
    lines.push(
        `    ${hexiStoryNodeId}["${escapeMermaidText(hexiStoryline.chapterLabel)}<br/>${escapeMermaidText(hexiStoryline.title)}"]:::storyline`,
    );

    lines.push(`    ${qingheNodeId} --> ${qingheStoryNodeId}`);
    lines.push(`    ${qingheStoryNodeId} -. hidden exploration + mystic arts .-> ${qingheHiddenNodeId}`);
    lines.push(`    ${qingheStoryNodeId} --> ${kaifengGateNodeId}`);
    lines.push(`    ${kaifengGateNodeId} --> ${kaifengNodeId}`);
    lines.push(`    ${kaifengNodeId} --> ${kaifengStoryNodeId}`);
    lines.push(`    ${qingheStoryNodeId} -. campaign gate in Qinghe .-> ${stillShoreNodeId}`);
    lines.push(`    ${qingheNodeId} -. mural route starts here .-> ${hexiGateNodeId}`);
    lines.push(`    ${stillShoreNodeId} --> ${hexiGateNodeId}`);
    lines.push(`    ${hexiGateNodeId} --> ${hexiNodeId}`);
    lines.push(`    ${hexiNodeId} --> ${hexiStoryNodeId}`);

    return {
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
        mermaid: lines.join("\n"),
    };
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
    const lines = ["flowchart TD"];

    appendFlowchartTheme(lines);
    lines.push(`    ${regionNodeId}["Region<br/>Qinghe"]:::region`);
    lines.push(
        `    ${storylineNodeId}["${escapeMermaidText(storyline.chapterLabel)}<br/>${escapeMermaidText(storyline.title)}"]:::storyline`,
    );
    lines.push(`    ${anotherNodeId}["${escapeMermaidText(anotherNewWing.title)}"]:::main`);
    lines.push(`    ${horseNodeId}["${escapeMermaidText(horseNeighs.title)}"]:::main`);
    lines.push(`    ${dustNodeId}["${escapeMermaidText(dustMirror.title)}"]:::main`);
    lines.push(`    ${finaleNodeId}["${escapeMermaidText(finale.title)}"]:::main`);
    lines.push(`    ${whiteBirdNodeId}["${escapeMermaidText(whiteBird.title)}<br/>(Exploration route)"]:::opportunity`);
    lines.push(`    ${shamelessNodeId}["${escapeMermaidText(shameless.title)}<br/>(Exploration route)"]:::opportunity`);
    lines.push(`    ${meridianNodeId}["${escapeMermaidText(meridianTouch.title)}<br/>(Jianghu Legacy / Mystic Art)"]:::legacy`);
    lines.push(`    ${stillShoreNodeId}["${escapeMermaidText(stillShore.title)}<br/>(Campaign side quest)"]:::campaign`);
    lines.push(`    ${regionNodeId} --> ${storylineNodeId}`);
    lines.push(`    ${storylineNodeId} --> ${anotherNodeId}`);
    lines.push(`    ${anotherNodeId} --> ${horseNodeId}`);
    lines.push(`    ${horseNodeId} --> ${dustNodeId}`);
    lines.push(`    ${dustNodeId} --> ${finaleNodeId}`);
    lines.push(`    ${anotherNodeId} -. reviewed exploration route .-> ${whiteBirdNodeId}`);
    lines.push(`    ${anotherNodeId} -. reviewed exploration route .-> ${shamelessNodeId}`);
    lines.push(`    ${horseNodeId} -. Jianghu Legacy detour on the road home .-> ${meridianNodeId}`);
    lines.push(`    ${horseNodeId} -. optional campaign during main quest .-> ${stillShoreNodeId}`);

    return {
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
        mermaid: lines.join("\n"),
    };
}

function getStorylineBranchPresentation(quest: QuestEntry) {
    switch (quest.questType) {
        case "campaign":
            return { className: "campaign", label: "Campaign side quest" };
        case "exploration":
            return { className: "opportunity", label: "Exploration" };
        case "jianghu-legacy":
            return { className: "legacy", label: "Jianghu Legacy" };
        default:
            return { className: "opportunity", label: formatDisplayLabel(quest.questType) };
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
    const lines = ["flowchart TD"];

    appendFlowchartTheme(lines);
    lines.push(`    ${regionNodeId}["Region<br/>${escapeMermaidText(formatDisplayLabel(regionId))}"]:::region`);
    lines.push(
        `    ${storylineNodeId}["${escapeMermaidText(storyline.chapterLabel)}<br/>${escapeMermaidText(storyline.title)}"]:::storyline`,
    );
    lines.push(`    ${regionNodeId} --> ${storylineNodeId}`);

    quests.forEach((quest, index) => {
        const nodeId = toNodeId("quest", quest.id);
        lines.push(`    ${nodeId}["${escapeMermaidText(quest.title)}"]:::main`);

        if (index === 0) {
            lines.push(`    ${storylineNodeId} --> ${nodeId}`);
        } else {
            const previousNodeId = toNodeId("quest", quests[index - 1].id);
            lines.push(`    ${previousNodeId} --> ${nodeId}`);
        }
    });

    optionalBranches.forEach(({ quest, anchorQuestId }) => {
        const presentation = getStorylineBranchPresentation(quest);
        const nodeId = toNodeId("campaign", quest.id);
        const anchorNodeId = toNodeId("quest", anchorQuestId ?? storyline.questIds[storyline.questIds.length - 1] ?? storyline.id);
        lines.push(`    ${nodeId}["${escapeMermaidText(quest.title)}<br/>(${escapeMermaidText(presentation.label)})"]:::${presentation.className}`);
        lines.push(`    ${anchorNodeId} -. optional .-> ${nodeId}`);
    });

    return {
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
        mermaid: lines.join("\n"),
    };
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
            const lines = ["flowchart TD"];

            appendFlowchartTheme(lines);
            lines.push(`    ${regionNodeId}["Region<br/>${escapeMermaidText(region.title)}"]:::region`);

            if (storyline && storylineNodeId) {
                lines.push(
                    `    ${storylineNodeId}["${escapeMermaidText(storyline.chapterLabel)}<br/>${escapeMermaidText(storyline.title)}"]:::storyline`,
                );
                lines.push(`    ${regionNodeId} --> ${storylineNodeId}`);
            }

            const anchorQuestIds = [...new Set(campaignQuests.flatMap((quest) => [...quest.prerequisiteQuestIds, ...quest.relatedEntryIds]))]
                .map((questId) => questById.get(questId))
                .filter((quest): quest is QuestEntry => Boolean(quest) && quest.regionIds.includes(region.id));

            anchorQuestIds.forEach((quest) => {
                const nodeId = toNodeId("anchor", quest.id);
                lines.push(`    ${nodeId}["${escapeMermaidText(quest.title)}"]:::main`);

                if (storylineNodeId) {
                    lines.push(`    ${storylineNodeId} -. anchor .-> ${nodeId}`);
                } else {
                    lines.push(`    ${regionNodeId} -. anchor .-> ${nodeId}`);
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

                lines.push(`    ${nodeId}["${escapeMermaidText(quest.title)}<br/>(Campaign side quest)"]:::campaign`);
                lines.push(`    ${sourceNodeId} -. optional .-> ${nodeId}`);
            });

            return {
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
                mermaid: lines.join("\n"),
            };
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