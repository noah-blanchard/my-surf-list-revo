import ProfileHeader from "@/features/profiles/components/ProfileHeader";
import { Stack } from "@mantine/core";
import { GlowSection } from "@/ui/components/section/GlowSection";
import { UserStatsGridView } from "@/features/stats/components/UserStatsGridView";
import { getUserServer } from "@/lib/auth";
import { KsfSyncButton } from "@/features/ksf/components/KsfSyncButton";

export default async function DashboardPage() {
  const user = await getUserServer();

  return (
    <Stack gap="md">
      <ProfileHeader userId={user?.id} />

      <UserStatsGridView userId={user?.id} />

      <GlowSection title="Sync KSF Completed Maps">
        {/* Placeholders: mets ici ton composant de tableau, timeline, etc. */}
        <KsfSyncButton />
      </GlowSection>
    </Stack>
  );
}
