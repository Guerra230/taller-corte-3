export type PageSlot = number | "gap-start" | "gap-end";

export function buildPageSlots(current: number, totalPages: number, siblings = 1): PageSlot[] {
  const visibleCount = siblings * 2 + 5;
  if (totalPages <= visibleCount) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const left = Math.max(current - siblings, 2);
  const right = Math.min(current + siblings, totalPages - 1);
  const middle = Array.from({ length: right - left + 1 }, (_, index) => left + index);

  return [
    1,
    ...(left > 2 ? (["gap-start"] as const) : []),
    ...middle,
    ...(right < totalPages - 1 ? (["gap-end"] as const) : []),
    totalPages,
  ];
}

export function parsePositiveInt(raw: string | null, fallback: number): number {
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
