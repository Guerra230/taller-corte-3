import { cx } from "@/lib/cx";

export interface SpinnerProps {
  label?: string;
  className?: string;
}

export function Spinner({ label = "Cargando", className }: SpinnerProps) {
  return <span role="status" aria-label={label} className={cx("spinner", className)} />;
}
