import type {
    QuestGraphDefinition,
    QuestGraphEdge,
    QuestGraphNode,
    QuestGraphNodeType,
} from "../questFlowchartModel";

function escapeMermaidText(value: string) {
    return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
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

function getMermaidClassName(nodeType: QuestGraphNodeType) {
    return nodeType;
}

function renderNodeLabel(node: QuestGraphNode) {
    return node.lines.map(escapeMermaidText).join("<br/>");
}

function renderEdge(edge: QuestGraphEdge) {
    if (edge.style === "dashed") {
        if (edge.label) {
            return `    ${edge.sourceId} -. ${escapeMermaidText(edge.label)} .-> ${edge.targetId}`;
        }

        return `    ${edge.sourceId} -.-> ${edge.targetId}`;
    }

    return `    ${edge.sourceId} --> ${edge.targetId}`;
}

export function renderQuestGraphDefinitionAsMermaid(definition: QuestGraphDefinition) {
    const lines = [`flowchart ${definition.direction}`];

    appendFlowchartTheme(lines);

    definition.nodes.forEach((node) => {
        lines.push(`    ${node.id}["${renderNodeLabel(node)}"]:::${getMermaidClassName(node.nodeType)}`);
    });

    definition.edges.forEach((edge) => {
        lines.push(renderEdge(edge));
    });

    return lines.join("\n");
}