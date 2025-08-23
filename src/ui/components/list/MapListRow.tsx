"use client";
import { Grid, Badge, Highlight, Text, Box, Group } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import { epochToMinSecMS } from "./helpers";

export function MapListRow({
  name,
  tier,
  isLinear,
  right,
  time,
  highlight,
}: {
  name: string;
  tier: number;
  isLinear: boolean;
  right?: React.ReactNode;
  highlight?: string;
  time?: number | null;
}) {
  const hasTime = time != null && Number.isFinite(time);

  return (
    <Box
      py={6}
      px={8}
      style={{ borderBottom: "1px solid var(--mantine-color-dark-6)" }}
    >
      <Grid columns={24} align="center" gutter={6}>
        {/* ======== Desktop (md+) : [Nom+badges] | [Time] | [Actions] ======== */}
        <Grid.Col span={{ base: 0, md: 16 }} visibleFrom="md">
          <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
            <Text fw={600} truncate="end" title={name} style={{ minWidth: 0 }}>
              <Highlight
                highlight={highlight && highlight.length > 0 ? highlight : ""}
                highlightStyles={(theme) => ({
                  backgroundColor: theme.colors.yellow[4],
                  color: theme.black,
                  padding: "0 2px",
                  borderRadius: 4,
                })}
              >
                {name}
              </Highlight>
            </Text>
            <Badge variant="light" size="sm">T{tier}</Badge>
            <Badge size="sm" color={isLinear ? "indigo" : "grape"}>
              {isLinear ? "LINEAR" : "STAGED"}
            </Badge>
          </Group>
        </Grid.Col>

        <Grid.Col span={{ base: 0, md: 6 }} ta="right" visibleFrom="md">
          {hasTime && (
            <Group gap={6} justify="end" wrap="nowrap">
              <IconClock size={14} stroke={1.75} />
              <Text size="sm" fw={500} ff="monospace">
                {epochToMinSecMS(time!)}
              </Text>
            </Group>
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 0, md: 2 }} ta="right" visibleFrom="md">
          {right}
        </Grid.Col>

        {/* ======== Mobile (base/sm) : 3 lignes ======== */}

        {/* L1: name — edit */}
        <Grid.Col span={{ base: 24, md: 0 }} hiddenFrom="md">
          <Group justify="space-between" gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
            <Text fw={600} truncate="end" title={name} style={{ minWidth: 0 }}>
              <Highlight
                highlight={highlight && highlight.length > 0 ? highlight : ""}
                highlightStyles={(theme) => ({
                  backgroundColor: theme.colors.yellow[4],
                  color: theme.black,
                  padding: "0 2px",
                  borderRadius: 4,
                })}
              >
                {name}
              </Highlight>
            </Text>
            {right}
          </Group>
        </Grid.Col>

        {/* L2: T{tier} — LINEAR/STAGED */}
        <Grid.Col span={{ base: 24, md: 0 }} hiddenFrom="md">
          <Group gap={6}>
            <Badge variant="light" size="xs">T{tier}</Badge>
            <Badge size="xs" color={isLinear ? "indigo" : "grape"}>
              {isLinear ? "LINEAR" : "STAGED"}
            </Badge>
          </Group>
        </Grid.Col>

        {/* L3: 🕘 00:46.992 */}
        <Grid.Col span={{ base: 24, md: 0 }} hiddenFrom="md">
          {hasTime && (
            <Group gap={6} align="center">
              <IconClock size={14} stroke={1.75} />
              <Text size="sm" ff="monospace">{epochToMinSecMS(time!)}</Text>
            </Group>
          )}
        </Grid.Col>
      </Grid>
    </Box>
  );
}
