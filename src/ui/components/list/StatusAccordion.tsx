// StatusAccordion.tsx
"use client";
import { Accordion, Paper, Text, Button } from "@mantine/core";
import { MapListRow } from "./MapListRow";
import { MapWithCompletion } from "@/features/maps/schemas";
import { IconEdit } from "@tabler/icons-react";

export function StatusAccordion({
  sections,
  defaultValue,
  highlight,
  onEdit, // <- NEW
}: {
  sections: {
    key: string;
    title: string;
    items: MapWithCompletion[];
    emptyHint?: string;
  }[];
  defaultValue?: string[];
  highlight: string;
  onEdit: (item: MapWithCompletion) => void; // <- NEW
}) {
  return (
    <Paper withBorder radius="md" p="sm">
      <Accordion multiple defaultValue={defaultValue} variant="separated">
        {sections.map((s) => (
          <Accordion.Item key={s.key} value={s.key}>
            <Accordion.Control>{s.title}</Accordion.Control>
            <Accordion.Panel>
              {s.items.length ? (
                s.items.map((m) => (
                  <MapListRow
                    time={m.completion_data?.time}
                    key={m.id}
                    name={m.name}
                    tier={m.tier}
                    isLinear={m.is_linear}
                    highlight={highlight}
                    right={
                      <Button
                        size="xs"
                        variant="subtle"
                        onClick={() => onEdit(m)}
                        rightSection={<IconEdit size={16} />}
                      />
                    }
                  />
                ))
              ) : (
                <Text size="sm" c="dimmed">
                  {s.emptyHint ?? "No items"}
                </Text>
              )}
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Paper>
  );
}
