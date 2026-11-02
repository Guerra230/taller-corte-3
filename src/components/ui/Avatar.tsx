import { cx } from "@/lib/cx";
import { initialsOf } from "@/lib/format";

export interface AvatarProps {
  name: string;
  size?: "sm" | "md";
  className?: string;
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <span className={cx("avatar", `avatar--${size}`, className)} aria-hidden="true">
      {initialsOf(name)}
    </span>
  );
}
