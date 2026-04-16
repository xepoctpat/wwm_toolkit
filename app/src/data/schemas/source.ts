import { z } from "zod";

import { contentPackMetaSchema } from "./common";

export const sourceEntrySchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    url: z.string().url(),
    tier: z.enum(["official", "in-game", "community", "provisional"]),
    summary: z.string().min(1),
    lastReviewed: z.string().min(1),
});

export const sourcePackSchema = z.object({
    meta: contentPackMetaSchema.extend({
        domain: z.literal("sources"),
    }),
    entries: z.array(sourceEntrySchema),
});

export type SourceEntry = z.infer<typeof sourceEntrySchema>;
export type SourcePack = z.infer<typeof sourcePackSchema>;
