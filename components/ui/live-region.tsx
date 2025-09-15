"use client";

import { useEffect, useRef } from "react";

interface LiveRegionProps {
  message: string;
  "aria-live"?: "polite" | "assertive";
  "aria-atomic"?: boolean;
  className?: string;
}

export function LiveRegion({
  message,
  "aria-live": ariaLive = "polite",
  "aria-atomic": ariaAtomic = true,
  className = "sr-only",
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (regionRef.current && message) {
      // Force screen reader to announce by clearing and setting content
      regionRef.current.textContent = "";
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message;
        }
      }, 100);
    }
  }, [message]);

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      className={className}
    />
  );
}
