// src/features/maps/validator.ts
import { z } from "zod";

export const GetMapsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),

  q: z.string().trim().min(1).optional(),                  // recherche par nom
  tier: z.coerce.number().int().min(1).max(10).optional(), // ajuste max si besoin
  isLinear: z
    .union([z.literal("true"), z.literal("false"), z.literal("all")])
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),

  sort: z
    .enum(["alpha", "tier", "created"])
    .optional()
    .default("created"),
  dir: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type GetMapsQuery = z.infer<typeof GetMapsQuery>;
