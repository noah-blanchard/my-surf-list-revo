import { SimpleGrid } from "@mantine/core";

export function KPIGrid({ children }: { children: React.ReactNode }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
      {children}
    </SimpleGrid>
  );
}
