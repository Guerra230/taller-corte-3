import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/cx";

export type CardProps = HTMLAttributes<HTMLElement>;

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <article className={cx("card", className)} {...rest}>
      {children}
    </article>
  );
}

export interface CardHeaderProps {
  title: string;
  subtitle?: string | null;
  aside?: ReactNode;
}

export function CardHeader({ title, subtitle, aside }: CardHeaderProps) {
  return (
    <header className="card__header">
      <div>
        <h2 className="card__title">{title}</h2>
        {subtitle && <p className="card__subtitle">{subtitle}</p>}
      </div>
      {aside}
    </header>
  );
}

export type CardBodyProps = HTMLAttributes<HTMLDivElement>;

export function CardBody({ className, children, ...rest }: CardBodyProps) {
  return (
    <div className={cx("card__body", className)} {...rest}>
      {children}
    </div>
  );
}
