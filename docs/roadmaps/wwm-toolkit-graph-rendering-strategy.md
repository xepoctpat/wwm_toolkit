# WWM Toolkit Graph Rendering Strategy

This document tracks the strategy for replacing or evolving the current graph workspace.

It exists because the app now has useful progression charts, but the chart data should not stay locked inside Mermaid syntax forever — and the current graph workspace is already past the pure-Mermaid pilot stage.

## Current chart state

The modular app currently renders `8` chart definitions from `app/src/lib/flowcharts/questFlowcharts.ts`:

- Qinghe onboarding progression route
- region and level gate overview
- three main-story chapter flowcharts
- three region campaign-branch charts

Those definitions are now stored as graph data plus metadata:

- chart ID
- title
- kind
- summary
- region IDs
- linked codex entry IDs
- optional route modules for charts that expose loop/cross-link structure directly
- graph nodes and edges
- Mermaid source generated from the graph as fallback output

Current repo state:

- `app/src/lib/flowcharts/questFlowchartModel.ts` defines the renderer-neutral quest graph shape
- `app/src/lib/flowcharts/renderers/mermaidQuestFlowchartAdapter.ts` generates Mermaid from that graph
- `app/src/lib/flowcharts/renderers/vanillaQuestFlowchartRenderer.ts` renders the default HTML/SVG graph view
- Mermaid remains the compatibility fallback renderer in the UI

That is the right long-term boundary. The remaining work is about proving and generalizing the model, not re-winning the argument for separating Mermaid from canonical chart data.

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

Do **not** remove Mermaid immediately.

Instead:

1. keep graph data renderer-neutral
2. keep Mermaid as the compatibility adapter / fallback output
3. keep proving the default vanilla graph renderer against denser Qinghe-local structure
4. use `understand-anything` as a reference for graph-view patterns, not as a required local dependency
5. only revisit a larger renderer replacement after the module model and feature ownership are cleaner

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

This step is now complete.

The current Mermaid generation is already split into two layers:

- graph-model builder
- Mermaid serializer

Completed exit criteria:

- existing chart count and IDs remain unchanged
- dedicated graph / adapter / renderer tests now pass
- chart linked-entry IDs are still validated
- the UI can still render Mermaid diagrams as fallback output

### Step 2 — Renderer spike

This step is also already in progress.

The repo now has a working vanilla graph renderer prototype against the renderer-neutral model.

The current proving-ground questions are:

- can the graph use available stage space well enough for real route work?
- can Qinghe loops, ladders, and detours be expressed as explicit route modules instead of one-off edge labels?
- can linked chart transitions stay coherent as Qinghe-local structure deepens?

Evaluate two paths:

1. **React graph island**
   - use `@xyflow/react` and ELK-style layout patterns inspired by `understand-anything`
   - mount the graph panel as an isolated component inside the current app
   - accept React as a focused dependency only if the UX payoff is clear

2. **Vanilla graph renderer**
  - use the same model and possibly ELK layout, but render with SVG/HTML from the existing TypeScript app
  - keep dependencies smaller
  - avoid app-framework split-brain for now
  - this is the current default path already being proved in Qinghe

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
- reusable route-module semantics beyond Qinghe-specific inline setup

## Risks to manage

- **Framework drift:** adding React only for charts could create two UI paradigms unless the graph panel is isolated carefully.
- **Dependency weight:** React Flow, ELK, and related utilities are much heavier than Mermaid.
- **Source-of-truth confusion:** Mermaid and a richer graph renderer must not diverge; both should read the same graph model during the transition.
- **Overfitting to Qinghe:** the current module layer is intentionally Qinghe-heavy; the next pass must prove it is reusable rather than assuming one region’s pattern fits all future charts automatically.
- **Taxonomy mistakes:** chart nodes must preserve the important separation between `campaign`, `exploration`, `jianghu-legacy`, and literal `encounter` activity layers.
- **Local dependency trap:** do not depend on `E:\Understanding\understand-anything-plugin` from this repo. If code is reused later, vendor intentionally, publish a package, or reimplement only the small patterns needed.

## Recommended next action

Keep using Qinghe as the proving ground while the graph workspace is split into owned modules.

Specifically:

1. extract the graph/filter/module workspace out of `renderFoundationApp.ts`
2. add more Qinghe-local route structure before broadening to another region slice
3. generalize route-module builders only after the Qinghe proof is strong enough

That keeps chart strategy aligned with app assembly instead of starting a separate visualization rewrite.