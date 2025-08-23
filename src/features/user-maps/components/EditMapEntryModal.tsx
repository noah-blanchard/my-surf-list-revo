"use client";
import React from "react";
import {
  Button,
  Group,
  Modal,
  Stack,
  Divider,
  Text,
  Box,
  useMantineTheme,
  rgba,
  ActionIcon,
  Title,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { MapStatusSegmented } from "@/ui/components/select/MapStatusSegmented";
import { NumberGridMultiSelect } from "@/ui/components/grid/NumberGridMultiSelect";
import { Map, MapStatusEnum } from "@/features/maps/schemas";

type Props = {
  opened: boolean;
  onClose: () => void;
  map: Map;
  status: MapStatusEnum;
  onStatusChange: (s: MapStatusEnum) => void;
  bonuses: number[];
  onAddBonus: (b: number) => void;
  onRemoveBonus: (b: number) => void;
  stages: number[];
  onAddStage: (s: number) => void;
  onRemoveStage: (s: number) => void;
  onDelete: () => void;
  onSubmit: () => void;
  submitting?: boolean;
  deleting?: boolean;
};

export function EditMapEntryModal(props: Props) {
  const {
    opened, onClose, map, status, onStatusChange,
    bonuses, onAddBonus, onRemoveBonus,
    stages, onAddStage, onRemoveStage,
    onDelete, onSubmit, submitting, deleting,
  } = props;

  const theme = useMantineTheme();

  // ---------- même logique, valeurs + subtiles & mouvement réduit ----------
  const grad = React.useMemo(() => {
    const C = {
      Completed: {
        from: rgba(theme.colors.green[6], 0.10),
        to:   rgba(theme.colors.teal[8],  0.035),
        x: "60%", y: "28%",
      },
      Ongoing: {
        from: rgba(theme.colors.blue[6],  0.10),
        to:   rgba(theme.colors.indigo[8],0.035),
        x: "55%", y: "30%",
      },
      "On hold": {
        from: rgba(theme.colors.yellow[5],0.09),
        to:   rgba(theme.colors.orange[7],0.03),
        x: "62%", y: "58%",
      },
      Planned: {
        from: rgba(theme.colors.gray[5],  0.085),
        to:   rgba(theme.colors.grape[7], 0.03),
        x: "50%", y: "65%",
      },
      Dropped: {
        from: rgba(theme.colors.red[6],   0.11),
        to:   rgba(theme.colors.pink[7],  0.04),
        x: "45%", y: "42%",
      },
    } as const;
    return C[status];
  }, [status, theme]);

  const haloVars = {
    ["--halo-from"]: grad.from,
    ["--halo-to"]: grad.to,
    ["--halo-x"]: grad.x,
    ["--halo-y"]: grad.y,
  } as React.CSSProperties;

  // ---------- halo : plus grand, plus flou, très discret ----------
  const haloStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    borderRadius: `calc(${theme.radius.lg} * 1.0)`,
    background: `
      radial-gradient(
        1600px circle at var(--halo-x) var(--halo-y),
        var(--halo-from) 0%,
        var(--halo-to) 22%,
        transparent 88%
      )
    `,
    // flou léger pour diffuser le halo sans gêner la lisibilité
    filter: "blur(14px)",
    // transitions douces, mouvement moins marqué
    transition:
      "--halo-from 420ms ease, --halo-to 420ms ease, --halo-x 420ms ease, --halo-y 420ms ease, opacity 220ms ease",
  };

  return (
    <Modal
      withCloseButton={false}
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      radius="lg"
      styles={{
        content: { background: theme.colors.dark[7], overflow: "hidden" },
        header: { zIndex: 2 },
        body:   { position: "relative", zIndex: 1 },
      }}
    >
      {/* variables typées pour animer proprement */}
      <style jsx global>{`
        @property --halo-from { syntax: '<color>'; inherits: false; initial-value: rgba(0,0,0,0); }
        @property --halo-to   { syntax: '<color>'; inherits: false; initial-value: rgba(0,0,0,0); }
        @property --halo-x    { syntax: '<percentage>'; inherits: false; initial-value: 50%; }
        @property --halo-y    { syntax: '<percentage>'; inherits: false; initial-value: 50%; }
      `}</style>

      {/* halo derrière tout le contenu */}
      <Box style={{ ...haloStyle, ...haloVars }} />

      <Stack gap="lg">
        {/* header custom */}
        <Group justify="space-between" align="center">
          <Title order={4}>Edit entry · {map.name}</Title>
          <ActionIcon variant="subtle" color="gray" aria-label="Close" onClick={onClose} title="Close">
            <IconX size={18} />
          </ActionIcon>
        </Group>

        <MapStatusSegmented value={status} onChange={onStatusChange} />

        {!map.is_linear && (map.stages_count ?? 0) > 0 && (
          <>
            <Divider />
            <NumberGridMultiSelect
              toggleAll={status === MapStatusEnum.Completed}
              onAdd={onAddStage}
              onRemove={onRemoveStage}
              label="Completed stages"
              count={map.stages_count ?? 0}
              value={stages}
            />
          </>
        )}

        {(map.b_count ?? 0) > 0 && (
          <>
            <Divider />
            <NumberGridMultiSelect
              onAdd={onAddBonus}
              onRemove={onRemoveBonus}
              label="Completed bonuses"
              count={map.b_count ?? 0}
              value={bonuses}
            />
          </>
        )}

        {map.is_linear && (map.b_count ?? 0) === 0 && (
          <Text c="dimmed" size="sm">
            This map doesn&apos;t have any stages or bonuses to complete.
          </Text>
        )}

        <Group justify="space-between" mt="md">
          <Button color="red" variant="light" onClick={onDelete} loading={deleting}>
            Remove from my maps
          </Button>
          <Group>
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button onClick={onSubmit} loading={submitting}>Save</Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
