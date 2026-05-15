# WWM Toolkit Graph Rendering Strategy

This document tracks the strategy for replacing or evolving the current Mermaid-backed flowchart pilot.

It exists because the app now has useful progression charts, but the chart data should not stay locked inside Mermaid syntax forever.

## Current chart state

The modular app currently renders `8` chart definitions from `app/src/lib/flowcharts/questFlowcharts.ts`:

- Qinghe onboarding progression route
- region and level gate overview
- three main-story chapter flowcharts
- three region campaign-branch charts

Those definitions are currently stored as Mermaid strings plus metadata:

- chart ID
- title
- kind
- summary
- region IDs
- linked codex entry IDs
- Mermaid source

This works well enough for a pilot, but it makes Mermaid the effective source of truth for node and edge structure. That is the wrong long-term boundary.

## Local `understand-anything` repo evaluation

The local repo inspected for this strategy is:

- `E:\Understanding\understand-anything-plugin`

Relevant observed pieces:

- `@understand-anything/core` defines a reusable knowledge-graph schema with `domain`, `flow`, and `step` node types plus graph validation helpers.
- `@understand-anything/dashboard` is a React app using `@xyflow/react`, `elkjs`, `d3-force`, Zustand, and graph-specific node components.
- the dashboard already has domain graph views, flow nodes, step nodes, layout utilities, graph validation, search, minimap controls, path finding, and export-oriented UI concepts.

That is promising, but it is not a drop-in Mermaid replacement.

Why not:

- WWM Toolkit's modular app is currently vanilla TypeScript, not React.
- the local repo is a workspace package, not a stable dependency already integrated into this repo.
- the dashboard is designed around codebase / knowledge-graph analysis, while WWM needs game-codex progression graphs.
- adopting it directly would add significant runtime and styling surface area.
- a local path dependency would make the toolkit harder to clone, build, and publish.

## Strategic decision

Do **not** replace Mermaid immediately.

Instead:

1. make graph data renderer-neutral
2. keep Mermaid as the compatibility adapter
3. test that the existing chart labels, linked entries, and chart IDs stay stable
4. prototype a richer renderer after the adapter boundary exists
5. use `understand-anything` as a reference for graph-view patterns, not as a required local dependency

This avoids turning a chart improvement into a surprise app-framework migration.

## Target graph model

The WWM graph layer should eventually model charts as data like this:

- `QuestGraphDefinition`
  - `id`
  - `title`
  - `kind`
  - `summary`
  - `regionIds`
  - `linkedEntryIds`
  - `nodes`
  - `edges`
- `QuestGraphNode`
  - `id`
  - `label`
  - `entryId`
  - `nodeType` such as `region`, `storyline`, `main`, `campaign`, `exploration`, `jianghu-legacy`, `gate`, or future `encounter`
  - optional metadata for level gates, source confidence, and route notes
- `QuestGraphEdge`
  - `sourceId`
  - `targetId`
  - `edgeType` such as `main-path`, `optional-branch`, `campaign-chain`, `gate`, `related-route`, or future `encounter-trigger`
  - optional label

Mermaid output should be generated from that model, not hand-assembled as the only representation.

## Adoption path

### Step 1 — Adapter boundary

Extract the current Mermaid generation into two layers:

- graph-model builder
- Mermaid serializer

Exit criteria:

- existing chart count and IDs remain unchanged
- existing chart tests still pass
- chart linked-entry IDs are still validated
- the UI still renders Mermaid diagrams exactly as before

### Step 2 — Renderer spike

Build a small prototype against the renderer-neutral graph model.

Evaluate two paths:

1. **React graph island**
   - use `@xyflow/react` and ELK-style layout patterns inspired by `understand-anything`
   - mount the graph panel as an isolated component inside the current app
   - accept React as a focused dependency only if the UX payoff is clear

2. **Vanilla graph renderer**
   - use the same model and possibly ELK layout, but render with SVG/HTML from the existing TypeScript app
   - keep dependencies smaller
   - avoid app-framework split-brain for now

Exit criteria:

- graph selection still syncs with codex selection
- guide quick actions still steer the chart and codex together
- keyboard navigation remains at least as good as the current chart cards
- bundle/runtime impact is understood

### Step 3 — Replacement decision

Only remove Mermaid after the richer renderer proves it can support:

- current progression, storyline, and campaign charts
- visible source/codex links
- accessible navigation
- mobile-friendly layout behavior
- export or copyable fallback output
- clear failure states when layout/rendering fails

## Risks to manage

- **Framework drift:** adding React only for charts could create two UI paradigms unless the graph panel is isolated carefully.
- **Dependency weight:** React Flow, ELK, and related utilities are much heavier than Mermaid.
- **Source-of-truth confusion:** Mermaid and a richer graph renderer must not diverge; both should read the same graph model during the transition.
- **Taxonomy mistakes:** chart nodes must preserve the important separation between `campaign`, `exploration`, `jianghu-legacy`, and literal `encounter` activity layers.
- **Local dependency trap:** do not depend on `E:\Understanding\understand-anything-plugin` from this repo. If code is reused later, vendor intentionally, publish a package, or reimplement only the small patterns needed.

## Recommended next action

Add the renderer-neutral quest graph model during Phase A, while `renderFoundationApp.ts` is already being split.

That keeps chart strategy aligned with app assembly instead of starting a separate visualization rewrite.