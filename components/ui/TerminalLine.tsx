"use client";

import { useEffect, useState } from "react";
import styles from "./TerminalLine.module.css";

interface TerminalLineProps {
  text: string;
  prefix?: string;
  delay?: number;
  speedMs?: number;
  showCursor?: boolean;
  onComplete?: () => void;
}

export function TerminalLine({
  text,
  prefix = "> ",
  delay = 0,
  speedMs = 22,
  showCursor = true,
  onComplete,
}: TerminalLineProps) {
  const [n, setN] = useState(0);
  const [started, setStarted] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (n >= text.length) {
      onComplete?.();
      return;
    }
    const id = setTimeout(() => setN((c) => c + 1), speedMs);
    return () => clearTimeout(id);
  }, [started, n, text.length, speedMs, onComplete]);

  const done = n >= text.length;

  return (
    <span className={styles.line}>
      <span className={styles.prefix}>{prefix}</span>
      {text.slice(0, n)}
      {showCursor && !done ? (
        <span className={styles.cursor} aria-hidden="true" />
      ) : null}
    </span>
  );
}
