// src/ui/components/filters/TypeToggle.tsx
"use client";
import { SegmentedControl } from "@mantine/core";

export type CompletionFilterType = "all" | "complete" | "incomplete" | "unplayed";

export function CompletionToggle({
  value, onChange,
}: { value: CompletionFilterType; onChange: (v: CompletionFilterType) => void; }) {
  return (
    <SegmentedControl
      value={value}
      onChange={(v) => onChange(v as CompletionFilterType)}
      data={[
        { label: "All", value: "all" },
        { label: "Complete", value: "complete" },
        { label: "Incomplete", value: "incomplete" },
        { label: "Unplayed", value: "unplayed" },
      ]}
      radius="md"
    />
  );
}
