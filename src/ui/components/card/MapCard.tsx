// src/ui/components/card/MapCard.tsx
"use client";
import { Badge, Group, Paper, Skeleton, Stack, Text, Menu, Button } from "@mantine/core";
import { IconPlus, IconChevronDown, IconPlayerPlay, IconCalendarPlus, IconCheck } from "@tabler/icons-react";
import type { Database } from "@/types/supabase";
import { useEffect, useState } from "react";
type MapRow = Database["public"]["Tables"]["maps"]["Row"];

type MapCardProps = {
  item: MapRow;
  loading: boolean;
  onAddPlanned?: (map: MapRow) => void;
  onAddOngoing?: (map: MapRow) => void;
  onAddCompleted?: (map: MapRow) => void;
};

export function MapCard({ item, onAddPlanned, onAddOngoing, onAddCompleted, loading }: MapCardProps) {

  const [localLoading, setLocalLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (loading === false && localLoading === true) {
      setLocalLoading(false)
      setSuccess(true);
    }
  }, [loading, localLoading])

  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text fw={700}>{item.name}</Text>
          <Group gap="xs">
            <Badge size="sm" variant="light">Tier {item.tier}</Badge>
            <Badge size="sm" color={item.is_linear ? "indigo" : "grape"}>
              {item.is_linear ? "Linear" : "Staged"}
            </Badge>
            <Badge size="sm" variant="outline">
              {item.cp_count} {item.is_linear ? "cp" : "stages"}
            </Badge>
            <Badge size="sm" variant="outline">{item.b_count} bonuses</Badge>
          </Group>
        </Stack>
      </Group>

      <Group justify="space-between" mt="sm">
        <Text size="xs" c="dimmed">
          {new Date(item.created_at).toLocaleDateString()}
        </Text>

        {/* Add menu */}
        <Menu withinPortal withArrow>
          <Menu.Target>
            <Button
              loading={localLoading}
              disabled={success}
              size="xs"
              variant="default"
              rightSection={<IconChevronDown size={14} />}
              leftSection={
                success ? <IconCheck size={14} /> : <IconPlus size={14} />
              }
            >
              {success ? "Added" : "Add"}
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconCalendarPlus size={14} />}
              onClick={() => { onAddPlanned?.(item); setLocalLoading(true); }}
            >
              Add as Planned
            </Menu.Item>
            <Menu.Item
              leftSection={<IconPlayerPlay size={14} />}
              onClick={() => { onAddOngoing?.(item); setLocalLoading(true); }}
            >
              Add as Ongoing
            </Menu.Item>
            <Menu.Item
              leftSection={<IconCheck size={14} />}
              onClick={() => { onAddCompleted?.(item); setLocalLoading(true); }}
            >
              Add as Completed
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Paper>
  );
}

export function MapCardSkeleton() {
  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between" align="flex-start" align-items="stretch">
        <Stack gap={6} style={{ flex: 1 }}>
          <Skeleton height={16} width="60%" radius="sm" />
          <Group gap="xs">
            <Skeleton height={20} width={70} radius="xl" />
            <Skeleton height={20} width={80} radius="xl" />
            <Skeleton height={20} width={56} radius="xl" />
          </Group>
        </Stack>
        <Skeleton height={12} width={80} radius="sm" />
      </Group>
    </Paper>
  );
}
