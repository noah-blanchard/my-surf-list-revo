// src/app/api/profiles/[userId]/route.ts
import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { GetProfileSchema } from "./schemas";

type Ctx = { params: Promise<{ userId?: string }> };

export async function GET(
  _req: Request,
  context: Ctx
) {
  const params = await context.params;
  const parse = GetProfileSchema.safeParse(params);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues[0]?.message ?? "Bad request" }, { status: 400 });
  }
  const { userId } = parse.data;

  const supabase = await createServerSupabase();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error?.code === "PGRST116") {
    return NextResponse.json({ profile: null }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { profile },
    { status: 200, headers: { "Cache-Control": "no-store" } }
  );
}
