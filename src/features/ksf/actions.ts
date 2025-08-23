"use client";

import { syncKsf } from "./api";

/** Action simple qui wrappe l’appel API et normalise l’output */
export async function syncKsfAction() {
  try {
    const res = await syncKsf();
    if (res.ok) return { ok: true as const, data: res };
    return { ok: false as const, message: res.message };
  } catch (e) {
    return { ok: false as const, message: (e as Error)?.message ?? "Sync failed" };
  }
}
