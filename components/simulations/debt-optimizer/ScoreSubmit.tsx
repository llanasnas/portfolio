"use client";

import { useEffect, useRef, useState } from "react";
import { GlowButton } from "@/components/ui/GlowButton";
import { HoloPanel } from "@/components/ui/HoloPanel";
import type {
  LeaderboardResponse,
  RunStats,
  SubmitScoreError,
  SubmitScoreResponse,
} from "@/lib/simulations/types";
import type { DebtScoreBreakdown } from "@/lib/simulations/debt-optimizer/scoring";
import styles from "./ScoreSubmit.module.css";

const NICK_RE = /^[A-Z0-9_]{3,16}$/;
const STORAGE_KEY = "gl.sim.nickname";

interface ScoreSubmitProps {
  slug: string;
  seed: number;
  breakdown: DebtScoreBreakdown;
  stats: RunStats;
  onClose: () => void;
  onSubmitted: () => void;
}

export function ScoreSubmit({
  slug,
  seed,
  breakdown,
  stats,
  onClose,
  onSubmitted,
}: ScoreSubmitProps) {
  const [nick, setNick] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse["entries"] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setNick(saved);
    } catch {}
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async () => {
    const value = nick.trim().toUpperCase();
    if (!NICK_RE.test(value)) {
      setError("3–16 chars · A-Z, 0-9, _ only");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug,
          nickname: value,
          score: breakdown.score,
          stats,
          seed,
        }),
      });
      const json = (await res.json()) as
        | SubmitScoreResponse
        | SubmitScoreError;
      if (!res.ok || !("ok" in json) || !json.ok) {
        const err = json as SubmitScoreError;
        setError(translateError(err));
        setSubmitting(false);
        return;
      }
      try {
        window.localStorage.setItem(STORAGE_KEY, value);
      } catch {}
      setSubmittedRank(json.rank);
      onSubmitted();
      // Fetch leaderboard to show after submit
      try {
        const limit = Math.max(5, json.rank);
        const lbRes = await fetch(`/api/leaderboard?slug=${slug}&limit=${limit}`);
        const lbData = (await lbRes.json()) as LeaderboardResponse;
        setLeaderboard(lbData.entries);
      } catch {
        /* leaderboard stays null — handled gracefully */
      }
    } catch {
      setError("Network failure · retry");
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <HoloPanel variant="rare" cornerTicks className={styles.modal}>
        {submittedRank !== null ? (
          /* ── Success: rank reveal + leaderboard ─────── */
          <>
            <span className={styles.eyebrow}>{"// entry_committed"}</span>

            <div className={styles.rankReveal}>
              <span className={styles.rankTag}>rank achieved</span>
              <span className={styles.rankBadge}>
                #{String(submittedRank).padStart(2, "0")}
              </span>
            </div>

            <div className={styles.lbContainer}>
              <p className={styles.lbTitle}>{"// top operators"}</p>
              {leaderboard === null ? (
                <div className={styles.lbLoading}>loading…</div>
              ) : (
                <div className={styles.lbRows}>
                  {leaderboard.slice(0, 5).map((entry, i) => {
                    const isSelf =
                      entry.nickname === nick.trim().toUpperCase();
                    return (
                      <div
                        key={entry.rank}
                        className={`${styles.lbRow}${isSelf ? ` ${styles.lbRowSelf}` : ""}`}
                        style={{ animationDelay: `${i * 70 + 200}ms` }}
                      >
                        <span className={styles.lbRank}>
                          #{String(entry.rank).padStart(2, "0")}
                        </span>
                        <span className={styles.lbNick}>{entry.nickname}</span>
                        <span className={styles.lbScore}>
                          {entry.score.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                  {submittedRank > 5 &&
                    !leaderboard
                      .slice(0, 5)
                      .some(
                        (e) => e.nickname === nick.trim().toUpperCase(),
                      ) && (
                      <>
                        <div className={styles.lbDivider}>{"···"}</div>
                        <div
                          className={`${styles.lbRow} ${styles.lbRowSelf}`}
                          style={{ animationDelay: "620ms" }}
                        >
                          <span className={styles.lbRank}>
                            #{String(submittedRank).padStart(2, "0")}
                          </span>
                          <span className={styles.lbNick}>
                            {nick.trim().toUpperCase()}
                          </span>
                          <span className={styles.lbScore}>
                            {breakdown.score.toFixed(1)}
                          </span>
                        </div>
                      </>
                    )}
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <GlowButton variant="primary" onClick={onClose}>
                Close
              </GlowButton>
            </div>
          </>
        ) : (
          /* ── Form state ───────────────────────────────── */
          <>
            <span className={styles.eyebrow}>{"// run_complete"}</span>
            <h2 className={styles.title}>Submit Score</h2>

            <div className={styles.scoreRow}>
              <div className={styles.scoreTile}>
                <span className={styles.scoreLabel}>Score</span>
                <span className={`${styles.scoreValue} ${styles.scoreHero}`}>
                  {breakdown.score.toFixed(1)}
                </span>
              </div>
              <div className={styles.scoreTile}>
                <span className={styles.scoreLabel}>Time</span>
                <span className={styles.scoreValue}>
                  {(stats.timeMs / 1000).toFixed(1)}s
                </span>
              </div>
              <div className={styles.scoreTile}>
                <span className={styles.scoreLabel}>Transfers</span>
                <span className={styles.scoreValue}>
                  {stats.transfersBefore} → {stats.transfersAfter}
                </span>
              </div>
              <div className={styles.scoreTile}>
                <span className={styles.scoreLabel}>Efficiency</span>
                <span className={styles.scoreValue}>
                  {(stats.efficiency * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div>
              <label className={styles.fieldLabel} htmlFor="sim-nickname">
                Operator Handle
              </label>
              <input
                id="sim-nickname"
                ref={inputRef}
                className={styles.input}
                value={nick}
                maxLength={16}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) =>
                  setNick(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                placeholder="NEURAL_GHOST"
              />
              {error ? (
                <div className={styles.error}>{error}</div>
              ) : (
                <div className={styles.hint}>3–16 · uppercase, digits, underscore</div>
              )}
            </div>

            <div className={styles.actions}>
              <GlowButton variant="ghost" onClick={onClose} disabled={submitting}>
                Skip
              </GlowButton>
              <GlowButton
                variant="primary"
                onClick={submit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit →"}
              </GlowButton>
            </div>
          </>
        )}
      </HoloPanel>
    </div>
  );
}

function translateError(err: SubmitScoreError): string {
  switch (err.error) {
    case "INVALID_NICKNAME":
      return "Invalid handle · A-Z, 0-9, _ · 3–16 chars";
    case "INVALID_PAYLOAD":
      return "Malformed submission";
    case "INVALID_SLUG":
      return "Unknown protocol";
    case "PROFANITY":
      return "Handle rejected · pick another";
    case "RATE_LIMITED":
      return `Rate limited · retry in ${err.retryAfter ?? 60}s`;
    case "INTERNAL":
    default:
      return "Server error · retry";
  }
}
