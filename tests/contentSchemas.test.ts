import { describe, expect, it } from "vitest";

import { questPack } from "../app/src/data/content/quests";
import { regionPack } from "../app/src/data/content/regions";
import { sourcePack } from "../app/src/data/content/sources";
import { storylinePack } from "../app/src/data/content/storylines";
import { questEntrySchema } from "../app/src/data/schemas/quest";
import { regionEntrySchema } from "../app/src/data/schemas/region";

describe("content pack scaffolds", () => {
    it("accepts the reviewed quest pack", () => {
        expect(questPack.meta.domain).toBe("quests");
        expect(questPack.meta.status).toBe("in-progress");
        expect(questPack.entries.length).toBeGreaterThan(0);
    });

    it("accepts the reviewed storyline pack", () => {
        expect(storylinePack.meta.domain).toBe("storylines");
        expect(storylinePack.meta.status).toBe("in-progress");
        expect(storylinePack.entries.length).toBeGreaterThan(0);
    });

    it("accepts the reviewed region pack", () => {
        expect(regionPack.meta.domain).toBe("regions");
        expect(regionPack.meta.status).toBe("in-progress");
        expect(regionPack.entries).toHaveLength(3);
    });

    it("accepts the reviewed source pack", () => {
        expect(sourcePack.meta.domain).toBe("sources");
        expect(sourcePack.entries.length).toBeGreaterThan(0);
    });

    it("requires verification metadata on quest entries", () => {
        expect(() =>
            questEntrySchema.parse({
                id: "quest-demo",
                title: "Demo quest",
                summary: "Used only for schema validation coverage.",
                tags: [],
                sourceIds: ["official-demo"],
                lastVerified: "2026-04-16",
                gameVersion: "CN/Global unknown",
                confidence: "provisional",
                verificationStatus: "provisional",
                evidenceType: "community-guide",
                relatedEntryIds: [],
                questType: "campaign",
                locationHint: "Qinghe - General's Shrine",
                regionIds: [],
                storylineIds: [],
                npcIds: [],
                prerequisiteQuestIds: [],
                followUpQuestIds: [],
                rewardIds: [],
            }),
        ).not.toThrow();
    });

    it("requires traversal and subregion metadata on region entries", () => {
        expect(() =>
            regionEntrySchema.parse({
                id: "qinghe-demo",
                title: "Qinghe demo",
                summary: "Used only for schema validation coverage.",
                tags: ["starter-region"],
                sourceIds: ["official-site"],
                lastVerified: "2026-04-16",
                gameVersion: "1.5 As Snow Falls",
                confidence: "cross-checked",
                verificationStatus: "reviewed",
                evidenceType: "community-guide",
                verificationNotes: "Synthetic test payload.",
                relatedEntryIds: [],
                regionOrder: 1,
                requiredCharacterLevel: 32,
                unlockRequirement: "Available immediately.",
                traversalSummary: "Loop between the starter shrines and village hubs.",
                subregions: ["Verdant Wilds"],
                landmarkNames: ["Heaven's Pier"],
                storylineIds: ["storyline-heaven-has-no-pier"],
                progressionGateEntryIds: ["storyline-heaven-has-no-pier"],
                questIds: ["quest-another-new-wing"],
                campaignQuestIds: [],
                activityHighlights: ["Starter route verified."],
            }),
        ).not.toThrow();
    });
});
