export type SyncProgress =
  | { phase: "fetch" | "resolve" | "upsert"; pct: number; message?: string; meta?: Record<string, any> }
  | { phase: "done"; pct: 100; message?: string; meta?: Record<string, any> }
  | { phase: "error"; pct: number; message: string };

export function startKsfSync(params: {
  user_id: string;
  steam64?: string;
  steam2?: string;
  game?: "css" | "csgo" | "cs2";
  mode?: string;
  delayMs?: number;
  status?: "Planned" | "On hold" | "Dropped" | "Completed" | "Ongoing";
  dryRun?: boolean;
  onEvent: (e: SyncProgress) => void;
}): () => void {
  const qs = new URLSearchParams({
    user_id: params.user_id,
    ...(params.steam64 ? { steam64: params.steam64 } : {}),
    ...(params.steam2 ? { steam2: params.steam2 } : {}),
    ...(params.game ? { game: params.game } : {}),
    ...(params.mode ? { mode: params.mode } : {}),
    ...(params.delayMs != null ? { delayMs: String(params.delayMs) } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.dryRun ? { dryRun: "1" } : {}),
  });
  const es = new EventSource(`/api/ksf/sync?${qs.toString()}`);

  es.addEventListener("progress", (evt) => {
    try {
      params.onEvent(JSON.parse((evt as MessageEvent).data));
    } catch {
      // ignore
    }
  });
  es.onerror = () => {
    params.onEvent({ phase: "error", pct: 100, message: "connection lost" });
    es.close();
  };

  // return a disposer
  return () => es.close();
}
