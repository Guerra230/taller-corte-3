"use client";

import { useCallback, useState } from "react";
import type { ActivityEntry } from "@/types/court";

const MAX_ENTRIES = 6;

export function useActivityLog() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);

  const record = useCallback((message: string) => {
    const at = Date.now();
    setEntries((current) => [{ id: `${at}-${current.length}`, message, at }, ...current].slice(0, MAX_ENTRIES));
  }, []);

  return { entries, record };
}
