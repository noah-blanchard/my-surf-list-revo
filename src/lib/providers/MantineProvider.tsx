"use client";

import { MantineProvider as Mantine } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

export function MantineProvider({ children }: { children: React.ReactNode }) {
    return (
        <Mantine defaultColorScheme="dark">
            <Notifications position="top-right" />
            {children}
        </Mantine>
    );
}
