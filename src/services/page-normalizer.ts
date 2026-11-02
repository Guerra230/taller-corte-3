import { ApiError } from "@/services/api-error";
import { firstNumber, firstValue, isRecord } from "@/lib/records";
import type { Page, PageRequest } from "@/types/api";

const ITEM_FIELDS = ["items", "data", "results", "content", "rows"] as const;
const TOTAL_FIELDS = ["total", "totalItems", "count", "totalElements"] as const;
const LIMIT_FIELDS = ["limit", "perPage", "itemsPerPage", "pageSize", "take"] as const;
const PAGES_FIELDS = ["totalPages", "lastPage", "pageCount"] as const;

function buildMeta(request: PageRequest, total: number, limit: number, totalPages?: number | null) {
  return {
    page: request.page,
    limit,
    total,
    totalPages: totalPages ?? Math.max(Math.ceil(total / limit), 1),
  };
}

export function normalizePage<TItem>(
  payload: unknown,
  request: PageRequest,
  mapItem: (raw: unknown) => TItem,
): Page<TItem> {
  if (Array.isArray(payload)) {
    const start = (request.page - 1) * request.limit;
    return {
      items: payload.slice(start, start + request.limit).map(mapItem),
      meta: buildMeta(request, payload.length, request.limit),
    };
  }

  if (!isRecord(payload)) throw new ApiError("contract");

  const rawItems = firstValue(payload, ITEM_FIELDS);
  if (!Array.isArray(rawItems)) throw new ApiError("contract");

  const metaSource = isRecord(payload.meta) ? { ...payload, ...payload.meta } : payload;
  const limit = firstNumber(metaSource, LIMIT_FIELDS) ?? request.limit;
  const total = firstNumber(metaSource, TOTAL_FIELDS) ?? rawItems.length;

  return {
    items: rawItems.map(mapItem),
    meta: buildMeta(request, total, limit, firstNumber(metaSource, PAGES_FIELDS)),
  };
}
