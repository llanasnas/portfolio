"use client";

import { type CSSProperties } from "react";

interface TunnelGridProps {
  mPos: number;
}

const RING_COUNT = 14;
const GAP = 1100;
const PASS_HIDE_Z = 1300; // hide beyond this (safe below perspective)
const PASS_FADE_FROM = 500; // fade between fade-from and hide

const RING_COLORS = [
  "#5ad7ff", // cyan
  "#ff2dcf", // magenta
  "#b5ff5a", // lime
  "#b87bff", // violet
  "#ffb35a", // amber
  "#5af7c5", // teal
  "#ff5a8a", // pink
];

function ringStyle(i: number, mPos: number): CSSProperties {
  const z = mPos * GAP - (i + 2) * GAP;
  const color = RING_COLORS[i % RING_COLORS.length];

  if (z >= PASS_HIDE_Z) {
    // Past camera — park far back at unique Z (avoid layer overlap + recreation)
    return {
      "--ring-color": color,
      transform: `translate3d(-50%, -50%, ${-40000 - i * 200}px)`,
      opacity: 0,
    } as CSSProperties;
  }

  let opacity = 1;
  if (z > PASS_FADE_FROM) {
    opacity = (PASS_HIDE_Z - z) / (PASS_HIDE_Z - PASS_FADE_FROM);
  }

  return {
    "--ring-color": color,
    transform: `translate3d(-50%, -50%, ${z}px)`,
    opacity,
  } as CSSProperties;
}

export function TunnelGrid({ mPos }: TunnelGridProps) {
  return (
    <div className="tunnel-grid" aria-hidden="true">
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <div key={i} className="cv-ring" style={ringStyle(i, mPos)}>
          <div className="cv-ring__c cv-ring__c--1" />
          <div className="cv-ring__c cv-ring__c--2" />
        </div>
      ))}
      <div className="tunnel-grid__vignette" />
    </div>
  );
}
