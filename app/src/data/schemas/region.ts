import { z } from "zod";

import { baseContentEntrySchema, contentPackMetaSchema } from "./common";

export const regionRouteWindowToneSchema = z.enum(["main", "exploration", "legacy", "campaign", "gate"]);

export const regionSubregionDetailSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    landmarkNames: z.array(z.string().min(1)).default([]),
    linkedEntryIds: z.array(z.string()).default([]),
    activityHighlights: z.array(z.string().min(1)).default([]),
    focusEntryId: z.string().min(1),
});

export const regionRouteWindowSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    tone: regionRouteWindowToneSchema,
    subregionIds: z.array(z.string().min(1)).default([]),
    landmarkNames: z.array(z.string().min(1)).default([]),
    linkedEntryIds: z.array(z.string()).default([]),
    focusEntryId: z.string().min(1),
});

export const regionEntrySchema = baseContentEntrySchema.extend({
    regionOrder: z.number().int().positive(),
    requiredCharacterLevel: z.number().int().positive().optional(),
    unlockRequirement: z.string().min(1).optional(),
    traversalSummary: z.string().min(1),
    subregions: z.array(z.string().min(1)).min(1),
    subregionDetails: z.array(regionSubregionDetailSchema).default([]),
    landmarkNames: z.array(z.string().min(1)).default([]),
    routeWindows: z.array(regionRouteWindowSchema).default([]),
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
export type RegionSubregionDetail = z.infer<typeof regionSubregionDetailSchema>;
export type RegionRouteWindowTone = z.infer<typeof regionRouteWindowToneSchema>;
export type RegionRouteWindow = z.infer<typeof regionRouteWindowSchema>;