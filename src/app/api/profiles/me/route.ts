// src/app/api/me/route.ts
import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createServerSupabase();



    // Récupération session
    const { data: { session } } = await supabase.auth.getSession();


    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
        { profile },
        { status: 200, headers: { "Cache-Control": "no-store" } }
    );
}
