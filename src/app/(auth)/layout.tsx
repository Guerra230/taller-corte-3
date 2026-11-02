import { Suspense, type ReactNode } from "react";
import { GuestGate } from "@/features/auth/AuthGate";
import { AuthShell } from "@/features/auth/AuthShell";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <GuestGate>
        <AuthShell>{children}</AuthShell>
      </GuestGate>
    </Suspense>
  );
}
