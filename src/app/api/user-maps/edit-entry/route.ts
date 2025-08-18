// src/app/api/user-maps/edit-entry/route.ts
import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { EditUserMapEntryParamsSchema, EditUserMapEntryPayload } from "./schemas";

export async function PUT(req: Request) {
    try {
        const supabase = await createServerSupabase();

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const body = await req.json();
        const parsed = EditUserMapEntryParamsSchema.safeParse(body);
        if (!parsed.success) {
            const msg = parsed.error.issues[0]?.message ?? "Invalid payload";
            return NextResponse.json({ ok: false, message: msg }, { status: 400 });
        }
        const { id, status, bonuses_completed, stages_completed, completed_at } = parsed.data;

        const patch: Partial<EditUserMapEntryPayload> = {};
        if (status !== undefined) patch.status = status;
        if (bonuses_completed !== undefined) patch.bonuses_completed = bonuses_completed;
        if (stages_completed !== undefined) patch.stages_completed = stages_completed;
        if (completed_at !== undefined) patch.completed_at = completed_at;

        const { data: updated, error } = await supabase
            .from("user_maps")
            .update(patch)
            .eq("id", id)
            .eq("user_id", userId)
            .select(`
        id, user_id, map_id, status, bonuses_completed, stages_completed,
        completed_at, created_at, updated_at,
        maps:maps(*)
      `)
            .single();

        if (error) {
            return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
        }
        // Return typed success
        return NextResponse.json({ ok: true, data: updated }, { status: 200 });
    } catch (e) {
        const msg = e instanceof Error ? e.message : "Internal error";
        return NextResponse.json({ ok: false, message: msg }, { status: 500 });
    }
}
