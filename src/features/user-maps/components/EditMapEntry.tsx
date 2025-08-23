"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { EditMapEntryModal } from "./EditMapEntryModal";
import { Map, MapStatusEnum } from "@/features/maps/schemas";
import { UserMap } from "../schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { editMapEntryAction, getUserMapEntryAction } from "../actions";
// ajuste le chemin si besoin
import type { EditUserMapEntryPayload } from "@/app/api/user-maps/edit-entry/schemas";

type EditMapEntryProps = {
  opened: boolean;
  onClose: () => void;
  map: Map;
};

export function EditMapEntry({ opened, onClose, map }: EditMapEntryProps) {
  const { data } = useQuery({
    queryKey: ["api", "user-maps", "get", map.id],
    queryFn: () => getUserMapEntryAction({ mapId: map.id }),
  });

  const entry = useMemo(() => {
    if (!data?.ok) return null;
    return data?.data?.user_map as UserMap;
  }, [data]);

  const [status, setStatus] = useState<MapStatusEnum>(
    entry?.status ?? MapStatusEnum.Planned
  );
  const [bonuses, setBonuses] = useState<number[]>(
    entry?.bonuses_completed ?? []
  );
  const [stages, setStages] = useState<number[]>(entry?.stages_completed ?? []);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setStatus(entry?.status ?? MapStatusEnum.Planned);
    setBonuses(entry?.bonuses_completed ?? []);
    setStages(entry?.stages_completed ?? []);
  }, [
    entry?.id,
    opened,
    entry?.status,
    entry?.bonuses_completed,
    entry?.stages_completed,
  ]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      onClose();
    } finally {
      setDeleting(false);
    }
  }, [onClose]);

  const handleStatusChange = useCallback((newStatus: MapStatusEnum) => {
    setStatus(newStatus);
  }, []);

  const handleAddBonus = useCallback((bonus: number) => {
    setBonuses((prev) => (prev.includes(bonus) ? prev : [...prev, bonus]));
  }, []);
  const handleRemoveBonus = useCallback((bonus: number) => {
    setBonuses((prev) => prev.filter((b) => b !== bonus));
  }, []);
  const handleAddStage = useCallback((stage: number) => {
    setStages((prev) => (prev.includes(stage) ? prev : [...prev, stage]));
  }, []);
  const handleRemoveStage = useCallback((stage: number) => {
    setStages((prev) => prev.filter((s) => s !== stage));
  }, []);

  const arraysEqual = (a: number[], b: number[]) =>
    a.length === b.length && a.every((v, i) => v === b[i]);

  const payload: EditUserMapEntryPayload = useMemo(() => {
    const p: Partial<EditUserMapEntryPayload> = { id: entry?.id };
    if (status !== entry?.status) p.status = status;

    if (!arraysEqual(bonuses, entry?.bonuses_completed ?? [])) {
      p.bonuses_completed = bonuses;
    }

    if (!map.is_linear && (map.stages_count ?? 0) > 0) {
      if (!arraysEqual(stages, entry?.stages_completed ?? [])) {
        p.stages_completed = stages;
      }
    } else if ((entry?.stages_completed?.length ?? 0) > 0) {
      // map is linear → clear stages if they existed before
      p.stages_completed = [];
    }

    // Cast to the payload type (id + at least one updatable field)
    return p as EditUserMapEntryPayload;
  }, [
    entry?.id,
    entry?.status,
    entry?.bonuses_completed,
    entry?.stages_completed,
    status,
    bonuses,
    stages,
    map.is_linear,
    map.stages_count,
  ]);

  // --- Mutation
  const qc = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: editMapEntryAction, // (payload) => Promise<{ ok, data | message }>
    onSuccess: async (res) => {
      if (!res.ok) {
        throw new Error(res.message);
      }
      // Invalidate whatever lists/detail depend on this entry
      // Ajuste ces clés selon tes queries
      await qc.invalidateQueries({ queryKey: ["api", "user-maps"] });
      await qc.invalidateQueries({
        queryKey: ["api", "user-maps", "by-status"],
      });
    },
  });

  const handleSubmit = useCallback(async () => {
    // If nothing to update, just close silently
    const { status: s, bonuses_completed: b, stages_completed: st } = payload;
    if (s === undefined && b === undefined && st === undefined) {
      onClose();
      return;
    }

    const res = await mutateAsync(payload);
    if (!res.ok) throw new Error(res.message);

    onClose();
  }, [payload, mutateAsync, onClose]);

  return (
    <EditMapEntryModal
      opened={opened}
      onClose={onClose}
      map={map}
      status={status}
      onStatusChange={handleStatusChange}
      bonuses={bonuses}
      stages={stages}
      onDelete={handleDelete}
      onSubmit={handleSubmit}
      onAddBonus={handleAddBonus}
      onRemoveBonus={handleRemoveBonus}
      onAddStage={handleAddStage}
      onRemoveStage={handleRemoveStage}
      submitting={isPending}
      deleting={deleting}
    />
  );
}
