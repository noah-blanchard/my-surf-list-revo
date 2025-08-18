import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { GetUserMapParamsSchema } from "./schema";

export async function GET(
  _req: Request,
  context: { params: Promise<{ mapId?: string }> } // Next.js 15: Promise
) {
  try {
    const supabase = await createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const params = await context.params; // await the Promise
    const parsed = GetUserMapParamsSchema.safeParse(params);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid map id";
      return NextResponse.json({ ok: false, message: msg }, { status: 400 });
    }
    const { mapId } = parsed.data;

    const { data, error } = await supabase
      .from("user_maps")
      .select("*")
      .eq("user_id", userId)
      .eq("map_id", mapId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, user_map: data }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Internal error";
    return NextResponse.json({ ok: false, message: msg }, { status: 500 });
  }
}
