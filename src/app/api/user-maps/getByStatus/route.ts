import { NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { GetByStatusQuery, GetByStatusResponse } from "@/features/user-maps/validators";

type UMRow = Database["public"]["Tables"]["user_maps"]["Row"];
type MapRow = Database["public"]["Tables"]["maps"]["Row"];

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parsed = GetByStatusQuery.safeParse({ user_id: url.searchParams.get("user_id") ?? "" });
  if (!parsed.success) {

    return new Response(JSON.stringify({ ok: false, message: "Invalid user_id" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }
  const { user_id } = parsed.data;

  const supabase = await createServerSupabase();

  // Auth
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return new Response(JSON.stringify({ ok: false, message: "Unauthorized" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  // NOTE RLS: avec la policy "read_own", ce SELECT ne marchera que si user_id === session.user.id
  // Pour autoriser la lecture publique des listes, tu peux:
  // create policy "read_user_maps_all" on public.user_maps for select to authenticated using (true);

  // join user_maps -> maps
  const { data, error } = await supabase
    .from("user_maps")
    .select("status, completed_at, updated_at, maps:map_id(id, name, tier, is_linear)")
    .eq("user_id", user_id)
    .order("updated_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ ok: false, message: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  const groups = {
    Completed: [] as any[],
    Ongoing: [] as any[],
    "On hold": [] as any[],
    Planned: [] as any[],
    Dropped: [] as any[],
  };

  for (const row of (data ?? []) as (Pick<UMRow, "status" | "completed_at" | "updated_at"> & { maps: Pick<MapRow, "id" | "name" | "tier" | "is_linear"> | null })[]) {
    if (!row.maps) continue;
    const item = {
      id: Number(row.maps.id),
      name: row.maps.name as string,
      tier: Number(row.maps.tier),
      is_linear: !!row.maps.is_linear,
      completed_at: row.completed_at ?? null,
      updated_at: row.updated_at ?? undefined,
    };
    (groups as any)[row.status]?.push(item);
  }

  const counts = {
    Completed: groups.Completed.length,
    Ongoing: groups.Ongoing.length,
    "On hold": groups["On hold"].length,
    Planned: groups.Planned.length,
    Dropped: groups.Dropped.length,
    total: (data ?? []).length,
  };

  const payload = { ok: true, counts, groups };
  const safe = GetByStatusResponse.parse(payload); // defensive
  return new Response(JSON.stringify(safe), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
