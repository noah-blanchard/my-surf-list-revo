// lib/auth.ts
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export async function getSession() {
  const supabase = await createClient();
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