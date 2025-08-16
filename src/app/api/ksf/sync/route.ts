import type { Database } from "@/types/supabase";
import { createServerSupabase } from "@/lib/supabase/server";
import { steam64ToSteam2 } from "@/utils/steam";

const KSF_BASE = process.env.KSF_BASE_URL || "https://ksf.surf";
const GAME = "css";
const MODE = "0";

type UserMapsInsert = Database["public"]["Tables"]["user_maps"]["Insert"];
type MapRow = Database["public"]["Tables"]["maps"]["Row"];
type MapStatusDb = Database["public"]["Enums"]["map_status"];
type KsfRecord = { mapName: string; rank: string | number; points: number; date: number };

function sseEncoder(controller: ReadableStreamDefaultController) {
    const enc = new TextEncoder();
    return (event: string, data: unknown) => {
        controller.enqueue(enc.encode(`event:${event}\n`));
        controller.enqueue(enc.encode(`data:${JSON.stringify(data)}\n\n`));
    };
}

async function fetchJSON(url: string, timeoutMs = 10000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
        return await res.json();
    } finally {
        clearTimeout(t);
    }
}
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET() {
    const supabase = await createServerSupabase();

    // 1) Session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        return new Response(JSON.stringify({ ok: false, message: "Unauthorized" }), {
            status: 401, headers: { "Content-Type": "application/json" },
        });
    }

    // 2) Profile → steam_id64
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
    const steam2 = steam64ToSteam2(steam64, 0);
    const statusValue: MapStatusDb = "Completed";


    // 3) SSE stream
    const stream = new ReadableStream({
        async start(controller) {
            const send = sseEncoder(controller);
            try {
                send("progress", { phase: "fetch", pct: 5, message: "Starting KSF sync…" });

                // Fetch KSF in batches of 5
                const all: KsfRecord[] = [];
                let fetched = 0;
                for (let start = 1; ; start += 5) {
                    const url = `${KSF_BASE}/api/players/${encodeURIComponent(steam2)}/bestrecords/${start}?game=${GAME}&mode=${MODE}`;
                    const json = await fetchJSON(url);
                    const rows: KsfRecord[] = json?.records ?? [];
                    if (rows.length === 0) break;

                    all.push(...rows);
                    fetched += rows.length;
                    send("progress", { phase: "fetch", pct: Math.min(60, 10 + fetched), message: `Fetched ${fetched}+ records…` });

                    if (rows.length < 5) break;
                    await delay(800);
                }

                // Resolve names -> map ids
                send("progress", { phase: "resolve", pct: 65, message: "Resolving map names…" });

                const uniqueNames = Array.from(new Set(all.map(r => r.mapName))).filter(Boolean);
                const nameToId = new Map<string, number>();
                if (uniqueNames.length) {
                    const { data: maps, error } = await supabase
                        .from("maps")
                        .select("id, name")
                        .in("name", uniqueNames);
                    if (error) throw error;
                    for (const m of (maps ?? []) as Pick<MapRow, "id" | "name">[]) {
                        nameToId.set(m.name as string, Number(m.id));
                    }
                }

                const rowsToUpsert: UserMapsInsert[] = [];
                const missing: string[] = [];
                for (const r of all) {
                    const id = nameToId.get(r.mapName);
                    if (!id) missing.push(r.mapName);
                    else rowsToUpsert.push({ user_id: session.user.id, map_id: id, status: statusValue });
                }

                send("progress", {
                    phase: "resolve",
                    pct: 75,
                    message: `Found ${rowsToUpsert.length} known maps (${missing.length} unknown)`,
                    meta: { known: rowsToUpsert.length, unknown: missing.length },
                });

                // Upsert user_maps (RLS s’applique : user_id = auth.uid())
                let upserted = 0;
                if (rowsToUpsert.length) {
                    send("progress", { phase: "upsert", pct: 85, message: "Writing user_maps…" });
                    const { error, count } = await supabase
                        .from("user_maps")
                        .upsert(rowsToUpsert, { onConflict: "user_id,map_id", count: "exact" });
                    if (error) throw error;
                    upserted = count ?? 0;
                }

                send("progress", {
                    phase: "done",
                    pct: 100,
                    message: "Sync completed",
                    meta: {
                        steam2, steam64,
                        game: GAME, mode: MODE,
                        fetched: all.length,
                        known: rowsToUpsert.length,
                        unknown: missing.length,
                        upserted,
                        status: statusValue,
                    },
                });

                controller.close();
            } catch (e: unknown) {
                const msg = (e as Error)?.message ?? "Sync failed";
                controller.enqueue(
                    new TextEncoder().encode(
                        `event:progress\ndata:${JSON.stringify({ phase: "error", pct: 100, message: msg })}\n\n`
                    )
                );
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
