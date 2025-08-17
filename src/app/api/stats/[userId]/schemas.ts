import { z } from "zod";
import { UserStatsSchema } from "@/features/stats/schemas";

// Params (depuis le segment [userId])
export const GetStatsParamsSchema = z.object({
  userId: z.string().min(1, "Missing userId"),
});
export type GetStatsPayload = z.infer<typeof GetStatsParamsSchema>;

// Réponse
export const GetStatsResponseSchema = z.object({
  ok: z.literal(true),
  data: UserStatsSchema,                // { planned, on_hold, dropped, completed, ongoing, total }
}).or(z.object({
  ok: z.literal(false),
  message: z.string(),
}));
export type GetStatsResponse = z.infer<typeof GetStatsResponseSchema>;
