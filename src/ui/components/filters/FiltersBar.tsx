// src/ui/components/filters/FiltersBar.tsx
"use client";
import { Group } from "@mantine/core";
import { SearchField } from "../inputs/SearchField";
import { TierSelect } from "./TierSelect";
import { TypeToggle, MapTypeFilter } from "./TypeToggle";
import { SortSelect, SortKey } from "./SortSelect";

export function FiltersBar({
  q, onQ, tier, onTier, type, onType, sort, dir, onSort, onDir,
}: {
  q: string; onQ: (v: string) => void;
  tier: number | null; onTier: (v: number | null) => void;
  type: MapTypeFilter; onType: (v: MapTypeFilter) => void;
  sort: SortKey; dir: "asc" | "desc"; onSort: (s: SortKey) => void; onDir: (d: "asc" | "desc") => void;
}) {
  return (
    <Group wrap="wrap" gap="sm">
      <SearchField value={q} onChange={onQ} />
      <TierSelect value={tier} onChange={onTier} />
      <TypeToggle value={type} onChange={onType} />
      <SortSelect sort={sort} dir={dir} onSort={onSort} onDir={onDir} />
    </Group>
  );
}
