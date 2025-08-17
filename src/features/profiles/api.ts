// src/features/profiles/api.ts
"use client";

import type { Database } from "@/types/supabase";
import { EditProfilePayload, EditProfileResponse } from "@/app/api/profiles/edit-self/schema";
import { GetProfileResponseSchema } from "@/app/api/profiles/[userId]/schemas";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

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
  const parsed = GetProfileResponseSchema.safeParse(json);
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