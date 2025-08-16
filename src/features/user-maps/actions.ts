"use client";

import { addMapSelf, fetchUserMapsByStatus } from "./api";
import { MapStatus } from "./validators";

export async function getUserMapsByStatusAction(userId: string) {
  try {
    const res = await fetchUserMapsByStatus(userId);
    if (res.ok) return { ok: true as const, data: res };
    return { ok: false as const, message: res.message };
  } catch (e) {
    return { ok: false as const, message: (e as Error)?.message ?? "Failed to load list" };
  }
}


async function addWithStatus(mapId: number, status: MapStatus, stages: number[] = [], bonuses: number[] = []) {
  try {
    const res = await addMapSelf({
      map_id: mapId,
      status,
      bonuses,
      stages,
    });
    if (res.ok) return { ok: true as const };
    return { ok: false as const, message: res.message ?? "Failed" };
  } catch (e) {
    return { ok: false as const, message: (e as Error)?.message ?? "Failed" };
  }
}

export const addPlannedAction = (mapId: number) => addWithStatus(mapId, "Planned");
export const addOngoingAction = (mapId: number) => addWithStatus(mapId, "Ongoing");
export const addCompletedAction = (mapId: number) => addWithStatus(mapId, "Completed");

