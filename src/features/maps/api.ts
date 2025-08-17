import {
  SearchMapsPayload,
  SearchMapsResponse,
  SearchMapsResponseSchema,
} from "@/app/api/maps/search/schemas";

export async function fetchSearchMaps(
  payload: SearchMapsPayload,
  opts?: { signal?: AbortSignal }
): Promise<SearchMapsResponse> {
  const qs = new URLSearchParams();

  // page / pageSize
  if (payload.page) qs.set("page", String(payload.page));
  if (payload.pageSize) qs.set("pageSize", String(payload.pageSize));

  // q
  if (payload.q && payload.q.trim().length > 0) qs.set("q", payload.q.trim());

  // tier
  if (typeof payload.tier === "number") qs.set("tier", String(payload.tier));

  // isLinear: boolean | undefined  ->  "true" | "false" (sinon on omet)
  if (typeof payload.isLinear === "boolean") {
    qs.set("isLinear", payload.isLinear ? "true" : "false");
  }

  // sort / dir (ont des defaults côté serveur)
  if (payload.sort) qs.set("sort", payload.sort);
  if (payload.dir) qs.set("dir", payload.dir);

  const resp = await fetch(`/api/maps/search?${qs.toString()}`, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: opts?.signal,
  });

  const json = await resp.json().catch(() => {
    throw new Error(`Invalid JSON from /api/maps/search (HTTP ${resp.status})`);
  });


  const parsed = SearchMapsResponseSchema.safeParse(json);
  if (!parsed.success) throw new Error("Invalid /api/maps/search response");
  return parsed.data;
}
