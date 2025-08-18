import { z } from "zod";
import { MapSchema } from "../maps/schemas";

export const GetByStatusQuery = z.object({
    user_id: z.uuid(),
});

export const GroupsSchema = z.object({
    Completed: z.array(MapSchema),
    Ongoing: z.array(MapSchema),
    "On hold": z.array(MapSchema),
    Planned: z.array(MapSchema),
    Dropped: z.array(MapSchema),
});

export const GetByStatusResponse = z.object({
    ok: z.literal(true),
    counts: z.object({
        Completed: z.number(),
        Ongoing: z.number(),
        "On hold": z.number(),
        Planned: z.number(),
        Dropped: z.number(),
        total: z.number(),
    }),
    groups: GroupsSchema,
}).or(
    z.object({ ok: z.literal(false), message: z.string() })
);


export type Groups = z.infer<typeof GroupsSchema>;
export type GetByStatusOk = z.infer<typeof GetByStatusResponse> & { ok: true };



// DB enum public.map_status
export const MapStatus = z.enum(["Planned", "On hold", "Dropped", "Completed", "Ongoing"]);
export type MapStatus = z.infer<typeof MapStatus>;

// ---- Add (self) ----
export const AddMapSelfBody = z.object({
    map_id: z.number().int().nonnegative(),        // bigint in DB
    status: MapStatus,                              // e.g. "Planned" | "Ongoing" | "Completed"
    bonuses: z.array(z.number().int().positive()).optional().default([]),
    stages: z.array(z.number().int().positive()).optional().default([]),
});
export type AddMapSelfBody = z.infer<typeof AddMapSelfBody>;

// ---- Add (admin) ----
export const AddMapAdminBody = AddMapSelfBody.extend({
    user_id: z.string().uuid(),
});
export type AddMapAdminBody = z.infer<typeof AddMapAdminBody>;

// ---- API response ----
export const OkResponse = z.object({ ok: z.literal(true) });
export const ErrResponse = z.object({ ok: z.literal(false), message: z.string() });
export const AddMapResponse = OkResponse.or(ErrResponse);
export type AddMapResponse = z.infer<typeof AddMapResponse>;
