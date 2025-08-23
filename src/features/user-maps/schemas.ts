import { z } from "zod";
import { MapSchema, MapStatusEnum } from "../maps/schemas";

export const UserMapSchema = z.object({
  id: z.number().int().nonnegative(),
  user_id: z.uuid(),
  map_id: z.number().int().nonnegative(),

  status: z.enum(MapStatusEnum),

  // Arrays garantis non-nuls en DB (defaults à {}), on encode > 0 côté app
  bonuses_completed: z.array(z.number().int().positive()).default([]),
  stages_completed: z.array(z.number().int().positive()).default([]),

  // Nouvelles colonnes KSF (toutes nullables en DB)
  time: z.number().nullable().optional(),     // double precision
  wrDiff: z.number().nullable().optional(),   // double precision
  date: z.iso.datetime({ offset: true }).nullable().optional(), // timestamptz
  points: z.number().nullable().optional(),   // double precision
  count: z.number().int().nullable().optional(),       // integer
  rank: z.string().nullable().optional(),              // text

  completed_at: z.iso.datetime({ offset: true }).nullable(),
  created_at: z.iso.datetime({ offset: true }),
  updated_at: z.iso.datetime({ offset: true }),

  // jointure éventuelle
  maps: MapSchema.optional(),
}).strict();

export type UserMap = z.infer<typeof UserMapSchema>;
