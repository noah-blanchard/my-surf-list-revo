import { z } from "zod";
import { MapSchema, MapStatusEnum } from "@/features/maps/schemas";

// Ajuste si ta DB a d’autres valeurs
export const UserMapSchema = z.object({
  id: z.number().int().nonnegative(),
  user_id: z.string().uuid(),
  map_id: z.number().int().nonnegative(),

  status: z.enum(MapStatusEnum),

  // En DB: check "nonneg" (interdit 0). On encode en > 0 côté app.
  bonuses_completed: z.array(z.number().int().positive()).default([]),
  stages_completed: z.array(z.number().int().positive()).default([]),

  completed_at: z.iso.datetime({ offset: true }).nullable(),
  created_at: z.iso.datetime({ offset: true }),
  updated_at: z.iso.datetime({ offset: true }),
  maps: MapSchema.optional(), // Pour les requêtes qui incluent les infos de la map
}).strict();

export type UserMap = z.infer<typeof UserMapSchema>;
