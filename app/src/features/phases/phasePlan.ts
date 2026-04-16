export type PhaseStatus = "completed" | "in-progress" | "planned";

export interface PhasePlanItem {
    kicker: string;
    title: string;
    status: PhaseStatus;
    statusLabel: string;
    summary: string;
    deliverables: string[];
}

export const phasePlan: PhasePlanItem[] = [
    {
        kicker: "Phase 0",
        title: "NPC vertical slice",
        status: "completed",
        statusLabel: "completed",
        summary: "The existing static prototype delivers the current NPC atlas, map overlay, archetype lab, and source notes.",
        deliverables: [
            "Searchable NPC atlas",
            "Approximate map overlay",
            "Local notes and progress tracking",
            "Custom map uploads",
        ],
    },
    {
        kicker: "Phase 1",
        title: "Hybrid foundation",
        status: "in-progress",
        statusLabel: "in progress",
        summary: "Build the modular TypeScript foundation, typed schemas, persistence bridge, validation tools, and documented migration path.",
        deliverables: [
            "Vite + TypeScript scaffold",
            "Typed content schemas",
            "IndexedDB migration bridge",
            "Python-ready data tooling directory",
            "Phase tracking documentation",
        ],
    },
    {
        kicker: "Phase 2",
        title: "Codex expansion",
        status: "in-progress",
        statusLabel: "in progress",
        summary: "Seed the codex with reviewed quest and storyline data, then expand into broader content domains and global search.",
        deliverables: [
            "Reviewed quest and storyline packs",
            "Cross-linked domain model",
            "Global codex search",
            "Layered map entities",
        ],
    },
    {
        kicker: "Phase 3",
        title: "Offline toolkit v1",
        status: "planned",
        statusLabel: "planned",
        summary: "Add the player workflow layer with backups, presets, route planning, calibration, and checklist tracking.",
        deliverables: [
            "Import / export backups",
            "Pin calibration mode",
            "Saved filter presets",
            "Checklists and route builder",
        ],
    },
    {
        kicker: "Phase 4+",
        title: "Distribution and operations",
        status: "planned",
        statusLabel: "planned",
        summary: "Ship as a real app, then mature the content pipeline and optional sync/community capabilities.",
        deliverables: [
            "PWA packaging",
            "Deployment pipeline",
            "Content validation workflow",
            "Optional cloud sync later",
        ],
    },
];
