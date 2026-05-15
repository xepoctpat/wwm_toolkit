import { describe, expect, it } from "vitest";

import { questPack } from "../app/src/data/content/quests";
import { regionPack } from "../app/src/data/content/regions";
import { storylinePack } from "../app/src/data/content/storylines";
import {
    buildQuestFlowchartDefinitions,
    getQuestFlowchartDefinitionById,
} from "../app/src/lib/flowcharts/questFlowcharts";
import {
    buildQuestGraphLayout,
    renderQuestGraphDefinitionAsHtml,
} from "../app/src/lib/flowcharts/renderers/vanillaQuestFlowchartRenderer";

const definitions = buildQuestFlowchartDefinitions({
    regionPack,
    questPack,
    storylinePack,
});

describe("Vanilla quest flowchart renderer", () => {
    it("lays out the Qinghe onboarding graph in rank order and renders selected interactive nodes", () => {
        const definition = getQuestFlowchartDefinitionById(definitions, "progression-qinghe-onboarding-route");

        expect(definition).toBeTruthy();

        const layout = buildQuestGraphLayout(definition!.graph);
        const anotherNode = layout.nodes.find((node) => node.entryId === "quest-another-new-wing");
        const horseNode = layout.nodes.find((node) => node.entryId === "quest-a-horse-neighs-in-the-forest");
        const dustNode = layout.nodes.find((node) => node.entryId === "quest-dust-on-the-rhombus-mirror");
        const meridianNode = layout.nodes.find((node) => node.entryId === "quest-meridian-touch");
        const campaignNode = layout.nodes.find((node) => node.entryId === "quest-still-shore");
        const explorationNode = layout.nodes.find((node) => node.entryId === "quest-white-bird-shooting");
        const shamelessNode = layout.nodes.find((node) => node.entryId === "quest-the-shameless");
        const html = renderQuestGraphDefinitionAsHtml(definition!.graph, {
            selectedEntryId: "quest-meridian-touch",
        });

        expect(anotherNode).toBeTruthy();
        expect(horseNode).toBeTruthy();
        expect(dustNode).toBeTruthy();
        expect(meridianNode).toBeTruthy();
        expect(campaignNode).toBeTruthy();
        expect(explorationNode).toBeTruthy();
        expect(shamelessNode).toBeTruthy();
        expect(meridianNode!.rank).toBeGreaterThan(horseNode!.rank);
        expect(campaignNode!.rank).toBeGreaterThan(horseNode!.rank);
        expect(explorationNode!.x).toBeLessThan(horseNode!.x);
        expect(meridianNode!.x).toBeGreaterThan(horseNode!.x);
        expect(campaignNode!.x).toBeGreaterThan(meridianNode!.x);
        expect(explorationNode!.y).toBeLessThan(horseNode!.y);
        expect(shamelessNode!.y).toBeLessThan(horseNode!.y + horseNode!.height);
        expect(meridianNode!.y).toBeLessThan(dustNode!.y + dustNode!.height / 2);
        expect(campaignNode!.y).toBeLessThan(dustNode!.y + dustNode!.height);
        expect(
            Math.abs(
                (explorationNode!.y + explorationNode!.height / 2 + shamelessNode!.y + shamelessNode!.height / 2) / 2 -
                    (anotherNode!.y + anotherNode!.height / 2),
            ),
        ).toBeLessThan(28);

        expect(html).toContain('data-flowchart-node-entry-id="quest-meridian-touch"');
        expect(html).toContain("graph-prototype__node--legacy");
        expect(html).toContain("graph-prototype__node--campaign");
        expect(html).toContain("is-selected");
        expect(html).toContain("Jianghu Legacy detour on the road home");
    });

    it("keeps edge labels contextual so the graph is quieter until a branch is selected", () => {
        const definition = getQuestFlowchartDefinitionById(definitions, "progression-qinghe-onboarding-route");

        expect(definition).toBeTruthy();

        const quietHtml = renderQuestGraphDefinitionAsHtml(definition!.graph);
        const selectedHtml = renderQuestGraphDefinitionAsHtml(definition!.graph, {
            selectedEntryId: "quest-meridian-touch",
        });

        expect(quietHtml).not.toContain("Jianghu Legacy detour on the road home");
        expect(selectedHtml).toContain("Jianghu Legacy detour on the road home");
        expect(selectedHtml).toContain("graph-prototype__edge--related-route");
        expect(selectedHtml).toContain("is-active");
    });

    it("can widen the graph stage so the side lanes use available horizontal space", () => {
        const definition = getQuestFlowchartDefinitionById(definitions, "progression-qinghe-onboarding-route");

        expect(definition).toBeTruthy();

        const compactLayout = buildQuestGraphLayout(definition!.graph);
        const expandedLayout = buildQuestGraphLayout(definition!.graph, { minimumWidth: 1200 });
        const compactExplorationNode = compactLayout.nodes.find((node) => node.entryId === "quest-white-bird-shooting");
        const compactMainNode = compactLayout.nodes.find((node) => node.entryId === "quest-a-horse-neighs-in-the-forest");
        const compactLegacyNode = compactLayout.nodes.find((node) => node.entryId === "quest-meridian-touch");
        const expandedExplorationNode = expandedLayout.nodes.find((node) => node.entryId === "quest-white-bird-shooting");
        const expandedMainNode = expandedLayout.nodes.find((node) => node.entryId === "quest-a-horse-neighs-in-the-forest");
        const expandedLegacyNode = expandedLayout.nodes.find((node) => node.entryId === "quest-meridian-touch");

        expect(compactExplorationNode).toBeTruthy();
        expect(compactMainNode).toBeTruthy();
        expect(compactLegacyNode).toBeTruthy();
        expect(expandedExplorationNode).toBeTruthy();
        expect(expandedMainNode).toBeTruthy();
        expect(expandedLegacyNode).toBeTruthy();

        expect(expandedLayout.width).toBeGreaterThanOrEqual(1200);
        expect(expandedMainNode!.x).toBeGreaterThan(compactMainNode!.x);
        expect(expandedMainNode!.x - expandedExplorationNode!.x).toBeGreaterThan(
            compactMainNode!.x - compactExplorationNode!.x,
        );
        expect(expandedLegacyNode!.x - expandedMainNode!.x).toBeGreaterThan(
            compactLegacyNode!.x - compactMainNode!.x,
        );
    });
});