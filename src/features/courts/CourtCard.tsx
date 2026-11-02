import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { AvailabilityBadge } from "@/features/courts/AvailabilityBadge";
import { KIND_LABEL, KIND_TONE, priceLabel } from "@/features/courts/court-labels";
import { CourtLines } from "@/features/courts/CourtLines";
import type { Court } from "@/types/court";

export interface CourtCardProps {
  court: Court;
  isSaved: boolean;
  onOpen: (court: Court) => void;
  onToggleSaved: (court: Court) => void;
}

export function CourtCard({ court, isSaved, onOpen, onToggleSaved }: CourtCardProps) {
  const price = priceLabel(court);

  return (
    <Card className={`court-card court-card--${court.kind}`}>
      <div className="court-card__surface">
        <CourtLines kind={court.kind} />
      </div>
      <CardHeader title={court.name} subtitle={court.location} aside={<AvailabilityBadge isAvailable={court.isAvailable} />} />
      <CardBody className="court-card__body">
        <div className="court-card__facts">
          <Badge tone={KIND_TONE[court.kind]}>{KIND_LABEL[court.kind]}</Badge>
          {price && <span className="court-card__price">{price}</span>}
        </div>
        <div className="court-card__actions">
          <Button size="sm" variant="secondary" onClick={() => onOpen(court)}>
            Ver detalles
          </Button>
          <Button size="sm" variant="outline" aria-pressed={isSaved} onClick={() => onToggleSaved(court)}>
            {isSaved ? "Guardada" : "Guardar"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
