// .../route.ts
import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { SearchMapsParamsSchema } from "./schemas";
import type { UserMap } from "@/features/user-maps/schemas";
import type { MapWithCompletion } from "@/features/maps/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = SearchMapsParamsSchema.safeParse({
      page: url.searchParams.get("page"),
      pageSize: url.searchParams.get("pageSize"),
      q: url.searchParams.get("q") || undefined,
      tier: url.searchParams.get("tier") || undefined,
      isLinear: url.searchParams.get("type") || undefined,
      sort: url.searchParams.get("sort") || undefined,
      dir: url.searchParams.get("dir") || undefined,
      completion: url.searchParams.get("completion") || undefined, // NEW
    });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid query" },
        { status: 400 }
      );
    }

    const {
      page,
      pageSize = 20,
      q,
      tier,
      isLinear,
      sort,
      dir,
      completion, // NEW
    } = parsed.data;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = await createServerSupabase();

    // On récupère l'utilisateur AVANT de construire la requête maps (pour appliquer le filtre)
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    // Prépare les sets d'ids nécessaires pour filtrer
    let completedIds: number[] = [];
    let anyIds: number[] = [];

    if (!userErr && user && completion !== "all") {
      // Une seule requête pour récupérer map_id + status
      const { data: userMaps, error: umFilterErr } = await supabase
        .from("user_maps")
        .select("map_id,status")
        .eq("user_id", user.id);

      if (!umFilterErr && userMaps) {
        anyIds = userMaps.map((r) => r.map_id);
        completedIds = userMaps.filter((r) => r.status === "Completed").map((r) => r.map_id);
      }
    }

    // 1) Récup maps paginées + count avec TOUS les filtres (y compris completion)
    let query = supabase.from("maps").select("*", { count: "exact", head: false });

    if (q) query = query.ilike("name", `%${q}%`);
    if (typeof tier === "number") query = query.eq("tier", tier);
    if (typeof isLinear === "boolean") query = query.eq("is_linear", isLinear);

    // Filtrage completion côté SQL pour que le count soit correct
    if (!userErr && user) {
      if (completion === "complete") {
        if (completedIds.length === 0) {
          // aucun résultat direct
          return NextResponse.json(
            {
              ok: true,
              data: {
                items: [],
                page,
                pageSize,
                total: 0,
                pageCount: 1,
                hasPrev: false,
                hasNext: false,
              },
            },
            { status: 200, headers: { "Cache-Control": "no-store" } }
          );
        }
        query = query.in("id", completedIds);
      } else if (completion === "incomplete") {
        // "tout sauf Completed" => NOT IN completedIds (inclut unplayed)
        if (completedIds.length > 0) {
          query = query.not("id", "in", `(${completedIds.join(",")})`);
        }
        // si aucun completed, pas besoin de filtre: tout est "incomplete"
      } else if (completion === "unplayed") {
        // sans entrée user_maps
        if (anyIds.length > 0) {
          query = query.not("id", "in", `(${anyIds.join(",")})`);
        }
        // si aucune entrée user_maps, tout est "unplayed" => pas de filtre
      }
    } else {
      // pas d'utilisateur connecté
      if (completion === "complete") {
        // pas de user => aucune map "complete"
        return NextResponse.json(
          {
            ok: true,
            data: {
              items: [],
              page,
              pageSize,
              total: 0,
              pageCount: 1,
              hasPrev: false,
              hasNext: false,
            },
          },
          { status: 200, headers: { "Cache-Control": "no-store" } }
        );
      }
      // "incomplete" et "unplayed" => on renvoie tout (pas d'entrée user_maps)
    }

    const sortCol = sort === "alpha" ? "name" : sort === "tier" ? "tier" : "created_at";
    query = query.order(sortCol, { ascending: dir === "asc" });

    const { data: maps, error: mapsError, count } = await query.range(from, to);
    if (mapsError) {
      return NextResponse.json({ ok: false, message: mapsError.message }, { status: 500 });
    }

    const items = maps ?? [];
    const total = count ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));

    // 2) Injecter completion_data (LEFT-like) pour les items de la page
    let itemsWithCompletion: Array<MapWithCompletion> = items.map((m) => ({
      ...m,
      completion_data: null,
    }));

    if (!userErr && user && items.length > 0) {
      const mapIds = items.map((m) => m.id);

      const { data: completions, error: umError } = await supabase
        .from("user_maps")
        .select("*")
        .eq("user_id", user.id)
        .in("map_id", mapIds);

      if (!umError && completions) {
        const byMapId = new Map<number, UserMap>();
        for (const row of completions) byMapId.set(row.map_id, row);

        itemsWithCompletion = items.map((m) => ({
          ...m,
          completion_data: byMapId.get(m.id) ?? null,
        }));
      }
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          items: itemsWithCompletion,
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
    return NextResponse.json(
      { ok: false, message: (e as Error)?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
