"use client";

import { AppShell, Group, Title, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Sidebar } from "@/features/nav/Sidebar";
import { defaultSidebarItems } from "@/features/nav/sidebarItems";
import { GlowButton } from "../buttons/GlowButton";
import { SignOutButton } from "@/features/auth/components/LogoutButton";

export default function AppFrame({ children }: { children: React.ReactNode }) {
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell
            header={{ height: 56 }}
            navbar={{ width: 260, breakpoint: "sm", collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Title order={4}>My Surf List Revo</Title>
                    </Group>

                    <Box>
                        <SignOutButton />
                    </Box>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="xs">
                <Sidebar items={defaultSidebarItems} />
            </AppShell.Navbar>

            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
}
