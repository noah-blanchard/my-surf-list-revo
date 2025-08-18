import { MapStatusEnum } from "@/features/maps/schemas";
import { UserMapSchema } from "@/features/user-maps/schemas";
import { z } from "zod";

export const EditUserMapEntryParamsSchema = z.object({
    id: z.number().int().positive(),
    status: z.enum(MapStatusEnum).optional(),
    bonuses_completed: z.array(z.number().int().positive()).optional(),
    stages_completed: z.array(z.number().int().positive()).optional(),
    completed_at: z.iso.datetime({ offset: true }).nullable().optional(),
}).refine(
    (v) =>
        v.status !== undefined ||
        v.bonuses_completed !== undefined ||
        v.stages_completed !== undefined ||
        v.completed_at !== undefined,
    { message: "Nothing to update" }
);

export type EditUserMapEntryPayload = z.infer<typeof EditUserMapEntryParamsSchema>;

export const EditUserMapEntryResponseSchema = z.object({
    ok: z.literal(true),
    data: UserMapSchema,
}).or(
    z.object({
        ok: z.literal(false),
        message: z.string(),
    })
);

export type EditUserMapEntryResponse = z.infer<typeof EditUserMapEntryResponseSchema>;