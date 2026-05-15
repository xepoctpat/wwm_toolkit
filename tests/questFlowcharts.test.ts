import { describe, expect, it } from "vitest";

import { questPack } from "../app/src/data/content/quests";
import { regionPack } from "../app/src/data/content/regions";
import { storylinePack } from "../app/src/data/content/storylines";
import {
    buildQuestFlowchartDefinitions,
    getQuestFlowchartDefinitionById,
} from "../app/src/lib/flowcharts/questFlowcharts";

const definitions = buildQuestFlowchartDefinitions({
    regionPack,
    questPack,
    storylinePack,
});

describe("quest flowcharts", () => {
    it("builds progression, storyline, and campaign flowcharts from the reviewed seed", () => {
        expect(definitions.map((definition) => definition.id)).toEqual([
            "progression-region-level-overview",
            "progression-qinghe-onboarding-route",
            "storyline-heaven-has-no-pier-flowchart",
            "storyline-universal-furnace-flowchart",
            "storyline-a-lonely-moon-over-changan-flowchart",
            "campaign-branches-qinghe",
            "campaign-branches-kaifeng",
            "campaign-branches-hexi",
        ]);
    });

    it("surfaces region order plus published level and quest gates without collapsing everything into encounters", () => {
        const definition = getQuestFlowchartDefinitionById(definitions, "progression-region-level-overview");

        expect(definition).toBeTruthy();
        expect(definition?.kind).toBe("progression");
        expect(definition?.linkedEntryIds).toEqual(
            expect.arrayContaining([
                "qinghe",
                "storyline-heaven-has-no-pier",
                "quest-white-bird-shooting",
                "quest-the-shameless",
                "quest-meridian-touch",
                "quest-still-shore",
                "kaifeng",
                "storyline-universal-furnace",
                "hexi",
                "storyline-a-lonely-moon-over-changan",
            ]),
        );
        expect(definition?.mermaid).toContain("Level 32 + world level");
        expect(definition?.mermaid).toContain("Level 14 + Still Shore");
        expect(definition?.mermaid).toContain("White Bird Shooting / The Shameless");
        expect(definition?.mermaid).toContain("Meridian Touch");
        expect(definition?.mermaid).not.toContain("Encounter layer grows through Qinghe exploration");
    });

    it("starts with a Qinghe-first progression route instead of jumping to later chapters", () => {
        const definition = getQuestFlowchartDefinitionById(definitions, "progression-qinghe-onboarding-route");

        expect(definition).toBeTruthy();
        expect(definition?.kind).toBe("progression");
        expect(definition?.linkedEntryIds).toEqual(
            expect.arrayContaining([
                "qinghe",
                "storyline-heaven-has-no-pier",
                "quest-another-new-wing",
                "quest-white-bird-shooting",
                "quest-the-shameless",
                "quest-a-horse-neighs-in-the-forest",
                "quest-meridian-touch",
                "quest-dust-on-the-rhombus-mirror",
                "quest-for-whom-does-he-return",
                "quest-still-shore",
            ]),
        );
        expect(definition?.mermaid).toContain("White Bird Shooting<br/>(Exploration route)");
        expect(definition?.mermaid).toContain("The Shameless<br/>(Exploration route)");
        expect(definition?.mermaid).toContain("Meridian Touch<br/>(Jianghu Legacy / Mystic Art)");
        expect(definition?.mermaid).not.toContain("Encounter layer grows through Qinghe exploration");
    });

    it("anchors the Qinghe campaign branch to its known main-story prerequisite", () => {
        const definition = getQuestFlowchartDefinitionById(definitions, "campaign-branches-qinghe");

        expect(definition).toBeTruthy();
        expect(definition?.mermaid).toContain("A Horse Neighs in the Forest");
        expect(definition?.mermaid).toContain("Still Shore");
        expect(definition?.mermaid).toContain("Bodhi Sea");
        expect(definition?.mermaid).toContain("Halo Peak");
        expect(definition?.mermaid).toContain("-. optional .->");
    });

    it("surfaces Qinghe loops and cross-links as explicit route modules", () => {
        const progressionDefinition = getQuestFlowchartDefinitionById(definitions, "progression-qinghe-onboarding-route");
        const campaignDefinition = getQuestFlowchartDefinitionById(definitions, "campaign-branches-qinghe");

        expect(progressionDefinition).toBeTruthy();
        expect(campaignDefinition).toBeTruthy();

        const campaignLadderModule = progressionDefinition?.modules?.find((module) => module.id === "qinghe-campaign-ladder");
        const lateChapterLinkModule = campaignDefinition?.modules?.find((module) => module.id === "qinghe-late-chapter-link");

        expect(progressionDefinition?.modules?.map((module) => module.id)).toEqual(
            expect.arrayContaining([
                "qinghe-main-spine",
                "qinghe-exploration-loop",
                "qinghe-meridian-detour",
                "qinghe-campaign-ladder",
            ]),
        );
        expect(campaignDefinition?.modules?.map((module) => module.id)).toEqual(
            expect.arrayContaining([
                "qinghe-campaign-entry-gate",
                "qinghe-moonveil-loop",
                "qinghe-late-chapter-link",
                "qinghe-sundara-capstone",
            ]),
        );
        expect(campaignLadderModule).toMatchObject({
            tone: "campaign",
            focusEntryId: "quest-still-shore",
            relatedDefinitionId: "campaign-branches-qinghe",
        });
        expect(campaignLadderModule?.linkedEntryIds).toEqual(
            expect.arrayContaining([
                "quest-still-shore",
                "quest-bodhi-sea",
                "quest-gleaming-abyss",
                "quest-palace-of-annals",
                "quest-blissful-retreat",
                "quest-halo-peak",
            ]),
        );
        expect(lateChapterLinkModule).toMatchObject({
            tone: "campaign",
            focusEntryId: "quest-blissful-retreat",
            relatedDefinitionId: "storyline-heaven-has-no-pier-flowchart",
        });
        expect(lateChapterLinkModule?.linkedEntryIds).toEqual(
            expect.arrayContaining(["quest-for-whom-does-he-return", "quest-blissful-retreat"]),
        );
    });

    it("adds reviewed campaign and optional-route branches to the main storyline chart when the seed supports them", () => {
        const definition = getQuestFlowchartDefinitionById(definitions, "storyline-heaven-has-no-pier-flowchart");

        expect(definition).toBeTruthy();
        expect(definition?.mermaid).toContain("Heaven Has No Pier");
        expect(definition?.mermaid).toContain("White Bird Shooting");
        expect(definition?.mermaid).toContain("The Shameless");
        expect(definition?.mermaid).toContain("Meridian Touch");
        expect(definition?.mermaid).toContain("Still Shore");
        expect(definition?.mermaid).toContain("Blissful Retreat");
    });

    it("adds a Kaifeng campaign chart once the reviewed campaign roster exists", () => {
        const definition = getQuestFlowchartDefinitionById(definitions, "campaign-branches-kaifeng");

        expect(definition).toBeTruthy();
        expect(definition?.linkedEntryIds).toEqual(
            expect.arrayContaining([
                "kaifeng",
                "storyline-universal-furnace",
                "quest-unbound-cavern",
                "quest-ever-normal-granary",
                "quest-jinming-pool",
                "quest-furnace-of-righteousness-campaign",
                "quest-heavenfall",
                "quest-supreme-freedom",
            ]),
        );
        expect(definition?.mermaid).toContain("Accident");
        expect(definition?.mermaid).toContain("Unbound Cavern");
        expect(definition?.mermaid).toContain("Ever-Normal Granary");
        expect(definition?.mermaid).toContain("Jinming Pool");
        expect(definition?.mermaid).toContain("Heavenfall");
        expect(definition?.mermaid).toContain("Supreme Freedom");
    });

    it("keeps the Hexi campaign chart honest about the currently reviewed branch set", () => {
        const definition = getQuestFlowchartDefinitionById(definitions, "campaign-branches-hexi");

        expect(definition).toBeTruthy();
        expect(definition?.linkedEntryIds).toEqual(
            expect.arrayContaining([
                "hexi",
                "storyline-a-lonely-moon-over-changan",
                "quest-dasan-pass",
                "quest-death-of-the-governor",
                "quest-whitecrown-fortress",
            ]),
        );
        expect(definition?.mermaid).toContain("Liangzhou Melody");
        expect(definition?.mermaid).toContain("Dasan Pass");
        expect(definition?.mermaid).toContain("Death of the Governor");
        expect(definition?.mermaid).toContain("Whitecrown Fortress");
    });
});