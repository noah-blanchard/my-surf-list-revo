import { UserMapSchema } from "@/features/user-maps/schemas";
import { z } from "zod";    

export const GetUserMapParamsSchema = z.object({
  mapId: z.coerce.number().min(1, "Missing mapId"),
});

export type GetUserMapPayload = z.infer<typeof GetUserMapParamsSchema>;

export const GetUserMapResponseSchema = z.object({
  ok: z.literal(true),
  user_map: UserMapSchema,
}).or(
  z.object({
    ok: z.literal(false),
    message: z.string(),
  })
);