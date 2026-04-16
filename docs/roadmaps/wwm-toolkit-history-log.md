# WWM Toolkit History Log

This file is the dated implementation history for the broader `WWM Toolkit` migration.

## How to use this log

Each entry should capture:

- what changed
- why it was added
- the key files involved
- how it was verified
- what follow-up remained afterward

The phase tracker tells you **where the project stands now**.
This log tells you **how it got there**.

---

## 2026-04-16 — Phase A handoff prepared before the refactor

### What changed

The repo gained a dedicated Phase A kickoff packet for the modular-app refactor:

- defined the current overgrown responsibilities inside `app/src/app/renderFoundationApp.ts`
- documented a recommended module split for state, shell, render sections, and event handlers
- documented the extraction order for the refactor so the work can proceed in small reviewable slices
- documented the Phase A guardrails and validation loop

### Why it was added

The project needed a clean pause point before the architectural split begins. The purpose of this slice was to make the next step executable without starting the refactor impulsively or relying on chat history as the only plan.

### Key files and surfaces

- `docs/roadmaps/wwm-toolkit-phase-a-handoff.md`
- `docs/roadmaps/wwm-toolkit-documentation-map.md`
- `docs/roadmaps/wwm-toolkit-phase-status.md`

### Verification

- the handoff was cross-checked against the current Phase A definition in the assembly roadmap
- the handoff was cross-checked against the actual responsibilities still present in `app/src/app/renderFoundationApp.ts`
- the documentation map and phase tracker now point to the handoff explicitly

### Follow-up after this slice

- begin Phase A by extracting shared formatting helpers and UI-state helpers first
- keep the first refactor commits structural and avoid mixing in new content work

---

## 2026-04-16 — Open-source security hardening pass landed

### What changed

The repo gained a focused hardening pass for open-source publication:

- safer handling of external URLs in both the legacy prototype and modular app
- stricter validation and sanitization for persisted custom-map data URLs
- tighter file-type and file-size checks for custom map uploads
- browser referrer-policy metadata on both app entry pages
- a root `SECURITY.md` policy
- Dependabot configuration for npm and GitHub Actions
- a CodeQL workflow for JavaScript/TypeScript and Python scanning

### Why it was added

The project is moving toward an open-source development model, which changes the threat profile. It is no longer enough for the app to merely work; it also needs clearer guardrails around untrusted URLs, browser-stored payloads, uploads, and dependency/workflow hygiene.

### Key files and surfaces

- `assets/js/app.js`
- `app/src/app/renderFoundationApp.ts`
- `app/src/lib/storage/toolkitPersistence.ts`
- `tests/toolkitPersistence.test.ts`
- `app/index.html`
- `legacy-prototype.html`
- `SECURITY.md`
- `.github/dependabot.yml`
- `.github/workflows/codeql.yml`

### Verification

- custom-map sanitization coverage was expanded in persistence tests
- frontend tests passed after the hardening changes
- frontend lint passed after the hardening changes
- production build passed after the hardening changes
- `npm audit --omit=dev` reported zero production vulnerabilities at verification time
- browser verification confirmed the modular app still rendered correctly at the fixed local preview URL

### Follow-up after this slice

- consider adding a dedicated dependency-review workflow for pull requests
- keep security fixes landing on `wind` first until a release/version support matrix exists
- revisit CSP hardening later once Phase A refactoring reduces the amount of UI rendered through large template strings

---

## 2026-04-16 — Fixed local dev launch path added for the modular app

### What changed

The repo gained a predictable local launch path for the modular Vite app:

- added `npm run dev:local`
- pinned the local modular-app URL to `http://127.0.0.1:4173/`
- added a matching workspace task for the same flow
- documented the fixed local preview path in the README

### Why it was added

The modular app itself was rendering correctly, but ad hoc dev-server launches were too easy to misfire or leave behind a stale browser tab that looked like a broken white screen. The purpose of this slice was to make local preview boring and predictable.

### Key files and surfaces

- `package.json`
- `.vscode/tasks.json`
- `README.md`
- `docs/roadmaps/wwm-toolkit-phase-status.md`

### Verification

- the local dev HTML entry was served successfully by Vite after relaunch
- browser verification confirmed the modular app rendered the Qinghe-first guide, flowchart pilot, and codex search instead of a blank page

### Follow-up after this slice

- consider whether a similarly pinned `preview` script is worth adding for built-app smoke tests
- keep using the fixed local launch path while Phase A refactoring turns the modular app into the primary surface

---

## 2026-04-16 — Legacy prototype entry renamed for clearer app boundaries

### What changed

The root-level legacy prototype entry was renamed from `index.html` to `legacy-prototype.html`.

Related repo docs were updated so the legacy surface and the modular Vite app are easier to distinguish.

### Why it was added

The repo had reached the point where having both a root `index.html` and an `app/index.html` was creating avoidable ambiguity during development and preview work. The purpose of this slice was to make the boundary explicit without deleting the legacy prototype.

### Key files and surfaces

- `legacy-prototype.html`
- `README.md`
- `docs/roadmaps/wwm-toolkit-upgrade.md`
- `docs/roadmaps/wwm-toolkit-phase-status.md`
- `docs/roadmaps/wwm-toolkit-assembly-roadmap.md`

### Verification

- the legacy prototype markup was preserved verbatim under the new filename
- repo documentation was updated to point at the renamed legacy entry
- the modular Vite surface remained separate under `app/index.html`

### Follow-up after this slice

- continue Phase A work so the modular app becomes the default preview target and the legacy prototype becomes an explicit reference surface rather than a competing entry point

---

## 2026-04-16 — Assembly roadmap clarified

### What changed

The repo gained a dedicated execution roadmap for the hard part that had become increasingly obvious during Phase 1 and Phase 2 work:

- assembling multiple surfaces, evidence-backed content, and migration work into one coherent app

The documentation set now explicitly distinguishes between:

- long-range product scope
- current phase status
- dated implementation history
- the concrete assembly sequence needed to keep the project manageable

### Why it was added

By this point the project clearly had enough source material and enough partial surfaces that "just keep adding content" was no longer a sufficient plan. The purpose of this slice was to make the execution order explicit: modular app first, content contract second, then further codex expansion and daily-use workflows.

### Key files and surfaces

- `docs/roadmaps/wwm-toolkit-assembly-roadmap.md`
- `docs/roadmaps/wwm-toolkit-documentation-map.md`
- `docs/roadmaps/wwm-toolkit-phase-status.md`

### Verification

- roadmap cross-checked against the current phase tracker, history log, README, and repo memory for the shipped modular-app state
- immediate priorities aligned with the known structural bottlenecks: dual-surface operation, giant render file ownership, and lack of a single content-assembly contract

### Follow-up after this slice

- execute Phase A of the new roadmap by splitting the modular UI into feature modules and adding a clearer shell/navigation
- choose one next reviewed content slice only after the assembly contract is locked tightly enough to support it

---

## 2026-04-16 — Phase 1 foundation established

### What changed

The repo gained a maintainable hybrid foundation around the legacy prototype:

- Vite + TypeScript toolchain
- typed content schemas
- Vitest + ESLint setup
- modular `app/` scaffold
- Python manifest/validation stubs
- workspace tasks for repeatable validation

### Why it was added

The original static prototype was useful, but it was not a safe base for a larger codex. The purpose of this slice was to create a non-destructive migration path instead of rewriting the project in one risky jump.

### Key files and surfaces

- `package.json`
- `app/`
- `tests/`
- `scripts_py/build_data_pack.py`
- `scripts_py/validate_sources.py`
- `.vscode/tasks.json`
- `docs/roadmaps/wwm-toolkit-phase-status.md`

### Verification

- frontend build passed
- frontend tests passed
- frontend lint passed
- Python manifest build passed
- Python manifest validation passed

### Follow-up after this slice

- migrate persistence away from legacy localStorage-only behavior
- replace content stubs with reviewed quest/storyline data

---

## 2026-04-16 — IndexedDB migration bridge added

### What changed

The modular foundation gained an IndexedDB-first persistence layer with localStorage fallback, plus legacy import support for both:

- `wwm-toolkit-state-v4`
- `wwm-toolkit-state-v3`

The new app also exposed a visible migration panel showing:

- backend in use
- detected legacy key
- imported counts
- manual re-import action

### Why it was added

The purpose of this slice was to preserve user favorites, notes, progress, and custom maps while the project transitions from the static prototype to the modular app.

### Key files and surfaces

- `app/src/lib/storage/toolkitPersistence.ts`
- `app/src/app/renderFoundationApp.ts`
- `tests/toolkitPersistence.test.ts`
- `docs/roadmaps/wwm-toolkit-phase-status.md`
- `README.md`

### Verification

- persistence tests passed
- frontend lint passed
- frontend build passed
- Python manifest pipeline still passed
- browser verification confirmed import from `wwm-toolkit-state-v3`

### Follow-up after this slice

- begin real content ingestion so the modular app stores something more useful than an empty codex shell

---

## 2026-04-16 — Reviewed quest and storyline seed started

### What changed

The modular app replaced quest/storyline stubs with the first reviewed content seed:

- 3 storyline chapter entries
- 13 top-level main-story quest entries
- 4 campaign quest entries
- 4 source registry entries
- graph validation tests for cross-links and source references
- raw evidence note documenting the seed sources and editorial rules

Phase 2 moved from `planned` to `in progress`.

### Why it was added

The purpose of this slice was to start the actual codex graph with a small but honest dataset. The emphasis was on traceable provenance and cross-linked structure, not pretending the project already had a full verified game database.

### Key files and surfaces

- `app/src/data/content/quests.ts`
- `app/src/data/content/storylines.ts`
- `app/src/data/content/sources.ts`
- `app/src/data/schemas/common.ts`
- `app/src/data/schemas/quest.ts`
- `app/src/data/schemas/storyline.ts`
- `app/src/data/schemas/source.ts`
- `tests/contentSchemas.test.ts`
- `tests/contentGraph.test.ts`
- `content/raw/quest-storyline-seed-evidence.md`
- `docs/roadmaps/wwm-toolkit-phase-status.md`
- `README.md`

### Verification

- all frontend tests passed (`13/13` at landing time)
- frontend lint passed
- production build passed
- Python manifest build passed
- Python manifest validation passed
- browser verification confirmed the new reviewed seed cards and counts in the built app

### Follow-up after this slice

- deepen Chapter 2 and Chapter 3 normalization
- decide whether nested Chapter 3 quest blocks should become first-class quest entries
- add global codex search across the reviewed seed packs

---

## 2026-04-16 — Global codex search foundation added

### What changed

The modular app gained the first user-facing search surface for the reviewed codex seed:

- reusable codex search/index module spanning quests, storylines, and sources
- ranking based on title, tags, metadata, regions, and summary matches
- filters for domain, region, and quest type
- grouped result columns and a linked detail panel
- direct navigation between related quests, storylines, and source records
- search-focused unit coverage for indexing, ranking, and filter behavior

### Why it was added

The purpose of this slice was to turn the reviewed content seed into something navigable. Without search, the new codex graph was technically present but still behaved like a static showcase. This milestone proves the modular app can query real content relationships instead of just rendering counts and cards.

### Key files and surfaces

- `app/src/lib/search/codexSearch.ts`
- `tests/codexSearch.test.ts`
- `app/src/app/renderFoundationApp.ts`
- `app/src/styles.css`
- `docs/roadmaps/wwm-toolkit-phase-status.md`
- `README.md`

### Verification

- frontend tests passed (`18/18` after landing the search slice)
- frontend lint passed
- production build passed
- Python manifest build passed
- Python manifest validation passed
- browser verification confirmed the search panel, filters, grouped results, and linked detail view in `dist/index.html`

### Follow-up after this slice

- add keyboard-first result navigation and shortcut handling
- surface matched-term highlighting or clearer result explanations
- expand search coverage as more codex domains land (regions, factions, items, encounters)
- decide when to split the search UI into reusable components instead of keeping it inside the foundation render file

---

## 2026-04-16 — Reviewed regions became first-class codex entries

### What changed

The modular app gained its first reviewed `regions` domain instead of treating region slugs as passive metadata only:

- added a typed `region` schema and reviewed content pack for `Qinghe`, `Kaifeng`, and `Hexi`
- expanded the source registry with official-site and region-specific community references
- indexed regions in codex search alongside quests, storylines, and sources
- updated the foundation UI with region seed cards plus region-aware detail sections and navigation links
- expanded schema, graph, and search tests to validate region references and the larger indexed corpus
- added a raw evidence note documenting the editorial rules for the reviewed region slice

### Why it was added

The purpose of this slice was to turn existing `regionIds` into first-class documents. That makes the current reviewed seed more honest and more useful: regions are now searchable, linkable, and ready to support later map, checklist, and route-planning features without pretending copied third-party map data already exists.

### Key files and surfaces

- `app/src/data/schemas/region.ts`
- `app/src/data/content/regions.ts`
- `app/src/data/content/sources.ts`
- `app/src/lib/search/codexSearch.ts`
- `app/src/app/renderFoundationApp.ts`
- `tests/contentSchemas.test.ts`
- `tests/contentGraph.test.ts`
- `tests/codexSearch.test.ts`
- `content/raw/region-seed-evidence.md`
- `docs/roadmaps/wwm-toolkit-phase-status.md`
- `README.md`

### Verification

- frontend tests passed after landing region coverage
- frontend lint passed
- production build passed
- Python manifest build passed
- Python manifest validation passed
- browser verification confirmed searchable region cards, region filters, and linked detail views in the modular app

### Follow-up after this slice

- add richer location domains beneath regions (subregions, landmarks, vendors, encounters)
- decide how much of the legacy map overlay should migrate into the modular app versus stay as a prototype reference
- add keyboard-first codex navigation and more explicit result explanations
- design an original map/checklist system that uses reviewed region structure without copying third-party map assets or marker dumps

---

## 2026-04-16 — Storyline and campaign flowchart pilot added

### What changed

The modular app gained an initial flowchart surface for the reviewed quest graph:

- added a reusable quest-flowchart module that converts the reviewed storyline and campaign graph into Mermaid diagrams
- rendered a flowchart pilot panel in the modular app using Mermaid SVG output
- surfaced three storyline chapter charts plus campaign-branch charts for the regions that currently have reviewed optional content
- added a Qinghe-first progression route so the pilot reflects natural early-game play instead of jumping straight to chapter-spine abstraction
- added test coverage for chart generation so anchor relationships stay stable as the seed expands
- added `mermaid` as a runtime dependency for in-app diagram rendering

### Why it was added

The reviewed quest graph is already getting dense enough that plain cards stop being the best deep-dive surface. This slice turns that graph into something visually navigable without pretending the project already has a fully normalized quest database. It especially helps keep main-story spines, early Qinghe detours, and side-branch opportunities legible while the deeper quest pass is still incomplete.

### Key files and surfaces

- `app/src/lib/flowcharts/questFlowcharts.ts`
- `app/src/app/renderFoundationApp.ts`
- `app/src/styles.css`
- `tests/questFlowcharts.test.ts`
- `package.json`
- `docs/roadmaps/wwm-toolkit-phase-status.md`
- `README.md`

### Verification

- frontend tests passed after landing the flowchart slice
- frontend lint passed
- production build passed
- Python manifest build passed
- Python manifest validation passed
- browser verification confirmed the new flowchart panel and diagram rendering in `dist/index.html`

### Follow-up after this slice

- split Chapter 3 nested quest blocks into first-class records when the evidence pass is ready
- add richer side-quest flowcharts once more than campaign examples are normalized
- add reviewed encounter placement once specific early-Qinghe triggers are normalized well enough to place honestly on progression routes
- decide whether flowchart selection should eventually sync with codex detail selection
- add keyboard navigation and possibly export/share options for diagram views

---

## 2026-04-16 — Region/level gates clarified in progression charts

### What changed

The modular flowchart and region model now distinguish three things that had started getting blurred together:

- region order
- player-level / gate requirements
- optional content taxonomy

Specifically:

- regions now carry explicit reviewed character-level gates where the guides publish them
- region entries can now link to reviewed codex entries that function as progression gates
- the flowchart pilot gained a region-and-level overview chart in addition to the Qinghe onboarding route
- the Qinghe route now labels hidden exploration quests and mystic-art unlocks more precisely instead of letting them read like generic encounter noise
- source/evidence notes now explicitly record that literal `Encounter` pins are a separate activity layer from hidden exploration, side-story, and skill-unlock content

### Why it was added

The earlier chart cleanup correctly removed a vague encounter note, but the user clarified an important nuance: `encounters` means literal encounter activities, not every hidden or exploratory mission. This slice keeps the charts honest about that distinction while also grounding progression in published region gates instead of hand-wavy chapter order alone.

### Key files and surfaces

- `app/src/data/schemas/region.ts`
- `app/src/data/content/regions.ts`
- `app/src/data/content/sources.ts`
- `app/src/lib/search/codexSearch.ts`
- `app/src/lib/flowcharts/questFlowcharts.ts`
- `app/src/app/renderFoundationApp.ts`
- `tests/contentSchemas.test.ts`
- `tests/contentGraph.test.ts`
- `tests/questFlowcharts.test.ts`
- `content/raw/region-seed-evidence.md`
- `content/raw/quest-storyline-seed-evidence.md`
- `docs/roadmaps/wwm-toolkit-phase-status.md`
- `README.md`

### Verification

- frontend tests passed after landing the gate-aware flowchart and region-model updates
- frontend lint passed
- production build passed
- browser verification confirmed the new region/level chart and the absence of the earlier encounter note

### Follow-up after this slice

- decide whether hidden exploration quests and mystic-art unlocks should become first-class entries instead of title-only optional nodes
- normalize literal encounter placement separately from other optional-content layers
- deepen the region-gate model once more reviewed unlock routes are available for later content

---

## 2026-04-16 — Qinghe optional routes became first-class codex entries

### What changed

The modular app promoted the first reviewed Qinghe optional routes from flowchart-only notes into first-class quest records:

- `White Bird Shooting` and `The Shameless` are now explicit Qinghe `exploration` quests
- `Meridian Touch` is now an explicit Qinghe `jianghu-legacy` route rather than a generic mystic-art note
- quest typing now distinguishes these routes from `campaign` and from literal `encounter` activities
- region detail views now separate Qinghe's main-story anchors, exploration routes, Jianghu Legacy / mystic-art routes, and campaign gates instead of dumping them into one bucket
- the Qinghe progression and Chapter 1 storyline flowcharts now link these entries directly
- the reviewed seed surface now includes a dedicated Qinghe optional-route subsection
- the README now records that the modular Vite build should be served over `http://` / `https://` outside VS Code because direct `file://` opens can fail in external browsers

### Why it was added

The previous flowchart pass correctly stopped calling everything an encounter, but the new handoff clarified the next modeling step: optional Qinghe exploration routes and mystic-art unlocks needed to become real codex entities, not just title-only chart labels. This slice does that without pretending reviewed encounter placement already exists.

### Key files and surfaces

- `app/src/data/schemas/quest.ts`
- `app/src/data/content/quests.ts`
- `app/src/data/content/regions.ts`
- `app/src/data/content/sources.ts`
- `app/src/lib/search/codexSearch.ts`
- `app/src/lib/flowcharts/questFlowcharts.ts`
- `app/src/app/renderFoundationApp.ts`
- `tests/contentGraph.test.ts`
- `tests/codexSearch.test.ts`
- `tests/questFlowcharts.test.ts`
- `content/raw/quest-storyline-seed-evidence.md`
- `content/raw/region-seed-evidence.md`
- `docs/roadmaps/wwm-toolkit-phase-status.md`
- `README.md`

### Verification

- frontend tests passed after landing the Qinghe optional-route slice
- frontend lint passed
- production build passed
- Python manifest build passed
- Python manifest validation passed
- browser verification confirmed the new Qinghe optional-route cards, codex search entries, region detail sections, and flowchart links in the served modular app

### Follow-up after this slice

- expand first-class optional-route coverage beyond Qinghe into later reviewed regions
- normalize literal encounter placement separately once trigger and placement evidence are strong enough
- decide when more optional taxonomies such as Worldly Affairs or Hidden Paths need their own first-class quest typing or dedicated panels

---

## 2026-04-16 — Qinghe-first layout moved the route above the scaffolding

### What changed

The modular app stopped leading with migration internals and started leading with the reviewed opening route:

- reordered the page so the Qinghe guide, flowcharts, and codex search now appear before the phase tracker and persistence bridge
- added a Qinghe-first guide panel with quick actions for the region overview, Chapter 1 main route, exploration routes, Meridian Touch, Still Shore, and later gates
- made `Qinghe` the default selected codex entry and made the `Qinghe onboarding route` the default flowchart
- updated the hero copy so the app presents itself as a player-facing route surface first and a migration scaffold second

### Why it was added

The reviewed Qinghe slice had become strong enough that the main UX problem was no longer the data model. The page was still leading with implementation scaffolding instead of the route a player actually cares about first.

### Key files and surfaces

- `app/src/app/renderFoundationApp.ts`
- `app/src/styles.css`
- `README.md`
- `docs/roadmaps/wwm-toolkit-phase-status.md`

### Verification

- frontend tests passed (`33/33`)
- frontend lint passed
- production build passed
- Python manifest build passed
- Python manifest validation passed
- browser verification in the served modular app confirmed the new Qinghe-first guide panel, the default Qinghe onboarding chart, and working quick-action filtering for `Meridian Touch`

### Follow-up after this slice

- add keyboard-first navigation so the new guide surface is not mouse-first only
- tighten deeper state sync between flowchart selection, codex detail, and guided entry points beyond the current quick actions
- expand later-region optional-route slices once Kaifeng and Hexi evidence is ready

---

## 2026-04-16 — Campaign coverage expanded for the Qinghe to Kaifeng gate path

### What changed

The reviewed quest seed stopped treating campaigns as a handful of examples and started modeling the current gate-path campaign ladders much more honestly:

- expanded Qinghe from `Still Shore` only to the reviewed chain through `Bodhi Sea`, `Gleaming Abyss`, `Palace of Annals`, `Blissful Retreat`, and `Halo Peak`
- added the reviewed Kaifeng campaign roster: `Unbound Cavern`, `Ever-Normal Granary`, `Jinming Pool`, campaign `Furnace of Righteousness`, `Heavenfall`, and `Supreme Freedom`
- kept the existing Game8-backed Hexi slice (`Whitecrown Fortress`, `Death of the Governor`, `Dasan Pass`) in place without over-claiming unverified extras
- updated region packs, campaign flowcharts, graph tests, and search counts so the modular app reflects the larger campaign slice consistently
- expanded the raw evidence note and source registry with an explicit Fextralife campaign-guide source instead of relying on looser directory hints alone

### Why it was added

The user redirected focus away from more UI polish and toward content completeness: before broadening the codex further, the toolkit needed to cover the gated Qinghe → Kaifeng / Hexi side-story path more faithfully. The old seed was too sparse for that goal.

### Key files and surfaces

- `app/src/data/content/quests.ts`
- `app/src/data/content/regions.ts`
- `app/src/data/content/sources.ts`
- `app/src/lib/flowcharts/questFlowcharts.ts`
- `tests/contentGraph.test.ts`
- `tests/questFlowcharts.test.ts`
- `tests/codexSearch.test.ts`
- `content/raw/quest-storyline-seed-evidence.md`
- `docs/roadmaps/wwm-toolkit-phase-status.md`

### Verification

- graph/search/flowchart tests were expanded alongside the data change
- full frontend validation was rerun after the content patch
- Python manifest and source validation were rerun to ensure the published packs still resolve cleanly

### Follow-up after this slice

- decide whether Fextralife-only extras such as additional Hexi campaigns should wait for a second source pass before promotion
- normalize later-region Jianghu Legacy, Worldly Affairs, and literal encounter layers separately instead of merging them into the campaign slice
- decide when late Qinghe/Kaifeng non-campaign side-story taxonomies deserve their own first-class pass

---

## Template for future entries

```text
## YYYY-MM-DD — short milestone title

### What changed
- ...

### Why it was added
- ...

### Key files and surfaces
- ...

### Verification
- ...

### Follow-up after this slice
- ...
```
