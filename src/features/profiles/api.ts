"use client";
import { z } from "zod";
import type { Database } from "@/types/supabase";
import type { User } from "@supabase/supabase-js";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const ProfileSchema = z.object({
    user_id: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    display_name: z.string().nullable(),
    steam_id64: z.string().nullable(),
});

const MeResponseSchema = z.object({
    profile: ProfileSchema.nullable(),
});

export type MeResponse = z.infer<typeof MeResponseSchema>;

/**
 * Appelle l’endpoint interne GET /api/me.
 * Utilisable côté serveur (Server Action/Route) comme côté client (Component).
 */
export async function fetchMe(options?: { signal?: AbortSignal }) {


    const res = await fetch("/api/profiles/me", {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: options?.signal,
    });


    if (res.status === 401) {
        // Non connecté
        return { user: null, profile: null } as MeResponse;
    }
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`GET /api/me failed (${res.status}): ${txt || res.statusText}`);
    }

    const json = await res.json();
    const parsed = MeResponseSchema.safeParse(json);
    if (!parsed.success) {
        throw new Error("Invalid /api/me response shape");
    }
    return parsed.data;
}


