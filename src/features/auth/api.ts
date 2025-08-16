// features/auth/api.ts
// "Fetch" layer: thin wrappers around Supabase SDK.
import { createServerSupabase } from "@/lib/supabase/server";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { SignInInput, SignUpInput } from "./validators";

// Server-side auth (used in Server Actions)
export async function serverSignUp(input: SignUpInput) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
            data: {
                display_name: input.displayName,
                steam_id64: input.steamId64 ?? null,
            },
        },
    });

    if (error) throw error;
    return data;
}
export async function serverSignIn(input: SignInInput) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
    });
    if (error) throw error;
    return data;
}

export async function serverSignOut() {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

// Client-side variants (if you prefer to call from client components)
export const clientAuth = {
    signIn: (i: SignInInput) =>
        supabaseBrowser.auth.signInWithPassword({ email: i.email, password: i.password }),
    signUp: (i: SignUpInput) =>
        supabaseBrowser.auth.signUp({ email: i.email, password: i.password }),
    signOut: () => supabaseBrowser.auth.signOut(),
};