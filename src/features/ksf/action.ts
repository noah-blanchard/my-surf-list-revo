"use client";

import { startKsfSync, type SyncProgress } from "./api";

export function runKsfSync(input: {
  user_id: string;
  steam64?: string;
  steam2?: string;
  game?: "css" | "csgo" | "cs2";
  mode?: string;
  delayMs?: number;
  status?: "Planned" | "On hold" | "Dropped" | "Completed" | "Ongoing";
  dryRun?: boolean;
  onProgress: (p: SyncProgress) => void;
}) {
  return startKsfSync({ ...input, onEvent: input.onProgress });
}
