import { describe, expect, it } from "vitest";

import {
    getCodexSyncTargetForFlowchartDefinition,
    getKeyboardNavigationTargetIndex,
    getPreferredFlowchartDefinitionIdForCodexDocument,
} from "../app/src/app/foundationNavigation";
import { questPack } from "../app/src/data/content/quests";
import { regionPack } from "../app/src/data/content/regions";
import { sourcePack } from "../app/src/data/content/sources";
import { storylinePack } from "../app/src/data/content/storylines";
import {
    buildQuestFlowchartDefinitions,
    getQuestFlowchartDefinitionById,
} from "../app/src/lib/flowcharts/questFlowcharts";
import {
    buildCodexSearchDocuments,
    getCodexDocumentById,
} from "../app/src/lib/search/codexSearch";

const definitions = buildQuestFlowchartDefinitions({
    regionPack,
    questPack,
    storylinePack,
});

const codexDocuments = buildCodexSearchDocuments({
    regionPack,
    questPack,
    storylinePack,
    sourcePack,
});

describe("foundation navigation helpers", () => {
    it("syncs the Qinghe onboarding chart to a broad Qinghe codex view anchored on the first main quest", () => {
        const definition = getQuestFlowchartDefinitionById(definitions, "progression-qinghe-onboarding-route");

        expect(definition).toBeTruthy();
        expect(getCodexSyncTargetForFlowchartDefinition(definition!, codexDocuments)).toEqual({
            query: "",
            domain: "all",
            regionId: "qinghe",
            questType: "all",
            selectedEntryId: "quest-another-new-wing",
        });
    });

    it("syncs the region overview chart to region-first navigation", () => {
        const definition = getQuestFlowchartDefinitionById(definitions, "progression-region-level-overview");

        expect(definition).toBeTruthy();
        expect(getCodexSyncTargetForFlowchartDefinition(definition!, codexDocuments)).toEqual({
            query: "",
            domain: "regions",
            regionId: "all",
            questType: "all",
            selectedEntryId: "qinghe",
        });
    });

    it("syncs campaign charts to campaign-filtered quest navigation", () => {
        const definition = getQuestFlowchartDefinitionById(definitions, "campaign-branches-kaifeng");

        expect(definition).toBeTruthy();
        expect(getCodexSyncTargetForFlowchartDefinition(definition!, codexDocuments)).toEqual({
            query: "",
            domain: "quests",
            regionId: "kaifeng",
            questType: "campaign",
            selectedEntryId: "quest-unbound-cavern",
        });
    });

    it("chooses the most relevant chart for Qinghe optional routes, campaign quests, storylines, and regions", () => {
        const whiteBird = getCodexDocumentById(codexDocuments, "quest-white-bird-shooting");
        const stillShore = getCodexDocumentById(codexDocuments, "quest-still-shore");
        const qingheStoryline = getCodexDocumentById(codexDocuments, "storyline-heaven-has-no-pier");
        const qingheRegion = getCodexDocumentById(codexDocuments, "qinghe");
        const kaifengRegion = getCodexDocumentById(codexDocuments, "kaifeng");

        expect(whiteBird).toBeTruthy();
        expect(stillShore).toBeTruthy();
        expect(qingheStoryline).toBeTruthy();
        expect(qingheRegion).toBeTruthy();
        expect(kaifengRegion).toBeTruthy();

        expect(getPreferredFlowchartDefinitionIdForCodexDocument(whiteBird!, definitions)).toBe(
            "progression-qinghe-onboarding-route",
        );
        expect(getPreferredFlowchartDefinitionIdForCodexDocument(stillShore!, definitions)).toBe(
            "campaign-branches-qinghe",
        );
        expect(getPreferredFlowchartDefinitionIdForCodexDocument(qingheStoryline!, definitions)).toBe(
            "storyline-heaven-has-no-pier-flowchart",
        );
        expect(getPreferredFlowchartDefinitionIdForCodexDocument(qingheRegion!, definitions)).toBe(
            "progression-qinghe-onboarding-route",
        );
        expect(getPreferredFlowchartDefinitionIdForCodexDocument(kaifengRegion!, definitions)).toBe(
            "progression-region-level-overview",
        );
    });

    it("returns no chart for source-only entries that are not part of the flowchart graph", () => {
        const source = getCodexDocumentById(codexDocuments, "official-site");

        expect(source).toBeTruthy();
        expect(getPreferredFlowchartDefinitionIdForCodexDocument(source!, definitions)).toBeNull();
    });

    it("supports linear keyboard navigation across cards", () => {
        expect(getKeyboardNavigationTargetIndex(0, 5, "ArrowDown")).toBe(1);
        expect(getKeyboardNavigationTargetIndex(4, 5, "ArrowDown")).toBe(4);
        expect(getKeyboardNavigationTargetIndex(2, 5, "ArrowUp")).toBe(1);
        expect(getKeyboardNavigationTargetIndex(2, 5, "ArrowRight")).toBe(3);
        expect(getKeyboardNavigationTargetIndex(2, 5, "ArrowLeft")).toBe(1);
        expect(getKeyboardNavigationTargetIndex(2, 5, "Home")).toBe(0);
        expect(getKeyboardNavigationTargetIndex(2, 5, "End")).toBe(4);
        expect(getKeyboardNavigationTargetIndex(2, 5, "Enter")).toBeNull();
    });
});