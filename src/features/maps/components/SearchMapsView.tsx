// src/features/maps/components/SearchMapsView.tsx
"use client";

import * as React from "react";
import { GlowSection as Section } from "@/ui/components/section/GlowSection";
import { ResultsGrid, ResultsGridSkeleton } from "@/ui/components/grid/ResultGrid";
import { MapCard } from "@/ui/components/card/MapCard";
import { FiltersBar } from "@/ui/components/filters/FiltersBar";
import { PaginationBar } from "@/ui/components/pagination/PaginationBar";
import { useDebouncedValue } from "@mantine/hooks";
import { Alert, Stack, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addPlannedAction,
  addOngoingAction,
  addCompletedAction,
} from "@/features/user-maps/actions";
import { Database } from "@/types/supabase";

type MapRow = Database["public"]["Tables"]["maps"]["Row"];


export default function SearchMapsView() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  const [q, setQ] = React.useState("");
  const [debouncedQ] = useDebouncedValue(q, 300);

  const [tier, setTier] = React.useState<number | null>(null);
  const [type, setType] = React.useState<"all" | "linear" | "staged">("all");
  const [sort, setSort] = React.useState<"created" | "alpha" | "tier">("created");
  const [dir, setDir] = React.useState<"asc" | "desc">("desc");

  React.useEffect(() => {
    setPage(1);
  }, [debouncedQ, tier, type, sort, dir, pageSize]);

  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    ...(debouncedQ ? { q: debouncedQ } : {}),
    ...(tier ? { tier: String(tier) } : {}),
    ...(type === "all" ? { type: "all" } : { type: String(type === "linear") }),
    sort,
    dir,
  });

  const { data, isError, error, isLoading, isFetching } = useQuery({
    queryKey: ["api", "maps", "list", Object.fromEntries(qs)],
    queryFn: async () => {
      const res = await fetch(`/api/maps/getMaps?${qs.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || json?.ok === false) throw new Error(json?.message || `HTTP ${res.status}`);
      return json.data as {
        items: MapRow[];
        page: number;
        pageSize: number;
        total: number;
        pageCount: number;
        hasPrev: boolean;
        hasNext: boolean;
      };
    },
    staleTime: 30_000,
  });

  const showSkeletons = isLoading || (!data && isFetching);

  // --- Mutations: add map as Planned / Ongoing / Completed
  const queryClient = useQueryClient();

  const invalidateLists = () => {
    // Refresh any user-maps derived views after add
    queryClient.invalidateQueries({ queryKey: ["api", "user-maps"] }).catch(() => {});
  };

  const plannedMut = useMutation({
    mutationFn: (mapId: number) => addPlannedAction(mapId),
    onSuccess: (r) => {
      if (r.ok) invalidateLists();
    },
  });

  const ongoingMut = useMutation({
    mutationFn: (mapId: number) => addOngoingAction(mapId),
    onSuccess: (r) => {
      if (r.ok) invalidateLists();
    },
  });

  const completedMut = useMutation({
    mutationFn: (mapId: number) => addCompletedAction(mapId),
    onSuccess: (r) => {
      if (r.ok) invalidateLists();
    },
  });

  return (
    <Stack gap="md">
      <Section title="Search maps" popOut={false}>
        <FiltersBar
          q={q}
          onQ={setQ}
          tier={tier}
          onTier={setTier}
          type={type}
          onType={setType}
          sort={sort}
          dir={dir}
          onSort={setSort}
          onDir={setDir}
        />
      </Section>

      <Section title="Results" popOut={false}>
        {isError && (
          <Alert color="red" icon={<IconAlertTriangle size={16} />}>
            {(error as Error)?.message ?? "Failed to load maps"}
          </Alert>
        )}

        {showSkeletons ? (
          <ResultsGridSkeleton count={pageSize} />
        ) : data?.items?.length ? (
          <>
            <ResultsGrid>
              {data.items.map((m) => (
                <MapCard
                  loading={plannedMut.isPending || ongoingMut.isPending || completedMut.isPending}
                  key={m.id}
                  item={m}
                  onAddPlanned={(map) => plannedMut.mutate(Number(map.id))}
                  onAddOngoing={(map) => ongoingMut.mutate(Number(map.id))}
                  onAddCompleted={(map) => completedMut.mutate(Number(map.id))}
                />
              ))}
            </ResultsGrid>

            <div style={{ height: 12 }} />

            <PaginationBar
              page={page}
              total={data.pageCount}
              onChange={setPage}
              pageSize={pageSize}
              onPageSize={setPageSize}
            />
          </>
        ) : (
          <Text c="dimmed">No maps found</Text>
        )}
      </Section>
    </Stack>
  );
}
