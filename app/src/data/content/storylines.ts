import { storylinePackSchema } from "../schemas/storyline";

export const storylinePack = storylinePackSchema.parse({
    meta: {
        domain: "storylines",
        label: "Storyline journal",
        description:
            "Reviewed seed pack for the first three released main-story chapters, normalized into chapter-level storyline entries with ordered quest links.",
        status: "in-progress",
    },
    entries: [
        {
            id: "storyline-heaven-has-no-pier",
            title: "Heaven Has No Pier",
            summary:
                "The opening Qinghe chapter introduces the Young Master of Heaven's Pier, teaches foundational traversal and combat systems, and ends with the Aureate Pavilion attack that forces the story out into the broader Jianghu.",
            tags: ["main-story", "chapter-1", "qinghe"],
            sourceIds: ["fextra-main-walkthrough", "game8-story-chapters", "fextra-quest-directory"],
            lastVerified: "2026-04-16",
            gameVersion: "1.5 As Snow Falls",
            confidence: "cross-checked",
            verificationStatus: "reviewed",
            evidenceType: "community-guide",
            verificationNotes:
                "Chapter title, region, and quest order are cross-checked between Fextralife and Game8. Chapter synopsis is editorial and intentionally concise.",
            relatedEntryIds: ["storyline-universal-furnace"],
            chapterLabel: "Chapter 1",
            chapterNumber: 1,
            regionIds: ["qinghe"],
            questIds: [
                "quest-another-new-wing",
                "quest-a-horse-neighs-in-the-forest",
                "quest-dust-on-the-rhombus-mirror",
                "quest-for-whom-does-he-return",
            ],
        },
        {
            id: "storyline-universal-furnace",
            title: "Universal Furnace",
            summary:
                "The Kaifeng chapter shifts the story into a denser political setting. The current seed captures its confirmed quest order and chapter placement while fuller beat summaries remain to be normalized.",
            tags: ["main-story", "chapter-2", "kaifeng"],
            sourceIds: ["fextra-main-walkthrough", "game8-story-chapters", "fextra-quest-directory"],
            lastVerified: "2026-04-16",
            gameVersion: "1.5 As Snow Falls",
            confidence: "cross-checked",
            verificationStatus: "reviewed",
            evidenceType: "community-guide",
            verificationNotes:
                "This chapter is intentionally modeled first as an ordered quest spine. Detailed per-quest narrative notes will expand later.",
            relatedEntryIds: ["storyline-heaven-has-no-pier", "storyline-a-lonely-moon-over-changan"],
            chapterLabel: "Chapter 2",
            chapterNumber: 2,
            regionIds: ["kaifeng"],
            questIds: [
                "quest-new-guest-in-kaifeng",
                "quest-gathering-of-heroes",
                "quest-reunion",
                "quest-accident",
                "quest-furnace-of-righteousness",
            ],
        },
        {
            id: "storyline-a-lonely-moon-over-changan",
            title: "A Lonely Moon Over Chang'an",
            summary:
                "The released Hexi chapter expands the main story into Jade Gate Pass and Liangzhou-linked content. Game8 and Fextralife agree on the top-level quest anchors, while Fextralife additionally exposes nested quest blocks inside that chapter.",
            tags: ["main-story", "chapter-3", "hexi"],
            sourceIds: ["fextra-main-walkthrough", "game8-story-chapters", "fextra-quest-directory"],
            lastVerified: "2026-04-16",
            gameVersion: "1.5 As Snow Falls",
            confidence: "cross-checked",
            verificationStatus: "reviewed",
            evidenceType: "community-guide",
            verificationNotes:
                "Top-level chapter quest nodes follow Game8's four-quest structure, while nested Fextralife quest blocks are preserved in editorial notes rather than separate records for this first seed.",
            relatedEntryIds: ["storyline-universal-furnace"],
            chapterLabel: "Chapter 3",
            chapterNumber: 3,
            regionIds: ["hexi"],
            questIds: [
                "quest-by-lamplight",
                "quest-burlap-sack",
                "quest-liangzhou-melody",
                "quest-paper-moon",
            ],
        },
    ],
});
