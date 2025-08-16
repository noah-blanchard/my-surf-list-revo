"use client";

import { Group, Text, ThemeIcon, Stack, Skeleton } from "@mantine/core";
import type { ReactNode } from "react";
import { GlowSection, type GlowSectionProps } from "../section/GlowSection";

type StatCardProps = Omit<GlowSectionProps, "children" | "title"> & {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
    hint?: string;
};

export function GlowStatCard({
    label,
    value,
    icon,
    hint,
    // defaults “soft” pour les cards
    glowSize = 500,
    glowOpacity = 0.15,
    glowGradient = "twilight",
    p = "md",
    radius = "md",
    withBorder = true,
    ...rest
}: StatCardProps) {
    return (
        <GlowSection
            p={p}
            radius={radius}
            withBorder={withBorder}
            glowSize={glowSize}
            glowOpacity={glowOpacity}
            glowGradient={glowGradient}
            {...rest}
        >
            <Group align="center" gap="sm" style={{ position: "relative", zIndex: 1 }}>
                {icon && <ThemeIcon variant="light" size="lg">{icon}</ThemeIcon>}
                <Stack gap={2}>
                    <Text size="md" c="dimmed" fw={700}>{label}</Text>
                    <Text size="xl" fw={700}>{value}</Text>
                    {hint && <Text size="xs" c="dimmed">{hint}</Text>}
                </Stack>
            </Group>
        </GlowSection>
    );
}

export function GlowStatCardSkeleton() {
    return (
        <GlowSection
            p="md"
            radius="md"
            withBorder
            glowSize={300}
            glowOpacity={0.1}
        >
            <Group align="center" gap="sm" style={{ position: "relative", zIndex: 1 }}>
                <Skeleton circle height={32} width={32} />
                <Stack gap={2}>
                    <Skeleton height={16} width="60%" />
                    <Skeleton height={24} width="40%" />
                </Stack>
            </Group>
        </GlowSection>
    );
}