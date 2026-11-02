"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Sidebar, SidebarSection } from "@/components/layout/Sidebar";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListItem } from "@/components/ui/ListItem";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { CourtCard } from "@/features/courts/CourtCard";
import { CourtDetailModal } from "@/features/courts/CourtDetailModal";
import { useActivityLog } from "@/hooks/useActivityLog";
import { usePaginatedResource } from "@/hooks/usePaginatedResource";
import { useSavedCourts } from "@/hooks/useSavedCourts";
import { formatTime } from "@/lib/format";
import { parsePositiveInt } from "@/lib/pagination";
import { fetchCourts } from "@/services/courts.service";
import type { Court } from "@/types/court";

const PAGE_SIZE = 9;

export function CourtFeed() {
  const router = useRouter();
  const pathname = usePathname();
  const page = parsePositiveInt(useSearchParams().get("page"), 1);

  const { data, error, isFetching, reload } = usePaginatedResource(fetchCourts, { page, limit: PAGE_SIZE });
  const { saved, toggle } = useSavedCourts();
  const { entries, record } = useActivityLog();
  const [selected, setSelected] = useState<Court | null>(null);

  const goToPage = useCallback(
    (target: number, mode: "push" | "replace" = "push") => {
      router[mode](`${pathname}?page=${target}`);
    },
    [router, pathname],
  );

  const totalPages = data?.meta.totalPages ?? 0;

  useEffect(() => {
    if (!isFetching && totalPages > 0 && page > totalPages) goToPage(totalPages, "replace");
  }, [isFetching, page, totalPages, goToPage]);

  const openCourt = (court: Court) => {
    setSelected(court);
    record(`Abriste ${court.name}`);
  };

  const toggleSaved = (court: Court) => {
    record(`${saved.has(court.id) ? "Quitaste" : "Guardaste"} ${court.name}`);
    toggle(court.id);
  };

  const retryButton = (
    <Button size="sm" variant="outline" onClick={reload}>
      Reintentar
    </Button>
  );

  return (
    <div className="feed">
      <section className="feed__main" aria-busy={isFetching}>
        <header className="feed__header">
          <h1 className="page-title">Canchas</h1>
          {data && <p className="feed__count">{data.meta.total} en total</p>}
        </header>

        {error && (
          <Alert tone="danger" action={retryButton}>
            {error.message}
          </Alert>
        )}

        {!data && isFetching && (
          <div className="feed__grid">
            {Array.from({ length: PAGE_SIZE }, (_, index) => (
              <Skeleton key={index} className="skeleton--card" />
            ))}
          </div>
        )}

        {data && data.items.length === 0 && !isFetching && (
          <EmptyState
            title="Todavía no hay canchas"
            description="Cuando un administrador registre una cancha, aparecerá aquí."
            action={retryButton}
          />
        )}

        {data && data.items.length > 0 && (
          <div className={isFetching ? "feed__grid feed__grid--stale" : "feed__grid"}>
            {data.items.map((court) => (
              <CourtCard
                key={court.id}
                court={court}
                isSaved={saved.has(court.id)}
                onOpen={openCourt}
                onToggleSaved={toggleSaved}
              />
            ))}
          </div>
        )}

        {data && (
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={goToPage} isBusy={isFetching} />
        )}
      </section>

      <Sidebar label="Tu actividad">
        <SidebarSection title="Guardadas">
          <p className="sidebar__stat">{saved.size}</p>
        </SidebarSection>
        <SidebarSection title="Actividad reciente">
          {entries.length === 0 ? (
            <p className="sidebar__hint">Abre o guarda una cancha para verla aquí.</p>
          ) : (
            <ul className="list">
              {entries.map((entry) => (
                <ListItem key={entry.id} title={entry.message} meta={formatTime(entry.at)} />
              ))}
            </ul>
          )}
        </SidebarSection>
      </Sidebar>

      <CourtDetailModal
        court={selected}
        isSaved={selected ? saved.has(selected.id) : false}
        onClose={() => setSelected(null)}
        onToggleSaved={toggleSaved}
      />
    </div>
  );
}
