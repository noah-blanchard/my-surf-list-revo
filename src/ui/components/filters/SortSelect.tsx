// src/ui/components/filters/SortSelect.tsx
"use client";
import { Select } from "@mantine/core";

export type SortKey = "created" | "alpha" | "tier";

export function SortSelect({
  sort, dir, onSort, onDir,
}: {
  sort: SortKey;
  dir: "asc" | "desc";
  onSort: (s: SortKey) => void;
  onDir: (d: "asc" | "desc") => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Select
        data={[
          { value: "created", label: "Newest" },
          { value: "alpha", label: "Alphabetical" },
          { value: "tier", label: "By tier" },
        ]}
        value={sort}
        onChange={(v) => onSort((v as SortKey) ?? "created")}
        radius="md"
      />
      <Select
        data={[
          { value: "desc", label: "Desc" },
          { value: "asc", label: "Asc" },
        ]}
        value={dir}
        onChange={(v) => onDir((v as "asc" | "desc") ?? "desc")}
        radius="md"
      />
    </div>
  );
}
