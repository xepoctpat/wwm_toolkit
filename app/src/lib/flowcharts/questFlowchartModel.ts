export type QuestGraphDirection = "TD";

export type QuestGraphNodeType =
    | "region"
    | "storyline"
    | "gate"
    | "main"
    | "campaign"
    | "opportunity"
    | "legacy";

export type QuestGraphEdgeType =
    | "main-path"
    | "optional-branch"
    | "campaign-chain"
    | "gate"
    | "related-route"
    | "anchor";

export type QuestGraphEdgeStyle = "solid" | "dashed";

export interface QuestGraphNode {
    id: string;
    nodeType: QuestGraphNodeType;
    lines: string[];
    entryId?: string;
    metadata?: Record<string, string | number | boolean | undefined>;
}

export interface QuestGraphEdge {
    sourceId: string;
    targetId: string;
    edgeType: QuestGraphEdgeType;
    style: QuestGraphEdgeStyle;
    label?: string;
}

export interface QuestGraphDefinition {
    direction: QuestGraphDirection;
    nodes: QuestGraphNode[];
    edges: QuestGraphEdge[];
}

export function createQuestGraphDefinition(direction: QuestGraphDirection = "TD"): QuestGraphDefinition {
    return {
        direction,
        nodes: [],
        edges: [],
    };
}

export function createQuestGraphNode(node: QuestGraphNode): QuestGraphNode {
    return node;
}

export function createQuestGraphEdge(edge: QuestGraphEdge): QuestGraphEdge {
    return edge;
}