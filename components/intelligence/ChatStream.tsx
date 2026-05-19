"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AnyMessage } from "./useInterpreter";
import styles from "./ChatStream.module.css";

interface Props {
  messages: AnyMessage[];
  pending: boolean;
  onCitationClick: (tag: string) => void;
  onExampleClick: (q: string) => void;
}

const EXAMPLES = [
  "What's the strongest LLM evidence?",
  "How is Mincelly's pipeline architected?",
  "Coherence on real-time apps?",
  "Where are the security signals?",
];

function renderWithCitations(
  text: string,
  onClick: (tag: string) => void,
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const re = /\[(S|P|R):\d+\]|\[BIO\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const tag = m[0].slice(1, -1);
    const isBio = tag === "BIO";
    parts.push(
      <button
        key={`c-${i++}`}
        type="button"
        className={styles.citationPill + (isBio ? " " + styles.bio : "")}
        onClick={() => onClick(tag)}
        title={`signal ${tag}`}
      >
        {tag}
      </button>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function ChatStream({ messages, pending, onCitationClick, onExampleClick }: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending]);

  if (messages.length === 0) {
    return (
      <div className={styles.stream}>
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>// AWAITING QUERY</div>
          <div className={styles.emptyHint}>
            Probe the dataset. The interpreter responds in signal-language with
            citations from the active sweep.
          </div>
          <div className={styles.examples}>
            {EXAMPLES.map((q) => (
              <button
                key={q}
                type="button"
                className={styles.exampleBtn}
                onClick={() => onExampleClick(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stream}>
      {messages.map((m, i) => {
        if (m.role === "user") {
          return (
            <div key={i} className={`${styles.row} ${styles.user}`}>
              <div className={`${styles.bubble} ${styles.user}`}>{m.content}</div>
            </div>
          );
        }
        const isLatest = i === messages.length - 1;
        return (
          <div key={i} className={styles.row}>
            <div className={`${styles.bubble} ${styles.assistant}`}>
              <span className={styles.assistantPrefix}>// interpreter</span>
              {isLatest ? (
                <AssistantTyper
                  text={m.content}
                  onCitationClick={onCitationClick}
                />
              ) : (
                <span>{renderWithCitations(m.content, onCitationClick)}</span>
              )}
            </div>
          </div>
        );
      })}
      {pending ? (
        <div className={styles.pending}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span>interpreting</span>
        </div>
      ) : null}
      <div ref={endRef} />
    </div>
  );
}

type Segment =
  | { kind: "text"; text: string }
  | { kind: "cite"; tag: string };

function segmentize(text: string): Segment[] {
  const segs: Segment[] = [];
  const re = /\[(S|P|R):\d+\]|\[BIO\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) segs.push({ kind: "text", text: text.slice(last, m.index) });
    segs.push({ kind: "cite", tag: m[0].slice(1, -1) });
    last = m.index + m[0].length;
  }
  if (last < text.length) segs.push({ kind: "text", text: text.slice(last) });
  return segs;
}

function AssistantTyper({
  text,
  onCitationClick,
}: {
  text: string;
  onCitationClick: (tag: string) => void;
}) {
  const segs = useMemo(() => segmentize(text), [text]);
  const totalChars = useMemo(
    () => segs.reduce((acc, s) => acc + (s.kind === "text" ? s.text.length : 4), 0),
    [segs],
  );
  const [n, setN] = useState(0);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reducedMotion) {
      setN(totalChars);
      return;
    }
    if (n >= totalChars) return;
    const id = setTimeout(() => setN((c) => c + 1), 10);
    return () => clearTimeout(id);
  }, [n, totalChars, reducedMotion]);

  const out: React.ReactNode[] = [];
  let consumed = 0;
  let i = 0;
  for (const s of segs) {
    if (s.kind === "text") {
      const remaining = Math.max(0, n - consumed);
      const slice = s.text.slice(0, remaining);
      if (slice) out.push(<span key={`t-${i++}`}>{slice}</span>);
      consumed += s.text.length;
    } else {
      const remaining = Math.max(0, n - consumed);
      if (remaining >= 4) {
        const isBio = s.tag === "BIO";
        out.push(
          <button
            key={`c-${i++}`}
            type="button"
            className={styles.citationPill + (isBio ? " " + styles.bio : "")}
            onClick={() => onCitationClick(s.tag)}
            title={`signal ${s.tag}`}
          >
            {s.tag}
          </button>,
        );
      }
      consumed += 4;
    }
  }
  const done = n >= totalChars;
  return (
    <span>
      {out}
      {!done ? (
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: 7,
            height: 12,
            verticalAlign: "text-bottom",
            background: "var(--accent-cyan)",
            marginLeft: 2,
            animation: "none",
          }}
        />
      ) : null}
    </span>
  );
}
