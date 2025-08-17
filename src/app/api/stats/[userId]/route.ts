import { NextResponse, type NextRequest } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { GetStatsParamsSchema } from "./schemas";

// aide de typage pour le client supabase retourné par createServerSupabase()
type SupabaseClient = Awaited<ReturnType<typeof createServerSupabase>>;

async function countStatus(
  supabase: SupabaseClient,
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

type Ctx = { params: Promise<{ userId?: string }> };

export async function GET(_req: NextRequest, context: Ctx) {
  try {
    const params = await context.params;
    const parsed = GetStatsParamsSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid params" },
        { status: 400 }
      );
    }
    const { userId } = parsed.data;

    const supabase = await createServerSupabase();

    // 5 counts en parallèle (head:true => pas de lignes transférées)
    const [planned, onHold, dropped, completed, ongoing] = await Promise.all([
      countStatus(supabase, userId, "Planned"),
      countStatus(supabase, userId, "On hold"),
      countStatus(supabase, userId, "Dropped"),
      countStatus(supabase, userId, "Completed"),
      countStatus(supabase, userId, "Ongoing"),
    ]);

    const stats = {
      planned,
      on_hold: onHold,
      dropped,
      completed,
      ongoing,
      total: planned + onHold + dropped + completed + ongoing,
    };

    return NextResponse.json(
      { ok: true, data: stats },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: (e as Error)?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
