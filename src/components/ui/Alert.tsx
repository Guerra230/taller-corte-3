import type { ReactNode } from "react";

export interface AlertProps {
  tone: "danger" | "success";
  children: ReactNode;
  action?: ReactNode;
}

export function Alert({ tone, children, action }: AlertProps) {
  return (
    <div className={`alert alert--${tone}`} role={tone === "danger" ? "alert" : "status"}>
      <p>{children}</p>
      {action}
    </div>
  );
}
