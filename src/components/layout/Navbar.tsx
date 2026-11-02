import type { ReactNode } from "react";

export interface NavbarProps {
  brand: ReactNode;
  children?: ReactNode;
}

export function Navbar({ brand, children }: NavbarProps) {
  return (
    <header className="navbar">
      <div className="navbar__brand">{brand}</div>
      {children}
    </header>
  );
}
