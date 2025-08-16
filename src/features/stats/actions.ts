"use client";

import { fetchUserStats } from "./api";

export async function getUserStatsAction(userId: string) {
  try {
    const res = await fetchUserStats(userId);
    if (res.ok) return { ok: true as const, data: res.data };
    return { ok: false as const, message: res.message };
  } catch (e: any) {
    return { ok: false as const, message: e?.message ?? "Failed to load stats" };
  }
}
