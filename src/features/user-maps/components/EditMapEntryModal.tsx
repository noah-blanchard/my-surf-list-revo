"use client";
import React from "react";
import { Button, Group, Modal, Stack, Divider, Text } from "@mantine/core";
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

export function EditMapEntryModal({
  opened,
  onClose,
  map,
  status,
  onStatusChange,
  bonuses,
  onAddBonus,
  onRemoveBonus,
  onRemoveStage,
  onAddStage,
  stages,
  onDelete,
  onSubmit,
  submitting,
  deleting,
}: Props) {
  const showStages = !map.is_linear && (map.stages_count ?? 0) > 0;
  const showBonuses = (map.b_count ?? 0) > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Edit entry · ${map.name}`}
      centered
      size="lg"
      radius="lg"
    >
      <Stack gap="lg">
        <MapStatusSegmented value={status} onChange={onStatusChange} />

        {showStages && (
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

        {showBonuses && (
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

        {!showStages && !showBonuses && (
          <Text c="dimmed" size="sm">
            This map doesn&apos;t have any stages or bonuses to complete.
          </Text>
        )}

        <Group justify="space-between" mt="md">
          <Button
            color="red"
            variant="light"
            onClick={onDelete}
            loading={deleting}
          >
            Remove from my maps
          </Button>

          <Group>
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSubmit} loading={submitting}>
              Save
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}
