import { NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { AddMapAdminBody, AddMapResponse } from "@/features/user-maps/validators";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return new Response(JSON.stringify({ ok: false, message: "Unauthorized" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  const json = await req.json().catch(() => null);
  const parsed = AddMapAdminBody.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ ok: false, message: parsed.error.issues[0]?.message ?? "Invalid body" }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const { user_id, map_id, status, bonuses, stages } = parsed.data;

  // simple guard (retire-le quand tu auras un vrai système d’admin)
  if (user_id !== session.user.id) {
    return new Response(JSON.stringify({ ok: false, message: "Forbidden" }), {
      status: 403, headers: { "Content-Type": "application/json" },
    });
  }

  const { error } = await supabase.rpc("_add_map", {
    p_user_id: user_id,
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
