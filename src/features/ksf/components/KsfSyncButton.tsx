"use client";
import { Group, Tooltip } from "@mantine/core";
import { GlowButton } from "@/ui/components/buttons/GlowButton";
import { ProgressWithLabel } from "@/ui/components/progress/ProgressWithLabel";
import { useKsfSync } from "./useKsfSync";

export function KsfSyncButton() {
  const { running, pct, label, start, cancel } = useKsfSync();

  return (
    <Group align="center" gap="sm" wrap="nowrap">
      <Tooltip label={running ? "Cancel sync" : "Start KSF sync"}>
        <GlowButton
          variant="default"
          size="sm"
          glowGradient="ocean"
          glowOpacity={0.25}
          onClick={() => (running ? cancel() : start())}
        >
          {running ? "Cancel" : "Sync KSF"}
        </GlowButton>
      </Tooltip>
      <ProgressWithLabel value={pct} label={label} />
    </Group>
  );
}
