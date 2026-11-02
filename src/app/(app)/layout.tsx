import type { ReactNode } from "react";
import { AppShell } from "@/features/auth/AppShell";
import { PrivateGate } from "@/features/auth/AuthGate";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return (
    <PrivateGate>
      <AppShell>{children}</AppShell>
    </PrivateGate>
  );
}
