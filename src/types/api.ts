export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Page<TItem> {
  items: TItem[];
  meta: PageMeta;
}

export interface PageRequest {
  page: number;
  limit: number;
}

export type UnknownRecord = Record<string, unknown>;
