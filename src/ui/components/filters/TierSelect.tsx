// src/ui/components/filters/TierSelect.tsx
"use client";
import { Select } from "@mantine/core";

const options = Array.from({ length: 10 }, (_, i) => String(i + 1)).map((v) => ({ value: v, label: `Tier ${v}` }));

export function TierSelect({
  value, onChange, allowClear = true,
}: { value: number | null; onChange: (v: number | null) => void; allowClear?: boolean; }) {
  return (
    <Select
      data={allowClear ? [{ value: "", label: "All tiers" }, ...options] : options}
      value={value ? String(value) : ""}
      onChange={(v) => onChange(v ? Number(v) : null)}
      radius="md"
    />
  );
}
