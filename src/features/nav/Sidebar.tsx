"use client";

import { Stack, ScrollArea } from "@mantine/core";
import type { NavItem } from "./sidebarItems";
import { SidebarLink } from "./SidebarLink";

export function Sidebar({ items }: { items: NavItem[] }) {
  return (
    <ScrollArea style={{ height: "100%" }} type="never">
      <Stack p="xs" gap={6}>
        {items.map((it) => (
          <SidebarLink key={it.href} item={it} />
        ))}
      </Stack>
    </ScrollArea>
  );
}
