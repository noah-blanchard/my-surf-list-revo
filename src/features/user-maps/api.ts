import { EditUserMapEntryPayload, EditUserMapEntryResponseSchema } from "@/app/api/user-maps/edit-entry/schemas";
import { AddMapSelfBody, GetByStatusResponse, AddMapAdminBody, AddMapResponse } from "./validators";
import { GetUserMapPayload, GetUserMapResponseSchema } from "@/app/api/user-maps/get/[mapId]/schema";

export async function fetchUserMapsByStatus(userId: string, opts?: { signal?: AbortSignal }) {
  const res = await fetch(`/api/user-maps/getByStatus?user_id=${encodeURIComponent(userId)}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: opts?.signal,
  });
  const json = await res.json();
  const parsed = GetByStatusResponse.safeParse(json);
  if (!parsed.success) throw new Error("Invalid API response");
  return parsed.data;
}


export async function addMapSelf(body: AddMapSelfBody, opts?: { signal?: AbortSignal }) {
  const res = await fetch("/api/user-maps/add-self", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    signal: opts?.signal,
  });
  const json = await res.json().catch(() => null);
  const parsed = AddMapResponse.safeParse(json);
  if (!parsed.success) throw new Error(json?.message || `HTTP ${res.status}`);
  return parsed.data;
}

export async function addMapForUser(body: AddMapAdminBody, opts?: { signal?: AbortSignal }) {
  const res = await fetch("/api/user-maps/add", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    signal: opts?.signal,
  });
  const json = await res.json().catch(() => null);
  const parsed = AddMapResponse.safeParse(json);
  if (!parsed.success) throw new Error(json?.message || `HTTP ${res.status}`);
  return parsed.data;
}

export async function editMapEntry(body: EditUserMapEntryPayload, opts?: { signal?: AbortSignal }) {
  const res = await fetch("/api/user-maps/edit-entry", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    signal: opts?.signal,
  });
  const json = await res.json().catch(() => null);
  const parsed = EditUserMapEntryResponseSchema.safeParse(json);
  if (!parsed.success) throw new Error(json?.message || `HTTP ${res.status}`);
  return parsed.data;
}

export async function getUserMapEntry(body: GetUserMapPayload, opts?: { signal?: AbortSignal }) {
  const res = await fetch(`/api/user-maps/get/${encodeURIComponent(body.mapId)}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: opts?.signal,
  });
  const json = await res.json().catch(() => null);
  const parsed = GetUserMapResponseSchema.safeParse(json);
  if (!parsed.success) throw new Error(json?.message || `HTTP ${res.status}`);
  return parsed.data;
}