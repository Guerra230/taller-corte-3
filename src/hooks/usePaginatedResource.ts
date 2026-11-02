"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { ApiError } from "@/services/api-error";
import type { Page, PageRequest } from "@/types/api";

export type PageFetcher<TItem> = (request: PageRequest, signal: AbortSignal) => Promise<Page<TItem>>;

interface ResourceState<TItem> {
  data: Page<TItem> | null;
  error: ApiError | null;
  isFetching: boolean;
}

type ResourceAction<TItem> =
  | { type: "start" }
  | { type: "success"; data: Page<TItem> }
  | { type: "failure"; error: ApiError };

function reducer<TItem>(state: ResourceState<TItem>, action: ResourceAction<TItem>): ResourceState<TItem> {
  switch (action.type) {
    case "start":
      return { ...state, isFetching: true, error: null };
    case "success":
      return { data: action.data, error: null, isFetching: false };
    case "failure":
      return { ...state, error: action.error, isFetching: false };
  }
}

export function usePaginatedResource<TItem>(fetcher: PageFetcher<TItem>, { page, limit }: PageRequest) {
  const [state, dispatch] = useReducer(reducer<TItem>, { data: null, error: null, isFetching: true });
  const [version, setVersion] = useState(0);
  const cache = useRef(new Map<string, Page<TItem>>());

  useEffect(() => {
    const key = `${page}:${limit}`;
    const cached = cache.current.get(key);
    if (cached) {
      dispatch({ type: "success", data: cached });
      return;
    }

    const controller = new AbortController();
    dispatch({ type: "start" });

    fetcher({ page, limit }, controller.signal)
      .then((data) => {
        cache.current.set(key, data);
        dispatch({ type: "success", data });
      })
      .catch((cause: unknown) => {
        const error = cause instanceof ApiError ? cause : new ApiError("contract");
        if (error.code !== "aborted") dispatch({ type: "failure", error });
      });

    return () => controller.abort();
  }, [fetcher, page, limit, version]);

  const reload = useCallback(() => {
    cache.current.clear();
    setVersion((current) => current + 1);
  }, []);

  return { ...state, reload };
}
