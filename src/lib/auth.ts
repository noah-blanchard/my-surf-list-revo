// lib/auth.ts
import { redirect } from "next/navigation";
import { createServerSupabase } from "./supabase/server";

export async function getSession() {
  const supabase = await createServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) redirect("/sign-in");
  return session.user;
}