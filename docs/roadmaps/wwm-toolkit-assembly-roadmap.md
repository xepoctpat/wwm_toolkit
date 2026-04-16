# WWM Toolkit Assembly Roadmap

This document is the **execution roadmap** for turning the current repo from a promising multi-surface project into **one manageable offline-first app**.

It exists because the project now has three things at once:

- a useful legacy prototype
- a growing modular codex foundation
- enough source material to expand quickly, but also enough complexity to get lost in it

The problem is no longer just "add more data."

The real problem is **assembly**.

## Plain-language diagnosis

The project is hard to manage for structural reasons, not because the idea is wrong.

The hard parts are:

- the repo still has **two active surfaces** (`legacy-prototype.html` and the modular `app/`)
- the content model is expanding faster than the app shell
- source-backed data still has to be **normalized, cross-linked, and proven**, not merely collected
- optional-content taxonomies are easy to blur together unless the rules stay explicit
- persistence and migration matter because user state already exists in the legacy tool
- the temptation to add more domains is stronger than the current operational discipline

In short:

> sources are necessary, but they do not magically assemble themselves into a product

That assembly work is now the main job.

## The strategic decision

The modular `app/` must become the **primary product surface**.

The root prototype should remain available as a legacy reference only until the remaining high-value workflows are either:

- migrated into the modular app, or
- explicitly retired

That means:

- no net-new product expansion should depend on the root prototype
- no new core UX should be designed around the legacy page structure
- the modular app should become the default place where new architecture, content, and persistence decisions land

If this rule is not enforced, the repo will keep acting like two half-products taped together.

## What “one app” means here

The project should count as "assembled into one app" only when all of these are true:

1. **One primary navigation shell** exists in the modular app.
2. **One canonical content pipeline** exists from raw evidence to published data.
3. **One persistence model** handles user notes, progress, favorites, and backups.
4. **One source policy** governs confidence, verification, and freshness.
5. The legacy prototype is either **embedded, bridged cleanly, or retired**.
6. The supported runtime for the modern app is clearly **HTTP-served**, not accidental `file://` behavior.

Until those are true, the toolkit is still in transition.

## Guardrails

These are the rules that keep the roadmap realistic.

### Do not do these yet

- Do **not** add cloud sync or accounts.
- Do **not** jump into factions / builds / items / bosses just because they are in long-range scope.
- Do **not** merge `campaign`, `exploration`, `jianghu-legacy`, and literal `encounter` content into one mushy bucket.
- Do **not** add new major features to the root prototype unless they are migration-critical.
- Do **not** treat a bigger dataset as success if the navigation, provenance, and validation story gets worse.

### Always do these

- keep evidence and published content separate
- land new reviewed slices with provenance, tests, and validation
- prefer one clean next slice over three half-finished ones
- keep region order, level gates, and optional-content taxonomy explicit
- preserve the offline-first design as the default product assumption

## The five workstreams

## 1. App consolidation

Goal: reduce structural chaos.

This workstream includes:

- splitting large render logic into feature modules
- defining the modular app shell and primary navigation
- deciding what remains legacy-only versus what must migrate now
- making the modular app the default development surface

## 2. Content operations

Goal: make content assembly repeatable instead of artisanal.

This workstream includes:

- raw evidence notes
- normalization rules
- source registry hygiene
- Python validation and manifest checks
- published artifact contracts

## 3. Domain expansion

Goal: grow the codex without losing truthfulness.

This workstream includes:

- deepening `regions`, `quests`, and `storylines`
- keeping optional-content taxonomies distinct
- adding later domains only after current ones are operationally stable

## 4. Player workflow tools

Goal: make the app useful day to day, not just informative.

This workstream includes:

- progress tracking
- notes and favorites
- saved views/presets
- backup/export/import
- map calibration or annotation workflows later

## 5. Release operations

Goal: keep expansion shippable.

This workstream includes:

- build/test/lint discipline
- Python manifest validation
- HTTP preview expectations
- future packaging/PWA work
- release checklists and migration safety

## Phase A — Stabilize the control tower

**Priority:** immediate

This is the next phase that should receive the most attention.

### Objective

Make the modular app structurally ready to become the main product surface.

### Deliverables

- split `app/src/app/renderFoundationApp.ts` into feature-focused modules
- add a clear app shell / top-level navigation in the modular app
- define section ownership for at least:
  - guide / route surface
  - codex
  - flowcharts
  - persistence / settings
  - legacy bridge surfaces where still needed
- freeze net-new product work in the root prototype except for preservation-critical fixes

### Exit criteria

- the modular app is the default place to preview and extend the product
- no single giant renderer owns the entire UI surface
- a contributor can tell where a new feature belongs without reading one huge file end to end

## Phase B — Freeze the content assembly contract

**Priority:** immediate after Phase A starts

### Objective

Make new content slices cheap to add and hard to corrupt.

### Deliverables

- document a content intake checklist for new reviewed entries
- keep explicit editorial rules for:
  - `campaign`
  - `exploration`
  - `jianghu-legacy`
  - literal `encounter`
- add or tighten validation around:
  - duplicate IDs
  - broken cross-links
  - missing source references
  - invalid taxonomy values
  - stale/missing review metadata where applicable
- choose exactly **one** next reviewed expansion slice:
  - Kaifeng / Hexi non-campaign optional routes, **or**
  - literal encounter normalization

### Exit criteria

- one additional reviewed slice can be added without ad hoc structural surgery
- the editorial taxonomy is stable enough that tests enforce it instead of conversations re-litigating it every time

## Phase C — Complete the early-to-mid-game unified codex

**Priority:** near term

### Objective

Make the current app genuinely useful for the first surfaced progression arc.

### Deliverables

- deepen reviewed coverage for Qinghe, Kaifeng, and Hexi
- preserve clean distinctions between gates, optional routes, encounters, and campaign ladders
- tighten sync between guide actions, codex selection, and flowchart selection
- improve keyboard-first navigation and result explanation where needed
- expand source-backed region detail surfaces instead of leaving them as thin shells

### Exit criteria

- a player can use the modular app to understand the Qinghe → Kaifeng / Hexi route without needing the root prototype for core codex guidance
- the reviewed content graph feels connected, not merely present

## Phase D — Bring over the sticky daily-use workflows

**Priority:** after the codex is stable enough to deserve them

### Objective

Move from "reference app" toward "daily companion app."

### Deliverables

- quest / region progress tracking in the modular app
- persistent personal notes and favorites at the modular-app level
- import/export backups
- saved filters or presets
- initial plan for map calibration / annotations if that still belongs in v1

### Exit criteria

- a user can use the modular app as the main day-to-day tool without bouncing back to the legacy prototype for essential stateful workflows

## Phase E — Retire dual-surface operation and ship offline v1

**Priority:** later, but must be planned now

### Objective

Stop running the project as a permanent migration experiment.

### Deliverables

- explicit decision: retire, embed, or preserve the legacy prototype as a historical surface
- production-oriented app shell and navigation polish
- packaging / PWA work
- release checklist for build, validation, migration, and smoke testing

### Exit criteria

- the repo has one clearly primary app
- the legacy surface has an intentional status, not an accidental one
- release steps are boring and repeatable, which is the dream

## Recommended next four milestones

These are the most rational next steps from the current state.

1. **Refactor the modular UI into feature modules**
   - reduce `renderFoundationApp.ts` complexity
   - establish stable ownership boundaries before more content lands

2. **Add the modular app shell/navigation**
   - make the product structure visible in the UI
   - stop presenting one long page as the only shape of the future app

3. **Lock the content intake contract and pick one next content slice**
   - choose either later optional routes or literal encounters
   - do not try to normalize both at once

4. **Add backup/export-import in the modular app**
   - reduce migration risk
   - make the new surface more trustworthy as the primary daily-use app

## Recommended decision right now

If forced to choose between **more content immediately** and **architecture/assembly discipline first**, the better next move is:

## architecture first

That does **not** mean stop content work forever.

It means the current main bottleneck is no longer lack of raw material. The bottleneck is that the project is crossing the line where each additional slice becomes harder to place, test, explain, and keep coherent.

So the practical order should be:

1. stabilize the modular app structure
2. freeze the content contract
3. then expand the next reviewed domain slice

That sequence is slower in the next few days and faster over the next few months.

## Success metrics

The roadmap is working only if these trends improve:

- the modular app becomes the clear primary preview target
- each reviewed slice lands with evidence + tests + manifest validation
- the amount of logic trapped in a single renderer keeps shrinking
- the need to touch both app surfaces for one feature keeps shrinking
- the legacy prototype becomes narrower over time instead of silently remaining the real product

## Bottom line

The hard truth is simple:

> assembling this into one app is a product-operations problem, not just a data-collection problem

The good news is that the project already has the right ingredients:

- a working prototype
- a modular foundation
- source-backed editorial discipline
- validation tooling
- a real codex graph beginning to exist

What it needs now is a stricter execution order.

This roadmap is that order.
