"use client";

import { useEffect, useRef } from "react";
import type { OptimizeResult } from "@/lib/simulations/debt-optimizer";
import styles from "./PhaseTimeline.module.css";

const PHASE_LABELS: { label: string; subtitle: string }[] = [
  { label: "Accumulation", subtitle: "indexing expense events" },
  { label: "Net Balance", subtitle: "paid − owes per node" },
  { label: "Settlements", subtitle: "apply prior payments" },
  { label: "Sorting", subtitle: "rank creditors / debtors" },
  { label: "Greedy Minimization", subtitle: "minimize transfer count" },
];

interface PhaseTimelineProps {
  result: OptimizeResult | null;
  currentPhaseIndex: number;
}

export function PhaseTimeline({
  result,
  currentPhaseIndex,
}: PhaseTimelineProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const logs = result
    ? result.phases.slice(0, currentPhaseIndex + 1).flatMap((p) => p.log)
    : [];

  useEffect(() => {
    if (!logRef.current) return;
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs.length]);

  return (
    <div className={styles.root}>
      <h3 className={styles.title}>{"// protocol phases"}</h3>

      <div className={styles.stepper}>
        {PHASE_LABELS.map((p, i) => {
          const active = i === currentPhaseIndex;
          const done = result && i < currentPhaseIndex;
          const status = !result
            ? "pending"
            : done
              ? "complete"
              : active
                ? "executing"
                : "queued";
          return (
            <div
              key={p.label}
              className={[
                styles.step,
                active ? styles.stepActive : "",
                done ? styles.stepDone : "",
              ].join(" ")}
            >
              <span className={styles.stepIdx}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={styles.stepBody}>
                <span className={styles.stepLabel}>{p.label}</span>
                <span className={styles.stepStatus}>
                  {p.subtitle} · {status}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <div className={styles.logPanel} ref={logRef} aria-live="polite">
        {logs.length === 0 ? (
          <span className={styles.logEmpty}>
            &gt; awaiting protocol execution...
          </span>
        ) : (
          logs.map((line, i) => (
            <span key={i} className={styles.logLine}>
              {line}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
