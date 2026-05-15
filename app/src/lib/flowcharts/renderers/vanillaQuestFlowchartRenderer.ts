import type { QuestGraphDefinition, QuestGraphEdge, QuestGraphNode } from "../questFlowchartModel";

const NODE_MIN_WIDTH = 204;
const NODE_MAX_WIDTH = 280;
const NODE_MIN_HEIGHT = 78;
const NODE_LINE_HEIGHT = 18;
const NODE_VERTICAL_PADDING = 18;
const NODE_HORIZONTAL_PADDING = 18;
const LANE_GAP = 36;
const LANE_STACK_GAP = 18;
const LANE_CLUSTER_GAP = 26;
const VERTICAL_GAP = 72;
const EDGE_CURVE_OFFSET = 36;
const GRAPH_PADDING_X = 18;

export interface QuestGraphNodeLayout extends QuestGraphNode {
    x: number;
    y: number;
    width: number;
    height: number;
    rank: number;
    lane: number;
}

export interface QuestGraphEdgeLayout extends QuestGraphEdge {
    path: string;
    labelX: number | null;
    labelY: number | null;
    active: boolean;
}

export interface QuestGraphLayout {
    width: number;
    height: number;
    nodes: QuestGraphNodeLayout[];
    edges: QuestGraphEdgeLayout[];
}

export interface VanillaQuestFlowchartRenderOptions {
    selectedEntryId?: string | null;
    showAllEdgeLabels?: boolean;
    minimumWidth?: number;
}

function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(Math.max(value, minimum), maximum);
}

function escapeHtml(value: string | number | null | undefined) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function getNodeHeight(node: QuestGraphNode) {
    return Math.max(NODE_MIN_HEIGHT, NODE_VERTICAL_PADDING * 2 + node.lines.length * NODE_LINE_HEIGHT);
}

function getNodeWidth(node: QuestGraphNode) {
    const longestLine = node.lines.reduce((max, line) => Math.max(max, line.length), 0);

    return clamp(longestLine * 7.1 + NODE_HORIZONTAL_PADDING * 2, NODE_MIN_WIDTH, NODE_MAX_WIDTH);
}

function getNodeIndexMap(nodes: QuestGraphDefinition["nodes"]) {
    return new Map(nodes.map((node, index) => [node.id, index]));
}

function sortNodeIdsByDefinitionOrder(ids: string[], nodeIndexById: Map<string, number>) {
    return [...ids].sort((left, right) => (nodeIndexById.get(left) ?? 0) - (nodeIndexById.get(right) ?? 0));
}

function sortNodesByDefinitionOrder(nodes: QuestGraphNode[], nodeIndexById: Map<string, number>) {
    return [...nodes].sort((left, right) => (nodeIndexById.get(left.id) ?? 0) - (nodeIndexById.get(right.id) ?? 0));
}

function getNodeLane(node: QuestGraphNode) {
    switch (node.nodeType) {
        case "opportunity":
            return -1;
        case "legacy":
        case "campaign":
            return 1;
        default:
            return 0;
    }
}

function getClusterHeight(nodes: QuestGraphNode[]) {
    return nodes.reduce((sum, node, index) => sum + getNodeHeight(node) + (index > 0 ? LANE_STACK_GAP : 0), 0);
}

function getIncomingEdgesByTarget(definition: QuestGraphDefinition) {
    const incoming = new Map<string, QuestGraphEdge[]>();

    definition.edges.forEach((edge) => {
        const list = incoming.get(edge.targetId) ?? [];

        list.push(edge);
        incoming.set(edge.targetId, list);
    });

    return incoming;
}

function resolveAnchorNodeId(
    nodeId: string,
    incomingEdgesByTarget: Map<string, QuestGraphEdge[]>,
    nodeById: Map<string, QuestGraphNode>,
    nodeIndexById: Map<string, number>,
) {
    const visited = new Set<string>();
    let currentId: string | null = nodeId;

    while (currentId && !visited.has(currentId)) {
        visited.add(currentId);
        const incomingEdges = incomingEdgesByTarget.get(currentId);

        if (!incomingEdges || incomingEdges.length === 0) {
            return null;
        }

        const [firstIncomingEdge] = [...incomingEdges].sort(
            (left, right) => (nodeIndexById.get(left.sourceId) ?? 0) - (nodeIndexById.get(right.sourceId) ?? 0),
        );
        const sourceNode = nodeById.get(firstIncomingEdge.sourceId);

        if (!sourceNode) {
            return null;
        }

        if (getNodeLane(sourceNode) === 0) {
            return sourceNode.id;
        }

        currentId = sourceNode.id;
    }

    return null;
}

function buildNodeRanks(definition: QuestGraphDefinition) {
    const nodeById = new Map(definition.nodes.map((node) => [node.id, node]));
    const nodeIndexById = getNodeIndexMap(definition.nodes);
    const inDegree = new Map(definition.nodes.map((node) => [node.id, 0]));
    const outgoing = new Map(definition.nodes.map((node) => [node.id, [] as string[]]));
    const ranks = new Map(definition.nodes.map((node) => [node.id, 0]));

    definition.edges.forEach((edge) => {
        if (!nodeById.has(edge.sourceId) || !nodeById.has(edge.targetId)) {
            return;
        }

        outgoing.get(edge.sourceId)?.push(edge.targetId);
        inDegree.set(edge.targetId, (inDegree.get(edge.targetId) ?? 0) + 1);
    });

    const queue = sortNodeIdsByDefinitionOrder(
        definition.nodes.filter((node) => (inDegree.get(node.id) ?? 0) === 0).map((node) => node.id),
        nodeIndexById,
    );
    const processed = new Set<string>();

    while (queue.length > 0) {
        const currentId = queue.shift();

        if (!currentId || processed.has(currentId)) {
            continue;
        }

        processed.add(currentId);
        const currentRank = ranks.get(currentId) ?? 0;

        sortNodeIdsByDefinitionOrder(outgoing.get(currentId) ?? [], nodeIndexById).forEach((targetId) => {
            ranks.set(targetId, Math.max(ranks.get(targetId) ?? 0, currentRank + 1));
            inDegree.set(targetId, (inDegree.get(targetId) ?? 1) - 1);

            if ((inDegree.get(targetId) ?? 0) === 0) {
                queue.push(targetId);
                queue.sort((left, right) => (nodeIndexById.get(left) ?? 0) - (nodeIndexById.get(right) ?? 0));
            }
        });
    }

    definition.nodes.forEach((node) => {
        if (!processed.has(node.id)) {
            ranks.set(node.id, ranks.get(node.id) ?? 0);
        }
    });

    return ranks;
}

export function buildQuestGraphLayout(
    definition: QuestGraphDefinition,
    options: VanillaQuestFlowchartRenderOptions = {},
): QuestGraphLayout {
    const nodeById = new Map(definition.nodes.map((node) => [node.id, node]));
    const nodeIndexById = getNodeIndexMap(definition.nodes);
    const incomingEdgesByTarget = getIncomingEdgesByTarget(definition);
    const ranks = buildNodeRanks(definition);
    const centerLaneRankGroups = new Map<number, QuestGraphNode[]>();
    const sideLaneClusterGroups = new Map<number, Map<string, QuestGraphNode[]>>();
    const laneWidths = new Map<number, number>();

    definition.nodes.forEach((node) => {
        const rank = ranks.get(node.id) ?? 0;
        const lane = getNodeLane(node);

        laneWidths.set(lane, Math.max(laneWidths.get(lane) ?? NODE_MIN_WIDTH, getNodeWidth(node)));

        if (lane === 0) {
            const nodes = centerLaneRankGroups.get(rank) ?? [];

            nodes.push(node);
            centerLaneRankGroups.set(rank, nodes);
            return;
        }

        const anchorId =
            resolveAnchorNodeId(node.id, incomingEdgesByTarget, nodeById, nodeIndexById) ?? `orphan-${node.id}`;
        const clusters = sideLaneClusterGroups.get(lane) ?? new Map<string, QuestGraphNode[]>();
        const nodes = clusters.get(anchorId) ?? [];

        nodes.push(node);
        clusters.set(anchorId, nodes);
        sideLaneClusterGroups.set(lane, clusters);
    });

    const leftLaneWidth = laneWidths.get(-1) ?? 0;
    const centerLaneWidth = laneWidths.get(0) ?? NODE_MIN_WIDTH;
    const rightLaneWidth = laneWidths.get(1) ?? 0;
    const baseWidth = Math.max(
        GRAPH_PADDING_X * 2 +
            leftLaneWidth +
            (leftLaneWidth > 0 ? LANE_GAP : 0) +
            centerLaneWidth +
            (rightLaneWidth > 0 ? LANE_GAP + rightLaneWidth : 0),
        NODE_MIN_WIDTH + GRAPH_PADDING_X * 2,
    );
    const totalWidth = Math.max(baseWidth, options.minimumWidth ?? 0);
    const minCenterLaneX = GRAPH_PADDING_X + (leftLaneWidth > 0 ? leftLaneWidth + LANE_GAP : 0);
    const maxCenterLaneX =
        totalWidth -
        GRAPH_PADDING_X -
        centerLaneWidth -
        (rightLaneWidth > 0 ? rightLaneWidth + LANE_GAP : 0);
    const centeredCenterLaneX = GRAPH_PADDING_X + Math.max((totalWidth - GRAPH_PADDING_X * 2 - centerLaneWidth) / 2, 0);
    const centerLaneX = clamp(centeredCenterLaneX, minCenterLaneX, Math.max(minCenterLaneX, maxCenterLaneX));
    const laneStartX = new Map<number, number>([
        [-1, GRAPH_PADDING_X],
        [0, centerLaneX],
        [1, totalWidth - GRAPH_PADDING_X - rightLaneWidth],
    ]);

    const layouts: QuestGraphNodeLayout[] = [];
    let currentY = 0;
    const orderedRanks = [...centerLaneRankGroups.keys()].sort((left, right) => left - right);

    orderedRanks.forEach((rank) => {
        const centerNodes = sortNodesByDefinitionOrder(centerLaneRankGroups.get(rank) ?? [], nodeIndexById);
        const rowHeight = Math.max(NODE_MIN_HEIGHT, getClusterHeight(centerNodes));
        let cursorY = currentY;

        centerNodes.forEach((node) => {
            const width = getNodeWidth(node);
            const height = getNodeHeight(node);

            layouts.push({
                ...node,
                x: (laneStartX.get(0) ?? GRAPH_PADDING_X) + Math.max((centerLaneWidth - width) / 2, 0),
                y: cursorY,
                width,
                height,
                rank,
                lane: 0,
            });
            cursorY += height + LANE_STACK_GAP;
        });

        currentY += rowHeight + VERTICAL_GAP;
    });

    const centerNodeLayoutById = new Map(layouts.map((node) => [node.id, node]));

    [-1, 1].forEach((lane) => {
        const clusters = sideLaneClusterGroups.get(lane);
        const laneWidth = laneWidths.get(lane);

        if (!clusters || !laneWidth) {
            return;
        }

        let laneCursorY = 0;

        [...clusters.entries()]
            .map(([anchorId, nodes]) => ({
                nodes: sortNodesByDefinitionOrder(nodes, nodeIndexById),
                anchorLayout: anchorId.startsWith("orphan-") ? null : centerNodeLayoutById.get(anchorId) ?? null,
            }))
            .sort((left, right) => {
                const leftY = left.anchorLayout ? left.anchorLayout.y + left.anchorLayout.height / 2 : Number.MAX_SAFE_INTEGER;
                const rightY = right.anchorLayout ? right.anchorLayout.y + right.anchorLayout.height / 2 : Number.MAX_SAFE_INTEGER;

                if (leftY !== rightY) {
                    return leftY - rightY;
                }

                return (nodeIndexById.get(left.nodes[0]?.id ?? "") ?? 0) - (nodeIndexById.get(right.nodes[0]?.id ?? "") ?? 0);
            })
            .forEach(({ nodes, anchorLayout }) => {
                const clusterHeight = getClusterHeight(nodes);
                const anchorCenterY = anchorLayout ? anchorLayout.y + anchorLayout.height / 2 : laneCursorY + clusterHeight / 2;
                const clusterStartY = Math.max(anchorCenterY - clusterHeight / 2, laneCursorY, 0);
                let cursorY = clusterStartY;

                nodes.forEach((node) => {
                    const width = getNodeWidth(node);
                    const height = getNodeHeight(node);

                    layouts.push({
                        ...node,
                        x: (laneStartX.get(lane) ?? GRAPH_PADDING_X) + Math.max((laneWidth - width) / 2, 0),
                        y: cursorY,
                        width,
                        height,
                        rank: ranks.get(node.id) ?? 0,
                        lane,
                    });
                    cursorY += height + LANE_STACK_GAP;
                });

                laneCursorY = cursorY + LANE_CLUSTER_GAP;
            });
    });

    const completedNodeLayoutById = new Map(layouts.map((node) => [node.id, node]));
    const selectedNodeIds = new Set(
        layouts.filter((node) => node.entryId === options.selectedEntryId).map((node) => node.id),
    );
    const totalHeight = Math.max(
        currentY - VERTICAL_GAP,
        ...layouts.map((node) => node.y + node.height),
        NODE_MIN_HEIGHT,
    );
    const edges: QuestGraphEdgeLayout[] = definition.edges
        .filter((edge) => completedNodeLayoutById.has(edge.sourceId) && completedNodeLayoutById.has(edge.targetId))
        .map((edge) => {
            const source = completedNodeLayoutById.get(edge.sourceId)!;
            const target = completedNodeLayoutById.get(edge.targetId)!;
            const active = selectedNodeIds.has(edge.sourceId) || selectedNodeIds.has(edge.targetId);
            const sameRank = source.rank === target.rank;
            const startX = sameRank ? source.x + source.width : source.x + source.width / 2;
            const startY = sameRank ? source.y + source.height / 2 : source.y + source.height;
            const endX = sameRank ? target.x : target.x + target.width / 2;
            const endY = sameRank ? target.y + target.height / 2 : target.y;
            const controlOffset = sameRank
                ? Math.abs(endX - startX) / 2
                : Math.max((endY - startY) / 2, EDGE_CURVE_OFFSET);
            const path = sameRank
                ? `M ${startX} ${startY} C ${startX + controlOffset} ${startY} ${endX - controlOffset} ${endY} ${endX} ${endY}`
                : `M ${startX} ${startY} C ${startX} ${startY + controlOffset} ${endX} ${endY - controlOffset} ${endX} ${endY}`;
            const labelX = edge.label
                ? sameRank
                    ? (startX + endX) / 2
                    : target.lane < source.lane
                      ? target.x + target.width * 0.72
                      : target.lane > source.lane
                        ? target.x + target.width * 0.28
                        : (startX + endX) / 2
                : null;
            const labelY = edge.label
                ? sameRank
                    ? Math.min(startY, endY) - 16
                    : target.lane === source.lane
                      ? (startY + endY) / 2 - 10
                      : target.y - 16
                : null;

            return {
                ...edge,
                path,
                labelX,
                labelY,
                active,
            };
        });

    return {
        width: totalWidth,
        height: totalHeight,
        nodes: layouts,
        edges,
    };
}

function renderEdgeLabel(edge: QuestGraphEdgeLayout, options: VanillaQuestFlowchartRenderOptions) {
    if (!edge.label || edge.labelX === null || edge.labelY === null) {
        return "";
    }

    if (!options.showAllEdgeLabels && !edge.active) {
        return "";
    }

    const width = Math.max(72, edge.label.length * 6.4 + 16);
    const x = edge.labelX - width / 2;
    const y = edge.labelY - 11;

    return `
        <g class="graph-prototype__edge-label" transform="translate(${x} ${y})">
            <rect width="${width}" height="22" rx="11" ry="11"></rect>
            <text x="${width / 2}" y="14" text-anchor="middle">${escapeHtml(edge.label)}</text>
        </g>
    `;
}

function renderNode(node: QuestGraphNodeLayout, options: VanillaQuestFlowchartRenderOptions) {
    const classes = [
        "graph-prototype__node",
        `graph-prototype__node--${node.nodeType}`,
        node.entryId ? "is-interactive" : "is-static",
        node.entryId && options.selectedEntryId === node.entryId ? "is-selected" : "",
    ]
        .filter(Boolean)
        .join(" ");
    const style = `left:${node.x}px;top:${node.y}px;width:${node.width}px;min-height:${node.height}px;`;
    const body = `
        ${node.lines
            .map(
                (line, index) => `
                    <span class="graph-prototype__node-line ${index === 0 ? "graph-prototype__node-line--primary" : ""}">${escapeHtml(line)}</span>
                `,
            )
            .join("")}
    `;

    if (!node.entryId) {
        return `<div class="${classes}" style="${style}">${body}</div>`;
    }

    return `
        <button
            class="${classes}"
            type="button"
            style="${style}"
            aria-pressed="${options.selectedEntryId === node.entryId ? "true" : "false"}"
            data-flowchart-node-entry-id="${escapeHtml(node.entryId)}"
        >
            ${body}
        </button>
    `;
}

export function renderQuestGraphDefinitionAsHtml(
    definition: QuestGraphDefinition,
    options: VanillaQuestFlowchartRenderOptions = {},
) {
    const layout = buildQuestGraphLayout(definition, options);

    return `
        <div class="graph-prototype" style="width:${layout.width}px;height:${layout.height}px;">
            <svg class="graph-prototype__edges" viewBox="0 0 ${layout.width} ${layout.height}" aria-hidden="true">
                ${layout.edges
                    .map(
                        (edge) => `
                            <g>
                                <path
                                    class="graph-prototype__edge graph-prototype__edge--${edge.edgeType} ${edge.style === "dashed" ? "graph-prototype__edge--dashed" : ""} ${edge.active ? "is-active" : ""}"
                                    d="${edge.path}"
                                ></path>
                                ${renderEdgeLabel(edge, options)}
                            </g>
                        `,
                    )
                    .join("")}
            </svg>

            ${layout.nodes.map((node) => renderNode(node, options)).join("")}
        </div>
    `;
}
