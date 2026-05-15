# WWM Toolkit Qinghe Modularity Checkpoint Handoff

This document is the **stable checkpoint handoff** for the current Qinghe-first graph workspace.

It exists because the repo now has enough graph behavior, Qinghe route detail, and linked-chart interactions that the next contributor should not have to reconstruct the intent from code and screenshots alone.

## Why this checkpoint matters

The project now has a workable proof that the modular app can carry:

- a renderer-neutral quest graph
- a vanilla graph surface with Mermaid fallback
- a graph-first page hierarchy
- compact chart filtering
- explicit route-module cards that describe loops, detours, and cross-links

That is enough to call the current state **stable**, but it is not yet the end-state architecture.

The next pass should keep using **Qinghe as the proving ground** instead of broadening scope too quickly.

## Current shipped checkpoint

Confirmed working state in the repo:

- `50` codex entries across `3` regions, `31` quests, `3` storylines, and `13` sources
- `8` graph definitions for progression, storyline, and campaign slices
- renderer-neutral graph model in `app/src/lib/flowcharts/questFlowchartModel.ts`
- Mermaid compatibility adapter in `app/src/lib/flowcharts/renderers/mermaidQuestFlowchartAdapter.ts`
- vanilla HTML/SVG graph renderer in `app/src/lib/flowcharts/renderers/vanillaQuestFlowchartRenderer.ts`
- graph-first workbench with compact chart filters in `app/src/app/renderFoundationApp.ts`
- explicit Qinghe route modules for:
  - main spine
  - exploration loop
  - Meridian detour
  - campaign ladder
- explicit Qinghe campaign modules for:
  - opening gate
  - Moonveil loop
  - late-Chapter 1 link
  - Sundara capstone

## What is stable enough to trust

These behaviors are currently good enough to build on:

1. **Graph selection defaults to the relevant Qinghe progression scope**
   - first load starts on Qinghe progression instead of showing every chart at once

2. **Route modules can move between related charts**
   - for example, the Qinghe campaign-ladder module can switch the workspace into the Qinghe campaign chart

3. **Chart rendering is no longer coupled to Mermaid text as canonical data**
   - Mermaid is now the fallback, not the source of truth

4. **Branch semantics are visible in the UI**
   - exploration, legacy, and campaign relationships are expressed both in the graph and in the module cards

## What is still structurally awkward

The checkpoint is stable, but not yet cleanly owned.

### 1. `renderFoundationApp.ts` still owns too much

It still contains:

- flowchart filters
- chart selector rendering
- module-card rendering
- module interaction behavior
- graph hydration and Mermaid fallback handling

That means the graph workspace is more usable than before, but not yet well factored.

### 2. Qinghe modules are still authored inline inside `questFlowcharts.ts`

That is acceptable for the checkpoint, but it should not become the permanent pattern.

The next pass should extract reusable builders for:

- route modules
- linked-chart transitions
- tone-to-filter behavior

### 3. Qinghe still needs more local structure to really stress the model

The current modules prove the concept, but the next proving-ground step should add more Qinghe-local content rather than jumping to another region immediately.

## Recommended next slice

The next contributor should do **Qinghe-deepening work**, not broad expansion.

Recommended order:

### 1. Split the graph workspace into owned modules

At minimum, extract:

- chart filters
- chart selector cards
- route-module cards
- flowchart view header / controls
- graph hydration / renderer switching

### 2. Add more Qinghe-local structure before touching another broad region slice

Best candidates:

- subregion-aware routing notes
- landmark or local gate anchors
- more explicit links between route windows and location hints
- clearer late-Qinghe reinsertion points

Rule:

> use Qinghe to prove the modularity hard enough that Kaifeng and Hexi can inherit the pattern instead of inventing their own

### 3. Generalize route modules into reusable builders

The current module pattern should become reusable enough that later charts can declare:

- module title
- module tone
- linked entries
- focus entry
- optional linked chart

without repeating bespoke inline setup.

### 4. Keep encounter work separate until evidence is strong enough

Do **not** collapse literal encounters into exploration, legacy, or campaign content just to make the graph denser.

The current checkpoint is better precisely because those layers are still kept distinct.

## Suggested non-goals for the next slice

Do **not** bundle these into the next checkpoint:

- no direct `understand-anything` local dependency
- no immediate React migration
- no large Kaifeng/Hexi optional-route pass yet
- no literal encounter normalization mixed into the Qinghe module proof
- no broad redesign of the whole app shell at the same time as deeper Qinghe route modeling

## Current validation state

Verified at this checkpoint:

- `npm run test` passed: `47/47`
- `npm run lint` passed
- `npm run build` passed
- browser verification confirmed:
  - default Qinghe progression scope
  - compact chart filters working
  - linked module actions working
  - jump from Qinghe progression module to Qinghe campaign chart working

Preview URL during this checkpoint:

- `http://127.0.0.1:4173/`

## Key files for the next contributor

- `app/src/app/renderFoundationApp.ts`
- `app/src/lib/flowcharts/questFlowcharts.ts`
- `app/src/lib/flowcharts/questFlowchartModel.ts`
- `app/src/lib/flowcharts/renderers/vanillaQuestFlowchartRenderer.ts`
- `app/src/lib/flowcharts/renderers/mermaidQuestFlowchartAdapter.ts`
- `tests/questFlowcharts.test.ts`
- `tests/vanillaQuestFlowchartRenderer.test.ts`

## Bottom line

The repo is at a good checkpoint.

The graph workspace is now strong enough that the next work should be:

1. **tighten ownership**
2. **deepen Qinghe locally**
3. **generalize the module model only after Qinghe proves it**

That order keeps the current momentum without turning the next expansion into another giant unowned surface.