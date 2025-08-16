import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { GetStatsQuery, UserStatsSchema } from "@/features/stats/validators";

async function countStatus(
  supabase: ReturnType<typeof createServerSupabase> extends Promise<infer C> ? C : never,
  userId: string,
  status: "Planned" | "On hold" | "Dropped" | "Completed" | "Ongoing"
) {
  const { count, error } = await supabase
    .from("user_maps")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", status);
  if (error) throw error;
  return count ?? 0;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = GetStatsQuery.safeParse({ user_id: url.searchParams.get("user_id") });
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid query" },
        { status: 400 }
      );
    }
    const { user_id } = parsed.data;

    const supabase = await createServerSupabase();

    // 5 petits COUNT parallèles (head:true => pas de lignes transférées)
    const [planned, onHold, dropped, completed, ongoing] = await Promise.all([
      countStatus(supabase, user_id, "Planned"),
      countStatus(supabase, user_id, "On hold"),
      countStatus(supabase, user_id, "Dropped"),
      countStatus(supabase, user_id, "Completed"),
      countStatus(supabase, user_id, "Ongoing"),
    ]);

    const stats = {
      planned,
      on_hold: onHold,
      dropped,
      completed,
      ongoing,
      total: planned + onHold + dropped + completed + ongoing,
    };

    // validation de sortie (défensif)
    const safe = UserStatsSchema.parse(stats);

    return NextResponse.json({ ok: true, data: safe }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error)?.message ?? "Server error" }, { status: 500 });
  }
}
