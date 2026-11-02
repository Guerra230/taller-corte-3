"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { tokenStorage } from "@/services/token-storage";

function safeDestination(raw: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("\\") ? raw : "/feed";
}

function FullPageSpinner() {
  return (
    <div className="full-page">
      <Spinner />
    </div>
  );
}

export function PrivateGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== "anonymous") return;
    const reason = tokenStorage.consumeClearReason();
    if (reason === "logout") {
      router.replace("/login");
      return;
    }
    const params = new URLSearchParams({ next: `${pathname}${window.location.search}` });
    if (reason === "expired") params.set("expired", "1");
    router.replace(`/login?${params.toString()}`);
  }, [status, router, pathname]);

  return status === "authenticated" ? <>{children}</> : <FullPageSpinner />;
}

export function GuestGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const destination = safeDestination(useSearchParams().get("next"));

  useEffect(() => {
    if (status === "authenticated") router.replace(destination);
  }, [status, router, destination]);

  return status === "anonymous" ? <>{children}</> : <FullPageSpinner />;
}
