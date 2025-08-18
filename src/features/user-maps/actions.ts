"use client";

import { EditUserMapEntryParamsSchema, EditUserMapEntryPayload } from "@/app/api/user-maps/edit-entry/schemas";
import { addMapSelf, editMapEntry, fetchUserMapsByStatus, getUserMapEntry } from "./api";
import { MapStatus } from "./validators";
import { GetUserMapPayload } from "@/app/api/user-maps/get/[mapId]/schema";

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

export async function editMapEntryAction(
  payload: EditUserMapEntryPayload,
  opts?: { signal?: AbortSignal }
) {
  // Validation côté action (évite d'appeler l'API avec un body invalide)
  const parsed = EditUserMapEntryParamsSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false as const,
      message: parsed.error.issues[0]?.message ?? "Invalid payload",
    };
  }

  try {
    // editMapEntry lève si !ok (il revalide la réponse via Zod)
    const res = await editMapEntry(parsed.data, opts);
    // Ici res est déjà le JSON parsé & validé (typiquement { ok:true, data })
    return res;
  } catch (e) {
    return {
      ok: false as const,
      message: (e as Error)?.message ?? "Request failed",
    };
  }
}

export async function getUserMapEntryAction(
  payload: GetUserMapPayload,
  opts?: { signal?: AbortSignal }
) {
  try {
    const res = await getUserMapEntry(payload, opts);
    if (res.ok) return { ok: true as const, data: res };
    return { ok: false as const, message: res.message };
  } catch (e) {
    return { ok: false as const, message: (e as Error)?.message ?? "Failed to load entry" };
  }
}
