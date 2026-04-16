import { z } from "zod";

import { baseContentEntrySchema, contentPackMetaSchema } from "./common";

export const storylineEntrySchema = baseContentEntrySchema.extend({
    chapterLabel: z.string().min(1),
    chapterNumber: z.number().int().positive().optional(),
    regionIds: z.array(z.string()).default([]),
    questIds: z.array(z.string()).default([]),
});

export const storylinePackSchema = z.object({
    meta: contentPackMetaSchema.extend({
        domain: z.literal("storylines"),
    }),
    entries: z.array(storylineEntrySchema),
});

export type StorylineEntry = z.infer<typeof storylineEntrySchema>;
export type StorylinePack = z.infer<typeof storylinePackSchema>;
