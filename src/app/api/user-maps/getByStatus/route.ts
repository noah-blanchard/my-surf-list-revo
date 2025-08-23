// app/api/user-maps/getByStatus/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { GetByStatusQuery } from "@/features/user-maps/validators";
import type { UserMap } from "@/features/user-maps/schemas";
import type { MapWithCompletion } from "@/features/maps/schemas";
import { GetByStatusResponseSchema } from "./schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parsed = GetByStatusQuery.safeParse({
    user_id: url.searchParams.get("user_id") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json({ ok: false as const, message: "Invalid user_id" }, { status: 400 });
  }
  const { user_id } = parsed.data;

  const supabase = await createServerSupabase();

  // Auth
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ ok: false as const, message: "Unauthorized" }, { status: 401 });
  }

  // On part de user_maps (on veut la completion) + map jointe
  const { data, error } = await supabase
    .from("user_maps")
    .select("*, maps:map_id(*)")
    .eq("user_id", user_id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false as const, message: error.message }, { status: 500 });
  }

  // Record<status, MapWithCompletion[]>
  const groups: Record<UserMap["status"], MapWithCompletion[]> = {
    Completed: [],
    Ongoing: [],
    "On hold": [],
    Planned: [],
    Dropped: [],
  };

  for (const row of data ?? []) {
    const m = Array.isArray(row.maps) ? row.maps[0] : row.maps;
    if (!m) continue;

    const completion_data = {
      id: row.id,
      user_id: row.user_id,
      map_id: row.map_id,
      status: row.status,
      bonuses_completed: row.bonuses_completed ?? [],
      stages_completed: row.stages_completed ?? [],
      completed_at: row.completed_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      time: row.time ?? null,
      wrDiff: row.wrDiff ?? null,
      date: row.date ?? null,
      points: row.points ?? null,
      count: row.count ?? null,
      rank: row.rank ?? null,
    };

    groups[row.status]?.push({ ...m, completion_data } as MapWithCompletion);
  }

  const counts = {
    Completed: groups.Completed.length,
    Ongoing: groups.Ongoing.length,
    "On hold": groups["On hold"].length,
    Planned: groups.Planned.length,
    Dropped: groups.Dropped.length,
    total: (data ?? []).length,
  };

  const payload = { ok: true as const, counts, groups };
  const safe = GetByStatusResponseSchema.safeParse(payload);
  if (!safe.success) {
    return NextResponse.json({ ok: false as const, message: "Bad response" }, { status: 500 });
  }

  return NextResponse.json(safe.data, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
