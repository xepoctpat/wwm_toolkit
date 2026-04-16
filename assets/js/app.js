const archetypes = Array.isArray(window.WWM_ARCHETYPES) ? [...window.WWM_ARCHETYPES] : [];
const npcs = Array.isArray(window.WWM_NPCS) ? [...window.WWM_NPCS] : [];
const sources = Array.isArray(window.WWM_SOURCES) ? [...window.WWM_SOURCES] : [];

const viewIds = ["dashboard", "atlas", "map", "archetypes", "sources"];
const regions = [...new Set(npcs.map((npc) => npc.region))];
const interactionTypes = [...new Set(npcs.map((npc) => npc.interactionType))];

const archetypeMap = new Map(archetypes.map((entry) => [entry.id, entry]));
const npcMap = new Map(npcs.map((entry) => [entry.id, entry]));
const sourceMap = new Map(sources.map((entry) => [entry.id, entry]));

const progressMeta = Object.freeze({
    untracked: { id: "untracked", label: "Untracked", emoji: "○", className: "untracked" },
    working: { id: "working", label: "Working", emoji: "◔", className: "working" },
    solved: { id: "solved", label: "Solved", emoji: "✓", className: "solved" },
});

const progressStatuses = Object.keys(progressMeta);

const regionMeta = {
    Qinghe: {
        description: "Qinghe is still the cleanest routing zone for repeat NPC affinity loops, with strong density in Heaven's Pier, General's Shrine, Halo Peak, and Mercyheart Town.",
        hotRoute: ["Heaven's Pier", "General's Shrine", "Mercyheart Town"],
        note: "Community sources repeatedly treat Qinghe as the fastest loop for Old Friends and AI chat experiments.",
        landmarks: [
            { name: "Heaven's Pier", x: 16, y: 66 },
            { name: "General's Shrine", x: 52, y: 54 },
            { name: "Mercyheart Town", x: 23, y: 26 },
            { name: "Halo Peak", x: 38, y: 14 },
        ],
    },
    Kaifeng: {
        description: "Kaifeng currently behaves like a dense urban routing zone, especially around Velvet Shade and Revelry Hall where many NPCs cluster vertically indoors.",
        hotRoute: ["Velvet Shade", "Revelry Hall", "Springwave Pavilion"],
        note: "Kaifeng is best treated as a cluster map: fewer long rides, more stacked indoor NPC routes.",
        landmarks: [
            { name: "Velvet Shade", x: 56, y: 44 },
            { name: "Revelry Hall", x: 51, y: 41 },
            { name: "Springwave Pavilion", x: 66, y: 50 },
            { name: "City Docks", x: 40, y: 60 },
        ],
    },
    Hexi: {
        description: "Hexi spreads wider than Qinghe and benefits from landmark-oriented routing around Lost Crossing, Jade-Mirrored Spring, and Steed's Pass.",
        hotRoute: ["Lost Crossing", "Jade-Mirrored Spring", "Steed's Pass"],
        note: "Official sources frame Hexi as a major live region, while community guides still treat several pins as evolving.",
        landmarks: [
            { name: "Lost Crossing", x: 28, y: 45 },
            { name: "Karez Stone", x: 23, y: 49 },
            { name: "Jade-Mirrored Spring", x: 58, y: 26 },
            { name: "Steed's Pass", x: 70, y: 54 },
        ],
    },
};

const regionReferences = {
    Qinghe: [
        { title: "Game8 AI NPC index", body: "Location descriptions, region filters, and chat reset advice.", sourceId: "game8-npcs" },
        { title: "Fextralife interactive map", body: "Community pin groups and map-coordinate sharing, with approximate placement caveats.", sourceId: "fextra-map" },
        { title: "Jianghu Friends hints", body: "Direct AI-chat win conditions for several Qinghe NPCs.", sourceId: "fextra-jianghu" },
    ],
    Kaifeng: [
        { title: "Wand Kaifeng checklist", body: "Good for confirming Kaifeng's dense NPC checklist mindset and major city clusters.", sourceId: "wand-kaifeng" },
        { title: "Fextralife interactive map", body: "Useful for comparing Kaifeng category coverage and deep-link behavior.", sourceId: "fextra-map" },
        { title: "Official site", body: "Use for world framing and current region prominence, not fine-grained NPC routing.", sourceId: "official-site" },
    ],
    Hexi: [
        { title: "Steam store page", body: "Best official source for AI-NPC disclosure and world-scale claims.", sourceId: "official-steam" },
        { title: "Game8 AI NPC index", body: "Most usable Hexi location descriptions in the sources pulled for this toolkit.", sourceId: "game8-npcs" },
        { title: "Fextralife interactive map", body: "Confirms Hexi has a separate region map and category coverage, though pins remain approximate.", sourceId: "fextra-map" },
    ],
};

const storageKey = "wwm-toolkit-state-v4";
let persistTimer = 0;

function createDefaultState() {
    return {
        view: "dashboard",
        selectedNpcId: npcs[0]?.id ?? null,
        selectedArchetypeId: archetypes[0]?.id ?? null,
        atlasSearch: "",
        atlasRegion: "All",
        atlasInteraction: "All",
        atlasArchetype: "All",
        atlasStatus: "All",
        favorites: [],
        favoritesOnly: false,
        mapRegion: npcs[0]?.region ?? regions[0] ?? "Qinghe",
        npcProgress: {},
        npcNotes: {},
        customMaps: {},
    };
}

function loadState() {
    const defaults = createDefaultState();

    try {
        const savedState = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}");
        const npcProgress = Object.fromEntries(
            Object.entries(savedState.npcProgress ?? {}).filter(([npcId, status]) => npcMap.has(npcId) && progressStatuses.includes(status)),
        );
        const npcNotes = Object.fromEntries(
            Object.entries(savedState.npcNotes ?? {}).filter(([npcId, note]) => npcMap.has(npcId) && typeof note === "string"),
        );
        const customMaps = Object.fromEntries(
            Object.entries(savedState.customMaps ?? {}).filter(([region, dataUrl]) => regions.includes(region) && typeof dataUrl === "string" && dataUrl.length > 0),
        );

        return {
            ...defaults,
            ...savedState,
            view: viewIds.includes(savedState.view) ? savedState.view : defaults.view,
            selectedNpcId: npcMap.has(savedState.selectedNpcId) ? savedState.selectedNpcId : defaults.selectedNpcId,
            selectedArchetypeId: archetypeMap.has(savedState.selectedArchetypeId) ? savedState.selectedArchetypeId : defaults.selectedArchetypeId,
            atlasRegion: savedState.atlasRegion === "All" || regions.includes(savedState.atlasRegion) ? savedState.atlasRegion : defaults.atlasRegion,
            atlasInteraction: savedState.atlasInteraction === "All" || interactionTypes.includes(savedState.atlasInteraction)
                ? savedState.atlasInteraction
                : defaults.atlasInteraction,
            atlasArchetype: savedState.atlasArchetype === "All" || archetypeMap.has(savedState.atlasArchetype)
                ? savedState.atlasArchetype
                : defaults.atlasArchetype,
            atlasStatus: savedState.atlasStatus === "All" || progressStatuses.includes(savedState.atlasStatus)
                ? savedState.atlasStatus
                : defaults.atlasStatus,
            favorites: Array.isArray(savedState.favorites)
                ? savedState.favorites.filter((id) => npcMap.has(id))
                : defaults.favorites,
            mapRegion: regions.includes(savedState.mapRegion) ? savedState.mapRegion : defaults.mapRegion,
            npcProgress,
            npcNotes,
            customMaps,
        };
    } catch (error) {
        console.warn("Unable to load saved toolkit state, using defaults instead.", error);
        return defaults;
    }
}

const state = loadState();

function persistState() {
    window.clearTimeout(persistTimer);

    try {
        window.localStorage.setItem(storageKey, JSON.stringify(state));
        return true;
    } catch (error) {
        console.warn("Unable to persist toolkit state.", error);
        return false;
    }
}

function schedulePersist(delay = 240) {
    window.clearTimeout(persistTimer);
    persistTimer = window.setTimeout(() => {
        void persistState();
    }, delay);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function getNpc(id) {
    return npcMap.get(id) ?? null;
}

function getArchetype(id) {
    return archetypeMap.get(id) ?? null;
}

function getSource(id) {
    return sourceMap.get(id) ?? null;
}

function getNpcStatus(id) {
    return progressStatuses.includes(state.npcProgress[id]) ? state.npcProgress[id] : "untracked";
}

function getNpcNote(id) {
    return typeof state.npcNotes[id] === "string" ? state.npcNotes[id] : "";
}

function getCustomMap(region) {
    return typeof state.customMaps[region] === "string" ? state.customMaps[region] : "";
}

function getProgressCounts() {
    return npcs.reduce(
        (counts, npc) => {
            counts[getNpcStatus(npc.id)] += 1;
            return counts;
        },
        { untracked: 0, working: 0, solved: 0 },
    );
}

function getCustomMapCount() {
    return regions.filter((region) => Boolean(getCustomMap(region))).length;
}

function countBy(items, selector) {
    return items.reduce((accumulator, item) => {
        const key = selector(item);
        accumulator[key] = (accumulator[key] ?? 0) + 1;
        return accumulator;
    }, {});
}

function getHotspots(limit = 3) {
    const counts = countBy(npcs, (npc) => `${npc.region} • ${npc.subregion}`);

    return Object.entries(counts)
        .map(([label, count]) => ({ label, count }))
        .sort((left, right) => right.count - left.count)
        .slice(0, limit);
}

function syncSelectedNpcFromList(list) {
    if (!list.length) {
        return false;
    }

    const hasCurrentSelection = list.some((npc) => npc.id === state.selectedNpcId);
    if (hasCurrentSelection) {
        return false;
    }

    state.selectedNpcId = list[0].id;
    state.selectedArchetypeId = list[0].archetypeId;
    return true;
}

function getFilteredNpcs() {
    const search = state.atlasSearch.trim().toLowerCase();

    return npcs.filter((npc) => {
        if (state.atlasRegion !== "All" && npc.region !== state.atlasRegion) {
            return false;
        }

        if (state.atlasInteraction !== "All" && npc.interactionType !== state.atlasInteraction) {
            return false;
        }

        if (state.atlasArchetype !== "All" && npc.archetypeId !== state.atlasArchetype) {
            return false;
        }

        if (state.atlasStatus !== "All" && getNpcStatus(npc.id) !== state.atlasStatus) {
            return false;
        }

        if (state.favoritesOnly && !state.favorites.includes(npc.id)) {
            return false;
        }

        if (!search) {
            return true;
        }

        const haystack = [
            npc.name,
            npc.region,
            npc.area,
            npc.subregion,
            npc.location,
            npc.notes,
            npc.interactionType,
            getNpcNote(npc.id),
        ].join(" ").toLowerCase();

        return haystack.includes(search);
    });
}

function isFavorite(id) {
    return state.favorites.includes(id);
}

function updateSelectedNpc(id) {
    const npc = getNpc(id);
    if (!npc) {
        return false;
    }

    state.selectedNpcId = npc.id;
    state.selectedArchetypeId = npc.archetypeId;
    state.mapRegion = npc.region;
    return true;
}

function updateSelectedArchetype(id) {
    if (!archetypeMap.has(id)) {
        return false;
    }

    state.selectedArchetypeId = id;
    return true;
}

function setView(view) {
    if (!viewIds.includes(view)) {
        return false;
    }

    const changed = state.view !== view;
    state.view = view;
    return changed;
}

function toggleFavoriteState(id) {
    if (!npcMap.has(id)) {
        return false;
    }

    if (isFavorite(id)) {
        state.favorites = state.favorites.filter((favoriteId) => favoriteId !== id);
    } else {
        state.favorites = [...state.favorites, id];
    }

    return true;
}

function setNpcStatusState(id, status) {
    if (!npcMap.has(id) || !progressStatuses.includes(status)) {
        return false;
    }

    if (status === "untracked") {
        delete state.npcProgress[id];
    } else {
        state.npcProgress[id] = status;
    }

    return true;
}

function setNpcNoteState(id, note) {
    if (!npcMap.has(id)) {
        return false;
    }

    const nextNote = String(note ?? "");
    if (nextNote.trim()) {
        state.npcNotes[id] = nextNote;
    } else {
        delete state.npcNotes[id];
    }

    return true;
}

function setMapRegionState(region) {
    if (!regions.includes(region)) {
        return false;
    }

    state.mapRegion = region;
    syncSelectedNpcFromList(npcs.filter((npc) => npc.region === region));
    return true;
}

function focusAtlasSearch(cursorPosition = null) {
    window.requestAnimationFrame(() => {
        const input = document.getElementById("atlas-search");
        if (!input) {
            return;
        }

        input.focus();
        if (typeof cursorPosition === "number") {
            input.setSelectionRange(cursorPosition, cursorPosition);
        }
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, left: 0 });
}

function confidenceClass(confidence) {
    return confidence === "high" ? "high" : "medium";
}

function renderTag(text) {
    return `<span class="tag">${escapeHtml(text)}</span>`;
}

function renderStatusPill(status) {
    const meta = progressMeta[status] ?? progressMeta.untracked;
    return `<span class="status-pill status-pill--${meta.className}">${meta.emoji} ${meta.label}</span>`;
}

function renderSourceLink(sourceId) {
    const source = getSource(sourceId);
    if (!source) {
        return "";
    }

    return `
        <a class="source-chip" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer noopener">
            ${escapeHtml(source.title)} ↗
        </a>
    `;
}

function buildNpcBrief(npc) {
    const archetype = getArchetype(npc.archetypeId);
    const opener = archetype?.playbook?.[0]?.text ?? "Use a short, direct opener and mirror the NPC hint.";
    const note = getNpcNote(npc.id).trim();

    return [
        `${npc.name} — ${npc.region} / ${npc.subregion}`,
        `Location: ${npc.location}`,
        `Interaction: ${npc.interactionType}`,
        archetype ? `Archetype: ${archetype.name}` : null,
        `Recommended opener: ${opener}`,
        `Win condition: ${npc.winCondition}`,
        note ? `My note: ${note}` : null,
    ].filter(Boolean).join("\n");
}

function renderNpcCard(npc, isActive) {
    const archetype = getArchetype(npc.archetypeId);
    const note = getNpcNote(npc.id);
    const status = getNpcStatus(npc.id);

    return `
        <div class="npc-card-row">
            <button class="npc-card ${isActive ? "active" : ""}" type="button" data-action="open-npc" data-id="${escapeHtml(npc.id)}">
                <p class="npc-card-eyebrow">${escapeHtml(npc.region)} • ${escapeHtml(npc.subregion)}</p>
                <h3 class="npc-card-name">${escapeHtml(npc.name)}</h3>
                <p class="npc-card-location">${escapeHtml(npc.location)}</p>
                <div class="npc-meta">
                    ${renderTag(npc.interactionType)}
                    ${archetype ? renderTag(`${archetype.emoji} ${archetype.name}`) : ""}
                    ${renderStatusPill(status)}
                    ${note.trim() ? renderTag("📝 Note") : ""}
                    ${renderTag(npc.confidence === "high" ? "High confidence" : "Community-inferred")}
                </div>
            </button>
            <button class="icon-button ${isFavorite(npc.id) ? "is-active" : ""}" type="button" aria-label="${isFavorite(npc.id) ? "Remove from favorites" : "Add to favorites"}" data-action="toggle-favorite" data-id="${escapeHtml(npc.id)}">
                ${isFavorite(npc.id) ? "★" : "☆"}
            </button>
        </div>
    `;
}

function renderNpcDetail(npc) {
    if (!npc) {
        return `
            <div class="empty-state">
                No NPC matches the current filters. Try broadening the region, archetype, interaction type, or progress filter.
            </div>
        `;
    }

    const archetype = getArchetype(npc.archetypeId);
    const opening = archetype?.playbook?.[0]?.text ?? "Start with a short, positive reply and adapt to the hint.";
    const note = getNpcNote(npc.id);
    const status = getNpcStatus(npc.id);
    const sourceLinks = npc.sourceIds.map(renderSourceLink).join("");

    return `
        <div class="detail-header">
            <div>
                <p class="detail-kicker">${escapeHtml(npc.region)} • ${escapeHtml(npc.area)}</p>
                <h2 class="detail-heading">${escapeHtml(npc.name)}</h2>
                <p class="detail-lead">${escapeHtml(npc.notes)}</p>
            </div>
            <span class="confidence-badge ${confidenceClass(npc.confidence)}">${npc.confidence === "high" ? "High confidence" : "Community inferred"}</span>
        </div>

        <div class="tag-row">
            ${renderTag(npc.interactionType)}
            ${archetype ? renderTag(`${archetype.emoji} ${archetype.name}`) : ""}
            ${renderTag(npc.subregion)}
            ${renderStatusPill(status)}
        </div>

        <div class="detail-actions">
            <button class="primary-button" type="button" data-action="copy-text" data-copy="${escapeHtml(opening)}">Copy recommended opener</button>
            <button class="secondary-button" type="button" data-action="copy-brief" data-id="${escapeHtml(npc.id)}">Copy full brief</button>
            <button class="secondary-button" type="button" data-action="open-npc" data-id="${escapeHtml(npc.id)}" data-target-view="map">Focus on map</button>
            <button class="secondary-button" type="button" data-action="select-archetype" data-id="${escapeHtml(npc.archetypeId)}" data-target-view="archetypes">Open archetype lab</button>
        </div>

        <div class="detail-section">
            <h3>Route note</h3>
            <p><strong>Exact spot:</strong> ${escapeHtml(npc.location)}</p>
            <p><strong>Win condition:</strong> ${escapeHtml(npc.winCondition)}</p>
        </div>

        <div class="detail-section">
            <h3>Progress</h3>
            <div class="status-button-group">
                ${progressStatuses.map((progressId) => {
                    const meta = progressMeta[progressId];
                    return `
                        <button class="status-button ${status === progressId ? `is-active is-${meta.className}` : ""}" type="button" data-action="set-status" data-id="${escapeHtml(npc.id)}" data-status="${progressId}">
                            ${meta.emoji} ${escapeHtml(meta.label)}
                        </button>
                    `;
                }).join("")}
            </div>
            <p class="muted-text">Track whether a route still needs testing, is in progress, or is completely solved for your own run.</p>
        </div>

        <div class="detail-section">
            <h3>Field notes</h3>
            <textarea id="npc-note-textarea" class="note-textarea" data-note-id="${escapeHtml(npc.id)}" rows="6" placeholder="Add your own reminder, alternate phrasing, or route note here…">${escapeHtml(note)}</textarea>
            <div class="note-meta">
                <span class="muted-text">Stored locally in this browser. Handy for “this NPC only worked after I mentioned the boat” moments.</span>
                ${note.trim() ? `<button class="text-button" type="button" data-action="clear-note" data-id="${escapeHtml(npc.id)}">Clear note</button>` : ""}
            </div>
        </div>

        <div class="detail-section">
            <h3>Recommended conversation ladder</h3>
            <div class="reply-stack">
                ${(archetype?.playbook ?? []).map((step) => `
                    <article class="reply-card">
                        <div class="reply-card-header">
                            <p class="reply-card-title">${escapeHtml(step.title)}</p>
                            <button class="copy-button" type="button" data-action="copy-text" data-copy="${escapeHtml(step.text)}">Copy line</button>
                        </div>
                        <p class="reply-card-body">${escapeHtml(step.text)}</p>
                    </article>
                `).join("")}
            </div>
        </div>

        <div class="detail-section">
            <h3>Source trail</h3>
            <div class="source-chip-grid">${sourceLinks}</div>
        </div>
    `;
}

function renderDashboard() {
    const aiChatCount = npcs.filter((npc) => npc.interactionType === "AI Chat").length;
    const hotspots = getHotspots();
    const progress = getProgressCounts();
    const customMapCount = getCustomMapCount();

    document.getElementById("dashboard-content").innerHTML = `
        <div class="hero-grid">
            <section class="hero-panel">
                <p class="eyebrow">Research-backed fan build</p>
                <h2 class="hero-title">Guide the conversation. Track the world.</h2>
                <p class="hero-copy">
                    Official sources confirm that <strong>Where Winds Meet</strong> uses AI-driven NPC text and voice chat,
                    while community guides fill in the routing details. This toolkit now adds local progress tracking, personal notes,
                    and bring-your-own map overlays so your route planning can be a little less chaotic and a lot more useful.
                </p>
                <div class="pill-row">
                    <span class="pill is-highlight">Official AI disclosure confirmed</span>
                    <span class="pill">${npcs.length} tracked NPC entries</span>
                    <span class="pill">${progress.solved} locally solved routes</span>
                    <span class="pill">${customMapCount} custom map${customMapCount === 1 ? "" : "s"} loaded</span>
                </div>
                <div class="hero-actions">
                    <button class="primary-button" type="button" data-view="atlas">Open NPC Atlas</button>
                    <button class="secondary-button" type="button" data-view="map">Open Map Overlay</button>
                    <button class="secondary-button" type="button" data-view="archetypes">Launch Archetype Lab</button>
                </div>
            </section>

            <div class="callout-stack">
                <article class="stack-card">
                    <h3>Fastest current Qinghe loop</h3>
                    <p>For quick affinity farming, the cleanest loop is still <strong>Heaven's Pier → General's Shrine → Mercyheart Town</strong>.</p>
                    <ul>
                        <li>Heaven's Pier gives you multiple AI chat NPCs packed around a short walk.</li>
                        <li>General's Shrine adds authority- and warrior-style conversations in one cluster.</li>
                        <li>Mercyheart Town finishes with duty- and family-driven routes.</li>
                    </ul>
                </article>
                <article class="stack-card">
                    <h3>Bring your own map overlay</h3>
                    <p>
                        The map view now accepts your own regional screenshot or reference image, stored locally, with the toolkit pins layered on top.
                        That gives you the closest thing to an in-game map overlay without copying third-party map assets.
                    </p>
                </article>
            </div>
        </div>

        <div class="kpi-grid">
            <article class="kpi-card"><p class="kpi-label">Tracked NPCs</p><p class="kpi-value">${npcs.length}</p></article>
            <article class="kpi-card"><p class="kpi-label">AI Chat routes</p><p class="kpi-value">${aiChatCount}</p></article>
            <article class="kpi-card"><p class="kpi-label">Solved routes</p><p class="kpi-value">${progress.solved}</p></article>
            <article class="kpi-card"><p class="kpi-label">In progress</p><p class="kpi-value">${progress.working}</p></article>
            <article class="kpi-card"><p class="kpi-label">Custom maps</p><p class="kpi-value">${customMapCount}</p></article>
            <article class="kpi-card"><p class="kpi-label">Research sources</p><p class="kpi-value">${sources.length}</p></article>
        </div>

        <div class="stack-grid">
            <article class="stack-card">
                <h3>Region hotspots</h3>
                <p>These are still the densest clusters in the current local dataset.</p>
                <ul>
                    ${hotspots.map((spot) => `<li><strong>${escapeHtml(spot.label)}</strong> — ${spot.count} tracked entries</li>`).join("")}
                </ul>
            </article>
            <article class="stack-card">
                <h3>AI chat rules that keep paying rent</h3>
                <ul>
                    <li>Read the NPC hint box before improvising.</li>
                    <li>Reset the dialogue when the conversation loops instead of trying to brute-force it.</li>
                    <li>If combat starts unexpectedly, break out and reset the encounter instead of digging the hole deeper.</li>
                    <li>Match the NPC's tone before you chase the win condition.</li>
                </ul>
            </article>
            <article class="stack-card">
                <h3>Local tracking, minus the nonsense</h3>
                <ul>
                    <li>Mark an NPC as untracked, working, or solved.</li>
                    <li>Save your own phrasing notes locally in the browser.</li>
                    <li>Upload a region image and keep pins on top of it.</li>
                    <li>Favorite frequently used NPCs for faster jumps.</li>
                </ul>
            </article>
            <article class="stack-card">
                <h3>What improved in this pass</h3>
                <ul>
                    <li>Only the active view now renders visibly—no more accidental mega-scroll stack.</li>
                    <li>Atlas search keeps focus while filtering instead of ejecting you after one character.</li>
                    <li>Detail panels now support personal notes and route state.</li>
                    <li>Map view supports local image overlays for region-specific planning.</li>
                </ul>
            </article>
        </div>
    `;
}

function renderAtlas() {
    const filteredNpcs = getFilteredNpcs();
    const selectedNpc = filteredNpcs.find((npc) => npc.id === state.selectedNpcId) ?? filteredNpcs[0] ?? null;

    document.getElementById("atlas-content").innerHTML = `
        <section class="toolbar">
            <div class="toolbar-row">
                <label class="control">
                    <span class="control-label">Search</span>
                    <input id="atlas-search" class="control-input" type="text" placeholder="Search NPC, region, area, note, or clue…" value="${escapeHtml(state.atlasSearch)}" />
                </label>
                <label class="control">
                    <span class="control-label">Region</span>
                    <select id="atlas-region-select" class="control-input">
                        <option value="All">All regions</option>
                        ${regions.map((region) => `<option value="${escapeHtml(region)}" ${state.atlasRegion === region ? "selected" : ""}>${escapeHtml(region)}</option>`).join("")}
                    </select>
                </label>
                <label class="control">
                    <span class="control-label">Interaction</span>
                    <select id="atlas-interaction-select" class="control-input">
                        <option value="All">All types</option>
                        ${interactionTypes.map((type) => `<option value="${escapeHtml(type)}" ${state.atlasInteraction === type ? "selected" : ""}>${escapeHtml(type)}</option>`).join("")}
                    </select>
                </label>
                <label class="control">
                    <span class="control-label">Archetype</span>
                    <select id="atlas-archetype-select" class="control-input">
                        <option value="All">All archetypes</option>
                        ${archetypes.map((archetype) => `<option value="${escapeHtml(archetype.id)}" ${state.atlasArchetype === archetype.id ? "selected" : ""}>${escapeHtml(archetype.emoji)} ${escapeHtml(archetype.name)}</option>`).join("")}
                    </select>
                </label>
                <label class="control">
                    <span class="control-label">Progress</span>
                    <select id="atlas-status-select" class="control-input">
                        <option value="All">All progress</option>
                        ${progressStatuses.map((status) => `<option value="${status}" ${state.atlasStatus === status ? "selected" : ""}>${escapeHtml(progressMeta[status].label)}</option>`).join("")}
                    </select>
                </label>
                <div class="filter-actions">
                    <button class="action-button" type="button" data-action="toggle-favorites-only">${state.favoritesOnly ? "★ Favorites only" : "☆ Favorites only"}</button>
                    <button class="secondary-button" type="button" data-action="reset-filters">Reset</button>
                </div>
            </div>
        </section>

        <div class="atlas-grid">
            <section class="list-panel">
                <div class="detail-header">
                    <div>
                        <p class="detail-kicker">Searchable atlas</p>
                        <h2 class="section-heading">NPC Explorer</h2>
                        <p class="muted-text">Filter by region, interaction style, archetype, or your own progress state.</p>
                    </div>
                    <span class="confidence-badge medium">${filteredNpcs.length} result${filteredNpcs.length === 1 ? "" : "s"}</span>
                </div>
                ${filteredNpcs.length
                    ? `<div class="npc-list">${filteredNpcs.map((npc) => renderNpcCard(npc, selectedNpc?.id === npc.id)).join("")}</div>`
                    : `<div class="empty-state">No matches right now. Try clearing favorites-only mode, loosening the archetype filter, or resetting progress filters.</div>`}
            </section>

            <section class="detail-panel">
                ${renderNpcDetail(selectedNpc)}
            </section>
        </div>
    `;
}

function renderMap() {
    const mapRegion = regions.includes(state.mapRegion) ? state.mapRegion : regions[0];
    const meta = regionMeta[mapRegion];
    const regionNpcs = npcs.filter((npc) => npc.region === mapRegion);
    const selectedNpc = regionNpcs.find((npc) => npc.id === state.selectedNpcId) ?? regionNpcs[0] ?? null;
    const selectedArchetype = selectedNpc ? getArchetype(selectedNpc.archetypeId) : null;
    const references = regionReferences[mapRegion] ?? [];
    const customMap = getCustomMap(mapRegion);
    const selectedNote = selectedNpc ? getNpcNote(selectedNpc.id).trim() : "";
    const favoritesInRegion = state.favorites.map((id) => getNpc(id)).filter((npc) => npc && npc.region === mapRegion);

    document.getElementById("map-content").innerHTML = `
        <section class="panel">
            <p class="eyebrow">Approximate overlay</p>
            <div class="detail-header">
                <div>
                    <h2 class="section-heading">${escapeHtml(mapRegion)} regional routing board</h2>
                    <p class="muted-text">${escapeHtml(meta.description)}</p>
                </div>
                <div class="region-switcher">
                    ${regions.map((region) => `
                        <button class="chip-button ${mapRegion === region ? "active" : ""}" type="button" data-action="set-map-region" data-region="${escapeHtml(region)}">
                            ${escapeHtml(region)}
                        </button>
                    `).join("")}
                </div>
            </div>

            <div class="map-toolbar">
                <div>
                    <p class="muted-text">Upload your own region screenshot or reference image to place the tracked pins on top. Stored locally in your browser only.</p>
                </div>
                <div class="map-actions">
                    <label class="secondary-button upload-button">
                        ${customMap ? "Replace custom map" : "Upload custom map"}
                        <input class="visually-hidden" type="file" accept="image/*" data-action="upload-map" data-region="${escapeHtml(mapRegion)}" />
                    </label>
                    ${customMap ? `<button class="action-button" type="button" data-action="clear-map" data-region="${escapeHtml(mapRegion)}">Remove custom map</button>` : ""}
                </div>
            </div>
        </section>

        <div class="map-layout">
            <section class="map-board-card">
                <div class="tag-row">
                    <span class="tag">${regionNpcs.length} tracked pins</span>
                    <span class="tag">Hot route: ${escapeHtml(meta.hotRoute.join(" → "))}</span>
                    <span class="tag">${customMap ? "Custom map loaded" : "Abstract board mode"}</span>
                </div>

                <div class="map-board region-${escapeHtml(mapRegion.toLowerCase())} ${customMap ? "has-custom-map" : ""}" aria-label="${escapeHtml(mapRegion)} route map">
                    ${customMap ? `<div class="map-skin" style="background-image: url(${customMap});" aria-hidden="true"></div>` : ""}
                    ${meta.landmarks.map((landmark) => `
                        <span class="map-landmark" style="left: ${landmark.x}%; top: ${landmark.y}%">${escapeHtml(landmark.name)}</span>
                    `).join("")}
                    ${regionNpcs.map((npc) => `
                        <button class="map-pin ${selectedNpc?.id === npc.id ? "active" : ""}" type="button" style="left: ${npc.mapX}%; top: ${npc.mapY}%" data-action="open-npc" data-id="${escapeHtml(npc.id)}">
                            ${selectedNpc?.id === npc.id ? `<span class="pin-label">${escapeHtml(npc.name)}</span>` : ""}
                        </button>
                    `).join("")}
                </div>

                <p class="map-note">
                    ${escapeHtml(meta.note)} Pins stay approximate even when a custom image is loaded, so use this as a routing aid rather than a pixel-perfect truth machine.
                </p>

                <div class="reference-grid">
                    ${references.map((reference) => {
                        const source = getSource(reference.sourceId);
                        return source
                            ? `
                                <a class="reference-card" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer noopener">
                                    <strong>${escapeHtml(reference.title)}</strong>
                                    <span>${escapeHtml(reference.body)}</span>
                                </a>
                            `
                            : "";
                    }).join("")}
                </div>
            </section>

            <aside class="map-sidebar">
                <h3>Selected pin</h3>
                ${selectedNpc ? `
                    <p class="detail-lead"><strong>${escapeHtml(selectedNpc.name)}</strong> — ${escapeHtml(selectedNpc.location)}</p>
                    <div class="tag-row">
                        ${renderTag(selectedNpc.interactionType)}
                        ${selectedArchetype ? renderTag(`${selectedArchetype.emoji} ${selectedArchetype.name}`) : ""}
                        ${renderStatusPill(getNpcStatus(selectedNpc.id))}
                    </div>
                    <div class="detail-actions">
                        <button class="primary-button" type="button" data-action="open-npc" data-id="${escapeHtml(selectedNpc.id)}" data-target-view="atlas">Open full NPC card</button>
                        ${selectedArchetype ? `<button class="secondary-button" type="button" data-action="select-archetype" data-id="${escapeHtml(selectedArchetype.id)}" data-target-view="archetypes">Open matching archetype</button>` : ""}
                    </div>
                    <ul class="detail-list">
                        <li><strong>Area:</strong> ${escapeHtml(selectedNpc.area)}</li>
                        <li><strong>Subregion:</strong> ${escapeHtml(selectedNpc.subregion)}</li>
                        <li><strong>Win note:</strong> ${escapeHtml(selectedNpc.winCondition)}</li>
                    </ul>
                    ${selectedNote ? `
                        <div class="detail-section">
                            <h3>Saved note</h3>
                            <div class="note-preview">${escapeHtml(selectedNote)}</div>
                        </div>
                    ` : ""}
                ` : `<div class="empty-state">No NPC pins are available for this region yet.</div>`}

                <div class="detail-section">
                    <h3>Legend</h3>
                    <div class="legend-list">
                        <span class="legend-chip">Blue pin: tracked NPC</span>
                        <span class="legend-chip">Gold pin: current selection</span>
                        <span class="legend-chip">Dark chips: landmark anchors</span>
                    </div>
                </div>

                <div class="detail-section">
                    <h3>Favorite route in this region</h3>
                    ${favoritesInRegion.length
                        ? `<div class="match-list">${favoritesInRegion.map((npc) => `
                            <button class="match-chip" type="button" data-action="open-npc" data-id="${escapeHtml(npc.id)}">
                                ${escapeHtml(npc.name)}
                            </button>
                        `).join("")}</div>`
                        : `<p class="muted-text">Favorite a few NPCs from the atlas and they will show up here as a mini route list.</p>`}
                </div>
            </aside>
        </div>
    `;
}

function renderArchetypes() {
    const activeArchetype = getArchetype(state.selectedArchetypeId) ?? archetypes[0];
    const matches = npcs.filter((npc) => npc.archetypeId === activeArchetype?.id);
    const solvedMatches = matches.filter((npc) => getNpcStatus(npc.id) === "solved").length;
    const workingMatches = matches.filter((npc) => getNpcStatus(npc.id) === "working").length;

    document.getElementById("archetypes-content").innerHTML = `
        <section class="panel">
            <p class="eyebrow">Separate workspace</p>
            <div class="detail-header">
                <div>
                    <h2 class="section-heading">Archetype Lab</h2>
                    <p class="muted-text">This view is intentionally isolated from the atlas so you can workshop tone, response ladders, and matching NPCs without wrestling the full dataset at the same time.</p>
                </div>
                <span class="hero-badge">${escapeHtml(activeArchetype.emoji)} ${escapeHtml(activeArchetype.name)}</span>
            </div>
        </section>

        <div class="archetype-layout">
            <section class="archetype-directory">
                ${archetypes.map((archetype) => {
                    const count = npcs.filter((npc) => npc.archetypeId === archetype.id).length;
                    return `
                        <button class="archetype-button ${activeArchetype?.id === archetype.id ? "active" : ""}" type="button" data-action="select-archetype" data-id="${escapeHtml(archetype.id)}">
                            <div class="archetype-button-title">
                                <strong>${escapeHtml(archetype.emoji)} ${escapeHtml(archetype.name)}</strong>
                                <span class="tag">${count} NPCs</span>
                            </div>
                            <p>${escapeHtml(archetype.tagline)}</p>
                        </button>
                    `;
                }).join("")}
            </section>

            <section class="archetype-stage">
                ${activeArchetype ? `
                    <div class="archetype-hero">
                        <div class="detail-header">
                            <div>
                                <p class="detail-kicker">${escapeHtml(activeArchetype.intensity)} intensity</p>
                                <h2>${escapeHtml(activeArchetype.emoji)} ${escapeHtml(activeArchetype.name)}</h2>
                                <p class="detail-lead">${escapeHtml(activeArchetype.description)}</p>
                            </div>
                            <span class="hero-badge">Trigger: ${escapeHtml(activeArchetype.trigger)}</span>
                        </div>
                        <div class="pill-row">
                            <span class="pill">${solvedMatches} solved match${solvedMatches === 1 ? "" : "es"}</span>
                            <span class="pill">${workingMatches} in progress</span>
                            ${activeArchetype.bestFor.map((item) => `<span class="pill">Best for ${escapeHtml(item)}</span>`).join("")}
                        </div>
                    </div>

                    <div class="playbook-grid">
                        ${activeArchetype.playbook.map((step) => `
                            <article class="reply-card">
                                <div class="reply-card-header">
                                    <p class="reply-card-title">${escapeHtml(step.title)}</p>
                                    <button class="copy-button" type="button" data-action="copy-text" data-copy="${escapeHtml(step.text)}">Copy line</button>
                                </div>
                                <p class="reply-card-body">${escapeHtml(step.text)}</p>
                            </article>
                        `).join("")}
                    </div>

                    <div class="detail-section">
                        <h3>Recovery tip</h3>
                        <p>${escapeHtml(activeArchetype.recovery)}</p>
                    </div>

                    <div class="detail-section">
                        <h3>Matching NPCs in this toolkit</h3>
                        <div class="match-list">
                            ${matches.map((npc) => `
                                <button class="match-chip" type="button" data-action="open-npc" data-id="${escapeHtml(npc.id)}" data-target-view="atlas">
                                    ${progressMeta[getNpcStatus(npc.id)].emoji} ${escapeHtml(npc.name)}
                                </button>
                            `).join("")}
                        </div>
                    </div>
                ` : `<div class="empty-state">No archetypes are loaded.</div>`}
            </section>
        </div>
    `;
}

function renderSources() {
    document.getElementById("sources-content").innerHTML = `
        <section class="panel">
            <p class="eyebrow">Research log</p>
            <h2 class="section-heading">What this build trusts, and what it refuses to fake</h2>
            <p class="muted-text">
                Official sources are used for world framing and the AI disclosure. Community sources are used for routing, NPC location notes,
                and conversation hints—with explicit caveats where pins or checklists are approximate, premium-gated, or incomplete.
            </p>
        </section>

        <div class="source-grid">
            ${sources.map((source) => `
                <article class="source-card">
                    <div class="source-header">
                        <div>
                            <h3>${escapeHtml(source.title)}</h3>
                            <p class="muted-text">${escapeHtml(source.summary)}</p>
                        </div>
                        <span class="confidence-badge ${confidenceClass(source.confidence)}">${source.type === "official" ? "Official" : "Community"}</span>
                    </div>

                    <div class="source-meta">
                        <span class="tag">${source.confidence === "high" ? "High confidence" : "Medium confidence"}</span>
                        ${source.highlights.map((highlight) => `<span class="tag">${escapeHtml(highlight)}</span>`).join("")}
                    </div>

                    <ul>
                        <li><strong>Integration decision:</strong> ${escapeHtml(source.integrationDecision)}</li>
                        <li><strong>Caveat:</strong> ${escapeHtml(source.caveat)}</li>
                    </ul>

                    <a class="source-link" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer noopener">Open source ↗</a>
                </article>
            `).join("")}
        </div>
    `;
}

function renderSessionSummary() {
    const progress = getProgressCounts();
    const customMapCount = getCustomMapCount();

    document.getElementById("session-summary").innerHTML = `
        <h2 class="card-title">Field session</h2>
        <p class="card-subtitle">A compact read on what this toolkit is currently tracking.</p>
        <div class="mini-kpis">
            <span class="mini-kpi"><strong>${npcs.length}</strong> NPCs</span>
            <span class="mini-kpi"><strong>${progress.solved}</strong> solved</span>
            <span class="mini-kpi"><strong>${progress.working}</strong> working</span>
            <span class="mini-kpi"><strong>${customMapCount}</strong> map${customMapCount === 1 ? "" : "s"}</span>
        </div>
        <div class="detail-section">
            <h3>Top shortcut</h3>
            <p>Press <strong>/</strong> anytime to jump straight into the NPC atlas search field.</p>
        </div>
    `;
}

function renderFavoritesPanel() {
    const favoriteNpcs = state.favorites.map((id) => getNpc(id)).filter(Boolean);

    document.getElementById("favorite-npcs-panel").innerHTML = `
        <h2 class="card-title">Pinned NPCs</h2>
        <p class="card-subtitle">Quick jumps for the routes you revisit the most.</p>
        ${favoriteNpcs.length
            ? `<div class="favorites-list">${favoriteNpcs.map((npc) => `
                <div class="favorite-row">
                    <div>
                        <strong>${escapeHtml(npc.name)}</strong>
                        <div class="favorite-meta">${escapeHtml(npc.region)} • ${escapeHtml(npc.subregion)}</div>
                        <div class="favorite-meta">${renderStatusPill(getNpcStatus(npc.id))}${getNpcNote(npc.id).trim() ? " • 📝 note" : ""}</div>
                    </div>
                    <button type="button" data-action="open-npc" data-id="${escapeHtml(npc.id)}" data-target-view="atlas">Open</button>
                </div>
            `).join("")}</div>`
            : `<div class="empty-state">Star a few NPCs in the atlas and they will show up here for one-click routing.</div>`}
    `;
}

function renderSourceCallout() {
    const customMapCount = getCustomMapCount();

    document.getElementById("source-callout").innerHTML = `
        <h2 class="card-title">Source policy</h2>
        <p class="card-subtitle">This build is careful about what gets embedded, copied, and approximated.</p>
        <ul class="detail-list">
            <li>Official sources are used for world framing and AI feature claims.</li>
            <li>Community sources inform NPC locations and chat hints.</li>
            <li>External map art is not copied into this project; uploaded maps stay local to your browser.</li>
        </ul>
        <div class="detail-actions">
            <button class="secondary-button" type="button" data-view="sources">Review sources</button>
            <span class="tag">${customMapCount} custom map${customMapCount === 1 ? "" : "s"} loaded</span>
        </div>
    `;
}

function renderNavigation() {
    document.querySelectorAll(".primary-nav .nav-button[data-view]").forEach((button) => {
        const isActive = button.dataset.view === state.view;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-current", isActive ? "page" : "false");
    });

    viewIds.forEach((viewId) => {
        const view = document.getElementById(`${viewId}-view`);
        if (!view) {
            return;
        }

        const isActive = state.view === viewId;
        view.hidden = !isActive;
        view.classList.toggle("active", isActive);
    });
}

function renderAll() {
    renderDashboard();
    renderAtlas();
    renderMap();
    renderArchetypes();
    renderSources();
    renderSessionSummary();
    renderFavoritesPanel();
    renderSourceCallout();
    renderNavigation();
}

function renderAtlasOnly() {
    renderAtlas();
    renderNavigation();
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => reject(reader.error ?? new Error("Unable to read file."));
        reader.readAsDataURL(file);
    });
}

function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = dataUrl;
    });
}

async function compressImageFile(file) {
    const rawDataUrl = await readFileAsDataUrl(file);
    const image = await loadImage(rawDataUrl);

    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const nextWidth = Math.max(1, Math.round(image.width * scale));
    const nextHeight = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");

    canvas.width = nextWidth;
    canvas.height = nextHeight;

    const context = canvas.getContext("2d");
    if (!context) {
        return rawDataUrl;
    }

    context.drawImage(image, 0, 0, nextWidth, nextHeight);
    return canvas.toDataURL("image/jpeg", 0.86);
}

async function handleCustomMapUpload(region, file) {
    const previousMap = getCustomMap(region);

    try {
        const compressedMap = await compressImageFile(file);
        state.customMaps[region] = compressedMap;

        if (!persistState()) {
            if (previousMap) {
                state.customMaps[region] = previousMap;
            } else {
                delete state.customMaps[region];
            }

            window.alert("That map image is too large to store locally. Try a smaller screenshot or crop it before uploading.");
            return;
        }

        renderAll();
    } catch (error) {
        console.warn("Unable to process the selected map image.", error);
        window.alert("Couldn't process that image. Try a JPG or PNG screenshot instead.");
    }
}

document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action], [data-view]");
    if (!target) {
        return;
    }

    if (target.dataset.view) {
        const didChangeView = setView(target.dataset.view);
        void persistState();
        renderAll();
        if (target.dataset.view === "atlas") {
            focusAtlasSearch();
        }
        if (didChangeView) {
            scrollToTop();
        }
        return;
    }

    const action = target.dataset.action;

    switch (action) {
        case "focus-atlas": {
            const didChangeView = setView("atlas");
            void persistState();
            renderAll();
            focusAtlasSearch();
            if (didChangeView) {
                scrollToTop();
            }
            break;
        }

        case "toggle-favorites-only":
            state.favoritesOnly = !state.favoritesOnly;
            syncSelectedNpcFromList(getFilteredNpcs());
            void persistState();
            renderAtlasOnly();
            break;

        case "reset-filters":
            state.atlasSearch = "";
            state.atlasRegion = "All";
            state.atlasInteraction = "All";
            state.atlasArchetype = "All";
            state.atlasStatus = "All";
            state.favoritesOnly = false;
            syncSelectedNpcFromList(getFilteredNpcs());
            void persistState();
            renderAtlasOnly();
            break;

        case "toggle-favorite":
            if (toggleFavoriteState(target.dataset.id)) {
                void persistState();
                renderAll();
            }
            break;

        case "open-npc": {
            const didSelectNpc = updateSelectedNpc(target.dataset.id);
            const didChangeView = target.dataset.targetView ? setView(target.dataset.targetView) : false;
            if (didSelectNpc) {
                void persistState();
                renderAll();
                if (didChangeView) {
                    scrollToTop();
                }
            }
            break;
        }

        case "set-map-region":
            if (setMapRegionState(target.dataset.region)) {
                void persistState();
                renderAll();
            }
            break;

        case "select-archetype": {
            const didSelectArchetype = updateSelectedArchetype(target.dataset.id);
            const didChangeView = target.dataset.targetView ? setView(target.dataset.targetView) : false;
            if (didSelectArchetype) {
                void persistState();
                renderAll();
                if (didChangeView) {
                    scrollToTop();
                }
            }
            break;
        }

        case "copy-text":
            void copyText(target, target.dataset.copy);
            break;

        case "copy-brief": {
            const npc = getNpc(target.dataset.id);
            if (npc) {
                void copyText(target, buildNpcBrief(npc));
            }
            break;
        }

        case "set-status":
            if (setNpcStatusState(target.dataset.id, target.dataset.status)) {
                void persistState();
                renderAll();
            }
            break;

        case "clear-note":
            if (setNpcNoteState(target.dataset.id, "")) {
                void persistState();
                renderAll();
            }
            break;

        case "clear-map":
            delete state.customMaps[target.dataset.region];
            void persistState();
            renderAll();
            break;

        default:
            break;
    }
});

document.addEventListener("input", (event) => {
    const target = event.target;

    if (target.id === "atlas-search") {
        const cursorPosition = target.selectionStart ?? target.value.length;
        state.atlasSearch = target.value;
        syncSelectedNpcFromList(getFilteredNpcs());
        schedulePersist();
        renderAtlasOnly();
        focusAtlasSearch(cursorPosition);
    }

    if (target.id === "npc-note-textarea") {
        if (setNpcNoteState(target.dataset.noteId, target.value)) {
            schedulePersist();
        }
    }
});

document.addEventListener("change", async (event) => {
    const target = event.target;

    if (target.id === "atlas-region-select") {
        state.atlasRegion = target.value;
        syncSelectedNpcFromList(getFilteredNpcs());
        void persistState();
        renderAtlasOnly();
        return;
    }

    if (target.id === "atlas-interaction-select") {
        state.atlasInteraction = target.value;
        syncSelectedNpcFromList(getFilteredNpcs());
        void persistState();
        renderAtlasOnly();
        return;
    }

    if (target.id === "atlas-archetype-select") {
        state.atlasArchetype = target.value;
        syncSelectedNpcFromList(getFilteredNpcs());
        void persistState();
        renderAtlasOnly();
        return;
    }

    if (target.id === "atlas-status-select") {
        state.atlasStatus = target.value;
        syncSelectedNpcFromList(getFilteredNpcs());
        void persistState();
        renderAtlasOnly();
        return;
    }

    if (target.matches('input[type="file"][data-action="upload-map"]')) {
        const selectedFile = target.files?.[0];
        if (!selectedFile) {
            return;
        }

        await handleCustomMapUpload(target.dataset.region, selectedFile);
        target.value = "";
    }
});

document.addEventListener("keydown", (event) => {
    const tagName = document.activeElement?.tagName?.toLowerCase();
    const isTextInput = tagName === "input" || tagName === "textarea" || document.activeElement?.isContentEditable;

    if (event.key === "/" && !isTextInput) {
        event.preventDefault();
        const didChangeView = setView("atlas");
        void persistState();
        renderAll();
        focusAtlasSearch();
        if (didChangeView) {
            scrollToTop();
        }
    }
});

async function copyText(button, text) {
    if (!text) {
        return;
    }

    const originalLabel = button.textContent;

    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        console.warn("Clipboard API unavailable; used fallback copy.", error);
    }

    button.textContent = "✅ Copied";
    button.classList.add("is-success");
    window.setTimeout(() => {
        button.textContent = originalLabel;
        button.classList.remove("is-success");
    }, 1400);
}

renderAll();

console.log("%c✅ WWM toolkit upgraded — custom map overlays, progress tracking, and cleaner UX are live.", "color:#22c55e;font-weight:bold");
