"use client";

import { GlowButton } from "@/components/ui/GlowButton";
import styles from "./RunControls.module.css";

interface RunControlsProps {
  seed: number;
  expenseCount: number;
  initialCount: number;
  manualCount: number;
  manualMoves: number;
  optimalCount: number | null;
  canRun: boolean;
  isComplete: boolean;
  onRun: () => void;
  onReset: () => void;
}

export function RunControls({
  seed,
  expenseCount,
  initialCount,
  manualCount,
  manualMoves,
  optimalCount,
  canRun,
  isComplete,
  onRun,
  onReset,
}: RunControlsProps) {
  return (
    <div className={styles.root}>
      <div className={styles.stats}>
        <div className={styles.statTile}>
          <span className={styles.statLabel}>Expenses</span>
          <span className={styles.statValue}>{expenseCount}</span>
        </div>
        <div className={styles.statTile}>
          <span className={styles.statLabel}>Raw arrows</span>
          <span className={styles.statValue}>{initialCount}</span>
        </div>
        <div className={styles.statTile}>
          <span className={styles.statLabel}>Current</span>
          <span className={styles.statValue}>{manualCount}</span>
        </div>
        <div className={styles.statTile}>
          <span className={styles.statLabel}>Moves</span>
          <span className={styles.statValue}>{manualMoves}</span>
        </div>
        <div className={styles.statTile}>
          <span className={styles.statLabel}>Optimum</span>
          <span
            className={`${styles.statValue} ${optimalCount !== null ? styles.statValueWin : ""}`}
          >
            {optimalCount !== null ? optimalCount : "—"}
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <GlowButton
          variant="primary"
          size="lg"
          onClick={onRun}
          disabled={!canRun}
        >
          ▶ Execute Greedy Protocol
        </GlowButton>
        <GlowButton variant="ghost" onClick={onReset}>
          {isComplete ? "↻ New Run" : "↻ Reset"}
        </GlowButton>
        <span className={styles.seedBadge}>
          SEED
          <strong>{seed.toString(16).toUpperCase().padStart(4, "0")}</strong>
        </span>
      </div>
    </div>
  );
}
