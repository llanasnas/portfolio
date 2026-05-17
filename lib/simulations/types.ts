import type { ComponentType } from "react";

export type SimulationStatus = "active" | "locked";

export interface ScoringConfig {
  weights: { efficiency: number; time: number; manualBonus: number };
  timeFloorMs: number;
  timeCeilingMs: number;
}

export interface SimulationManifest {
  slug: string;
  codename: string;
  title: string;
  index: string;
  status: SimulationStatus;
  classification: string;
  shortDescription: string;
  longDescription: string;
  estimatedDuration: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  scoring: ScoringConfig;
  load?: () => Promise<{ default: ComponentType }>;
}

export interface RunStats {
  timeMs: number;
  transfersBefore: number;
  transfersAfter: number;
  manualMoves: number;
  efficiency: number;
}

export interface RunResult {
  simulationSlug: string;
  score: number;
  seed: number;
  stats: RunStats;
}

export interface ScoreEntry {
  _id?: string;
  simulationSlug: string;
  nickname: string;
  score: number;
  stats: RunStats;
  seed: number;
  createdAt: string;
}

export interface LeaderboardResponse {
  slug: string;
  entries: Array<{
    rank: number;
    nickname: string;
    score: number;
    stats: RunStats;
    createdAt: string;
  }>;
  total: number;
}

export interface SubmitScoreResponse {
  ok: true;
  entry: ScoreEntry;
  rank: number;
}

export interface SubmitScoreError {
  ok: false;
  error:
    | "INVALID_PAYLOAD"
    | "INVALID_NICKNAME"
    | "INVALID_SLUG"
    | "PROFANITY"
    | "RATE_LIMITED"
    | "INTERNAL";
  retryAfter?: number;
}
