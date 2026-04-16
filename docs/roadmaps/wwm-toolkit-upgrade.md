# WWM Toolkit Upgrade Roadmap

## Goal
Transform the initial single-page manual into a polished, multi-view fan toolkit with:
- a separate archetype view
- a searchable NPC atlas
- a map overlay experience for tracked NPC locations
- source-backed research notes from official and community references

## Research highlights
- Steam store confirms `AI-driven NPC text and voice chat` and positions the world as `20+ unique regions` with `thousands of points of interest`.
- Official website highlights the currently surfaced regions `Qinghe`, `Kaifeng`, and `Hexi`.
- Game8 provides a large `List of All AI NPCs` with concrete location descriptions plus AI chat troubleshooting tips.
- Fextralife notes that its map is `not pixel-perfect`, supports shareable map coordinate links, and tracks `NPC Friends / Old Friends`.
- Fextralife `Jianghu Friends` page provides example AI-chat resolutions and confirms weekly gifts at revered friendship thresholds.
- Wand offers comprehensive checklist-style NPC map coverage, but the data is platform-hosted and not a clean embeddable dataset.

## Product direction
1. Replace the long scrolling manual with a top-level app shell and distinct views.
2. Keep the project dependency-light so it still works by opening `legacy-prototype.html` directly.
3. Use local data files instead of remote APIs to avoid fragile scraping or third-party embed issues.
4. Implement a custom fan-made map overlay with approximate region coordinates rather than copying in-game map assets.
5. Add source links and a transparency note so users know which data is official vs community-derived.

## Planned file changes
- `legacy-prototype.html` -> app shell with view switching and data-driven panels
- `assets/css/styles.css` -> full responsive redesign and UI system
- `assets/js/app.js` -> view state, rendering, filters, favorites, copy actions, map interactions
- `assets/js/data/archetypes.js` -> archetype decision content
- `assets/js/data/npcs.js` -> NPC dataset with region, type, archetype tags, and approximate map coords
- `assets/js/data/sources.js` -> source metadata and research summaries
- `README.md` -> updated project structure, usage, and research notes

## Phase 2 UX + utility pass

Delivered in the follow-up iteration:

1. Fix the hidden-view bug so only the active workspace is visibly rendered.
2. Fix atlas search focus loss by avoiding full-app rerenders during typing.
3. Add local per-NPC progress states (`Untracked`, `Working`, `Solved`).
4. Add local per-NPC notes for route reminders and alternate phrasing.
5. Add per-region custom map uploads so users can place the existing approximate pins over their own screenshots/reference images.
6. Keep uploads browser-local and continue avoiding bundled third-party map assets.

## Constraints
- Avoid embedding copyrighted third-party map imagery directly.
- Keep functionality robust on `file:///` by avoiding fetch-dependent local JSON loading.
- Treat community map coordinates as approximate.
