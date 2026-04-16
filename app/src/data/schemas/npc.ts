import { z } from "zod";

import { baseContentEntrySchema } from "./common";

export const npcEntrySchema = baseContentEntrySchema.extend({
    regionIds: z.array(z.string()).default([]),
    factionIds: z.array(z.string()).default([]),
    questIds: z.array(z.string()).default([]),
    serviceTags: z.array(z.string()).default([]),
});

export type NpcEntry = z.infer<typeof npcEntrySchema>;
