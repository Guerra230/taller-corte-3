import type { ReactNode } from "react";
import { CourtLines } from "@/features/courts/CourtLines";
import { APP_NAME } from "@/lib/brand";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth">
      <section className="auth__panel">
        <p className="auth__brand">{APP_NAME}</p>
        <CourtLines kind="soccer" className="auth__lines court-lines-animated" />
        <p className="auth__headline">Tu cancha, a la hora que puedes jugar.</p>
      </section>
      <main className="auth__main">
        <div className="auth__form">{children}</div>
      </main>
    </div>
  );
}
