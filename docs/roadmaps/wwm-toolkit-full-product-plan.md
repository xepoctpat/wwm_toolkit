# WWM Toolkit Full Product Plan

## Current state

The current project started as a **good vertical slice**, not the whole product.

The legacy prototype is strongest in one lane:

- NPC routing
- archetype conversation helpers
- source-backed location notes
- local progress, notes, favorites, and custom map uploads

That is valuable, but **Where Winds Meet is much bigger than NPCs**.

If this is going to become a real `WWM Toolkit`, it should evolve from an NPC companion into an **offline-first game companion + codex** for the broader game.

## Current strategic checkpoint — 2026-05-15

The foundation milestone described later in this document has partially landed:

- Vite + TypeScript foundation exists under `app/`
- typed schemas exist for quests, storylines, regions, NPCs, and sources
- IndexedDB migration exists for legacy favorites, notes, progress, and custom maps
- global codex search exists across reviewed regions, quests, storylines, and sources
- the current reviewed content graph contains `3` regions, `31` quests, `3` storylines, and `13` sources
- the current chart surface contains `8` Mermaid-backed graph definitions

The next product risk is no longer “can this become more than NPCs?” It already has.

The next product risk is **whether the modular app can stay coherent while it grows**.

Immediate strategic direction:

1. make the modular app the primary owned surface
2. split the overgrown renderer into feature modules
3. introduce an explicit app shell/navigation layer
4. decouple quest graph data from Mermaid rendering
5. evaluate the local `understand-anything` repo as a graph-rendering reference after the adapter boundary exists
6. freeze the content intake contract before the next expansion slice

## What “full toolkit” should mean

A full WWM toolkit should cover the game across multiple knowledge domains, not just a single activity loop.

It should support these six layers:

1. **Reliable app foundation**
   - modular codebase
   - typed data model
   - testable UI logic
   - predictable persistence

2. **High-trust content system**
   - validated, versioned content packs
   - explicit source confidence and change tracking
   - cross-links between game systems instead of isolated entries

3. **Full game codex**
   - quests
   - storylines and chapter arcs
   - NPCs and relationships
   - factions / schools / affiliations
   - regions, settlements, landmarks, dungeons, and points of interest
   - items, crafting, resources, and vendors
   - skills, weapons, martial arts, and builds
   - bosses, encounters, and challenge content
   - collectibles, achievements, and progression checklists

4. **Player workflow tools**
   - tracking
   - route planning
   - personal notes
   - map calibration
   - backups/import/export
   - saved views and presets

5. **Search + discovery layer**
   - one search box across the entire toolkit
   - tag-driven filtering
   - entity cross-links like `Quest -> NPC -> Region -> Reward -> Build relevance`

6. **Distribution + operations**
   - installable web app
   - deployable production build
   - content update pipeline
   - optional contributor/admin workflow later

## Product vision

The toolkit should feel like a mix of:

- an **interactive codex**
- a **quest tracker**
- a **map notebook**
- a **build / progression reference**
- a **personal companion app**

The important idea is this:

## The product should be entity-driven, not page-driven.

That means the data model should understand relationships such as:

- a quest belongs to a storyline
- a storyline touches one or more regions
- a region contains NPCs, quests, and vendors
- an NPC can be tied to a quest, faction, gift route, or unlock
- an item can be rewarded by a quest or sold by an NPC
- a martial art / skill can support a specific build archetype
- a boss can live in a region and drop progression-relevant rewards

If you model those links correctly, the UI can become much richer without turning into chaos in a trench coat.

## Core content domains

The full toolkit should eventually include these domain packs.

## 1. Quests + storyline journal

This should become one of the primary pillars.

Support:

- main story quests
- side quests
- faction / school questlines
- region story arcs
- prerequisites and unlock conditions
- branching notes where relevant
- rewards and follow-up quests
- involved NPCs
- progress state per quest

Useful UI ideas:

- chapter timeline view
- quest dependency graph
- “where did I leave off?” resume cards
- quest-to-region and quest-to-reward linking

## 2. NPC + relationship atlas

Keep the current NPC work, but make it one module inside a larger system.

Expand it to support:

- dialogue / affinity routes
- quest involvement
- faction ties
- shops / services
- gifts / reward cadence
- relationship milestones
- personal encounter notes

## 3. Region + world map layer

The map should grow beyond NPC pins.

Support layers for:

- NPCs
- quests
- dungeons
- bosses
- vendors
- collectibles
- story beats
- route presets
- user annotations

Important constraint remains unchanged:

- do not bundle copyrighted third-party map art directly into the repo
- support user-provided screenshots or licensed/self-captured assets

## 4. Factions / schools / affiliations

This domain should connect narrative and progression.

Track:

- faction identity
- major NPCs
- region influence
- questline links
- unlocks
- martial style associations
- reputation / relationship notes if applicable

## 5. Skills / weapons / builds

The toolkit should eventually become helpful for progression and combat planning too.

Support:

- weapon families
- martial arts / skills / techniques
- build archetypes
- recommended progression paths
- synergy notes
- unlock sources
- quest/faction requirements where relevant

Useful views:

- build planner
- compare view
- progression recommendations by stage of play

## 6. Items / crafting / resources

Support:

- consumables
- crafting materials
- quest items
- equipment and upgrade-related items
- vendors and acquisition sources
- region availability
- recipe/use links

## 7. Bosses / dungeons / encounters

Support:

- location
- requirements
- tactics notes
- related quests
- drops / rewards
- recommended preparation
- player notes

## 8. Collectibles / checklist systems

Support:

- achievements
- region collectibles
- story completion markers
- exploration checklists
- weekly / recurring systems

This is one of the strongest retention features because players love checking boxes almost as much as they love pretending they do not.

## Recommended architecture

## App stack

Recommended next stack:

- `Vite` for build/dev workflow
- `TypeScript` for maintainability
- modular feature structure instead of a single `app.js`
- `Vitest` for unit tests
- `ESLint` + `Prettier` for code quality

## Where Python helps

Yes — **Python can absolutely be useful**, but I would use it as a **data and operations tool**, not as the primary app runtime for the player-facing UI.

Recommended split:

- **TypeScript** for the actual toolkit app
- **Python** for content ingestion, validation, transformation, verification tooling, and admin-style scripts

Python is especially useful for:

- bulk data normalization
- schema validation helpers
- import pipelines from CSV / JSON / spreadsheets
- source comparison and diffing
- content QA reports
- optional OCR or screenshot-assisted extraction experiments later
- offline build scripts that generate clean frontend-ready data packs

Python is **not** the best primary choice for the frontend app itself here, because:

- the toolkit wants to behave like an installable browser app / PWA
- the interactive client experience is better served by modern TypeScript tooling
- the content graph, search, filters, and map interactions belong naturally in the web app layer

So the best stack is a **hybrid** one:

- `TypeScript` for product UI
- `Python` for data tooling and content operations

I still would **not** jump straight to a backend-first architecture.

The right next step is to build a strong **offline-first product** with robust local persistence and a maintainable content model.

## Persistence model

Recommended storage split:

- **static content data** (`quests`, `storylines`, `npcs`, `regions`, `factions`, `items`, `skills`, `bosses`, `sources`) -> versioned JSON/TS modules in the repo
- **user state** (`progress`, `notes`, `favorites`, `saved filters`, `route plans`, `checklists`) -> `IndexedDB`
- **large local assets** (`custom map images`, maybe later personal screenshots) -> `IndexedDB`
- **optional cloud sync later** -> separate backend phase

Why change this:

- `localStorage` is acceptable for tiny settings
- it is weak for larger uploads and long-lived user data
- `IndexedDB` is better for offline-first content tools and backups

## Data model

Move from handwritten domain arrays toward a proper content system.

Recommended schema set:

- `quests.schema.ts`
- `storylines.schema.ts`
- `npcs.schema.ts`
- `regions.schema.ts`
- `factions.schema.ts`
- `items.schema.ts`
- `skills.schema.ts`
- `bosses.schema.ts`
- `sources.schema.ts`

Recommended shared concepts:

- `id`
- `title` / `name`
- `summary`
- `tags`
- `regionIds`
- `npcIds`
- `questIds`
- `storylineIds`
- `sourceIds`
- `lastVerified`
- `gameVersion`
- `confidence`
- `verificationStatus`
- `evidenceType`
- `relatedEntryIds`

This turns the project into a **maintainable data graph**, not just a set of disconnected pages.

## Grounding the toolkit in real game data

This is a critical requirement.

If the toolkit is going to cover the whole game, it cannot rely on vibes, loose community repetition, or unlabeled copied claims.

Every important entry should be grounded in a documented evidence chain.

## Source trust tiers

Recommended source hierarchy:

1. **Tier 1 — Official / first-party**
   - official website
   - official announcements / patch notes
   - store descriptions where relevant
   - official support or published game guides if available

2. **Tier 2 — Direct in-game verification**
   - your own screenshots
   - your own recordings
   - your own observed quest / NPC / item / map data
   - manually verified coordinates, unlocks, requirements, and rewards

3. **Tier 3 — Vetted community sources**
   - trusted wiki pages
   - structured guide sites
   - maintained checklists or maps
   - cross-confirmed community data

4. **Tier 4 — Inferred / provisional data**
   - partial reports
   - single-source claims
   - unverified branching notes
   - speculative unlock conditions

The UI should expose the difference between these tiers clearly.

## Per-entry evidence requirements

For major entries like quests, NPCs, regions, items, bosses, and builds, the data model should support:

- `sourceIds`
- `confidence`
- `verificationStatus`
- `lastVerified`
- `gameVersion`
- `evidenceType` (`official`, `in-game capture`, `community guide`, `inferred`)
- optional `verificationNotes`

That means no high-impact claim should exist without provenance.

## Recommended content pipeline

Use a three-layer content workflow:

### 1. Raw evidence layer

Keep a non-runtime source folder for collected inputs such as:

- screenshots
- recordings
- copied official text excerpts
- structured research notes
- provisional spreadsheets

### 2. Normalized data layer

Convert raw material into clean structured domain entries:

- quests
- storylines
- npcs
- regions
- items
- factions
- encounters

This is where Python can help heavily with transformation, cleanup, and consistency checks.

### 3. Published data packs

Generate frontend-consumable data used by the app.

These should be:

- validated
- versioned
- documented
- ready for TypeScript consumption

## Verification policy

Recommended rules:

- do not mark content as high-confidence without at least one strong source or direct in-game verification
- do not silently merge conflicting community claims; surface conflicts in notes
- tag provisional entries clearly
- add `lastVerified` and `gameVersion` so players know whether content may be stale after updates
- prefer direct in-game confirmation for quest steps, rewards, unlock conditions, vendors, and map placement whenever possible

## Best use of Python in this data pipeline

The most valuable Python tasks would be:

- `scripts_py/validate_sources.py`
- `scripts_py/normalize_quests.py`
- `scripts_py/normalize_items.py`
- `scripts_py/generate_search_index.py`
- `scripts_py/diff_game_versions.py`
- `scripts_py/build_data_pack.py`

These scripts can produce trusted, normalized outputs for the TypeScript app to consume.

That gives you the best of both worlds:

- Python for heavy lifting on data
- TypeScript for the actual product experience

## Suggested feature modules

Recommended product modules:

- `dashboard` — recent progress, resume cards, weekly reminders
- `codex` — global search and cross-linked encyclopedia
- `quests` — quest log, storyline progress, prerequisites, rewards
- `atlas` — NPC relationships and services
- `map` — layered world map and annotations
- `factions` — schools, affiliations, unlocks
- `builds` — weapons, skills, martial arts, progression planning
- `items` — acquisition and usage reference
- `encounters` — bosses, dungeons, challenge content
- `checklists` — collectibles, completion tracking
- `sources` — provenance, confidence, verification notes
- `settings` — storage, import/export, theme, backups

## Graph and chart rendering direction

The current Mermaid-backed flowchart pilot is a good proof of concept, but Mermaid strings should not become the canonical graph model.

The product should eventually represent route charts as structured graph data:

- graph nodes linked to codex entry IDs
- typed edges for main progression, optional branches, gates, campaign routes, and future encounter links
- renderer adapters that can target Mermaid, SVG/Canvas, React Flow, or another graph surface

The locally cloned `understand-anything` repo is strategically relevant because it already contains a React Flow + ELK dashboard with domain/flow/step node concepts. It should be treated as a reference implementation for a richer graph explorer, not as an immediate dependency to wire into this vanilla TypeScript app.

The safe order is:

1. extract renderer-neutral graph definitions
2. preserve Mermaid as the current adapter
3. prototype a richer graph panel using `understand-anything` patterns
4. decide whether to introduce a React graph island or keep a lighter non-React renderer
5. only remove Mermaid after feature parity and bundle/runtime impact are understood

## UX feature set for a true v1

The first real full-product v1 should go beyond the current NPC tools.

Recommended v1 feature set:

1. **Global search / codex view**
   - search quests, NPCs, storylines, regions, items, and builds from one place

2. **Quest + storyline tracker**
   - mark state like `not started`, `active`, `blocked`, `completed`
   - link rewards, NPCs, and regions

3. **Map with layered filters**
   - NPC layer
   - quest layer
   - vendor layer
   - encounter layer
   - collectible layer

4. **Import / export backups**
   - export all local notes, progress, checklists, favorites, and map assets
   - import on another browser or machine

5. **Pin calibration mode**
   - align content pins to a user-uploaded map screenshot per region

6. **Saved filter presets**
   - e.g. `Kaifeng side quests`, `Qinghe vendors`, `main story blockers`, `Cold Strategist NPCs`

7. **Checklist + cadence tracking**
   - weekly reward reminders
   - relationship milestones
   - exploration completion
   - optional collectible progress

## PWA / delivery layer

To make this feel like a real toolkit, add:

- installable `PWA` setup
- offline caching for app shell + data packs
- app icon / manifest
- production build target
- deploy to `GitHub Pages`, `Cloudflare Pages`, or `Netlify`

That makes the project usable like an app instead of a loose HTML file.

## Content operations

A full toolkit also needs a sane content maintenance process.

Recommended additions:

- `scripts/validate-data.ts`
- `scripts/build-data.ts` if data gets normalized/generated
- contributor guide for adding entries safely
- source policy doc for what can and cannot be embedded
- per-entry `lastVerified` metadata
- changelog for data pack updates

Later, optionally:

- internal editor/admin screen for content entry
- CSV/JSON import tools for bulk updates
- review queues for contributor submissions

## Optional online/community phase

Only after the offline-first toolkit is stable should you consider an online layer.

That phase could add:

- user accounts
- cloud sync
- community-submitted corrections
- shared route packs
- shared map calibrations
- moderation / approval queue
- analytics on popular lookups or routes

If you go there, good options are:

- `Supabase` for auth + Postgres + storage
- `Firebase` for auth + storage + sync

But this should still be **Phase 4 or 5**, not Phase 1.

## Recommended phased plan

The living execution tracker for these phases is kept in `docs/roadmaps/wwm-toolkit-phase-status.md`.

## Phase 1 — productize the foundation

Goal: make the codebase maintainable.

- migrate to `Vite + TypeScript`
- split `app.js` into feature modules
- create typed schemas for content domains
- add validation + test setup
- move user persistence toward `IndexedDB`

## Phase 2 — expand from NPC tool to full codex

Goal: broaden the content scope.

- add quests + storyline domain
- add regions + layered map entities
- add factions / schools
- add items / vendors / rewards
- add global search + cross-linking

## Phase 3 — ship a real offline toolkit v1

Goal: make the app genuinely useful day to day.

- import/export backups
- pin calibration mode
- saved filter presets
- quest tracker
- checklists / cadence tracking
- route builder

## Phase 4 — make it feel like a real app

Goal: distribution and resilience.

- PWA support
- build + deploy pipeline
- better empty/error states
- upgrade/migration handling for stored data

## Phase 5 — build a maintainable content pipeline

Goal: faster updates with less manual risk.

- dataset versioning
- validation scripts
- contributor workflow
- source freshness review process

## Phase 6 — optional connected platform

Goal: community and sync features.

- auth
- cloud sync
- shared submissions
- moderation

## Recommended next milestone

The best immediate milestone is now:

## `Assembly Gate 1: one app control tower`

That milestone should include exactly these items:

1. split `renderFoundationApp.ts` into feature-owned modules
2. add a top-level modular app shell / navigation structure
3. extract renderer-neutral quest graph definitions
4. keep Mermaid as a compatibility adapter while a richer renderer is evaluated
5. document the content intake contract for reviewed entries
6. add validation coverage for any new graph/content contract rules
7. choose one next expansion slice only after the above is stable

That gets you from **working foundation** to **manageable product surface** without turning every new content pass into a renderer, navigation, and taxonomy negotiation.

## Suggested future structure

```text
src/
  app/
    bootstrap.ts
    router.ts
    store/
  features/
    dashboard/
    codex/
    quests/
    storylines/
    atlas/
    map/
    factions/
    builds/
    items/
    encounters/
    checklists/
    sources/
    settings/
  components/
  data/
    quests/
    storylines/
    npcs/
    regions/
    factions/
    items/
    skills/
    bosses/
    sources/
    schemas/
  lib/
    storage/
    search/
    export/
    import/
    validation/
    graph/
  styles/
public/
  icons/
  manifest.webmanifest
scripts/
  validate-data.ts
  build-data.ts
tests/
```

## What not to do yet

Avoid these too early:

- scraping live third-party sites directly in the client
- embedding copyrighted map art into the repo
- building auth/backend before local workflows are polished
- introducing a heavy server framework before the offline app is stable
- trying to model every possible game system before the first broader codex slice ships

## Bottom line

The correct path is no longer just:

**NPC prototype -> offline product**

It should be:

**NPC prototype -> full codex foundation -> offline-first companion app -> optional connected platform**

That sequence keeps the project useful, scalable, and aligned with the much broader scope you actually want.
