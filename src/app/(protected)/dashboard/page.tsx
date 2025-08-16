import MeHeader from "@/features/profiles/components/MeHeader";
import { Stack } from "@mantine/core";
import { GlowSection } from "@/ui/components/section/GlowSection";
import { UserStatsGridView } from "@/features/stats/components/UserStatsGridView";
import { getSession } from "@/lib/auth";
import { KsfSyncPanel } from "@/features/ksf/components/KsfSyncPanel";
import { KsfSyncButton } from "@/features/ksf/components/KsfSyncButton";

export default async function DashboardPage() {

    // get userId from session or context
    const a = await getSession();

    const userId = a?.user?.id ?? "123"; // replace with actual user ID retrieval logic


    return (
        <Stack gap="md">
            <MeHeader />


            <UserStatsGridView userId={userId} />

            <GlowSection title="Sync KSF Completed Maps">
                {/* Placeholders: mets ici ton composant de tableau, timeline, etc. */}
                <KsfSyncButton />  
            </GlowSection>
        </Stack>
    );
}
