import { NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { AddMapSelfBody, AddMapResponse } from "@/features/user-maps/validators";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();

  // must be authenticated
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return new Response(JSON.stringify({ ok: false, message: "Unauthorized" satisfies string }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  // validate body
  const json = await req.json().catch(() => null);
  const parsed = AddMapSelfBody.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ ok: false, message: parsed.error.issues[0]?.message ?? "Invalid body" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const { map_id, status, bonuses, stages } = parsed.data;

  // call RPC (RLS-friendly: function uses auth.uid())
  const { error } = await supabase.rpc("add_map_self", {
    p_map_id: map_id,
    p_status: status,
    p_bonuses: bonuses ?? [],
    p_stages: stages ?? [],
  });

  if (error) {
    return new Response(JSON.stringify({ ok: false, message: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  const payload: AddMapResponse = { ok: true };
  return new Response(JSON.stringify(payload), {
    status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
