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
| Phase 2 — Codex expansion | in progress | Add quests, storylines, regions, factions, items, and cross-linked search. | First reviewed seed content now exists for `regions`, `quests`, and `storylines`, and the modular app now exposes codex search plus a Mermaid-backed flowchart pilot that now includes both a Qinghe-first route and a region/level gate overview while keeping literal encounters separate from first-class exploration, Jianghu Legacy, and campaign-side optional-content layers. The current UI now leads with that Qinghe slice instead of leading with migration scaffolding. |
| Phase 3 — Offline toolkit v1 | planned | Add backups, calibration, route builder, presets, and checklist workflows. | Depends on content graph and IndexedDB migration. |
| Phase 4 — Distribution layer | planned | PWA packaging, deployment pipeline, and better resilience. | Can start once the modular app is the primary surface. |
| Phase 5 — Content operations | planned | Mature validation, build scripts, versioning, and contributor workflow. | Python pipeline will expand here. |
| Phase 6 — Optional connected platform | planned | Add sync, accounts, submissions, and moderation. | Explicitly deferred until the offline-first experience is stable. |

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

### Remaining

- make the modular app the clear primary surface by splitting `renderFoundationApp.ts` into feature-focused modules and adding a top-level shell/navigation
- freeze a documented content intake contract for new reviewed slices so optional-content taxonomies and evidence rules stop drifting between expansions
- add additional Python validation scripts
- expand the reviewed region/quest/storyline seed beyond the current Qinghe/Kaifeng campaign ladders, Game8-backed Hexi campaign slice, and Qinghe optional-route coverage
- deepen the codex search and flowchart experience with keyboard navigation, clearer result explanations, tighter sync between guided quick actions and deeper codex/flowchart navigation, later content domains such as factions, items, literal encounters, and vendors, and more progression-aware route slices beyond early Qinghe

## Documentation links

- Full product scope: `docs/roadmaps/wwm-toolkit-full-product-plan.md`
- Assembly roadmap: `docs/roadmaps/wwm-toolkit-assembly-roadmap.md`
- Phase A handoff: `docs/roadmaps/wwm-toolkit-phase-a-handoff.md`
- Documentation map: `docs/roadmaps/wwm-toolkit-documentation-map.md`
- Historical log: `docs/roadmaps/wwm-toolkit-history-log.md`
- Original prototype roadmap: `docs/roadmaps/wwm-toolkit-upgrade.md`
