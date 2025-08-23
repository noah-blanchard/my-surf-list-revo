"use client";

import { Group, Text, Tooltip } from "@mantine/core";
import { GlowButton } from "@/ui/components/buttons/GlowButton";
import { useQuery } from "@tanstack/react-query";
import { syncKsfAction } from "../actions";

export function KsfSyncButton() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["api", "ksf-sync"],
    queryFn: () => syncKsfAction(),
    enabled: false,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const label = isLoading
    ? "Syncing…"
    : isError
    ? "Sync failed"
    : data?.ok
    ? `Synced ${data?.data?.upserted}/${data?.data?.fetched}`
    : "Idle";

  return (
    <Group align="center" gap="sm" wrap="nowrap">
      <Tooltip label={isLoading ? "Sync in progress" : "Start KSF sync"}>
        <GlowButton
          variant="default"
          size="sm"
          glowGradient="ocean"
          glowOpacity={0.25}
          onClick={() => refetch()}
          disabled={isLoading}
          loading={isLoading}
        >
          {isLoading ? "Syncing…" : "Sync KSF"}
        </GlowButton>
      </Tooltip>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    </Group>
  );
}
