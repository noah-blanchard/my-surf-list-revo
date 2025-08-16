import { Paper, Skeleton, Stack } from "@mantine/core";

export function MapListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Paper withBorder radius="md" p="sm">
      <Stack gap="xs">
        <Skeleton height={20} width="30%" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} height={28} />
        ))}
      </Stack>
    </Paper>
  );
}
