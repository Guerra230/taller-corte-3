import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AvailabilityBadge } from "@/features/courts/AvailabilityBadge";
import { KIND_LABEL, priceLabel } from "@/features/courts/court-labels";
import type { Court } from "@/types/court";

export interface CourtDetailModalProps {
  court: Court | null;
  isSaved: boolean;
  onClose: () => void;
  onToggleSaved: (court: Court) => void;
}

export function CourtDetailModal({ court, isSaved, onClose, onToggleSaved }: CourtDetailModalProps) {
  const facts: Array<[string, string | null]> = court
    ? [
        ["Tipo", KIND_LABEL[court.kind]],
        ["Ubicación", court.location],
        ["Precio", priceLabel(court)],
        ["Capacidad", court.capacity === null ? null : `${court.capacity} jugadores`],
      ]
    : [];

  return (
    <Modal
      isOpen={court !== null}
      title={court?.name ?? "Detalle de cancha"}
      onClose={onClose}
      footer={
        court && (
          <Button variant="outline" aria-pressed={isSaved} onClick={() => onToggleSaved(court)}>
            {isSaved ? "Quitar de guardadas" : "Guardar cancha"}
          </Button>
        )
      }
    >
      {court && (
        <>
          <AvailabilityBadge isAvailable={court.isAvailable} />
          {court.description && <p>{court.description}</p>}
          <dl className="facts">
            {facts.map(
              ([label, value]) =>
                value && (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ),
            )}
          </dl>
        </>
      )}
    </Modal>
  );
}
