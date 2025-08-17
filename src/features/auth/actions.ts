// src/features/auth/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "./validators";

// Types de retour uniformes
type ActionResult = { ok: true, needsConfirmation?: boolean } | { ok: false; message: string, needsConfirmation?: boolean };

// -------------------------------
// SIGN UP (server-side, no redirect)
// -------------------------------
export async function signUpAction(
  email: string,
  password: string,
  displayName: string,
  steamId64?: string
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse({ email, password, displayName, steamId64 });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
        steam_id64: parsed.data.steamId64 ?? null,
      },
    },
  });

  if (error) return { ok: false, message: error.message };

  return { ok: true, needsConfirmation: true };
}

// -------------------------------
// SIGN IN (server-side, no redirect)
// -------------------------------
export async function signInAction(email: string, password: string): Promise<ActionResult> {
  const parsed = signInSchema.safeParse({ email, password });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { ok: false, message: error.message };

  // Optionnel
  // revalidatePath("/", "layout");

  return { ok: true };
}

// -------------------------------
// SIGN OUT (server-side, no redirect)
// -------------------------------
export async function signOutAction(): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, message: error.message };

  // Optionnel
  // revalidatePath("/", "layout");

  return { ok: true };
}
