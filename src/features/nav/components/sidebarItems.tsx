import { IconGauge, IconSearch, IconList } from "@tabler/icons-react";
import type { ReactNode } from "react";

export type NavItem = {
    label: string;
    href: string;
    icon?: ReactNode;
};

export const defaultSidebarItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <IconGauge size={18} /> },
    { label: "My list", href: "/my-list", icon: <IconList size={18} /> },
    { label: "Search maps", href: "/search-maps", icon: <IconSearch size={18} /> },
];
