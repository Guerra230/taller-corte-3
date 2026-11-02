import type { ReactNode } from "react";

export interface ListItemProps {
  title: string;
  meta?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function ListItem({ title, meta, leading, trailing }: ListItemProps) {
  return (
    <li className="list-item">
      {leading}
      <div className="list-item__text">
        <span>{title}</span>
        {meta && <small>{meta}</small>}
      </div>
      {trailing}
    </li>
  );
}
