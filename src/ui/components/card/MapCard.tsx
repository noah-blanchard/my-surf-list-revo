// src/ui/components/card/MapCard.tsx
"use client";
import {
  Badge,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Menu,
  Button,
  Tooltip,
  Divider,
} from "@mantine/core";
import {
  IconPlus,
  IconChevronDown,
  IconPlayerPlay,
  IconCalendarPlus,
  IconCheck,
  IconClock,
} from "@tabler/icons-react";
import { useEffect, useState, useMemo } from "react";
import { MapWithCompletion } from "@/features/maps/schemas";
import { epochToMinSecMS } from "../list/helpers";

type MapCardProps = {
  item: MapWithCompletion;
  loading: boolean;
  onAddPlanned?: (map: MapWithCompletion) => void;
  onAddOngoing?: (map: MapWithCompletion) => void;
  onAddCompleted?: (map: MapWithCompletion) => void;
  cardHeight?: number;
};

const noShrink: React.CSSProperties = { flexShrink: 0 };

function statusColor(s?: string | null): string | undefined {
  switch (s) {
    case "Planned":
      return "gray";
    case "Ongoing":
      return "yellow";
    case "Completed":
      return "teal";
    case "On hold":
      return "orange";
    case "Dropped":
      return "red";
    default:
      return undefined;
  }
}

export function MapCard({
  item,
  onAddPlanned,
  onAddOngoing,
  onAddCompleted,
  loading,
}: MapCardProps) {
  const [localLoading, setLocalLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const completion = item.completion_data ?? null;
  const alreadyInList = !!completion?.status;

  const totalStages =
    item.stages_count ?? (item.is_linear ? 1 : item.cp_count ?? 0);
  const stagesCompleted = completion?.stages_completed?.length ?? 0;

  const showTime = typeof completion?.time === "number";
  const timeLabel = useMemo(
    () => (showTime ? epochToMinSecMS(completion!.time) : ""),
    [showTime, completion]
  );

  useEffect(() => {
    if (loading === false && localLoading === true) {
      setLocalLoading(false);
      setSuccess(true);
    }
  }, [loading, localLoading]);

  const btnDisabled = success || alreadyInList;
  const btnLoading = localLoading && !alreadyInList;

  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      {/* Header + badges */}
      <Stack gap={18}>
        <Text fz="lg" fw={700} lineClamp={1}>
          {item.name}
        </Text>

        {/* Ligne 1 : tier / linear|staged / stages / bonuses */}
        <Group
          gap="xs"
          wrap="nowrap"
          style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <Badge size="md" variant="light" style={noShrink}>
            TIER {item.tier}
          </Badge>
          <Badge size="md" color={item.is_linear ? "indigo" : "grape"} style={noShrink}>
            {item.is_linear ? "LINEAR" : "STAGED"}
          </Badge>
          <Badge size="md" variant="outline" style={noShrink}>
            {item.cp_count} {item.is_linear ? "CP" : "STAGES"}
          </Badge>
          <Badge size="md" variant="outline" style={noShrink}>
            {item.b_count} BONUSES
          </Badge>
        </Group>

        <Divider />

        {/* Ligne 2 : status / temps / stages complétés */}
        <Group
          gap="xs"
          wrap="nowrap"
          style={{ overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {completion?.status && (
            <Badge size="md" color={statusColor(completion.status)} style={noShrink}>
              {completion.status.toUpperCase()}
            </Badge>
          )}

          {showTime && (
            <Badge
              size="md"
              leftSection={<IconClock size={14} />}
              style={noShrink}
            >
              {timeLabel}
            </Badge>
          )}

          {!item.is_linear && Number.isFinite(totalStages) && totalStages > 0 && (
            <Badge size="md" variant="light" style={noShrink}>
              STAGES {stagesCompleted}/{totalStages}
            </Badge>
          )}
        </Group>
      </Stack>

      {/* Footer */}
      <Group justify="space-between" mt="auto">
        <Text size="xs" c="dimmed">
          {new Date(item.created_at).toLocaleDateString()}
        </Text>

        <Menu withinPortal withArrow disabled={btnDisabled}>
          <Menu.Target>
            <Tooltip
              label={alreadyInList ? "Déjà dans votre liste" : undefined}
              disabled={!alreadyInList}
            >
              <Button
                loading={btnLoading}
                disabled={btnDisabled}
                size="sm"
                variant="default"
                rightSection={<IconChevronDown size={16} />}
                leftSection={
                  success || alreadyInList ? <IconCheck size={16} /> : <IconPlus size={16} />
                }
              >
                {success || alreadyInList ? "In list" : "Add"}
              </Button>
            </Tooltip>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconCalendarPlus size={14} />}
              onClick={() => {
                onAddPlanned?.(item);
                setLocalLoading(true);
              }}
            >
              Add as Planned
            </Menu.Item>
            <Menu.Item
              leftSection={<IconPlayerPlay size={14} />}
              onClick={() => {
                onAddOngoing?.(item);
                setLocalLoading(true);
              }}
            >
              Add as Ongoing
            </Menu.Item>
            <Menu.Item
              leftSection={<IconCheck size={14} />}
              onClick={() => {
                onAddCompleted?.(item);
                setLocalLoading(true);
              }}
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
      <Stack gap={6} style={{ height: "100%" }}>
        <Skeleton height={18} width="60%" radius="sm" />
        <Group gap="xs">
          <Skeleton height={24} width={70} radius="xl" />
          <Skeleton height={24} width={90} radius="xl" />
          <Skeleton height={24} width={88} radius="xl" />
          <Skeleton height={24} width={110} radius="xl" />
        </Group>
        <Group gap="xs">
          <Skeleton height={24} width={100} radius="xl" />
          <Skeleton height={24} width={80} radius="xl" />
          <Skeleton height={24} width={120} radius="xl" />
        </Group>
        <Group justify="space-between" mt="auto">
          <Skeleton height={14} width={80} radius="sm" />
          <Skeleton height={28} width={90} radius="md" />
        </Group>
      </Stack>
    </Paper>
  );
}
