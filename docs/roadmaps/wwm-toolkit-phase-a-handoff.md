# WWM Toolkit Phase A Handoff

This document is the **kickoff packet** for Phase A of the assembly roadmap.

It exists so the repo can pause in a clean state **before** the modular-app refactor begins, while still making the next step concrete.

## What Phase A is actually for

Phase A is not a content expansion sprint.

It is the structural pass that turns the modular app into the default product surface by doing three things:

1. shrinking `app/src/app/renderFoundationApp.ts`
2. introducing clear section ownership in `app/`
3. making top-level app structure obvious to contributors without forcing them to reverse-engineer one giant file

## Current starting point

Right now `app/src/app/renderFoundationApp.ts` owns too much at once:

- startup / bootstrapping
- UI state creation and synchronization
- HTML rendering for the hero, guide, flowcharts, codex, phase tracker, domain cards, and migration panel
- event wiring for guide actions, codex search, flowchart selection, keyboard navigation, and persistence re-import
- Mermaid diagram hydration
- a few shared formatting / sanitization helpers

That file works, but it is already past the point where further growth stays cheap.

## Non-goals for the first Phase A slice

Do **not** bundle these into the refactor kickoff:

- no new content domains
- no visual redesign pass
- no CSP hardening pass yet
- no legacy-prototype feature expansion unless a preservation bug forces it
- no rewriting the persistence layer just because it is nearby

The point is to improve ownership boundaries first, not to create a moving-target rewrite.

## Target module map

Phase A should extract the current renderer into modules with responsibilities that are obvious from the path alone.

Recommended target layout:

- `app/src/app/renderFoundationApp.ts`
	- keep as the thin orchestration entry
- `app/src/app/foundationAppState.ts`
	- UI-state types, initial state, reset/sync helpers
- `app/src/app/foundationAppShell.ts`
	- top-level shell markup and section ordering
- `app/src/app/foundationFormatting.ts`
	- shared formatting helpers such as labels, timestamps, and safe external-link rendering
- `app/src/app/sections/renderQingheGuideSection.ts`
	- guide surface only
- `app/src/app/sections/renderFlowchartSection.ts`
	- flowchart panel only
- `app/src/app/sections/renderCodexSearchSection.ts`
	- search/results/detail rendering only
- `app/src/app/sections/renderFoundationOverviewSections.ts`
	- phase tracker, domain cards, reviewed-seed overview blocks
- `app/src/app/sections/renderMigrationPanel.ts`
	- persistence panel only
- `app/src/app/handlers/attachGuideHandlers.ts`
	- guide quick actions and keyboard support
- `app/src/app/handlers/attachCodexHandlers.ts`
	- query/filter/result/detail navigation wiring
- `app/src/app/handlers/attachFlowchartHandlers.ts`
	- flowchart selection + Mermaid hydration wiring
- `app/src/app/handlers/attachPersistenceHandlers.ts`
	- re-import button behavior

The exact filenames can still change, but the **responsibility split** should stay close to this shape.

## Recommended extraction order

Do the refactor in this order so the blast radius stays small:

### 1. Move pure helpers first

Extract:

- escaping / safe external-link helpers
- label/metadata formatters
- timestamp/backend/migration-label helpers

Why first:

- low risk
- easy to test implicitly through the existing UI tests/build
- immediately reduces visual noise in the root file

### 2. Move UI state and sync helpers

Extract:

- `CodexUiState`
- `FlowchartUiState`
- initial-state creation
- codex/flowchart sync helpers
- guide-action application logic

Why second:

- creates stable contracts the renderers and handlers can share
- makes later file splits much less tangled

### 3. Move render-only sections

Extract one rendering surface at a time:

- codex section
- flowchart section
- guide section
- migration panel
- overview/phase/domain sections

Rule:

- do not change behavior and file structure in the same extraction unless a trivial bug fix is unavoidable

### 4. Move event handlers

Extract one handler group at a time:

- guide handlers
- codex handlers
- flowchart handlers
- persistence handlers

Rule:

- preserve existing keyboard behavior while moving code

### 5. Add the top-level shell wrapper

Once the sections are split, introduce a clear app-shell composition layer so the modular app structure is visible at a glance.

At minimum, the shell should make these top-level surfaces explicit:

- guide / route surface
- flowcharts
- codex
- reviewed-seed overview
- roadmap / foundation status
- migration / persistence

### 6. Slim the entry file aggressively

At the end of Phase A, `renderFoundationApp.ts` should mostly:

- load migration summary
- create state
- render the shell
- attach handlers
- show loading/error states

If it still owns most rendering detail, Phase A did not really happen.

## Suggested first commit sequence for Phase A

To keep review and rollback sane, prefer a short sequence of small commits:

1. extract formatting/sanitization helpers
2. extract UI state and sync helpers
3. extract codex rendering
4. extract flowchart rendering + Mermaid support
5. extract guide and migration sections
6. extract handler modules
7. add or polish the top-level shell/navigation labels

That sequence is boring on purpose.

## Guardrails while Phase A is active

- keep `legacy-prototype.html` on maintenance-only status
- do not add a new content slice during the structural split
- keep the fixed preview target at `http://127.0.0.1:4173/`
- run frontend validation after each meaningful extraction
- keep Python/content validation available even if the Phase A changes are frontend-heavy

## Validation loop for Phase A

After each meaningful extraction step, run:

- `npm run test`
- `npm run lint`
- `npm run build`

Before calling Phase A stable enough to move on, also rerun:

- `scripts_py/build_data_pack.py`
- `scripts_py/validate_sources.py`

## Definition of done for the Phase A pause target

Phase A is complete enough to move to Phase B only when:

- `renderFoundationApp.ts` is clearly an entry/orchestration file instead of the whole product
- the modular app has obvious top-level section ownership
- a contributor can add to guide, codex, flowcharts, or migration surfaces without spelunking the full renderer
- the modular app is unquestionably the default preview target

## Bottom line

The next move is not “add more stuff.”

The next move is to **make the current modular app small enough, legible enough, and well-owned enough** that additional reviewed content stops raising the cost of every future change.
