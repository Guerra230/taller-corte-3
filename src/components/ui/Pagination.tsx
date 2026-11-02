"use client";

import { cx } from "@/lib/cx";
import { buildPageSlots } from "@/lib/pagination";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isBusy?: boolean;
}

export function Pagination({ page, totalPages, onPageChange, isBusy = false }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Paginación">
      <button
        type="button"
        className="pagination__item"
        disabled={page <= 1 || isBusy}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </button>
      {buildPageSlots(page, totalPages).map((slot) =>
        typeof slot === "number" ? (
          <button
            key={slot}
            type="button"
            className={cx("pagination__item", slot === page && "pagination__item--current")}
            aria-current={slot === page ? "page" : undefined}
            aria-label={`Página ${slot}`}
            disabled={isBusy}
            onClick={() => onPageChange(slot)}
          >
            {slot}
          </button>
        ) : (
          <span key={slot} className="pagination__gap" aria-hidden="true">
            …
          </span>
        ),
      )}
      <button
        type="button"
        className="pagination__item"
        disabled={page >= totalPages || isBusy}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
      </button>
    </nav>
  );
}
