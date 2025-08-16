import { NextRequest } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { GetByStatusQuery, GetByStatusResponse } from "@/features/user-maps/validators";

type UMRow = Database["public"]["Tables"]["user_maps"]["Row"];
type MapRow = Database["public"]["Tables"]["maps"]["Row"];

// DB a souvent `updated_at` nullable → on l’autorise
type MapRowReturn = Pick<MapRow, "id" | "name" | "tier" | "is_linear"> & { updated_at: string | null };

// Type *exact* de la jointure qu’on attend de Supabase
type UMSelect = Pick<UMRow, "status" | "completed_at" | "updated_at"> & {
  maps: Pick<MapRow, "id" | "name" | "tier" | "is_linear"> | null;
};

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

  // Jointure 1→1 : map_id → maps.id
  // On FORCE le type avec `.returns<UMSelect[]>()` pour éviter l’array fantôme.
  const { data, error } = await supabase
    .from("user_maps")
    .select("status, completed_at, updated_at, maps:map_id(id, name, tier, is_linear)")
    .eq("user_id", user_id)
    .order("updated_at", { ascending: false })
    .returns<UMSelect[]>(); // <<< Important

  if (error) {
    return new Response(JSON.stringify({ ok: false, message: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  const groups: Record<UMRow["status"], MapRowReturn[]> = {
    Completed: [],
    Ongoing: [],
    "On hold": [],
    Planned: [],
    Dropped: [],
  };

  for (const row of data ?? []) {
    // Défensif : si jamais Supabase renvoie un tableau (mauvaise relation), on prend le 1er.
    const m = Array.isArray(row.maps) ? row.maps[0] : row.maps;
    if (!m) continue;

    const item: MapRowReturn = {
      id: Number(m.id),
      name: String(m.name),
      tier: Number(m.tier),
      is_linear: Boolean(m.is_linear),
      updated_at: row.updated_at ?? null,
    };

    groups[row.status]?.push(item);
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
