"use client";

import styles from "./AlgorithmSteps.module.css";

const STEPS = [
  { n: "01", label: "Accumulate", sub: "paid / owes" },
  { n: "02", label: "Net balance", sub: "paid − owes" },
  { n: "03", label: "Partition", sub: "C vs D" },
  { n: "04", label: "Sort", sub: "rank by balance" },
  { n: "05", label: "Greedy", sub: "← your task", challenge: true },
];

interface AlgorithmStepsProps {
  done: boolean;
}

export function AlgorithmSteps({ done }: AlgorithmStepsProps) {
  return (
    <div
      className={`${styles.root} ${done ? styles.done : ""}`}
      aria-label="Algorithm steps"
    >
      {STEPS.map((s, i) => (
        <div key={s.n} className={styles.item}>
          <div
            className={`${styles.step} ${s.challenge ? styles.challenge : ""}`}
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className={styles.num}>{s.n}</span>
            <span className={styles.body}>
              <span className={styles.label}>{s.label}</span>
              <span className={styles.sub}>{s.sub}</span>
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <span className={styles.arrow} aria-hidden>
              ›
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
