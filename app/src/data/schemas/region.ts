import { z } from "zod";

import { baseContentEntrySchema, contentPackMetaSchema } from "./common";

export const regionEntrySchema = baseContentEntrySchema.extend({
    regionOrder: z.number().int().positive(),
    requiredCharacterLevel: z.number().int().positive().optional(),
    unlockRequirement: z.string().min(1).optional(),
    traversalSummary: z.string().min(1),
    subregions: z.array(z.string().min(1)).min(1),
    landmarkNames: z.array(z.string().min(1)).default([]),
    storylineIds: z.array(z.string()).default([]),
    progressionGateEntryIds: z.array(z.string()).default([]),
    questIds: z.array(z.string()).default([]),
    campaignQuestIds: z.array(z.string()).default([]),
    activityHighlights: z.array(z.string().min(1)).default([]),
});

export const regionPackSchema = z.object({
    meta: contentPackMetaSchema.extend({
        domain: z.literal("regions"),
    }),
    entries: z.array(regionEntrySchema),
});

export type RegionEntry = z.infer<typeof regionEntrySchema>;
export type RegionPack = z.infer<typeof regionPackSchema>;