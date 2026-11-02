import { api } from "@/services/api";
import { ApiError } from "@/services/api-error";
import { ENDPOINTS } from "@/services/endpoints";
import { normalizePage } from "@/services/page-normalizer";
import { firstNumber, firstString, firstValue, isRecord } from "@/lib/records";
import type { Page, PageRequest } from "@/types/api";
import type { Court, CourtKind } from "@/types/court";

const AVAILABLE_WORDS = new Set(["available", "disponible", "active", "activa", "activo", "libre"]);

function kindFrom(raw: string | null): CourtKind {
  const value = raw?.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase() ?? "";
  if (/futbol|soccer|football|sintetica/.test(value)) return "soccer";
  if (/basket|baloncesto/.test(value)) return "basketball";
  return "other";
}

function availabilityFrom(source: Record<string, unknown>): boolean | null {
  const value = firstValue(source, ["isAvailable", "available", "disponible", "isActive", "activa", "status", "estado"]);
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return AVAILABLE_WORDS.has(value.toLowerCase());
  return null;
}

function toCourt(raw: unknown): Court {
  if (!isRecord(raw)) throw new ApiError("contract");
  const id = firstString(raw, ["id", "uuid", "_id"]);
  if (!id) throw new ApiError("contract");
  const name = firstString(raw, ["name", "nombre", "title", "titulo"]);
  const kindSource = firstString(raw, ["type", "tipo", "sport", "deporte", "kind"]);

  return {
    id,
    name: name ?? `Cancha ${id}`,
    kind: kindFrom(kindSource ?? name),
    location: firstString(raw, ["location", "ubicacion", "address", "direccion", "sede"]),
    description: firstString(raw, ["description", "descripcion", "details"]),
    pricePerHour: firstNumber(raw, ["pricePerHour", "price", "precio", "precioHora", "precioPorHora", "hourlyRate"]),
    capacity: firstNumber(raw, ["capacity", "capacidad", "players", "jugadores"]),
    isAvailable: availabilityFrom(raw),
  };
}

export async function fetchCourts(request: PageRequest, signal: AbortSignal): Promise<Page<Court>> {
  const payload = await api.request<unknown>(ENDPOINTS.courts, {
    query: { page: request.page, limit: request.limit },
    signal,
  });
  return normalizePage(payload, request, toCourt);
}
