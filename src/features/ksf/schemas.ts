import { z } from "zod";

/** Réponse de /api/sync-ksf */
export const KsfSyncResponseSchema = z.object({
    ok: z.literal(true),
    steam64: z.string(),
    game: z.string(),
    mode: z.string(),
    fetched: z.number().int(),
    known: z.number().int(),
    unknown: z.array(z.string()),
    upserted: z.number().int(),
}).or(z.object({
    ok: z.literal(false),
    message: z.string(),
}));

export type KsfSyncResponse = z.infer<typeof KsfSyncResponseSchema>;

