import { requireUser } from "@/lib/auth";
import AppFrame from "@/ui/components/layout/AppFrame";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return <AppFrame>{children}</AppFrame>;
}