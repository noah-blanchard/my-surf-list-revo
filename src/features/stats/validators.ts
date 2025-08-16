import { z } from "zod";

export const GetStatsQuery = z.object({
  user_id: z.string().uuid({ message: "user_id must be a valid UUID" }),
});

export type GetStatsQuery = z.infer<typeof GetStatsQuery>;

// Typage des statuts (si tu veux réutiliser côté client)
export const MapStatus = z.enum(["Planned", "On hold", "Dropped", "Completed", "Ongoing"]);
export type MapStatus = z.infer<typeof MapStatus>;

// Réponse normalisée
export const UserStatsSchema = z.object({
  completed: z.number().int().nonnegative(),
  ongoing: z.number().int().nonnegative(),
  dropped: z.number().int().nonnegative(),
  planned: z.number().int().nonnegative(),
  on_hold: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});
export type UserStats = z.infer<typeof UserStatsSchema>;