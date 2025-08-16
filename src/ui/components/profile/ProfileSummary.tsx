import { Avatar, Group, Stack, Text, Badge } from "@mantine/core";

export function ProfileSummary({
  displayName,
  email,
  steamId64,
  avatarUrl,
  rightSlot,
}: {
  displayName?: string | null;
  email?: string | null;
  steamId64?: string | null;
  avatarUrl?: string | null;
  rightSlot?: React.ReactNode;
}) {
  return (
    <Group justify="space-between" align="center" wrap="nowrap">
      <Group align="center" gap="md">
        <Avatar src={avatarUrl ?? undefined} name={displayName ?? email ?? "User"} radius="xl" size={48} />
        <Stack gap={2}>
          <Text fw={700} size="lg">{displayName ?? "Anonymous"}</Text>
          <Group gap="xs">
            {email && <Text size="sm" c="dimmed">{email}</Text>}
            {steamId64 && <Badge size="xs" variant="light">Steam: {steamId64}</Badge>}
          </Group>
        </Stack>
      </Group>
      {rightSlot}
    </Group>
  );
}
