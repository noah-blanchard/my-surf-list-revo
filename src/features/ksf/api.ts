import { KsfSyncResponse, KsfSyncResponseSchema } from "./schemas";

/** Appelle l’endpoint interne, renvoie la réponse validée */
export async function syncKsf(opts?: { signal?: AbortSignal }): Promise<KsfSyncResponse> {
  const res = await fetch("/api/ksf/sync", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: opts?.signal,
  });

  const json = await res.json().catch(() => null);
  const parsed = KsfSyncResponseSchema.safeParse(json);
  if (!parsed.success) throw new Error(json?.message || `HTTP ${res.status}`);
  return parsed.data;
}
