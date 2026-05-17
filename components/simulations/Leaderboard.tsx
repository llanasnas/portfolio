"use client";

import { useCallback, useEffect, useState } from "react";
import type { LeaderboardResponse } from "@/lib/simulations/types";
import styles from "./Leaderboard.module.css";

interface LeaderboardProps {
  slug: string;
  limit?: number;
  refreshKey?: number;
}

type Entry = LeaderboardResponse["entries"][number];

export function Leaderboard({ slug, limit = 10, refreshKey = 0 }: LeaderboardProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(0);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/leaderboard?slug=${encodeURIComponent(slug)}&limit=${limit}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        setError("// link down · retry");
        setEntries([]);
        return;
      }
      const json = (await res.json()) as LeaderboardResponse;
      setEntries(json.entries ?? []);
      setLastRefresh(Date.now());
    } catch {
      setError("// link down · retry");
    } finally {
      setLoading(false);
    }
  }, [slug, limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchEntries();
  }, [fetchEntries, refreshKey]);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h3 className={styles.title}>{"// rank.protocol"}</h3>
        <span className={styles.subtitle}>
          top {limit} · {entries.length} on record
        </span>
      </div>

      {error ? (
        <div className={styles.error}>{error}</div>
      ) : loading && entries.length === 0 ? (
        <div className={styles.empty}>&gt; querying remote shard...</div>
      ) : entries.length === 0 ? (
        <div className={styles.empty}>
          &gt; no entries · be the first operator
        </div>
      ) : (
        <div className={styles.list}>
          {entries.map((e) => (
            <div
              key={`${e.rank}-${e.nickname}-${e.createdAt}`}
              className={[
                styles.row,
                e.rank <= 3 ? styles.rowTop : "",
                Date.parse(e.createdAt) > lastRefresh - 60_000
                  ? styles.rowFresh
                  : "",
              ].join(" ")}
            >
              <span className={styles.rank}>
                #{String(e.rank).padStart(2, "0")}
              </span>
              <span className={styles.nick}>{e.nickname}</span>
              <span className={styles.score}>{e.score.toFixed(1)}</span>
              <span className={styles.time}>
                {(e.stats.timeMs / 1000).toFixed(1)}s ·{" "}
                {e.stats.transfersAfter}↓
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
