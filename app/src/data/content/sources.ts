import { sourcePackSchema } from "../schemas/source";

export const sourcePack = sourcePackSchema.parse({
    meta: {
        domain: "sources",
        label: "Source registry",
        description:
            "Editorial source registry backing the reviewed quest, storyline, and region seed data for the modular codex migration.",
        status: "in-progress",
    },
    entries: [
        {
            id: "official-site",
            title: "Official Website — Where Winds Meet",
            url: "https://www.wherewindsmeetgame.com/",
            tier: "official",
            summary:
                "Used to confirm Qinghe, Kaifeng, and Hexi as marquee surfaced regions and to anchor the codex's high-level world framing to official wording.",
            lastReviewed: "2026-05-15",
        },
        {
            id: "fextra-main-walkthrough",
            title: "Fextralife — Walkthrough",
            url: "https://wherewindsmeet.wiki.fextralife.com/Walkthrough",
            tier: "community",
            summary:
                "Used to confirm chapter names, Chapter 1 quest flow, and the nested structure of the currently released main-story arcs.",
            lastReviewed: "2026-04-16",
        },
        {
            id: "fextra-quest-directory",
            title: "Fextralife — Quests",
            url: "https://wherewindsmeet.wiki.fextralife.com/Quests",
            tier: "community",
            summary:
                "Used to confirm quest-type definitions, chapter quest directories, early Qinghe exploration-route placement, and campaign quests that explicitly occur during specific main-story windows.",
            lastReviewed: "2026-04-16",
        },
        {
            id: "fextra-campaign-quests",
            title: "Fextralife — Campaign Quests",
            url: "https://wherewindsmeet.wiki.fextralife.com/Campaign_Quests",
            tier: "community",
            summary:
                "Used to confirm the ordered Qinghe and Kaifeng campaign rosters, campaign-to-main-story timing notes such as Still Shore during A Horse Neighs in the Forest and Unbound Cavern during Accident, and the broader region campaign sequence exposed by Fextralife's campaign guide.",
            lastReviewed: "2026-04-16",
        },
        {
            id: "fextra-meridian-touch",
            title: "Fextralife — Meridian Touch (Side Story)",
            url: "https://wherewindsmeet.wiki.fextralife.com/Meridian_Touch_(Side_Story)",
            tier: "community",
            summary:
                "Used to confirm Meridian Touch as a Qinghe Lost Chapter / Jianghu Legacy detour at Stonewash Strand, including Yan Qiren, reward framing, and its role as a mystic-art unlock route.",
            lastReviewed: "2026-04-16",
        },
        {
            id: "fextra-exploration-guide",
            title: "Fextralife — Exploration Guide",
            url: "https://wherewindsmeet.wiki.fextralife.com/Exploration_Guide",
            tier: "community",
            summary:
                "Used to cross-check Qinghe's exploration-system taxonomy, especially the separation between quests, encounters, Jianghu Legacies, bosses, outposts, Meow Meow activities, Wayfarers, and Boundary Stones.",
            lastReviewed: "2026-05-15",
        },
        {
            id: "game8-story-chapters",
            title: "Game8 — Story Walkthrough and List of Chapters",
            url: "https://game8.co/games/Where-Winds-Meet/archives/563484",
            tier: "community",
            summary:
                "Used to cross-check the three released main-story chapters, their region labels, and the top-level quest anchors for each chapter.",
            lastReviewed: "2026-04-16",
        },
        {
            id: "game8-campaign-quests",
            title: "Game8 — List of All Campaign Quests",
            url: "https://game8.co/games/Where-Winds-Meet/archives/564666",
            tier: "community",
            summary:
                "Used to confirm campaign quest locations, reward framing, and the full reviewed Qinghe and Kaifeng rosters, plus the current Game8-backed Hexi campaign slice.",
            lastReviewed: "2026-04-16",
        },
        {
            id: "game8-regions-map",
            title: "Game8 — Where Winds Meet Interactive Map / Regions",
            url: "https://game8.co/games/Where-Winds-Meet/archives/564080",
            tier: "community",
            summary:
                "Used to confirm the current three-region lineup, their published subregions, and the broader point-of-interest taxonomy exposed by the community map.",
            lastReviewed: "2026-04-16",
        },
        {
            id: "game8-qinghe-exploration",
            title: "Game8 — Qinghe Exploration Guide",
            url: "https://game8.co/games/Where-Winds-Meet/archives/564654",
            tier: "community",
            summary:
                "Used to confirm Qinghe's three top-level subregions, starter-region framing, and exploration notes like Dragon Key outposts and the Dream Realm cleanup route, while also showing that literal Encounter pins are tracked separately from Hidden Paths, Exploration Guide, Martial Art, and Mystic Skill layers.",
            lastReviewed: "2026-05-15",
        },
        {
            id: "game8-verdant-wilds-guide",
            title: "Game8 — Verdant Wilds 100% Completion Guide",
            url: "https://game8.co/games/Where-Winds-Meet/archives/564776",
            tier: "community",
            summary:
                "Used to refresh Qinghe's Verdant Wilds locality with the current four-area breakdown, including Bamboo Retreat, Northern Bamboo Grove, Northern Vow Ruins, Starfall Spring, Stonewash Strand, Qi Sheng's oddity route, and the local placement of White Bird Shooting, The Shameless, and Meridian Touch.",
            lastReviewed: "2026-05-15",
        },
        {
            id: "game8-moonveil-mountain-guide",
            title: "Game8 — Moonveil Mountain 100% Completion Guide",
            url: "https://game8.co/games/Where-Winds-Meet/archives/564886",
            tier: "community",
            summary:
                "Used to refresh Moonveil Mountain with its April 2026 area list, including Heaven's Pier, Kilnfire Ridge, Blissful Retreat, Still Shore, Palace of Annals, Crimson Cliff, Peace Bell Tower, Twinbeast Ridge, Sage's Knoll, Encircling Lake, and Riverside Station, plus the local campaign anchors for Still Shore, Gleaming Abyss, Palace of Annals, and Blissful Retreat.",
            lastReviewed: "2026-05-15",
        },
        {
            id: "game8-sundara-land-guide",
            title: "Game8 — Sundara Land 100% Completion Guide",
            url: "https://game8.co/games/Where-Winds-Meet/archives/564887",
            tier: "community",
            summary:
                "Used to refresh Sundara Land with its April 2026 area list, including Halo Peak, Bodhi Sea, Mercyheart Town, Mercyheart Monastery, Jadebrook Mountain, Buddha Fort, Wildmane Ranch, Thousand-Buddha Village, and Floral Expanse Beyond, plus the local anchors for Bodhi Sea and Halo Peak campaign routes.",
            lastReviewed: "2026-05-15",
        },
        {
            id: "game8-kaifeng-exploration",
            title: "Game8 — Kaifeng Exploration Guide",
            url: "https://game8.co/games/Where-Winds-Meet/archives/565799",
            tier: "community",
            summary:
                "Used to confirm Kaifeng as the second region, its published level-32/world-level gate after Chapter 1, and the fact that Encounter, Hidden Paths, Side Story, Martial Art, and Mystic Skill layers remain distinct categories in the community map taxonomy.",
            lastReviewed: "2026-04-16",
        },
        {
            id: "game8-kaifeng-city-guide",
            title: "Game8 — Kaifeng City 100% Completion Guide",
            url: "https://game8.co/games/Where-Winds-Meet/archives/567516",
            tier: "community",
            summary:
                "Used to confirm the density and landmark structure of Kaifeng City, especially around Velvet Shade, Revelry Hall, and other high-value city clusters inside the broader Kaifeng region.",
            lastReviewed: "2026-04-16",
        },
        {
            id: "game8-hexi-exploration",
            title: "Game8 — Hexi Exploration Guide",
            url: "https://game8.co/games/Where-Winds-Meet/archives/583786",
            tier: "community",
            summary:
                "Used to confirm Hexi as the third released region, its published access path of character level 14 plus Still Shore and the Bamboo Abode mural, and the separate Encounter / Side Story / Guide Quest / Mystic Skill activity buckets shown in the map taxonomy.",
            lastReviewed: "2026-04-16",
        },
        {
            id: "game8-hexi-melodies-of-peace",
            title: "Game8 — Melodies of Peace: Hexi Walkthrough and Rewards",
            url: "https://game8.co/games/Where-Winds-Meet/archives/582218",
            tier: "community",
            summary:
                "Used to confirm Jade Gate Pass / Lost Crossing onboarding details for Hexi and to anchor Qi Xian as the region's reviewed oddity-vendor activity hook.",
            lastReviewed: "2026-04-16",
        },
        {
            id: "gamerant-qinghe-meow-meow-guide",
            title: "Game Rant — All Qinghe Meow Meow Puzzle Locations Guide",
            url: "https://gamerant.com/where-winds-meet-all-qinghe-meow-meow-puzzle-locations-guide/",
            tier: "community",
            summary:
                "Used as a secondary Qinghe cross-check for Meow Meow distribution, confirming that challenge density stretches across Bamboo Abode, Stonewash Strand, Crimson Cliff/Crimson Cliffs, Peace Bell Tower, Blissful Retreat, Twinbeast Ridge, Sage's Knoll, Witherwilds, and Riverside Station.",
            lastReviewed: "2026-05-15",
        },
        {
            id: "dualshockers-qinghe-oddity-guide",
            title: "DualShockers — Full Qinghe Oddity Guide",
            url: "https://www.dualshockers.com/where-winds-meet-full-oddity-guide-qinghe/",
            tier: "community",
            summary:
                "Used as a secondary Qinghe cross-check for oddity terminology and for Qi Sheng's Melodies of Peace turn-in location east of General's Shrine, helping anchor Bamboo Abode's oddity utility loop without treating a single collectible guide as canonical map truth.",
            lastReviewed: "2026-05-15",
        },
    ],
});
