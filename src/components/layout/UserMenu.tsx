"use client";

import { useCallback, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useDismissable } from "@/hooks/useDismissable";

export interface UserMenuProps {
  name: string;
  email?: string | null;
  role?: string | null;
  onLogout: () => void;
}

export function UserMenu({ name, email, role, onLogout }: UserMenuProps) {
  const [isOpen, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const containerRef = useDismissable<HTMLDivElement>(isOpen, close);

  return (
    <div className="user-menu" ref={containerRef}>
      <button
        type="button"
        className="user-menu__trigger"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
      >
        <Avatar name={name} size="sm" />
        <span className="user-menu__name">{name}</span>
      </button>
      {isOpen && (
        <div className="user-menu__panel">
          <p className="user-menu__heading">{name}</p>
          {email && <p className="user-menu__email">{email}</p>}
          {role && <Badge tone="pitch">{role}</Badge>}
          <Button variant="outline" size="sm" fullWidth onClick={onLogout}>
            Cerrar sesión
          </Button>
        </div>
      )}
    </div>
  );
}
