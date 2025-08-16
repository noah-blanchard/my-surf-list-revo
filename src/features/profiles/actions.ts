// src/features/profiles/actions.ts
"use client";

import { fetchMe } from "./api";

export async function getMeAction() {
    try {
        const data = await fetchMe(); // appelle /api/me
        // data = { user: User|null, profile: ProfileRow|null }
        return { ok: true as const, data };
    } catch (e) {
        return { ok: false as const, message: (e as Error)?.message ?? "Failed to load profile" };
    }
}
