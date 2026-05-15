# WWM Toolkit Phase Status

This file is the living execution tracker for the broader `WWM Toolkit` roadmap.

## Status legend

- `completed` — shipped in the repo
- `in progress` — active implementation work
- `planned` — accepted scope, not yet started

## Phase overview

| Phase | Status | Purpose | Current notes |
| --- | --- | --- | --- |
| Phase 0 — NPC vertical slice | completed | Deliver a working prototype around NPC routing, archetypes, source notes, and map overlays. | Current root `legacy-prototype.html` app remains the working prototype. |
| Phase 1 — Hybrid foundation | in progress | Introduce Vite + TypeScript, typed schemas, Python-ready data tooling, and non-destructive migration structure. | `app/` scaffold, schemas, tests, Python pipeline stubs, and the IndexedDB migration bridge now exist. |
| Phase 2 — Codex expansion | in progress | Add quests, storylines, regions, factions, items, and cross-linked search. | First reviewed seed content now exists for `regions`, `quests`, and `storylines`, and the modular app now exposes codex search plus a renderer-neutral quest graph rendered through a vanilla HTML/SVG graph prototype with Mermaid fallback. The current UI now leads with a Qinghe-first route workbench, compact chart filters, and explicit Qinghe route modules while still keeping literal encounters separate from exploration, Jianghu Legacy, and campaign-side optional-content layers. |
| Phase 3 — Offline toolkit v1 | planned | Add backups, calibration, route builder, presets, and checklist workflows. | Depends on content graph and IndexedDB migration. |
| Phase 4 — Distribution layer | planned | PWA packaging, deployment pipeline, and better resilience. | Can start once the modular app is the primary surface. |
| Phase 5 — Content operations | planned | Mature validation, build scripts, versioning, and contributor workflow. | Python pipeline will expand here. |
| Phase 6 — Optional connected platform | planned | Add sync, accounts, submissions, and moderation. | Explicitly deferred until the offline-first experience is stable. |

## Current strategic checkpoint — 2026-05-15

The repo is now at a **stable Qinghe modularity checkpoint**.

The best next move is **Assembly Gate 1B**: keep using Qinghe as the proving ground for modular structure before broadening the reviewed content surface again.

Current reviewed surface:

- `50` codex-search entries: `3` regions, `31` quests, `3` storylines, and `13` sources
- `8` current flowchart definitions covering Qinghe onboarding, region/level gates, three storyline spines, and three campaign-region charts
- Qinghe optional exploration and Jianghu Legacy routes are first-class quest entries, while literal `Encounter` activities remain intentionally deferred
- the quest graph is now renderer-neutral, with Mermaid kept as the compatibility adapter and the vanilla HTML/SVG graph prototype used as the default chart surface
- the flowchart workspace now includes compact chart filters plus explicit Qinghe route modules for the main spine, exploration loop, Meridian detour, and the current campaign ladder
- linked Qinghe modules can now move the workspace between related charts so the campaign ladder, late-Chapter 1 link, and route loops are visible as named structures instead of loose edge trivia

Strategic next actions:

1. split the graph/filter/module UI out of `renderFoundationApp.ts` into feature-owned modules so the current checkpoint stops depending on one giant render file
2. deepen the Qinghe slice before broad region expansion by adding more subregion, landmark, gate, and optional-route structure to prove the module model against denser local content
3. generalize the current Qinghe route-module pattern into reusable builders instead of leaving it as a one-region special case inside `questFlowcharts.ts`
4. keep Mermaid as the fallback renderer, but treat the renderer-neutral graph model plus module metadata as the canonical chart surface
5. freeze the content intake contract for Qinghe expansion so optional-route, campaign, Jianghu Legacy, and literal-encounter layers keep distinct rules
6. only after the Qinghe modular proof holds, choose the next expansion lane: Kaifeng/Hexi non-campaign optional routes **or** literal encounter normalization

## Phase 1 deliverables

### Completed

- Added root `package.json` with Vite/TypeScript/Vitest/ESLint/Prettier toolchain
- Added `app/` modular foundation app
- Added initial typed schemas for quests, storylines, NPCs, and sources
- Added stub content packs for quests and storylines
- Added initial Vitest coverage for schema scaffolds
- Added `scripts_py/build_data_pack.py` as the first Python pipeline stub
- Verified build/test/lint end-to-end for the modular foundation
- Added workspace-local Python environment enforcement for new terminals via `.vscode/settings.json` and `scripts_py/activate_wwm_toolkit_env.ps1`
- Added terminal `Path` / `VIRTUAL_ENV` injection and explicit workspace tasks so local Python is the default path for new terminals and pipeline actions
- Added a one-click `Validate: Phase 1 foundation` task that runs build, test, lint, manifest generation, and manifest validation in sequence
- Added a fixed local dev script and matching workspace task so the modular app can be previewed predictably at `http://127.0.0.1:4173/` instead of relying on ad hoc Vite arguments
- Added open-source security hardening around safer external-link handling, stricter custom-map validation/sanitization, a repository `SECURITY.md`, Dependabot updates, and CodeQL scanning
- Added a dedicated Phase A handoff document that defines the planned module split, extraction order, and guardrails for turning the modular app into the primary surface without starting the refactor blindly
- Added an IndexedDB-first migration bridge in the modular app with localStorage fallback and legacy prototype snapshot import
- Started reviewed quest/storyline ingestion with 3 main-story chapter entries, 13 top-level story quests, initial campaign examples, and source-backed cross-link tests
- Added a documentation map and dated history log so milestones stay traceable by purpose, files, and verification state
- Added a first-pass global codex search panel across reviewed quests, storylines, and sources with focused filters and linked detail views
- Added a first-class `regions` schema and reviewed region pack for Qinghe, Kaifeng, and Hexi, wired into codex search, detail views, and graph validation
- Added a Mermaid-backed flowchart pilot in the modular app for reviewed storyline spines, currently supported campaign-side branches, a Qinghe-first natural progression route, and a region/level gate overview that treats literal encounters as a separate layer from hidden exploration or mystic-skill content
- Promoted `White Bird Shooting`, `The Shameless`, and `Meridian Touch` into first-class Qinghe quest entries with explicit `exploration` / `jianghu-legacy` typing, region detail links, and flowchart navigation that still keeps literal encounters separate
- Reordered the modular app into a Qinghe-first route surface with quick actions, a default Qinghe onboarding chart, and lower placement for migration scaffolding/persistence panels
- Expanded the reviewed campaign seed from isolated examples into the full currently reviewed Qinghe and Kaifeng campaign ladders, plus the current Game8-backed Hexi campaign slice, with codex links and region/campaign flowcharts kept in sync
- Extracted a renderer-neutral quest graph model, added a Mermaid compatibility adapter, and made the vanilla HTML/SVG graph prototype the default chart surface while keeping Mermaid available as a fallback
- Reworked the graph workspace into a graph-first surface with wider stage usage, compact chart filters, route-module cards, and linked-chart actions that make Qinghe loops and campaign ladders explicit
- Added a dedicated Qinghe modularity checkpoint handoff so the next implementation pass can keep Qinghe as the proving ground instead of broadening scope too quickly

### Remaining

- make the modular app the clear primary surface by splitting `renderFoundationApp.ts` into feature-focused modules and giving the current graph/filter/module workbench clear ownership boundaries
- generalize the new route-module layer so Qinghe logic becomes reusable structure rather than permanent inline chart-specific code
- freeze a documented content intake contract for new reviewed slices so optional-content taxonomies and evidence rules stop drifting between expansions
- add additional Python validation scripts
- expand the reviewed region/quest/storyline seed by deepening Qinghe first (subregions, landmarks, more linked route windows, and eventually encounter placement) before broadening the next region slice
- deepen the codex search and flowchart experience with keyboard navigation, clearer result explanations, tighter sync between guided quick actions and deeper codex/flowchart navigation, later content domains such as factions, items, literal encounters, and vendors, and more progression-aware route slices beyond early Qinghe

## Documentation links

- Full product scope: `docs/roadmaps/wwm-toolkit-full-product-plan.md`
- Assembly roadmap: `docs/roadmaps/wwm-toolkit-assembly-roadmap.md`
- Phase A handoff: `docs/roadmaps/wwm-toolkit-phase-a-handoff.md`
- Qinghe modularity handoff: `docs/roadmaps/wwm-toolkit-qinghe-modularity-checkpoint-handoff.md`
- Graph rendering strategy: `docs/roadmaps/wwm-toolkit-graph-rendering-strategy.md`
- Documentation map: `docs/roadmaps/wwm-toolkit-documentation-map.md`
- Historical log: `docs/roadmaps/wwm-toolkit-history-log.md`
- Original prototype roadmap: `docs/roadmaps/wwm-toolkit-upgrade.md`
