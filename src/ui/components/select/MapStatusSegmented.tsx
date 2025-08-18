"use client";
import React from "react";
import { SegmentedControl, Group, Text, ThemeIcon, rem } from "@mantine/core";
import {
  IconCheck, // Completed
  IconPlayerPause, // On hold
  IconCircleX, // Dropped
  IconBolt, // Ongoing
  IconCalendarPlus, // Planned
} from "@tabler/icons-react";
import type { MapStatusEnum } from "@/features/maps/schemas";

// Optional: control order explicitly

const META: Record<
  MapStatusEnum,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    tint?: number;
  }
> = {
  Completed: { label: "Completed", icon: IconCheck, color: "teal", tint: 5 },
  Ongoing: { label: "Ongoing", icon: IconBolt, color: "blue", tint: 5 },
  "On hold": {
    label: "On hold",
    icon: IconPlayerPause,
    color: "yellow",
    tint: 5,
  },
  Planned: { label: "Planned", icon: IconCalendarPlus, color: "gray", tint: 5 },
  Dropped: { label: "Dropped", icon: IconCircleX, color: "red", tint: 5 },
};

const ORDER = [
  "Completed",
  "Ongoing",
  "On hold",
  "Planned",
  "Dropped",
] as const;

type Props = {
  value: MapStatusEnum;
  onChange: (s: MapStatusEnum) => void;
  label?: string;
  fullWidth?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  radius?: number | "xs" | "sm" | "md" | "lg" | "xl";
};

export function MapStatusSegmented({
  value,
  onChange,
  label = "Status",
  fullWidth = true,
  size = "sm",
  radius = "md",
}: Props) {
  const data = ORDER.map((v) => {
    const { label, icon: Icon, color } = META[v];

    // custom label with icon + subtle color
    const node = (
      <Group gap={6} wrap="nowrap" align="center">
        <ThemeIcon
          size={rem(18)}
          radius="xl"
          color={color}
          variant="light"
          // make the icon subtle but visible on dark
          style={{ flex: "0 0 auto" }}
        >
          <Icon size={14} stroke={2} />
        </ThemeIcon>
        <Text size="sm">{label}</Text>
      </Group>
    );

    return { value: v, label: node };
  });

  return (
    <div>
      {label && (
        <Text size="sm" fw={600} mb={6}>
          {label}
        </Text>
      )}

      <SegmentedControl
        data={data}
        value={value}
        onChange={(v) => onChange(v as MapStatusEnum)}
        fullWidth={fullWidth}
        size={size}
        radius={radius}
        // Subtle borders between items looks nice for status toggles
        withItemsBorders
      />
    </div>
  );
}
