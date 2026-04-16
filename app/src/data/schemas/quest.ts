import { z } from "zod";

import { baseContentEntrySchema, contentPackMetaSchema } from "./common";

export const questEntrySchema = baseContentEntrySchema.extend({
    questType: z.enum(["main", "side", "campaign", "exploration", "jianghu-legacy", "faction", "region", "system"]),
    locationHint: z.string().min(1).optional(),
    regionIds: z.array(z.string()).default([]),
    storylineIds: z.array(z.string()).default([]),
    npcIds: z.array(z.string()).default([]),
    prerequisiteQuestIds: z.array(z.string()).default([]),
    followUpQuestIds: z.array(z.string()).default([]),
    rewardIds: z.array(z.string()).default([]),
});

export const questPackSchema = z.object({
    meta: contentPackMetaSchema.extend({
        domain: z.literal("quests"),
    }),
    entries: z.array(questEntrySchema),
});

export type QuestEntry = z.infer<typeof questEntrySchema>;
export type QuestPack = z.infer<typeof questPackSchema>;
