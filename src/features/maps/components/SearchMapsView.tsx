"use client";

import * as React from "react";
import { GlowSection as Section } from "@/ui/components/section/GlowSection";
import {
  ResultsGrid,
  ResultsGridSkeleton,
} from "@/ui/components/grid/ResultGrid";
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
import { searchMapsAction } from "../actions";
import type { SearchMapsPayload } from "@/app/api/maps/search/schemas";
import { MapWithCompletion } from "../schemas";
import { CompletionFilterType } from "@/ui/components/filters/CompletionToggle";

export default function SearchMapsView() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  const [q, setQ] = React.useState("");
  const [debouncedQ] = useDebouncedValue(q, 300);

  const [completion, setCompletion] =
    React.useState<CompletionFilterType>("all");

  const [tier, setTier] = React.useState<number | null>(null);
  const [type, setType] = React.useState<"all" | "linear" | "staged">("all");
  const [sort, setSort] = React.useState<"created" | "alpha" | "tier">(
    "created"
  );
  const [dir, setDir] = React.useState<"asc" | "desc">("desc");

  // reset page quand les filtres changent
  React.useEffect(() => {
    setPage(1);
  }, [debouncedQ, tier, type, sort, dir, pageSize]);

  // Payload complet pour l'API (page & pageSize inclus)
  const payload = React.useMemo<SearchMapsPayload>(() => {
    return {
      page,
      pageSize,
      q: debouncedQ.trim() ? debouncedQ.trim() : undefined,
      tier: tier ?? undefined,
      // isLinear attendu côté API: string transformé -> nous on garde boolean|undefined
      isLinear: type === "all" ? undefined : type === "linear",
      sort,
      dir,
      completion,
    };
  }, [page, pageSize, debouncedQ, tier, type, sort, dir, completion]);

  const { data, isError, error, isLoading, isFetching } = useQuery({
    queryKey: ["api", "maps", "list", payload],
    queryFn: async () => {
      const res = await searchMapsAction(payload);
      if (!res.ok) throw new Error(res.message);
      return res.data; // { items, page, pageSize, total, pageCount }
    },
    staleTime: 30_000,
  });


  const showSkeletons = isLoading || (!data && isFetching);

  const queryClient = useQueryClient();
  const invalidateLists = () =>
    queryClient
      .invalidateQueries({ queryKey: ["api", "user-maps"] })
      .catch(() => {});

  const plannedMut = useMutation({
    mutationFn: (mapId: number) => addPlannedAction(mapId),
    onSuccess: (r) => r.ok && invalidateLists(),
  });
  const ongoingMut = useMutation({
    mutationFn: (mapId: number) => addOngoingAction(mapId),
    onSuccess: (r) => r.ok && invalidateLists(),
  });
  const completedMut = useMutation({
    mutationFn: (mapId: number) => addCompletedAction(mapId),
    onSuccess: (r) => r.ok && invalidateLists(),
  });

  // const filteredData = React.useMemo(() => {
  //   const list = data?.items ?? [];

  //   // on normalise: completion_data toujours présent (null si absent)
  //   const normalized: MapWithCompletion[] = list.map((m) => ({
  //     ...m,
  //     completion_data: m.completion_data ?? null,
  //   }));

  //   switch (completion) {
  //     case "complete":
  //       return normalized.filter(
  //         (m) => m.completion_data?.status === "Completed"
  //       );

  //     case "incomplete":
  //       return normalized.filter(
  //         (m) => m.completion_data !== null && m.completion_data?.status !== "Completed"
  //       );

  //     case "unplayed":
  //       return normalized.filter((m) => m.completion_data === null);

  //     case "all":
  //     default:
  //       return normalized;
  //   }
  // }, [data, completion]);

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
          completion={completion}
          onCompletion={setCompletion}
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
              {data?.items?.map((m) => {
                const item: MapWithCompletion = {
                  ...m,
                  completion_data: m.completion_data ?? null,
                };
                return (
                  <MapCard
                    key={item.id}
                    item={item}
                    loading={
                      plannedMut.isPending ||
                      ongoingMut.isPending ||
                      completedMut.isPending
                    }
                    onAddPlanned={(map) => plannedMut.mutate(Number(map.id))}
                    onAddOngoing={(map) => ongoingMut.mutate(Number(map.id))}
                    onAddCompleted={(map) =>
                      completedMut.mutate(Number(map.id))
                    }
                  />
                );
              })}
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
