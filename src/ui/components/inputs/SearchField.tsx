// src/ui/components/inputs/SearchField.tsx
"use client";
import { TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

export function SearchField({
  value, onChange, placeholder = "Search maps…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <TextInput
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder={placeholder}
      leftSection={<IconSearch size={16} />}
      radius="md"
    />
  );
}
