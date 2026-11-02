import type { ReactNode } from "react";

export interface SidebarProps {
  label: string;
  children: ReactNode;
}

export function Sidebar({ label, children }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label={label}>
      {children}
    </aside>
  );
}

export interface SidebarSectionProps {
  title: string;
  children: ReactNode;
}

export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <section className="sidebar__section">
      <h2 className="sidebar__title">{title}</h2>
      {children}
    </section>
  );
}
