import type { JSX } from "react";
import { cx } from "@/lib/cx";
import type { CourtKind } from "@/types/court";

export interface CourtLinesProps {
  kind: CourtKind;
  className?: string;
}

const LINE_PROPS = { pathLength: 1 } as const;

function SoccerLines() {
  return (
    <>
      <rect x="6" y="6" width="308" height="148" {...LINE_PROPS} />
      <line x1="160" y1="6" x2="160" y2="154" {...LINE_PROPS} />
      <circle cx="160" cy="80" r="26" {...LINE_PROPS} />
      <rect x="6" y="38" width="46" height="84" {...LINE_PROPS} />
      <rect x="6" y="60" width="18" height="40" {...LINE_PROPS} />
      <rect x="268" y="38" width="46" height="84" {...LINE_PROPS} />
      <rect x="296" y="60" width="18" height="40" {...LINE_PROPS} />
      <path d="M52 62a22 22 0 0 1 0 36" {...LINE_PROPS} />
      <path d="M268 62a22 22 0 0 0 0 36" {...LINE_PROPS} />
    </>
  );
}

function BasketballLines() {
  return (
    <>
      <rect x="6" y="6" width="308" height="148" {...LINE_PROPS} />
      <line x1="160" y1="6" x2="160" y2="154" {...LINE_PROPS} />
      <circle cx="160" cy="80" r="20" {...LINE_PROPS} />
      <rect x="6" y="54" width="62" height="52" {...LINE_PROPS} />
      <rect x="252" y="54" width="62" height="52" {...LINE_PROPS} />
      <path d="M6 18h28a62 62 0 0 1 0 124H6" {...LINE_PROPS} />
      <path d="M314 18h-28a62 62 0 0 0 0 124h28" {...LINE_PROPS} />
    </>
  );
}

function GenericLines() {
  return (
    <>
      <rect x="6" y="6" width="308" height="148" {...LINE_PROPS} />
      <line x1="160" y1="6" x2="160" y2="154" {...LINE_PROPS} />
      <line x1="6" y1="80" x2="314" y2="80" {...LINE_PROPS} />
    </>
  );
}

const DRAWINGS: Record<CourtKind, () => JSX.Element> = {
  soccer: SoccerLines,
  basketball: BasketballLines,
  other: GenericLines,
};

export function CourtLines({ kind, className }: CourtLinesProps) {
  const Drawing = DRAWINGS[kind];
  return (
    <svg viewBox="0 0 320 160" className={cx("court-lines", className)} aria-hidden="true">
      <Drawing />
    </svg>
  );
}
