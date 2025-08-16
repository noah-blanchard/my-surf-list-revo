// src/features/profiles/actions.ts
"use client";

import { fetchMe, editProfileApi } from "./api";
import { EditProfileSchema, EditProfileResponse } from "./validators";


export async function getMeAction() {
    try {
        const data = await fetchMe(); // appelle /api/me
        // data = { user: User|null, profile: ProfileRow|null }
        return { ok: true as const, data };
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
        // ⬇️ Appel centralisé via api.ts
        return await editProfileApi(parsed.data);
    } catch (e) {
        return { ok: false, message: (e as Error)?.message ?? "Failed to edit profile" };
    }
}