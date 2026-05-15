# WWM Toolkit Qinghe Source Refresh Handoff

This document is the **day-end handoff** for the current Qinghe locality and source-refresh checkpoint.

It exists so the next session can start from the verified content and editorial rules directly, instead of re-investigating the same naming drift and source disagreements from scratch.

## Why this checkpoint matters

The graph-first Qinghe workspace is already structurally useful.

What changed in this slice is the **trustworthiness of the local content layer**:

- Qinghe now has a broader and fresher source stack
- subregion and landmark coverage is denser
- locality naming is normalized explicitly instead of drifting with whichever guide was read last
- the route-window model now reflects stronger local evidence without needing another schema expansion

That makes this a good stopping point for today and a much better starting point for the next contributor.

## Current verified checkpoint

Confirmed working state in the repo:

- `56` indexed codex entries across `3` regions, `31` quests, `3` storylines, and `19` sources
- `8` graph definitions for progression, storyline, and campaign slices
- Qinghe carries `3` structured subregions plus `7` route windows
- the flowchart layer still uses the renderer-neutral quest graph with vanilla HTML/SVG default rendering and Mermaid fallback
- the Qinghe guide and local route-window surfaces now show richer locality copy, landmark lists, and module summaries
- the raw evidence notes now record explicit source precedence and naming normalization rules for Qinghe

## What is now stable enough to trust

### 1. Locality naming should stay normalized

Use these as the canonical reviewed forms unless stronger official evidence overrides them later:

- `Moonveil Mountain`
- `Sundara Land`
- `Crimson Cliff`

Plural or alternate community variants can still be recorded as aliases, but they should not replace the canonical names casually.

### 2. `Stonewash Strand` belongs to Verdant Wilds in the reviewed seed

This is the most important locality correction from the slice.

Do not drift it back into Moonveil context just because some broader walkthrough text groups it loosely with nearby progression beats.

### 3. Game8's April 2026 subregion guides are the primary local-area references

For Qinghe locality and named-area coverage, the current source-precedence rule is:

1. official site material for top-level world framing
2. Game8 Qinghe / Verdant Wilds / Moonveil Mountain / Sundara Land guides for local area naming and route locality
3. Fextralife for broader exploration and quest-family framing
4. Game Rant / DualShockers as secondary cross-checks

### 4. The current quest taxonomy compromise is intentional

`White Bird Shooting` and `The Shameless` remain `exploration` entries.

The newer Verdant-local sources make them read more like tightly local activities or injustices, but the seed keeps the broader exploration classification until stronger direct category evidence says otherwise.

### 5. Search already indexes the richer Qinghe model

The current search layer already benefits from the improved locality data because it indexes region summaries, subregion details, and route windows.

That means deeper named-area coverage is already discoverable without adding a new schema field.

## Recommended next slice

The next session should stay focused and avoid trying to do three strategic passes at once.

Recommended order:

### 1. Add alias-aware search for normalized names

Best candidate follow-up:

- support queries like `Moonveil Mountains`, `Sundara Lands`, or `Crimson Cliffs` intentionally
- keep the editorially normalized names as canonical display text
- avoid quietly reintroducing naming drift in the data just to satisfy search behavior

### 2. Improve source readability in the codex UI

Qinghe's source list is now broad enough that the UI should eventually help the reader understand:

- which sources are primary vs secondary
- when each source was last reviewed
- why multiple sources are attached to the same locality or quest

This can be a small polish slice, not a redesign crusade.

### 3. Keep the structural split active

The content got better, but `app/src/app/renderFoundationApp.ts` is still too large.

Do not let the stronger Qinghe slice become an excuse to postpone the ownership split indefinitely.

### 4. Only then choose the next expansion lane

After the search/UI polish and ownership situation are clearer, choose one of these deliberately:

- broaden reviewed non-campaign optional-route coverage in Kaifeng or Hexi
- begin the separate literal-encounter normalization pass

Do not mix both at once.

## Suggested starting checklist for the next chat

1. read `docs/roadmaps/wwm-toolkit-phase-status.md`
2. read `docs/roadmaps/wwm-toolkit-history-log.md`
3. read this handoff and the older `docs/roadmaps/wwm-toolkit-qinghe-modularity-checkpoint-handoff.md`
4. review `content/raw/region-seed-evidence.md` and `content/raw/quest-storyline-seed-evidence.md` before changing Qinghe naming or source precedence
5. if doing search polish, inspect `app/src/lib/search/codexSearch.ts` first
6. if doing UI polish, inspect `app/src/app/renderFoundationApp.ts` and the current Qinghe/source detail surfaces first

## Current validation state

Verified at this checkpoint:

- `npm run test` passed: `50/50`
- `npm run lint` passed
- `npm run build` passed
- browser verification confirmed:
  - `56 indexed codex entries`
  - expanded Qinghe locality copy in the guide and route-window surfaces
  - the refreshed search coverage, including deeper Qinghe place names

Preview URL during this checkpoint:

- `http://127.0.0.1:4173/`

## Key files for the next contributor

- `app/src/data/content/sources.ts`
- `app/src/data/content/regions.ts`
- `app/src/data/content/quests.ts`
- `app/src/lib/search/codexSearch.ts`
- `app/src/app/renderFoundationApp.ts`
- `content/raw/region-seed-evidence.md`
- `content/raw/quest-storyline-seed-evidence.md`
- `tests/codexSearch.test.ts`

## Bottom line

Today ended at a good checkpoint.

Qinghe is no longer just a useful graph demo; it is now a better-grounded locality and source model too.

The next move should be:

1. **polish search/readability around the normalized Qinghe data**
2. **keep the structural split alive**
3. **only then broaden the next reviewed content lane**