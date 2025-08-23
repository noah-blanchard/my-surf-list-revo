// app/api/sync-ksf/route.ts
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

const GAME = "css";
const MODE = "0";

type DB = Database;
type UserMapsInsert = DB["public"]["Tables"]["user_maps"]["Insert"];
type MapRow = DB["public"]["Tables"]["maps"]["Row"];

type KsfRecord = {
    mapName: string;
    time?: number;
    wrDiff?: number;
    date?: number;     // epoch seconds
    points?: number;
    count?: number;
    rank?: string | number;
};

type KsfApiResponse = {
    ok: boolean;
    count: number;
    records: KsfRecord[];
    source?: string;
    error?: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
    const supabase = await createServerSupabase();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        return new Response(JSON.stringify({ ok: false, message: "Unauthorized" }), {
            status: 401, headers: { "Content-Type": "application/json" },
        });
    }

    const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("steam_id64")
        .eq("user_id", session.user.id)
        .single<{ steam_id64: string | null }>();

    if (pErr) {
        return new Response(JSON.stringify({ ok: false, message: pErr.message }), {
            status: 500, headers: { "Content-Type": "application/json" },
        });
    }
    if (!profile?.steam_id64) {
        return new Response(JSON.stringify({ ok: false, message: "No steam_id64 in profile" }), {
            status: 400, headers: { "Content-Type": "application/json" },
        });
    }

    const steam64 = profile.steam_id64;

    try {
        const origin = new URL(req.url).origin;
        const url = `${origin}/api/ksf/records/${encodeURIComponent(steam64)}?game=${GAME}&mode=${MODE}`;

        const cookie = req.headers.get("cookie") ?? "";
        const res = await fetch(url, {
            cache: "no-store",
            headers: { cookie },         // ✅ forward des cookies => le middleware te laisse passer
        });
        if (!res.ok) {
            return new Response(JSON.stringify({ ok: false, message: `ksf-records fetch failed: ${res.status}` }), {
                status: 502, headers: { "Content-Type": "application/json" },
            });
        }
        const data = (await res.json()) as KsfApiResponse;
        if (!data.ok) {
            return new Response(JSON.stringify({ ok: false, message: data.error || "ksf-records returned ok=false" }), {
                status: 502, headers: { "Content-Type": "application/json" },
            });
        }

        const records = data.records ?? [];
        if (records.length === 0) {
            return new Response(JSON.stringify({ ok: true, fetched: 0, upserted: 0, unknown: [] }), {
                status: 200, headers: { "Content-Type": "application/json" },
            });
        }

        const uniqueNames = Array.from(new Set(records.map(r => r.mapName))).filter(Boolean);
        const nameToId = new Map<string, number>();

        if (uniqueNames.length) {
            const { data: mapsRows, error: mapsErr } = await supabase
                .from("maps")
                .select("id,name")
                .in("name", uniqueNames);

            if (mapsErr) {
                return new Response(JSON.stringify({ ok: false, message: mapsErr.message }), {
                    status: 500, headers: { "Content-Type": "application/json" },
                });
            }

            for (const m of (mapsRows ?? []) as Pick<MapRow, "id" | "name">[]) {
                nameToId.set(String(m.name), Number(m.id));
            }
        }

        const rowsToUpsert: UserMapsInsert[] = [];
        const unknownNames: string[] = [];

        for (const r of records) {
            const mapId = nameToId.get(r.mapName);
            if (!mapId) {
                unknownNames.push(r.mapName);
                continue;
            }

            const dateIso =
                typeof r.date === "number"
                    ? new Date((r.date > 1e12 ? r.date : r.date * 1000)).toISOString()
                    : undefined;

            rowsToUpsert.push({
                user_id: session.user.id,
                map_id: mapId,
                time: r.time,             // double precision
                wrDiff: r.wrDiff,         // double precision
                date: dateIso,            // timestamptz (ISO)
                points: r.points,         // double precision
                count: (r.count) ?? undefined, // integer
                rank: r.rank != null ? String(r.rank) : undefined, // text
                status: "Completed",
            } as UserMapsInsert);
        }

        if (rowsToUpsert.length === 0) {
            return new Response(JSON.stringify({
                ok: true,
                fetched: records.length,
                known: 0,
                unknown: unknownNames,
                upserted: 0,
            }), { status: 200, headers: { "Content-Type": "application/json" } });
        }

        const { error: upErr, count } = await supabase
            .from("user_maps")
            .upsert(rowsToUpsert, {
                onConflict: "user_id,map_id",
                ignoreDuplicates: false,
            })
            .select("map_id"); // léger + count fiable

        if (upErr) {
            return new Response(JSON.stringify({ ok: false, message: upErr.message }), {
                status: 500, headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({
            ok: true,
            steam64,
            game: GAME,
            mode: MODE,
            fetched: records.length,
            known: rowsToUpsert.length,
            unknown: unknownNames,
            upserted: count ?? rowsToUpsert.length,
        }), { status: 200, headers: { "Content-Type": "application/json" } });

    } catch (e) {
        return new Response(JSON.stringify({ ok: false, message: (e as Error)?.message ?? "Sync failed" }), {
            status: 500, headers: { "Content-Type": "application/json" },
        });
    }
}
