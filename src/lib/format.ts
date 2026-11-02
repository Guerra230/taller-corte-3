const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const timeFormatter = new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit" });

export function formatCop(value: number): string {
  return copFormatter.format(value);
}

export function formatTime(timestamp: number): string {
  return timeFormatter.format(timestamp);
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
