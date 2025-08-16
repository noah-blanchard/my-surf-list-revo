"use client";

import { useState } from "react";
import { ProfileSummary } from "@/ui/components/profile/ProfileSummary";
import { GlowButton } from "@/ui/components/buttons/GlowButton";
import { getMeAction } from "../actions";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@mantine/core";
import { GlowSection } from "@/ui/components/section/GlowSection";
import { MeEditProfile } from "./MeEditProfile";

export default function MeHeader() {
  const [editOpen, setEditOpen] = useState(false);

  const { data: queryData, isLoading } = useQuery({
    queryKey: ["api", "profiles", "me"],
    queryFn: async () => {
      const res = await getMeAction();
      return res.ok ? res.data : null;
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

          <MeEditProfile
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
