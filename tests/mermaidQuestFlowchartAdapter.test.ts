import { describe, expect, it } from "vitest";

import { questPack } from "../app/src/data/content/quests";
import { regionPack } from "../app/src/data/content/regions";
import { storylinePack } from "../app/src/data/content/storylines";
import {
    buildQuestFlowchartDefinitions,
    getQuestFlowchartDefinitionById,
} from "../app/src/lib/flowcharts/questFlowcharts";
import { renderQuestGraphDefinitionAsMermaid } from "../app/src/lib/flowcharts/renderers/mermaidQuestFlowchartAdapter";

const definitions = buildQuestFlowchartDefinitions({
    regionPack,
    questPack,
    storylinePack,
});

describe("Mermaid quest flowchart adapter", () => {
    it("serializes renderer-neutral graph definitions back into Mermaid", () => {
        definitions.forEach((definition) => {
            expect(renderQuestGraphDefinitionAsMermaid(definition.graph)).toBe(definition.mermaid);
        });
    });

    it("keeps Qinghe onboarding node types separated across main, exploration, legacy, and campaign routes", () => {
        const definition = getQuestFlowchartDefinitionById(definitions, "progression-qinghe-onboarding-route");

        expect(definition).toBeTruthy();

        const nodeTypeByEntryId = new Map(
            definition?.graph.nodes
                .filter((node) => node.entryId)
                .map((node) => [node.entryId!, node.nodeType]),
        );

        expect(nodeTypeByEntryId.get("qinghe")).toBe("region");
        expect(nodeTypeByEntryId.get("storyline-heaven-has-no-pier")).toBe("storyline");
        expect(nodeTypeByEntryId.get("quest-another-new-wing")).toBe("main");
        expect(nodeTypeByEntryId.get("quest-white-bird-shooting")).toBe("opportunity");
        expect(nodeTypeByEntryId.get("quest-the-shameless")).toBe("opportunity");
        expect(nodeTypeByEntryId.get("quest-meridian-touch")).toBe("legacy");
        expect(nodeTypeByEntryId.get("quest-still-shore")).toBe("campaign");

        expect(definition?.graph.edges).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    edgeType: "related-route",
                    style: "dashed",
                    label: "Jianghu Legacy detour on the road home",
                }),
                expect.objectContaining({
                    edgeType: "campaign-chain",
                    style: "dashed",
                    label: "optional campaign during main quest",
                }),
            ]),
        );
    });
});