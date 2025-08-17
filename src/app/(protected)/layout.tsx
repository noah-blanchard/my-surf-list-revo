// src/app/(protected)/layout.tsx
import AppFrame from "@/ui/components/layout/AppFrame";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { getUserServer } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const user = await getUserServer();

  return (
    <AuthProvider initialUser={user}>
      <AppFrame>{children}</AppFrame>
    </AuthProvider>
  );
}
