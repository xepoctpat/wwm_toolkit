import { describe, expect, it } from "vitest";

import { questPack } from "../app/src/data/content/quests";
import { regionPack } from "../app/src/data/content/regions";
import { sourcePack } from "../app/src/data/content/sources";
import { storylinePack } from "../app/src/data/content/storylines";
import {
    buildCodexSearchDocuments,
    getCodexFilterOptions,
    searchCodexDocuments,
} from "../app/src/lib/search/codexSearch";

const documents = buildCodexSearchDocuments({
    regionPack,
    questPack,
    storylinePack,
    sourcePack,
});

describe("codex search", () => {
    it("indexes every reviewed region, quest, storyline, and source entry", () => {
        expect(documents).toHaveLength(50);
    });

    it("prefers an exact storyline title match over neighboring quest records", () => {
        const results = searchCodexDocuments(documents, {
            query: "Heaven Has No Pier",
            filters: {
                domain: "all",
                regionId: "all",
                questType: "all",
            },
        });

        expect(results[0]?.document.id).toBe("storyline-heaven-has-no-pier");
    });

    it("finds narrative summary matches across quest entries", () => {
        const results = searchCodexDocuments(documents, {
            query: "Qianye",
            filters: {
                domain: "all",
                regionId: "all",
                questType: "all",
            },
        });

        expect(results[0]?.document.id).toBe("quest-for-whom-does-he-return");
    });

    it("finds first-class Qinghe optional routes by title", () => {
        const results = searchCodexDocuments(documents, {
            query: "Meridian Touch",
            filters: {
                domain: "all",
                regionId: "all",
                questType: "all",
            },
        });

        expect(results[0]?.document.id).toBe("quest-meridian-touch");
        expect(results[0]?.document.domain).toBe("quests");
    });

    it("finds subregion metadata on region entries", () => {
        const results = searchCodexDocuments(documents, {
            query: "Sundara Land",
            filters: {
                domain: "regions",
                regionId: "all",
                questType: "all",
            },
        });

        expect(results[0]?.document.id).toBe("qinghe");
        expect(results[0]?.document.domain).toBe("regions");
    });

    it("supports region and quest-type filtering together", () => {
        const results = searchCodexDocuments(documents, {
            query: "",
            filters: {
                domain: "all",
                regionId: "hexi",
                questType: "campaign",
            },
        });

        expect(results).toHaveLength(3);
        expect(results.every((result) => result.document.domain === "quests")).toBe(true);
        expect(
            results.every(
                (result) => result.document.domain === "quests" && result.document.questType === "campaign",
            ),
        ).toBe(true);
        expect(results.every((result) => result.document.regionIds.includes("hexi"))).toBe(true);
    });

    it("supports exploration-route filtering in Qinghe", () => {
        const results = searchCodexDocuments(documents, {
            query: "",
            filters: {
                domain: "all",
                regionId: "qinghe",
                questType: "exploration",
            },
        });

        expect(results).toHaveLength(2);
        expect(
            results.every(
                (result) => result.document.domain === "quests" && result.document.questType === "exploration",
            ),
        ).toBe(true);
    });

    it("exposes stable filter options from the reviewed seed", () => {
        const options = getCodexFilterOptions(documents);

        expect(options.domains).toEqual(["regions", "quests", "storylines", "sources"]);
        expect(options.regions).toEqual(["hexi", "kaifeng", "qinghe"]);
        expect(options.questTypes).toEqual(["main", "campaign", "exploration", "jianghu-legacy"]);
    });
});
