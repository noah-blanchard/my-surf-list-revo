"use client";
import { KPIGrid } from "@/ui/components/grid/KPIGrid";
import { GlowStatCard, GlowStatCardSkeleton } from "@/ui/components/card/StatCard";
import { useQuery } from "@tanstack/react-query";
import { getUserStatsAction } from "../actions";
import { IconCancel, IconCheck, IconClock, IconProgress } from "@tabler/icons-react";

export function UserStatsGridView({ userId }: { userId?: string }) {

  const { data: stats, isLoading } = useQuery({
    queryKey: ["api", "stats", userId],
    queryFn: () => getUserStatsAction(userId ?? ""),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });


  return (
    <KPIGrid>
      {isLoading ? (
        <>
          <GlowStatCardSkeleton />
          <GlowStatCardSkeleton />
          <GlowStatCardSkeleton />
          <GlowStatCardSkeleton />
        </>
      ) : (
        <>
          <GlowStatCard label="Completed maps" value={stats?.data?.completed} icon={<IconCheck size={24} color="green" />} />
          <GlowStatCard label="In progress maps" value={stats?.data?.ongoing} icon={<IconProgress size={24} color="#60a5fa" />} />
          <GlowStatCard label="Planned maps" value={stats?.data?.planned} icon={<IconClock size={24} color="orange" />} />
          <GlowStatCard label="Dropped" value={stats?.data?.dropped} icon={<IconCancel size={24} color="red" />} />
        </>
      )}
    </KPIGrid>
  );
}
