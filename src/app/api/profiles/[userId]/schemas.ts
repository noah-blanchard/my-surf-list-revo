import { ProfileSchema } from "@/features/profiles/schemas";
import { z } from "zod";

export const GetProfileSchema = z.object({ userId: z.string().min(1, "Missing userId") });
export type GetProfilePayload = z.infer<typeof GetProfileSchema>;

export const GetProfileResponseSchema = z.object({
  profile: ProfileSchema.nullable(),
});
export type GetProfileResponse = z.infer<typeof GetProfileResponseSchema>;
