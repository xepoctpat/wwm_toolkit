# WWM Toolkit Documentation Map

This file explains **what each major project document is for**, so the repo keeps a usable historical trail instead of a pile of orphaned markdown.

## Why this file exists

The toolkit is now moving through a multi-phase migration:

- legacy static prototype still ships from the repo root
- modular Vite + TypeScript app is growing in parallel
- reviewed content packs are starting to replace placeholders
- Python scripts are beginning to own validation and manifest generation

That means the project needs two things at all times:

1. a clear record of **current state**
2. a durable record of **why a change happened and what it was for**

This map is the quick guide to where those answers live.

## Core documents and their purposes

### `README.md`

Use for:

- repo orientation
- high-level feature summary
- project structure overview
- current user-facing state of the toolkit

Do **not** use it as the full historical log. It should stay readable for a new contributor.

### `SECURITY.md`

Use for:

- supported security-fix branch expectations
- vulnerability reporting guidance
- disclosure norms for the open-source repo
- clarifying which classes of issues are security-relevant here

This is the **security reporting and disclosure document**.

### `docs/roadmaps/wwm-toolkit-full-product-plan.md`

Use for:

- the long-range product vision
- domain scope and intended architecture
- why the toolkit is expanding beyond NPC-only use cases
- major platform/product direction

This is the **strategic scope document**.

### `docs/roadmaps/wwm-toolkit-assembly-roadmap.md`

Use for:

- the practical execution sequence for turning the repo into one coherent app
- immediate decision gates and anti-chaos guardrails
- the order in which architecture, content operations, and workflow features should land
- clarifying what should **not** be expanded yet

This is the **assembly/execution document**.

### `docs/roadmaps/wwm-toolkit-phase-a-handoff.md`

Use for:

- the concrete kickoff packet for the modular-app refactor
- the exact responsibility split planned for Phase A
- extraction order and guardrails for shrinking `renderFoundationApp.ts`
- defining what counts as “prepared” versus “actually refactored”

This is the **Phase A handoff and execution-prep document**.

### `docs/roadmaps/wwm-toolkit-phase-status.md`

Use for:

- the live execution tracker
- current phase states
- what has shipped already
- what remains next

This is the **current-state dashboard**, not the deep historical archive.

### `docs/roadmaps/wwm-toolkit-history-log.md`

Use for:

- dated milestone entries
- what changed in each implementation slice
- why the slice existed
- what was verified when it landed
- what follow-up work remained after the slice

This is the **historical trail** for implementation work.

### `docs/roadmaps/wwm-toolkit-upgrade.md`

Use for:

- the original NPC-tool upgrade context
- the legacy static prototype intent
- early research and constraints that shaped the first shipped vertical slice

This is the **origin-context document**.

### `content/raw/README.md`

Use for:

- explaining the raw evidence layer
- clarifying that source material here is not runtime content yet

This is the **evidence staging rulebook**.

### `content/raw/quest-storyline-seed-evidence.md`

Use for:

- recording exactly which external pages were used for the first quest/storyline seed
- preserving the normalization rules used for those entries
- separating editorial summaries from raw source collection

This is the **evidence note for the current content seed**.

### `content/published/README.md`

Use for:

- describing generated frontend-ready artifacts
- reminding contributors not to hand-edit generated content casually

This is the **published artifact contract**.

## Update rules for future work

For any meaningful milestone, update the following on purpose:

### Always update

- `docs/roadmaps/wwm-toolkit-history-log.md`
- `docs/roadmaps/wwm-toolkit-phase-status.md` when phase state or deliverables change

### Update when user-facing behavior changes

- `README.md`

### Update when content evidence changes

- the relevant note in `content/raw/`
- source registry content in `app/src/data/content/sources.ts`

### Update when generated artifacts change shape

- `content/published/README.md` if the contract changes
- Python validation/build scripts if the published layer rules evolve

## What each milestone entry should capture

Each history-log entry should answer these questions:

- **What changed?**
- **Why was it added?**
- **Which files carried the change?**
- **How was it verified?**
- **What follow-up remains?**

If a change cannot answer those five questions, it probably is not documented well enough yet.

## Current documentation rhythm

As of `2026-04-16`, the project is using this practical rhythm:

- phase tracker for the live roadmap
- history log for milestone chronology
- raw evidence notes for content provenance
- modular source packs plus tests for machine-checkable structure

That combination is intentionally boring — which is excellent news for future debugging.
