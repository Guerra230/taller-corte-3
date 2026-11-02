import { Badge } from "@/components/ui/Badge";

export function AvailabilityBadge({ isAvailable }: { isAvailable: boolean | null }) {
  if (isAvailable === null) return null;
  return <Badge tone={isAvailable ? "success" : "danger"}>{isAvailable ? "Disponible" : "No disponible"}</Badge>;
}
