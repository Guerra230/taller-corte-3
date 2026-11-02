import { formatCop } from "@/lib/format";
import type { BadgeTone } from "@/components/ui/Badge";
import type { Court, CourtKind } from "@/types/court";

export const KIND_LABEL: Record<CourtKind, string> = {
  soccer: "Fútbol sintético",
  basketball: "Baloncesto",
  other: "Cancha",
};

export const KIND_TONE: Record<CourtKind, BadgeTone> = {
  soccer: "pitch",
  basketball: "hardwood",
  other: "neutral",
};

export function priceLabel(court: Court): string | null {
  return court.pricePerHour === null ? null : `${formatCop(court.pricePerHour)} por hora`;
}
