"use client";

import { fetchSearchMaps } from "./api";
import type { SearchMapsPayload } from "@/app/api/maps/search/schemas";

export async function searchMapsAction(payload: SearchMapsPayload) {
  try {
    const res = await fetchSearchMaps(payload);
    if (res.ok) return { ok: true as const, data: res.data };
    return { ok: false as const, message: res.message };
  } catch (e) {
    return {
      ok: false as const,
      message: (e as Error)?.message ?? "Failed to load maps",
    };
  }
}
