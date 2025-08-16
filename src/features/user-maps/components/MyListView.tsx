"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { GlowSection as Section } from "@/ui/components/section/GlowSection";
import { MapListSkeleton } from "@/ui/components/list/MapListSkeleton";
import { Alert, Stack, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { fetchUserMapsByStatus } from "../api";
import { StatusAccordion } from "@/ui/components/list/StatusAccordion";
import { SearchField } from "@/ui/components/inputs/SearchField";
import { useDebouncedValue } from "@mantine/hooks";

export function MyListView({ userId }: { userId: string }) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["api", "user-maps", "by-status", userId],
    queryFn: () =>
      fetchUserMapsByStatus(userId).then((r) => {
        if (!r.ok) throw new Error((r as any).message);
        return r;
      }),
    staleTime: 30_000,
  });

  const [q, setQ] = React.useState("");
  const [debounced] = useDebouncedValue(q.trim().toLowerCase(), 200);

  const filtered = React.useMemo(() => {
    if (!data?.ok) return null;
    const match = (s: string) => (debounced ? s.toLowerCase().includes(debounced) : true);
    const pick = (arr: typeof data.groups.Completed) =>
      debounced ? arr.filter((m) => match(m.name)) : arr;

    const groups = {
      Completed: pick(data.groups.Completed),
      Ongoing: pick(data.groups.Ongoing),
      "On hold": pick(data.groups["On hold"]),
      Planned: pick(data.groups.Planned),
      Dropped: pick(data.groups.Dropped),
    };

    const counts = {
      Completed: groups.Completed.length,
      Ongoing: groups.Ongoing.length,
      "On hold": groups["On hold"].length,
      Planned: groups.Planned.length,
      Dropped: groups.Dropped.length,
      total: Object.values(groups).reduce((a, b) => a + b.length, 0),
    };

    return { groups, counts };
  }, [data, debounced]);

  return (
    <Section title="My list" popOut={false}>
      {isLoading ? (
        <MapListSkeleton rows={10} />
      ) : isError || !data?.ok ? (
        <Alert color="red" icon={<IconAlertTriangle size={16} />}>
          {(error as Error)?.message ?? "Failed to load list"}
        </Alert>
      ) : (
        <Stack gap="md">
          <SearchField value={q} onChange={setQ} />

          {filtered && filtered.counts.total === 0 ? (
            <Text c="dimmed">No results for “{q}”.</Text>
          ) : (
            <StatusAccordion
              highlight={q}
              sections={[
                {
                  key: "completed",
                  title: `Completed (${filtered?.counts.Completed ?? 0})`,
                  items: filtered?.groups.Completed ?? [],
                  emptyHint: "No completed maps yet",
                },
                {
                  key: "ongoing",
                  title: `Ongoing (${filtered?.counts.Ongoing ?? 0})`,
                  items: filtered?.groups.Ongoing ?? [],
                  emptyHint: "No ongoing maps",
                },
                {
                  key: "onhold",
                  title: `On hold (${filtered?.counts["On hold"] ?? 0})`,
                  items: filtered?.groups["On hold"] ?? [],
                  emptyHint: "No on-hold maps",
                },
                {
                  key: "planned",
                  title: `Planned (${filtered?.counts.Planned ?? 0})`,
                  items: filtered?.groups.Planned ?? [],
                  emptyHint: "Nothing planned yet",
                },
                {
                  key: "dropped",
                  title: `Dropped (${filtered?.counts.Dropped ?? 0})`,
                  items: filtered?.groups.Dropped ?? [],
                  emptyHint: "No dropped maps",
                },
              ]}
            />
          )}
        </Stack>
      )}
    </Section>
  );
}
