import { z } from "zod";
import { UserMapSchema } from "@/features/user-maps/schemas";
import {
  MapStatusGroupWithCompletionSchema,
} from "@/features/maps/schemas";

export const GetByStatusRawResponseSchema = z.array(UserMapSchema);
export type GetByStatusRawResponse = z.infer<typeof GetByStatusRawResponseSchema>;

export const GetByStatusResponseSchema = z
  .object({
    ok: z.literal(true),
    counts: z.object({
      Completed: z.number(),
      Ongoing: z.number(),
      "On hold": z.number(),
      Planned: z.number(),
      Dropped: z.number(),
      total: z.number(),
    }),
    groups: MapStatusGroupWithCompletionSchema,
  })
  .or(z.object({ ok: z.literal(false), message: z.string() }));

export type GetByStatusResponse = z.infer<typeof GetByStatusResponseSchema>;