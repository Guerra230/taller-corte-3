"use client";

import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { UserMenu } from "@/components/layout/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME } from "@/lib/brand";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <>
      <Navbar brand={APP_NAME}>
        {user && <UserMenu name={user.name} email={user.email} role={user.role} onLogout={logout} />}
      </Navbar>
      {children}
    </>
  );
}
