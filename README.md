# WWM Toolkit

A polished static fan toolkit for **Where Winds Meet**, currently focused on NPC routing and conversation workflows, with an active modular migration toward a full codex covering regions, quests, storylines, factions, builds, items, encounters, and progression tracking.

## Views included

The current shipped build is an **NPC-focused vertical slice** of the broader toolkit vision.

- `Overview` — fast route notes, quick stats, and source-aware caveats
- `NPC Atlas` — searchable and filterable NPC explorer with local progress + notes
- `Map Overlay` — approximate region boards with NPC pins on top of optional custom map uploads
- `Archetype Lab` — a dedicated full-screen archetype workspace
- `Research Notes` — official and community sources with integration decisions

## Project structure

- `app/` — Vite + TypeScript foundation for the modular full-codex migration, including the IndexedDB migration bridge and a Qinghe-first route surface for the reviewed seed
- `app/src/lib/search/codexSearch.ts` — reusable search/index layer for the reviewed codex seed
- `app/src/lib/flowcharts/questFlowcharts.ts` — reviewed flowchart definitions plus Qinghe route-module metadata for the current graph workspace
- `app/src/lib/flowcharts/questFlowchartModel.ts` — renderer-neutral quest graph nodes/edges for progression, storyline, and campaign charts
- `app/src/lib/flowcharts/renderers/` — Mermaid compatibility adapter plus the current vanilla HTML/SVG graph renderer
- `legacy-prototype.html` — legacy static NPC-focused prototype app shell
- `assets/css/styles.css` — full UI system and responsive styling
- `assets/js/app.js` — state, rendering, filtering, favorites, progress tracking, notes, map uploads, copy actions
- `assets/js/data/archetypes.js` — archetype playbooks
- `assets/js/data/npcs.js` — NPC dataset with tags and approximate coordinates
- `assets/js/data/sources.js` — research sources and caveats
- `app/src/data/content/*.ts` — reviewed modular content seed packs for regions, quests, storylines, and source metadata
- `content/raw/region-seed-evidence.md` — editorial evidence note for the first reviewed region slice
- `scripts_py/` — Python pipeline stubs for content validation and data-pack building
- `docs/roadmaps/wwm-toolkit-upgrade.md` — implementation roadmap and source summary
- `docs/roadmaps/wwm-toolkit-full-product-plan.md` — next-step roadmap for turning this into a full product-grade toolkit
- `docs/roadmaps/wwm-toolkit-phase-status.md` — living phase tracker for migration progress and deliverables
- `docs/roadmaps/wwm-toolkit-documentation-map.md` — purpose guide for the main documentation surfaces
- `docs/roadmaps/wwm-toolkit-history-log.md` — dated milestone trail for historical tracking
- `docs/roadmaps/wwm-toolkit-graph-rendering-strategy.md` — chart-renderer strategy, including the `understand-anything` evaluation path
- `docs/roadmaps/wwm-toolkit-qinghe-modularity-checkpoint-handoff.md` — current stable checkpoint handoff for the Qinghe proving-ground pass

## How to use

1. Open `legacy-prototype.html` in your browser if you want the original static NPC-focused toolkit.
2. Press `/` to jump straight into atlas search.
3. Star NPCs in the atlas to pin them in the side rail.
4. Mark NPCs as `Untracked`, `Working`, or `Solved`, and save your own local notes in the atlas detail panel.
5. Use the map overlay for route planning, and optionally upload your own regional screenshot/reference map so pins sit on top of it.
6. Use the archetype lab when you want reply ladders without the clutter of the broader toolkit.

## Modular build note

The legacy root prototype in `legacy-prototype.html` is still intentionally `file:///`-friendly, but the modular Vite build in `dist/` should be served over `http://` or `https://` when opened outside VS Code.

Modern browsers treat the built JavaScript module and linked stylesheet assets as cross-origin fetches under `file://`, so opening `dist/index.html` directly can fail with CORS-style errors even though the app itself is fine.

## Local modular app preview

For a predictable local preview of the modular app, use:

- `npm run dev:local`

That serves the app at:

- `http://127.0.0.1:4173/`

The workspace also includes a matching task:

- `Frontend: Dev foundation locally`

The local script uses Vite's strict-port mode so the URL stays fixed instead of silently drifting to a different port.

## Research-backed notes

- The Steam store confirms **AI-driven NPC text and voice chat**.
- Official site materials highlight **Qinghe**, **Kaifeng**, and **Hexi** as key surfaced regions.
- Community sources provide the useful NPC location and chat-resolution details, but they also come with caveats.

## Where this is going

The long-term target is not just an NPC helper.

The roadmap now expands the toolkit into a broader **Where Winds Meet companion app** with planned support for:

- quests and storyline tracking
- regions, locations, and layered map data
- factions / schools / affiliations
- items, vendors, and rewards
- skills, weapons, and build planning
- bosses, dungeons, and checklist systems

The current foundation app also includes a visible persistence bridge that imports legacy prototype favorites, progress, notes, and custom maps into a versioned storage layer for the modular migration.

It now also includes the first reviewed codex seed: source-backed region entries for Qinghe, Kaifeng, and Hexi, storyline chapters, ordered main-story quest anchors, the currently reviewed Qinghe and Kaifeng campaign ladders plus the Game8-backed Hexi campaign slice, and the first first-class Qinghe exploration / Jianghu Legacy optional routes to start the real content graph.

It also now includes a first-pass global codex search panel in the modular app, with query ranking plus domain, region, and quest-type filters across the reviewed seed.

It also now includes a graph-first flowchart workbench in the modular app, rendering the reviewed storyline spine, currently supported campaign-side branches, a Qinghe-first natural progression route, and a region/level gate overview from a renderer-neutral graph model.

The current default chart surface is a vanilla HTML/SVG graph prototype, while Mermaid remains the compatibility fallback renderer. The next strategic chart step is to keep proving the module model in Qinghe, then evaluate an `understand-anything`-style graph view without committing the app to a local path dependency or a premature React migration.

It now also surfaces that reviewed slice in a Qinghe-first layout: the opening route, optional exploration detours, Meridian Touch, and later region gates appear before migration scaffolding so the foundation behaves more like a guide and less like a status dashboard.

It now also includes compact chart filters and explicit Qinghe route modules so the main spine, exploration loop, Meridian detour, and campaign ladder behave like named structures instead of loosely related chart branches.

That progression work now explicitly treats literal `encounters` as a separate activity layer from first-class exploration routes, Jianghu Legacy detours, campaign branches, and mystic-art unlock routes.

See `docs/roadmaps/wwm-toolkit-full-product-plan.md` for the full product scope.

The active migration status lives in `docs/roadmaps/wwm-toolkit-phase-status.md`.

The documentation purpose map lives in `docs/roadmaps/wwm-toolkit-documentation-map.md`, and the dated implementation trail lives in `docs/roadmaps/wwm-toolkit-history-log.md`.

## Security

This repository now includes a dedicated security policy in `SECURITY.md`.

Current hardening highlights include:

- safer parsing of persisted browser state
- stricter custom-map validation for local uploads and migrated storage
- safer external-link handling that only permits `http` / `https` targets
- dependency and code-scanning automation for the open-source repo surface

## Map policy

This project intentionally **does not embed or copy third-party in-game map assets**.

Instead, it uses a custom fan-made overlay with approximate pins based on source-backed region routing. You can optionally upload **your own** captured or licensed regional image, which is stored locally in the browser and never bundled into the project files.

If you later want to use a licensed or self-captured map image, the coordinate data in `assets/js/data/npcs.js` is the right place to start.
