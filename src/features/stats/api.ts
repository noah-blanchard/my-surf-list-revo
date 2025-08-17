import { GetStatsResponse, GetStatsResponseSchema } from "@/app/api/stats/[userId]/schemas";

export async function fetchUserStats(userId: string, opts?: { signal?: AbortSignal }): Promise<GetStatsResponse> {
  const res = await fetch(`/api/stats/${encodeURIComponent(userId)}`, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: opts?.signal,
  });
  const json = await res.json();
  const parsed = GetStatsResponseSchema.safeParse(json);
  if (!parsed.success) throw new Error("Invalid /api/stats/getStats response");
  return parsed.data as GetStatsResponse;
}
