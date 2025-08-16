// features/profiles/validators.ts
import { z } from "zod";

export const ProfileRowSchema = z.object({
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  display_name: z.string().nullable(),
  steam_id64: z.string().nullable(),
});
export type ProfileRow = z.infer<typeof ProfileRowSchema>;

// (garde si tu en as besoin ailleurs)
export const UpdateProfileBody = z.object({
  display_name: z.string().min(1).max(100).optional().nullable(),
  steam_id64: z.string().min(1).max(32).optional().nullable(),
});
export type UpdateProfileBody = z.infer<typeof UpdateProfileBody>;

export const EditProfileSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, "Display Name must be at least 2 characters")
    .max(32, "Display Name must be at most 32 characters"),
  steam_id64: z
    .string()
    .trim()
    .length(17, "SteamID64 must be 17 digits")
    .regex(/^\d+$/, "SteamID64 must be numeric")
    .refine((v) => v.startsWith("765"), "SteamID64 should start with 765…"),
});
export type EditProfilePayload = z.infer<typeof EditProfileSchema>;

export const EditProfileResponse = z.object({
  ok: z.boolean(),
  message: z.string().optional(),
});
export type EditProfileResponse = z.infer<typeof EditProfileResponse>;
