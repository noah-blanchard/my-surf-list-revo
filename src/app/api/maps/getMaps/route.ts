// src/app/api/maps/getMaps/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { GetMapsQuery } from "@/features/maps/validators";

type MapRow = Database["public"]["Tables"]["maps"]["Row"];

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = GetMapsQuery.safeParse({
      page: url.searchParams.get("page"),
      pageSize: url.searchParams.get("pageSize"),
      q: url.searchParams.get("q") || undefined,
      tier: url.searchParams.get("tier") || undefined,
      isLinear: (url.searchParams.get("type")) || undefined, // type=all|true|false
      sort: (url.searchParams.get("sort")) || undefined,
      dir: (url.searchParams.get("dir")) || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid query" },
        { status: 400 }
      );
    }

    const { page, pageSize = 20, q, tier, isLinear, sort, dir } = parsed.data;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = await createServerSupabase();

    let query = supabase
      .from("maps")
      .select("*", { count: "exact", head: false });

    if (q) query = query.ilike("name", `%${q}%`);
    if (typeof tier === "number") query = query.eq("tier", tier);
    if (typeof isLinear === "boolean") query = query.eq("is_linear", isLinear);

    const sortCol =
      sort === "alpha" ? "name" :
      sort === "tier" ? "tier" :
      "created_at";

    query = query.order(sortCol, { ascending: dir === "asc" });

    const { data: items, error, count } = await query.range(from, to);

    if (error) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
    }

    const total = count ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json(
      {
        ok: true,
        data: {
          items: (items ?? []) as MapRow[],
          page,
          pageSize,
          total,
          pageCount,
          hasPrev: page > 1,
          hasNext: page < pageCount,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return NextResponse.json({ ok: false, message: (e as Error)?.message ?? "Server error" }, { status: 500 });
  }
}
