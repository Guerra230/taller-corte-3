"use client";

import { useEffect, useRef, type RefObject } from "react";

export function useDismissable<TElement extends HTMLElement>(
  isActive: boolean,
  onDismiss: () => void,
): RefObject<TElement | null> {
  const containerRef = useRef<TElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) onDismiss();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isActive, onDismiss]);

  return containerRef;
}
