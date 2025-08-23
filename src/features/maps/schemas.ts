import { Database } from "@/types/supabase";
import { z } from "zod";

export type MapRow = Database["public"]["Tables"]["maps"]["Row"];
export type MapStatus = Database["public"]["Enums"]["map_status"];



export const MAP_STATUS = [
  "Planned",
  "On hold",
  "Dropped",
  "Completed",
  "Ongoing",
] as const;

export const MapStatusSchema = z.enum(MAP_STATUS);
export type MapStatusEnum = z.infer<typeof MapStatusSchema>


// ----- Map “pure” (inchangé)
export const MapSchema = z.object({
    b_count: z.number().int().nonnegative(),
    cheats: z.boolean(),
    cp_count: z.number().int().nonnegative(),
    created_at: z.iso.datetime({ offset: true }),
    id: z.number().int().nonnegative(),
    is_linear: z.boolean(),
    lastplayed_at: z.iso.datetime({ offset: true }).nullable(),
    leniency: z.number().nullable(),
    max_velocity: z.number().nonnegative(),
    name: z.string().min(1),
    stages_count: z.number().int().nonnegative().nullable(),
    tier: z.number().int().min(1).max(8),
    zones_count: z.number().int().nonnegative().nullable(),
}).strict();
export type Map = z.infer<typeof MapSchema>;

// ----- UserMap “completion” embarquée dans la Map
export const UserMapCompletionSchema = z.object({
    id: z.number().int().nonnegative(),
    user_id: z.uuid(),
    map_id: z.number().int().nonnegative(),

    status: MapStatusSchema,

    bonuses_completed: z.array(z.number().int().positive()).default([]),
    stages_completed: z.array(z.number().int().positive()).default([]),

    completed_at: z.iso.datetime({ offset: true }).nullable(),
    created_at: z.iso.datetime({ offset: true }),
    updated_at: z.iso.datetime({ offset: true }),

    // champs KSF que tu as ajoutés à user_maps
    time: z.number().nullable().optional(),
    wrDiff: z.number().nullable().optional(),
    date: z.iso.datetime({ offset: true }).nullable().optional(),
    points: z.number().nullable().optional(),
    count: z.number().int().nullable().optional(),
    rank: z.string().nullable().optional(),
}).strict();
export type UserMapCompletion = z.infer<typeof UserMapCompletionSchema>;

// ----- Map + completion
export const MapWithCompletionSchema = MapSchema.extend({
    completion_data: UserMapCompletionSchema.nullable(),
}).strict();
export type MapWithCompletion = z.infer<typeof MapWithCompletionSchema>;

// ----- Groupes par statut (arrays de MapWithCompletion)
export const MapStatusGroupWithCompletionSchema = z.object({
    Completed: z.array(MapWithCompletionSchema),
    Ongoing: z.array(MapWithCompletionSchema),
    "On hold": z.array(MapWithCompletionSchema),
    Planned: z.array(MapWithCompletionSchema),
    Dropped: z.array(MapWithCompletionSchema),
});
export type MapStatusGroupWithCompletion = z.infer<typeof MapStatusGroupWithCompletionSchema>;
