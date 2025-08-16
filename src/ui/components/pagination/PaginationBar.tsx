// src/ui/components/pagination/PaginationBar.tsx
"use client";
import { Group, Pagination, Select } from "@mantine/core";

export function PaginationBar({
  page, total, onChange, pageSize, onPageSize,
}: {
  page: number;
  total: number;
  onChange: (p: number) => void;
  pageSize: number;
  onPageSize: (s: number) => void;
}) {
  return (
    <Group justify="space-between">
      <Select
        data={["12","20","40","60"].map(v => ({ value: v, label: `${v}/page` }))}
        value={String(pageSize)}
        onChange={(v) => onPageSize(Number(v ?? 20))}
        w={110}
        radius="md"
      />
      <Pagination total={total} value={page} onChange={onChange} radius="md" />
    </Group>
  );
}
