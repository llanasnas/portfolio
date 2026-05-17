import {
  composeScore,
  efficiencyScore,
  manualBonus,
  timeScore,
} from "../scoring";
import type { ScoringConfig } from "../types";
import type { OptimizeResult, Transfer } from "./algorithm";

interface ScoreArgs {
  manualTransfers: Transfer[];
  manualMoves: number;
  optimalResult: OptimizeResult;
  initialTransferCount: number;
  timeMs: number;
  config: ScoringConfig;
}

export interface DebtScoreBreakdown {
  score: number;
  efficiency: number;
  time: number;
  manualBonus: number;
  effectiveTransferCount: number;
}

/**
 * Score = weighted blend of efficiency (vs greedy optimum), time, and manual effort.
 *
 * Efficiency rewards the user for the SMALLER of (manual attempt, greedy output).
 * If the user already matched the greedy optimum manually, they get the full bonus
 * AND a manual-bonus multiplier for trying.
 */
export function scoreDebtRun(args: ScoreArgs): DebtScoreBreakdown {
  const optimalCount = args.optimalResult.transfers.length;
  const manualCount = args.manualTransfers.length;

  // Use the actual manual count — more arrows than optimal = penalized score
  const efficiency = efficiencyScore(manualCount, optimalCount);
  const time = timeScore(args.timeMs, args.config);
  const mb = manualBonus(args.manualMoves, args.initialTransferCount);

  const score = composeScore({
    efficiency,
    time,
    manualBonus: mb,
    weights: args.config.weights,
  });

  return {
    score,
    efficiency: round3(efficiency),
    time: round3(time),
    manualBonus: round3(mb),
    effectiveTransferCount: manualCount,
  };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
