"use client";

import { computeLevel } from "@/lib/progression-system";

interface XPFillProps {
  xp: number;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function XPFill({ xp }: XPFillProps) {
  const { current, next } = computeLevel(xp);
  const min = current.xpRequired;
  const max = next ? next.xpRequired : current.xpRequired;
  const pct = next ? clamp((xp - min) / (max - min), 0, 1) : 1;

  return <div className="xpbar-fill" style={{ width: `${pct * 100}%` }} />;
}
