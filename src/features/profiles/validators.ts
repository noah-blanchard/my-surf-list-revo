import { z } from "zod";

export const ProfileRowSchema = z.object({
    user_id: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    display_name: z.string().nullable(),
    steam_id64: z.string().nullable(),
});
export type ProfileRow = z.infer<typeof ProfileRowSchema>;

// PATCH body (tous champs optionnels)
export const UpdateProfileBody = z.object({
    display_name: z.string().min(1).max(100).optional().nullable(),
    steam_id64: z.string().min(1).max(32).optional().nullable(),
});
export type UpdateProfileBody = z.infer<typeof UpdateProfileBody>;
