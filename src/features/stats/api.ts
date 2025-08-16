import { z } from "zod";
import { UserStatsSchema } from "./validators";

const GetStatsResponse = z.object({
  ok: z.literal(true),
  data: UserStatsSchema,
}).or(
  z.object({ ok: z.literal(false), message: z.string() })
);

export type GetStatsOk = z.infer<typeof UserStatsSchema>;
export type GetStatsResp = { ok: true; data: GetStatsOk } | { ok: false; message: string };

export async function fetchUserStats(userId: string, opts?: { signal?: AbortSignal }): Promise<GetStatsResp> {
  const res = await fetch(`/api/stats/getStats?user_id=${encodeURIComponent(userId)}`, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: opts?.signal,
  });
  const json = await res.json();
  const parsed = GetStatsResponse.safeParse(json);
  if (!parsed.success) throw new Error("Invalid /api/stats/getStats response");
  return parsed.data as GetStatsResp;
}
