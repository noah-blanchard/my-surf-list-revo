import { Database } from "@/types/supabase";
import { z } from "zod";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export const ProfileSchema = z.object({
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  display_name: z.string().nullable(),
  steam_id64: z.string().nullable(),
});

export type Profile = z.infer<typeof ProfileSchema>;