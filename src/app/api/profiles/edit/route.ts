import { NextRequest, NextResponse } from "next/server";
import { EditProfileSchema, EditProfileResponse } from "@/features/profiles/validators";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parse = EditProfileSchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(
        { ok: false, message: parse.error.issues[0]?.message ?? "Invalid payload" } satisfies EditProfileResponse,
        { status: 400 }
      );
    }

    const { display_name, steam_id64 } = parse.data;

    const supabase = await createServerSupabase();

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ ok: false, message: "Not authenticated" } satisfies EditProfileResponse, { status: 401 });
    }

    const { error } = await supabase.rpc("edit_profile_self", {
      p_display_name: display_name,
      p_steam_id64: steam_id64 ?? null,
    });

    if (error) {
      return NextResponse.json({ ok: false, message: error.message } satisfies EditProfileResponse, { status: 400 });
    }

    return NextResponse.json({ ok: true } satisfies EditProfileResponse, { status: 200 });
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error)?.message ?? "Server error" } satisfies EditProfileResponse, { status: 500 });
  }
}
