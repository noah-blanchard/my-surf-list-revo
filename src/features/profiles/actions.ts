// src/features/profiles/actions.ts
"use client";

import { fetchProfile, editProfileApi } from "./api";
import { EditProfileSchema, EditProfileResponse } from "./validators";

export async function getProfileAction(userId: string) {
  try {
    const data = await fetchProfile(userId);
    return { ok: true as const, data }; // { profile }
  } catch (e) {
    return { ok: false as const, message: (e as Error)?.message ?? "Failed to load profile" };
  }
}

export async function editProfileAction(input: unknown): Promise<EditProfileResponse> {
  const parsed = EditProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
    }
  try {
    return await editProfileApi(parsed.data);
  } catch (e) {
    return { ok: false, message: (e as Error)?.message ?? "Failed to edit profile" };
  }
}