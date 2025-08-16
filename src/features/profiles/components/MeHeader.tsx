"use client";

import { ProfileSummary } from "@/ui/components/profile/ProfileSummary";
import { GlowButton } from "@/ui/components/buttons/GlowButton";
import { getMeAction } from "../actions";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@mantine/core";
import { GlowSection } from "@/ui/components/section/GlowSection";

export default function MeHeader() {

    const { data: queryData, isLoading } = useQuery({
    queryKey: ["api", "profiles", "me"],
    queryFn: async () => {
      const res = await getMeAction();
      return res.ok ? res.data : null;
    },
    enabled: true,
    staleTime: 0,
    gcTime: 0,
  });


  return (
    <GlowSection>
      {isLoading ? (
        <Skeleton height={80} width="100%" /> // Adjust size as needed
      ) : (
        <ProfileSummary
          displayName={
            queryData?.profile?.display_name ??
            null
          }
          steamId64={queryData?.profile?.steam_id64 ?? null}
          rightSlot={
            <GlowButton
              variant="default"
              size="sm"
              glowGradient="magma"
              glowSize={50}
              glowOpacity={0.3}
            >
              Edit profile
            </GlowButton>
          }
        />
      )}
    </GlowSection>
  );
}
