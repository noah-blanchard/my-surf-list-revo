"use client";
import {
  ActionIcon,
  Button,
  Group,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { IconCheck, IconRefresh, IconX } from "@tabler/icons-react";
import React from "react";

type Props = {
  label: string;
  count: number; // total items
  value: number[]; // e.g. [1, 5, 2, 10]
  onAdd: (n: number) => void;
  onRemove: (n: number) => void;
  cols?: number; // fewer cols = wider buttons (default 6)
  rowHeight?: number; // button height (default 36)
};

export function NumberGridMultiSelect({
  label,
  count,
  value,
  onAdd,
  onRemove,
  cols = 6, // <-- wider by default: fewer columns -> more rows
  rowHeight = 36, // consistent height
}: Props) {
  const isSelected = (n: number) => value.includes(n);
  const toggle = (n: number) => (isSelected(n) ? onRemove(n) : onAdd(n));

  const setAll = () => {
    for (let i = 1; i <= count; i++) if (!isSelected(i)) onAdd(i);
  };
  const clearAll = () => {
    value.forEach((n) => {
      if (n >= 1 && n <= count) onRemove(n);
    });
  };
  const invert = () => {
    for (let i = 1; i <= count; i++) (isSelected(i) ? onRemove : onAdd)(i);
  };

  const percentage = Math.round((value.length / count) * 100);

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Group gap="sm" align="center">
          <Text fw={600}>{label}</Text>
          <Text size="xs" c="dimmed">
            Selected: {value.length}/{count} ({percentage}%)
          </Text>
        </Group>
        <Group gap="xs">
          <Tooltip label="Select all">
            <ActionIcon variant="default" onClick={setAll}>
              <IconCheck size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Clear all">
            <ActionIcon variant="default" onClick={clearAll}>
              <IconX size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Invert selection">
            <ActionIcon variant="default" onClick={invert}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Progress value={percentage} size="sm" radius="lg" />

      <SimpleGrid
        cols={Math.max(2, cols)} // keep sane lower bound
        spacing="xs"
        mt="xs"
      >
        {Array.from({ length: count }, (_, i) => i + 1).map((n) => {
          const active = isSelected(n);
          return (
            <Button
              key={n}
              variant={active ? "filled" : "default"}
              color={active ? "blue" : undefined}
              size="compact-sm"
              radius="md"
              fullWidth // <-- uniform width per column
              h={rowHeight} // <-- uniform height
              onClick={() => toggle(n)}
              styles={{ label: { lineHeight: 1, whiteSpace: "nowrap" } }}
              className="transition-transform duration-75"
              style={{
                transform: active ? "scale(1.02)" : undefined,
                position: "relative",
                padding: 0,
              }}
              rightSection={active ? <IconCheck size={16} /> : undefined}
            >
              {n}
            </Button>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
