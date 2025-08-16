// src/ui/components/filters/TypeToggle.tsx
"use client";
import { SegmentedControl } from "@mantine/core";

export type MapTypeFilter = "all" | "linear" | "staged";

export function TypeToggle({
  value, onChange,
}: { value: MapTypeFilter; onChange: (v: MapTypeFilter) => void; }) {
  return (
    <SegmentedControl
      value={value}
      onChange={(v) => onChange(v as MapTypeFilter)}
      data={[
        { label: "All", value: "all" },
        { label: "Linear", value: "linear" },
        { label: "Staged", value: "staged" },
      ]}
      radius="md"
    />
  );
}
