"use client";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { GlowSection as Section } from "@/ui/components/section/GlowSection";
import { MapListSkeleton } from "@/ui/components/list/MapListSkeleton";
import { Alert, Stack, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { StatusAccordion } from "@/ui/components/list/StatusAccordion";
import { SearchField } from "@/ui/components/inputs/SearchField";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { getUserMapsByStatusAction } from "../actions";
import type {  MapWithCompletion } from "@/features/maps/schemas";
import { EditMapEntry } from "./EditMapEntry";

export function MyListView({ userId }: { userId: string }) {
  // --- liste groupée
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["api", "user-maps", "by-status", userId],
    queryFn: async () => {
      const r = await getUserMapsByStatusAction(userId);
      if (!r.ok) throw new Error(r.message);
      return r;
    },
    staleTime: 30_000,
  });

  // --- recherche
  const [q, setQ] = React.useState("");
  const [debounced] = useDebouncedValue(q.trim().toLowerCase(), 200);

  // --- sélection pour édition
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedMap, setSelectedMap] = React.useState<MapWithCompletion | null>(null);

  const filtered = React.useMemo(() => {
    if (!data?.ok) return null;
    const match = (s: string) =>
      debounced ? s.toLowerCase().includes(debounced) : true;
    const pick = (arr: MapWithCompletion[]) =>
      debounced ? arr.filter((m) => match(m.name)) : arr;

    const groups = {
      Completed: pick(data.data.groups.Completed as MapWithCompletion[]),
      Ongoing: pick(data.data.groups.Ongoing as MapWithCompletion[]),
      "On hold": pick(data.data.groups["On hold"] as MapWithCompletion[]),
      Planned: pick(data.data.groups.Planned as MapWithCompletion[]),
      Dropped: pick(data.data.groups.Dropped as MapWithCompletion[]),
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

  console.log("groups", filtered)

  // ouvrir le modal depuis une ligne
  function handleEditClick(m: MapWithCompletion) {
    setSelectedMap(m);
    open();
  }

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
              onEdit={handleEditClick}
            />
          )}

          {/* <Modal
            opened={opened && !!selectedMap && (entryLoading || entryError)}
            onClose={close}
            centered
            title={selectedMap ? `Edit · ${selectedMap.name}` : "Edit"}
            withCloseButton
          >
            {entryLoading ? (
              <Group justify="center" py="md">
                <Loader />
              </Group>
            ) : entryError ? (
              <Alert color="red" icon={<IconAlertTriangle size={16} />}>
                {(entryErrObj as Error)?.message ?? "Failed to load entry"}
              </Alert>
            ) : null}
          </Modal> */}

          {/* Modal d’édition réel (monté uniquement quand entry OK) */}
          {opened && selectedMap && (
            <EditMapEntry opened onClose={close} map={selectedMap} />
          )}
        </Stack>
      )}
    </Section>
  );
}
