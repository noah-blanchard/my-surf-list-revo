import { Paper, Stack, Title, Text } from "@mantine/core";
import { MapListRow } from "./MapListRow";
import type { MapItem } from "@/features/user-maps/validators";

export function StatusGroup({
  title, items, emptyHint,
}: {
  title: string;
  items: MapItem[];
  emptyHint?: string;
}) {
  return (
    <Paper withBorder radius="md" p="sm">
      <Title order={4} mb="xs">{title}</Title>
      <Stack gap={0}>
        {items.length ? (
          items.map((m) => (
            <MapListRow key={m.id} name={m.name} tier={m.tier} isLinear={m.is_linear} />
          ))
        ) : (
          <Text size="sm" c="dimmed">{emptyHint ?? "No items"}</Text>
        )}
      </Stack>
    </Paper>
  );
}
