// src/features/auth/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  // convenience
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

type AuthProviderProps = {
  initialUser: User | null;
  children: React.ReactNode;
};

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [session, setSession] = useState<Session | null>(null);
  const supabase = useMemo(createClient, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const value = useMemo(
    () => ({ user, session, isAuthenticated: !!user }),
    [user, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
