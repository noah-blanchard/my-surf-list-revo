// features/auth/api.ts
// "Fetch" layer: thin wrappers around Supabase SDK.
import { supabaseBrowser } from "@/lib/supabase/client";
import { createClient } from '@/lib/supabase/server'
import type { SignInInput, SignUpInput } from "./validators";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Server-side auth (used in Server Actions)
export async function serverSignUp(input: SignUpInput) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
            data: {
                display_name: input.displayName,
                steam_id64: input.steamId64 ?? null,
            },
        },
    });

    if (error) { redirect('/error') }
    revalidatePath('/', 'layout');
    // redirect('/dashboard');
}
export async function serverSignIn(input: SignInInput) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email: input.email, password: input.password,
    });

    if (error) {
        // éventuellement revalidatePath(...) avant
        redirect('/error');
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard');
}

export async function serverSignOut() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    console.log("error", error);
    if (error) throw error;
    revalidatePath('/', 'layout');
    redirect('/sign-in');
}

// Client-side variants (if you prefer to call from client components)
export const clientAuth = {
    signIn: (i: SignInInput) =>
        supabaseBrowser.auth.signInWithPassword({ email: i.email, password: i.password }),
    signUp: (i: SignUpInput) =>
        supabaseBrowser.auth.signUp({ email: i.email, password: i.password }),
    signOut: () => supabaseBrowser.auth.signOut(),
};

