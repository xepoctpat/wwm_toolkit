import { z } from "zod";

export const confidenceSchema = z.enum(["official", "verified", "cross-checked", "provisional"]);
export const verificationStatusSchema = z.enum(["verified", "reviewed", "provisional", "stub"]);
export const evidenceTypeSchema = z.enum([
    "official",
    "in-game-capture",
    "community-guide",
    "inferred",
    "editorial",
]);

export const baseContentEntrySchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    tags: z.array(z.string()).default([]),
    sourceIds: z.array(z.string()).default([]),
    lastVerified: z.string().min(1),
    gameVersion: z.string().min(1),
    confidence: confidenceSchema,
    verificationStatus: verificationStatusSchema,
    evidenceType: evidenceTypeSchema,
    verificationNotes: z.string().min(1).optional(),
    relatedEntryIds: z.array(z.string()).default([]),
});

export const contentPackMetaSchema = z.object({
    domain: z.string().min(1),
    label: z.string().min(1),
    description: z.string().min(1),
    status: z.enum(["stub", "in-progress", "validated"]),
});

export type Confidence = z.infer<typeof confidenceSchema>;
export type VerificationStatus = z.infer<typeof verificationStatusSchema>;
export type EvidenceType = z.infer<typeof evidenceTypeSchema>;
export type BaseContentEntry = z.infer<typeof baseContentEntrySchema>;
export type ContentPackMeta = z.infer<typeof contentPackMetaSchema>;
