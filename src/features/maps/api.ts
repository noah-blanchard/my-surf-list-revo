// src/features/maps/api.ts
import { z } from "zod";
import type { Database } from "@/types/supabase";

type MapRow = Database["public"]["Tables"]["maps"]["Row"];

const GetMapsResponse = z.object({
  ok: z.literal(true),
  data: z.object({
    items: z.array(z.any()), // tu peux raffiner avec un zod basé sur tes colonnes si tu veux
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
    pageCount: z.number().int().min(1),
    hasPrev: z.boolean(),
    hasNext: z.boolean(),
  }),
}).or(
  z.object({ ok: z.literal(false), message: z.string() })
);

export type GetMapsOk = {
  ok: true;
  data: {
    items: MapRow[];
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
};
export type GetMapsResp = GetMapsOk | { ok: false; message: string };

export async function fetchMaps(page: number, opts?: { signal?: AbortSignal; pageSize?: number }): Promise<GetMapsResp> {
  const qs = new URLSearchParams({ page: String(page) });
  if (opts?.pageSize) qs.set("pageSize", String(opts.pageSize));

  const res = await fetch(`/api/maps/getMaps?${qs.toString()}`, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: opts?.signal,
  });

  const json = await res.json();
  const parsed = GetMapsResponse.safeParse(json);
  if (!parsed.success) {
    throw new Error(`Invalid /api/maps/getMaps response`);
  }
  // on garde le typage MapRow[] côté TS en cast, le runtime est validé par Zod
  return parsed.data as GetMapsResp;
}
