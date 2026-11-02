"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "reservas.saved-courts";

function readSaved(): Set<string> {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return new Set();
  }
}

export function useSavedCourts() {
  const [saved, setSaved] = useState<ReadonlySet<string>>(readSaved);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...saved]));
    } catch {
      return;
    }
  }, [saved]);

  const toggle = useCallback((id: string) => {
    setSaved((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  return { saved, toggle };
}
