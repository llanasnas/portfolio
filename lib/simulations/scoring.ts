import type { ScoringConfig } from "./types";

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function normalize(value: number, min: number, max: number): number {
  if (max === min) return 1;
  return clamp((value - min) / (max - min), 0, 1);
}

export function timeScore(timeMs: number, config: ScoringConfig): number {
  if (timeMs <= config.timeFloorMs) return 1;
  if (timeMs >= config.timeCeilingMs) return 0;
  const range = config.timeCeilingMs - config.timeFloorMs;
  return 1 - (timeMs - config.timeFloorMs) / range;
}

export function efficiencyScore(
  manualCount: number,
  optimalCount: number,
  initialCount: number,
): number {
  // Achieved optimal or better — max score
  if (manualCount <= optimalCount) return 1;
  // Initial was already optimal — no room to improve
  if (initialCount <= optimalCount) return 1;
  // Fraction of possible improvement the user achieved
  // 0 if unchanged, 1 if reached optimal, clamped for worse-than-start
  const maxImprovement = initialCount - optimalCount;
  const achieved = initialCount - manualCount;
  return clamp(achieved / maxImprovement, 0, 1);
}

export function manualBonus(
  manualMoves: number,
  initialTransferCount: number,
): number {
  if (initialTransferCount <= 0) return 0;
  const cappedMoves = Math.min(manualMoves, initialTransferCount * 2);
  return clamp(cappedMoves / (initialTransferCount * 2), 0, 1);
}

export function composeScore(args: {
  efficiency: number;
  time: number;
  manualBonus: number;
  weights: ScoringConfig["weights"];
}): number {
  const { efficiency, time, manualBonus: mb, weights } = args;
  const raw =
    efficiency * weights.efficiency +
    time * weights.time +
    mb * weights.manualBonus;
  return Math.round(raw * 1000) / 10;
}
