"use client";

import { useEffect, useRef, useState } from "react";
import { Scanlines } from "@/components/ui/Scanlines";
import type {
  ClientProfile,
  ProfileDataset,
} from "@/lib/intelligence/types";
import { ChatStream } from "./ChatStream";
import { Composer, type ComposerHandle } from "./Composer";
import { EvidencePanel } from "./EvidencePanel";
import { ScanAnimation } from "./ScanAnimation";
import { SignalGraph } from "./SignalGraph";
import { useInterpreter } from "./useInterpreter";
import styles from "./InterpreterPanel.module.css";

interface Props {
  profile: ProfileDataset;
  clientProfile: ClientProfile;
  onClose: () => void;
}

export function InterpreterPanel({ profile, clientProfile, onClose }: Props) {
  const [scanDone, setScanDone] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const composerRef = useRef<ComposerHandle>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { messages, pending, send, reset } = useInterpreter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (!panelRef.current) return;
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable[0]?.focus();
  }, []);

  // Highlighted graph keys based on latest assistant message's retrieved.
  const highlightedKeys = (() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last || last.role !== "assistant") return new Set<string>();
    const out = new Set<string>();
    for (const r of last.retrieved) {
      if (r.kind === "skill") out.add(`skill:${r.label}`);
      if (r.kind === "project") out.add(`project:${r.label}`);
    }
    return out;
  })();

  const onCitationClick = (tag: string) => {
    // Map S:n / P:n to graph key.
    if (tag === "BIO") return;
    const [kind, nStr] = tag.split(":");
    const n = parseInt(nStr ?? "0", 10);
    if (!n) return;
    if (kind === "S") {
      const s = profile.skills[n - 1];
      if (s) setSelectedKey(`skill:${s.name}`);
    } else if (kind === "P") {
      const p = profile.projects[n - 1];
      if (p) setSelectedKey(`project:${p.name}`);
    } else if (kind === "R") {
      const r = profile.relations[n - 1];
      if (r) setSelectedKey(`skill:${r.skill}`);
    }
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className={styles.panelWrap}
        role="dialog"
        aria-modal="true"
        aria-label="Neural Signal Interpreter"
      >
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.led} />
            <div className={styles.titleText}>
              <span className={styles.titleMain}>Neural Signal Interpreter</span>
              <span className={styles.titleSub}>
                {scanDone ? "// dataset live · awaiting query" : "// initialising sweep"}
              </span>
            </div>
          </div>
          <div className={styles.headerRight}>
            <span>v2.6</span>
            {messages.length > 0 ? (
              <button
                type="button"
                className={styles.resetBtn}
                onClick={reset}
                aria-label="Clear conversation"
              >
                reset
              </button>
            ) : null}
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close interpreter"
            >
              close
            </button>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.graphPane}>
            <Scanlines />
            <SignalGraph
              profile={clientProfile}
              selectedKey={selectedKey}
              highlightedKeys={highlightedKeys}
              onSelect={setSelectedKey}
            />
            {!scanDone ? <ScanAnimation onComplete={() => setScanDone(true)} /> : null}
            {selectedKey ? (
              <EvidencePanel
                profile={profile}
                selectedKey={selectedKey}
                onClose={() => setSelectedKey(null)}
                onAsk={(q) => {
                  composerRef.current?.prefill(q);
                  setSelectedKey(null);
                }}
              />
            ) : null}
          </div>
          <div className={styles.chatPane}>
            <ChatStream
              messages={messages}
              pending={pending}
              onCitationClick={onCitationClick}
              onExampleClick={(q) => composerRef.current?.prefill(q)}
            />
            <Composer
              ref={composerRef}
              disabled={!scanDone}
              pending={pending}
              onSend={(q) => send(q)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
