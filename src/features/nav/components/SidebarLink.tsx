"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink } from "@mantine/core";
import type { NavItem } from "./sidebarItems";

export function SidebarLink({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = pathname === item.href;

  return (
    <NavLink
      component={Link}
      href={item.href}
      label={item.label}
      leftSection={item.icon}
      active={active}
      variant="filled"
      styles={{ label: { fontWeight: 500 } }}
      // tu peux exposer onClick, etc., si besoin
    />
  );
}
