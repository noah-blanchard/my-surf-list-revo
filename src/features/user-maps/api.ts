import { AddMapSelfBody, GetByStatusResponse, AddMapAdminBody, AddMapResponse } from "./validators";

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


// POST /api/user-maps/add-self
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

// POST /api/user-maps/add  (admin-like; voir garde côté route)
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
