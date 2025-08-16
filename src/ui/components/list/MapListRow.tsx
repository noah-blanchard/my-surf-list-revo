"use client";
import { Badge, Group, Highlight } from "@mantine/core";

export function MapListRow({
  name,
  tier,
  isLinear,
  right,
  highlight,          // <- chaîne à surligner
}: {
  name: string;
  tier: number;
  isLinear: boolean;
  right?: React.ReactNode;
  highlight?: string;
}) {
  return (
    <Group
      justify="space-between"
      wrap="nowrap"
      p="xs"
      style={{ borderBottom: "1px solid var(--mantine-color-dark-6)" }}
    >
      <Group gap="sm">
        {/* Mantine Highlight */}
        <Highlight
          highlight={highlight && highlight.length > 0 ? highlight : ""}
          fw={600}
          // optionnel: styles personnalisés
          highlightStyles={(theme) => ({
            backgroundColor: theme.colors.yellow[4],
            color: theme.black,
            padding: "0 2px",
            borderRadius: 4,
          })}
        >
          {name}
        </Highlight>

        <Badge variant="light">Tier {tier}</Badge>
        <Badge color={isLinear ? "indigo" : "grape"}>
          {isLinear ? "Linear" : "Staged"}
        </Badge>
      </Group>

      {right}
    </Group>
  );
}
