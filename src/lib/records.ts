import type { UnknownRecord } from "@/types/api";

export function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function firstValue(source: UnknownRecord, keys: readonly string[]): unknown {
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

export function firstString(source: UnknownRecord, keys: readonly string[]): string | null {
  const value = firstValue(source, keys);
  if (typeof value === "number") return String(value);
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

export function firstNumber(source: UnknownRecord, keys: readonly string[]): number | null {
  const value = firstValue(source, keys);
  const parsed = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : null;
}
