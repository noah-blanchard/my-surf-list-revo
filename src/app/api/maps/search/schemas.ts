import { z } from "zod";
import { MapSchema } from "@/features/maps/schemas";
import { UserMapCompletionSchema } from "@/features/maps/schemas";

export const SearchMapsParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().trim().min(1).optional(),
  tier: z.coerce.number().int().min(1).max(8).optional(),
  isLinear: z
    .union([z.literal("true"), z.literal("false"), z.literal("all")])
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  sort: z.enum(["alpha", "tier", "created"]).optional().default("created"),
  dir: z.enum(["asc", "desc"]).optional().default("desc"),

  // NEW
  completion: z.enum(["all", "complete", "incomplete", "unplayed"]).optional().default("all"),
});

export type SearchMapsPayload = z.infer<typeof SearchMapsParamsSchema>;


// Map + completion_data (pour l'utilisateur courant)
export const MapWithCompletionSchema = MapSchema.extend({
  completion_data: UserMapCompletionSchema.nullable().optional(),
});

export const SearchMapsResponseSchema = z
  .object({
    ok: z.literal(true),
    data: z.object({
      hasNext: z.boolean(),
      hasPrev: z.boolean(),
      items: z.array(MapWithCompletionSchema).nullable().optional(),
      page: z.number().int(),
      pageSize: z.number().int(),
      total: z.number().int(),
      pageCount: z.number().int(),
    }),
  })
  .or(
    z.object({
      ok: z.literal(false),
      message: z.string(),
    })
  );

export type SearchMapsResponse = z.infer<typeof SearchMapsResponseSchema>;
