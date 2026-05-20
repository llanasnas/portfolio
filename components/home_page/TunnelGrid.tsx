"use client";

import { useEffect, useState, type CSSProperties } from "react";

const RING_COUNT_DESKTOP = 11;
// 5 rings × 2 concentric children = 10 composited layers on mobile;
// 4 rings = 8 layers, ~20% less compositor work without losing depth read.
const RING_COUNT_MOBILE = 4;

// Cohesive cyberpunk palette — violets + blues + yellow + red accents.
// No greens, no oranges (user-requested).
const RING_COLORS = [
  "#5ad7ff", // cyan
  "#b87bff", // violet
  "#ff4d5e", // red
  "#6aa6ff", // blue
  "#fbbf24", // yellow
  "#a48bff", // soft violet
  "#ff2d4d", // deep red
  "#8b7bff", // indigo
];

/**
 * Presentational tunnel rings. Z-translation + opacity along scroll are
 * driven by the master GSAP timeline mounted in HomeClient (which targets
 * `[data-tunnel-ring]` inside `.tunnel-grid`). This component renders the
 * static DOM + per-ring color only; no per-frame React updates.
 */
export function TunnelGrid() {
  const [ringCount, setRingCount] = useState(RING_COUNT_DESKTOP);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px), (pointer: coarse)");
    const apply = (matches: boolean) =>
      setRingCount(matches ? RING_COUNT_MOBILE : RING_COUNT_DESKTOP);
    apply(mq.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="tunnel-grid" aria-hidden="true">
      {Array.from({ length: ringCount }).map((_, i) => (
        <div
          key={i}
          className="cv-ring"
          data-tunnel-ring={i}
          style={
            {
              "--ring-color": RING_COLORS[i % RING_COLORS.length],
            } as CSSProperties
          }
        >
          <div className="cv-ring__c cv-ring__c--1" />
          <div className="cv-ring__c cv-ring__c--2" />
        </div>
      ))}
      <div className="tunnel-grid__vignette" />
    </div>
  );
}
