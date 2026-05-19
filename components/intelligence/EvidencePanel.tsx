"use client";

import { HoloPanel } from "@/components/ui/HoloPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import type { ProfileDataset } from "@/lib/intelligence/types";
import styles from "./EvidencePanel.module.css";

interface Props {
  profile: ProfileDataset;
  selectedKey: string;
  onClose: () => void;
  onAsk: (q: string) => void;
}

export function EvidencePanel({ profile, selectedKey, onClose, onAsk }: Props) {
  const [kind, name] = selectedKey.split(":");

  if (kind === "skill") {
    const s = profile.skills.find((sk) => sk.name === name);
    if (!s) return null;
    return (
      <HoloPanel variant="rare" className={styles.panel}>
        <div className={styles.header}>
          <div>
            <div className={styles.kind}>// SIGNAL · SKILL</div>
            <h3 className={styles.title}>{s.name}</h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            close
          </button>
        </div>
        <div className={styles.confidence}>
          <span>coherence</span>
          <span className={styles.bar}>
            <span
              className={styles.barFill}
              style={{ width: `${(s.confidence * 100).toFixed(0)}%` }}
            />
          </span>
          <span>{(s.confidence * 100).toFixed(0)}%</span>
        </div>

        <div className={styles.sectionLabel}>// signals</div>
        <ul className={styles.list}>
          {s.signals.map((sig, i) => (
            <li
              key={i}
              className={
                styles.item +
                (sig.type === "indicator" ? " " + styles.indicator : "") +
                (sig.type === "cv" ? " " + styles.cv : "")
              }
            >
              {sig.value}
              <span className={styles.source}>{sig.source}</span>
            </li>
          ))}
        </ul>

        {s.gaps.length > 0 ? (
          <>
            <div className={`${styles.sectionLabel} ${styles.weakness}`}>// gaps</div>
            <ul className={styles.list}>
              {s.gaps.map((g, i) => (
                <li key={i} className={`${styles.item} ${styles.weakness}`}>
                  {g}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <GlowButton
          variant="primary"
          size="sm"
          className={styles.askBtn}
          onClick={() => onAsk(`Interpret signal: ${s.name}`)}
        >
          ask interpreter
        </GlowButton>
      </HoloPanel>
    );
  }

  if (kind === "project") {
    const p = profile.projects.find((pr) => pr.name === name);
    if (!p) return null;
    return (
      <HoloPanel variant="epic" className={styles.panel}>
        <div className={styles.header}>
          <div>
            <div className={styles.kind}>// SIGNAL · PROJECT</div>
            <h3 className={styles.title}>{p.name}</h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            close
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--fg-2)", margin: 0, lineHeight: 1.55 }}>
          {p.blurb}
        </p>

        {p.signals.strengths.length > 0 ? (
          <>
            <div className={styles.sectionLabel}>// strengths</div>
            <ul className={styles.list}>
              {p.signals.strengths.map((s, i) => (
                <li key={i} className={styles.item}>
                  {s}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {p.signals.weaknesses.length > 0 ? (
          <>
            <div className={`${styles.sectionLabel} ${styles.weakness}`}>// open gaps</div>
            <ul className={styles.list}>
              {p.signals.weaknesses.map((w, i) => (
                <li key={i} className={`${styles.item} ${styles.weakness}`}>
                  {w}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <GlowButton
          variant="primary"
          size="sm"
          className={styles.askBtn}
          onClick={() => onAsk(`Interpret signal: ${p.name}`)}
        >
          ask interpreter
        </GlowButton>
      </HoloPanel>
    );
  }

  return null;
}
