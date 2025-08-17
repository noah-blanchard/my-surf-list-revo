"use client";

import { useState } from "react";
import { ProfileSummary } from "@/ui/components/profile/ProfileSummary";
import { GlowButton } from "@/ui/components/buttons/GlowButton";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@mantine/core";
import { GlowSection } from "@/ui/components/section/GlowSection";
import { EditProfile } from "./EditProfile";
import { getProfileAction } from "../actions";

export default function ProfileHeader({ userId }: { userId?: string }) {
  const [editOpen, setEditOpen] = useState(false);

  const { data: queryData, isLoading } = useQuery({
    enabled: userId !== undefined && userId !== null && userId !== "",
    queryKey: ["api", "profiles", userId],
    queryFn: async () => {
      const res = await getProfileAction(userId ?? "");
      return res && res.ok ? res.data : null;
    },
    staleTime: 0,
    gcTime: 0,
  });

  const displayName = queryData?.profile?.display_name ?? null;
  const steamId64 = queryData?.profile?.steam_id64 ?? null;

  return (
    <GlowSection>
      {isLoading ? (
        <Skeleton height={80} width="100%" />
      ) : (
        <>
          <ProfileSummary
            displayName={displayName}
            steamId64={steamId64}
            rightSlot={
              <GlowButton
                variant="default"
                size="sm"
                glowGradient="magma"
                glowSize={50}
                glowOpacity={0.3}
                onClick={() => setEditOpen(true)}
              >
                Edit profile
              </GlowButton>
            }
          />

          <EditProfile
            opened={editOpen}
            onClose={() => setEditOpen(false)}
            initialDisplayName={displayName}
            initialSteamId64={steamId64}
          />
        </>
      )}
    </GlowSection>
  );
}
