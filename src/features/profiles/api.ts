// src/features/profiles/api.ts
"use client";

import { z } from "zod";
import type { Database } from "@/types/supabase";
import type { EditProfilePayload, EditProfileResponse } from "./validators";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const ProfileSchema = z.object({
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  display_name: z.string().nullable(),
  steam_id64: z.string().nullable(),
});

const ProfileResponseSchema = z.object({
  profile: ProfileSchema.nullable(),
});
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

export async function fetchProfile(userId: string, options?: { signal?: AbortSignal }) {
  const res = await fetch(`/api/profiles/${encodeURIComponent(userId)}`, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GET /api/profiles/${userId} failed (${res.status}): ${txt || res.statusText}`);
  }

  const json = await res.json();
  const parsed = ProfileResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error("Invalid /api/profiles/[userId] response shape");
  }
  return parsed.data; // { profile: ProfileRow | null }
}

export async function editProfileApi(body: EditProfilePayload): Promise<EditProfileResponse> {
  const res = await fetch("/api/profiles/edit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  const data = (await res.json()) as EditProfileResponse;
  if (!res.ok) throw new Error(data.message || "Failed to edit profile");
  return data;
}