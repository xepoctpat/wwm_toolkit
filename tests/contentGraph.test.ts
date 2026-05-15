import { describe, expect, it } from "vitest";

import { questPack } from "../app/src/data/content/quests";
import { regionPack } from "../app/src/data/content/regions";
import { sourcePack } from "../app/src/data/content/sources";
import { storylinePack } from "../app/src/data/content/storylines";

describe("reviewed codex graph", () => {
    const questById = new Map(questPack.entries.map((entry) => [entry.id, entry]));
    const regionById = new Map(regionPack.entries.map((entry) => [entry.id, entry]));
    const storylineById = new Map(storylinePack.entries.map((entry) => [entry.id, entry]));
    const sourceIds = new Set(sourcePack.entries.map((entry) => entry.id));
    const codexEntryIds = new Set([
        ...questPack.entries.map((entry) => entry.id),
        ...storylinePack.entries.map((entry) => entry.id),
        ...regionPack.entries.map((entry) => entry.id),
    ]);

    it("resolves every source reference in quest, storyline, and region seed data", () => {
        for (const entry of [...questPack.entries, ...storylinePack.entries, ...regionPack.entries]) {
            for (const sourceId of entry.sourceIds) {
                expect(sourceIds.has(sourceId), `${entry.id} references missing source ${sourceId}`).toBe(true);
            }
        }
    });

    it("keeps storyline quest references resolvable and back-linked", () => {
        for (const storyline of storylinePack.entries) {
            expect(storyline.questIds.length).toBeGreaterThan(0);

            for (const questId of storyline.questIds) {
                const quest = questById.get(questId);
                expect(quest, `${storyline.id} references missing quest ${questId}`).toBeDefined();
                expect(quest?.storylineIds).toContain(storyline.id);
            }
        }
    });

    it("keeps follow-up and prerequisite quest links consistent", () => {
        for (const quest of questPack.entries) {
            for (const followUpQuestId of quest.followUpQuestIds) {
                const followUpQuest = questById.get(followUpQuestId);
                expect(followUpQuest, `${quest.id} follow-up ${followUpQuestId} is missing`).toBeDefined();
                expect(followUpQuest?.prerequisiteQuestIds).toContain(quest.id);
            }
        }
    });

    it("resolves region ids from quests and storylines to first-class region entries", () => {
        for (const entry of [...questPack.entries, ...storylinePack.entries]) {
            expect(entry.regionIds.length, `${entry.id} should reference at least one region`).toBeGreaterThan(0);

            for (const regionId of entry.regionIds) {
                const region = regionById.get(regionId);
                expect(region, `${entry.id} references missing region ${regionId}`).toBeDefined();

                if ("chapterLabel" in entry) {
                    expect(region?.storylineIds).toContain(entry.id);
                } else {
                    expect(region?.questIds).toContain(entry.id);
                }
            }
        }
    });

    it("keeps region storylines and quest anchors resolvable", () => {
        for (const region of regionPack.entries) {
            expect(region.subregions.length).toBeGreaterThan(0);

            for (const storylineId of region.storylineIds) {
                const storyline = storylineById.get(storylineId);
                expect(storyline, `${region.id} storyline ${storylineId} is missing`).toBeDefined();
                expect(storyline?.regionIds).toContain(region.id);
            }

            for (const questId of region.questIds) {
                const quest = questById.get(questId);
                expect(quest, `${region.id} quest ${questId} is missing`).toBeDefined();
                expect(quest?.regionIds).toContain(region.id);
            }
        }
    });

    it("keeps structured Qinghe-style subregion anchors and route windows internally consistent", () => {
        for (const region of regionPack.entries) {
            const subregionDetailIds = new Set(region.subregionDetails.map((detail) => detail.id));

            for (const detail of region.subregionDetails) {
                expect(region.subregions).toContain(detail.title);
                expect(codexEntryIds.has(detail.focusEntryId), `${region.id} subregion ${detail.id} focus entry is missing`).toBe(
                    true,
                );

                for (const entryId of detail.linkedEntryIds) {
                    expect(codexEntryIds.has(entryId), `${region.id} subregion ${detail.id} links missing entry ${entryId}`).toBe(
                        true,
                    );
                }
            }

            for (const routeWindow of region.routeWindows) {
                expect(codexEntryIds.has(routeWindow.focusEntryId), `${region.id} route window ${routeWindow.id} focus entry is missing`).toBe(
                    true,
                );

                for (const subregionId of routeWindow.subregionIds) {
                    expect(subregionDetailIds.has(subregionId), `${region.id} route window ${routeWindow.id} references missing subregion ${subregionId}`).toBe(
                        true,
                    );
                }

                for (const entryId of routeWindow.linkedEntryIds) {
                    expect(codexEntryIds.has(entryId), `${region.id} route window ${routeWindow.id} links missing entry ${entryId}`).toBe(
                        true,
                    );
                }
            }
        }

        expect(regionById.get("qinghe")?.subregionDetails).toHaveLength(3);
        expect(regionById.get("qinghe")?.routeWindows.map((window) => window.id)).toEqual(
            expect.arrayContaining([
                "qinghe-main-spine",
                "qinghe-exploration-loop",
                "qinghe-meridian-detour",
                "qinghe-opening-gate",
                "qinghe-campaign-ladder",
                "qinghe-late-chapter-link",
                "qinghe-sundara-capstone",
            ]),
        );
    });

    it("keeps reviewed region progression gates resolvable and source-backed", () => {
        for (const region of regionPack.entries) {
            for (const entryId of region.progressionGateEntryIds) {
                expect(codexEntryIds.has(entryId), `${region.id} progression gate ${entryId} is missing`).toBe(true);
            }
        }

        expect(regionById.get("qinghe")?.requiredCharacterLevel).toBeUndefined();
        expect(regionById.get("kaifeng")?.requiredCharacterLevel).toBe(32);
        expect(regionById.get("hexi")?.requiredCharacterLevel).toBe(14);
        expect(regionById.get("kaifeng")?.progressionGateEntryIds).toEqual(["storyline-heaven-has-no-pier"]);
        expect(regionById.get("hexi")?.progressionGateEntryIds).toEqual(["quest-still-shore"]);
    });

    it("keeps Qinghe optional routes first-class without collapsing them into campaign or encounter layers", () => {
        expect(questById.get("quest-white-bird-shooting")?.questType).toBe("exploration");
        expect(questById.get("quest-the-shameless")?.questType).toBe("exploration");
        expect(questById.get("quest-meridian-touch")?.questType).toBe("jianghu-legacy");
        expect(regionById.get("qinghe")?.questIds).toEqual(
            expect.arrayContaining([
                "quest-white-bird-shooting",
                "quest-the-shameless",
                "quest-meridian-touch",
            ]),
        );
        expect(regionById.get("qinghe")?.campaignQuestIds).toEqual([
            "quest-still-shore",
            "quest-bodhi-sea",
            "quest-gleaming-abyss",
            "quest-palace-of-annals",
            "quest-blissful-retreat",
            "quest-halo-peak",
        ]);
        expect(regionById.get("kaifeng")?.campaignQuestIds).toEqual([
            "quest-unbound-cavern",
            "quest-ever-normal-granary",
            "quest-jinming-pool",
            "quest-furnace-of-righteousness-campaign",
            "quest-heavenfall",
            "quest-supreme-freedom",
        ]);
    });

    it("seeds the first three released regions and story chapters plus Qinghe optional routes and the reviewed campaign ladders", () => {
        expect(regionPack.entries.map((entry) => entry.id)).toEqual(["qinghe", "kaifeng", "hexi"]);
        expect(storylinePack.entries.map((entry) => entry.chapterNumber)).toEqual([1, 2, 3]);
        expect(questPack.entries.filter((entry) => entry.questType === "main")).toHaveLength(13);
        expect(questPack.entries.filter((entry) => entry.questType === "campaign")).toHaveLength(15);
        expect(questPack.entries.filter((entry) => entry.questType === "exploration")).toHaveLength(2);
        expect(questPack.entries.filter((entry) => entry.questType === "jianghu-legacy")).toHaveLength(1);
        expect(storylineById.has("storyline-heaven-has-no-pier")).toBe(true);
        expect(questById.has("quest-bodhi-sea")).toBe(true);
        expect(questById.has("quest-unbound-cavern")).toBe(true);
        expect(questById.has("quest-death-of-the-governor")).toBe(true);
        expect(questById.has("quest-meridian-touch")).toBe(true);
        expect(questById.has("quest-supreme-freedom")).toBe(true);
    });
});
