"use client";
import { Progress, Group, Text } from "@mantine/core";

export function ProgressWithLabel({
  value,
  label,
}: {
  value: number; // 0..100
  label?: string;
}) {
  return (
    <Group wrap="nowrap" gap="sm" align="center">
      <Progress value={value} w={220} aria-label={label} />
      <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
        {label ?? `${Math.round(value)}%`}
      </Text>
    </Group>
  );
}
