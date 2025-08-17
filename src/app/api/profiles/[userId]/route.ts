// src/app/api/profiles/[userId]/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

const ParamsSchema = z.object({ userId: z.string().min(1, "Missing userId") });

export async function GET(
  _req: Request,
  context: { params: { userId?: string } }
) {
  const params = await context.params;
  const parse = ParamsSchema.safeParse(params);
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
    // row not found
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
