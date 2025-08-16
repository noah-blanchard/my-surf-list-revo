import AppFrame from "@/ui/components/layout/AppFrame";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame>{children}</AppFrame>;
}