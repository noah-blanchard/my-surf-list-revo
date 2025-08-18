import { Database } from "@/types/supabase";
import { z } from "zod";

export type MapRow = Database["public"]["Tables"]["maps"]["Row"];
export type MapStatus = Database["public"]["Enums"]["map_status"];

export enum MapStatusEnum {
    Planned = "Planned",
    OnHold = "On hold",
    Dropped = "Dropped",
    Completed = "Completed",
    Ongoing = "Ongoing",
}

export const MapSchema = z.object({
    b_count: z.number().int().nonnegative(),
    cheats: z.boolean(),
    cp_count: z.number().int().nonnegative(),
    created_at: z.iso.datetime({
        offset: true,
    }),   
    id: z.number().int().nonnegative(),
    is_linear: z.boolean(),
    lastplayed_at: z.iso.datetime({
        offset: true,
    }).nullable(),
    leniency: z.number().nullable(),
    max_velocity: z.number().nonnegative(),
    name: z.string().min(1),
    stages_count: z.number().int().nonnegative().nullable(),
    tier: z.number().int().min(1).max(8), // ajuste si >8 possible
    zones_count: z.number().int().nonnegative().nullable(),
}).strict();

export const MapStatusGroupSchema = z.object({
    Completed: z.array(MapSchema),
    Ongoing: z.array(MapSchema),
    "On hold": z.array(MapSchema),
    Planned: z.array(MapSchema),
    Dropped: z.array(MapSchema),
});

export type Map = z.infer<typeof MapSchema>;
export type MapStatusGroup = z.infer<typeof MapStatusGroupSchema>;