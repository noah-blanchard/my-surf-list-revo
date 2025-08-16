// src/ui/components/grid/ResultsGrid.tsx
import { SimpleGrid } from "@mantine/core";
import { MapCardSkeleton } from "../card/MapCard";

export function ResultsGrid({ children }: { children: React.ReactNode }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
      {children}
    </SimpleGrid>
  );
}

export function ResultsGridSkeleton({ count }: { count: number }) {
  return (
    <ResultsGrid>
      {Array.from({ length: count }).map((_, i) => (
        <MapCardSkeleton key={i} />
      ))}
    </ResultsGrid>
  );
}