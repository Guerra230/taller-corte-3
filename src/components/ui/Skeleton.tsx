import { cx } from "@/lib/cx";

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cx("skeleton", className)} aria-hidden="true" />;
}
