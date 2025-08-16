// src/features/maps/actions.ts
"use client";

import { fetchMaps } from "./api";

export async function getMapsAction(page: number, opts?: { pageSize?: number }) {
  try {
    const res = await fetchMaps(page, { pageSize: opts?.pageSize });
    if (res.ok) return { ok: true as const, data: res.data };
    return { ok: false as const, message: res.message };
  } catch (e: any) {
    return { ok: false as const, message: e?.message ?? "Failed to load maps" };
  }
}
