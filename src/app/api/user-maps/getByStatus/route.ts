import { NextRequest } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { GetByStatusQuery, GetByStatusResponse } from "@/features/user-maps/validators";
import { GetByStatusRawResponseSchema } from "./schema";
import { Map } from "@/features/maps/schemas";
import { UserMap } from "@/features/user-maps/schemas";


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
    .select("*, maps:map_id(*)")
    .eq("user_id", user_id)
    .order("updated_at", { ascending: false })

  if (error) {
    return new Response(JSON.stringify({ ok: false, message: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  const safeRawData = GetByStatusRawResponseSchema.safeParse(data);
  if (!safeRawData.success) {
    return new Response(JSON.stringify({ ok: false, message: "Invalid response shape" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }


  const groups: Record<UserMap["status"], Map[]> = {
    Completed: [],
    Ongoing: [],
    "On hold": [],
    Planned: [],
    Dropped: [],
  };

  for (const row of data ?? []) {
    const m = Array.isArray(row.maps) ? row.maps[0] : row.maps;
    if (!m) continue;

    const item: Map = m;

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
