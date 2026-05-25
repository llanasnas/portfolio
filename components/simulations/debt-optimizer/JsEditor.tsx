"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import type { Expense, UserNode } from "@/lib/simulations/debt-optimizer";
import { GlowButton } from "@/components/ui/GlowButton";
import { MonacoEditorWrapper } from "./MonacoEditorWrapper";
import styles from "./JsEditor.module.css";

const USE_MONACO_EDITOR = true;

// Cyberpunk Prism syntax theme — injected once into <head>
const PRISM_THEME = `
.token.comment,.token.prolog,.token.doctype,.token.cdata{color:#4b5468;font-style:italic}
.token.punctuation{color:#64748b}
.token.number,.token.boolean,.token.constant{color:#5ad7ff}
.token.string,.token.char{color:#68d391}
.token.operator{color:#fbb6ce}
.token.keyword{color:#b87bff}
.token.function,.token.class-name{color:#7dd3fc}
.token.regex,.token.variable{color:#f6ad55}
.token.attr-name,.token.property{color:#a5b4fc}
`;

function highlight(code: string): string {
  return Prism.highlight(code, Prism.languages.javascript, "javascript");
}

// expenses & users are injected as named function parameters —
// they don't need to be declared in the code editor.
const DEFAULT_CODE = `// ──────────────────────────────────────────────────────────────
// GROUPIO · DEBT SIMPLIFICATION CHALLENGE
// 'expenses' and 'users' are pre-loaded from the current run.
//
// Expense { id, name, payerId, amount, beneficiaryIds: string[] }
// User    { id, name }
//
// Goal: implement the greedy two-pointer loop in Step 4.
// ──────────────────────────────────────────────────────────────

// ── STEP 1: Accumulate paid / owes per user ─────────────────
const paid = {}, owes = {};
users.forEach(u => { paid[u.id] = 0; owes[u.id] = 0; });
expenses.forEach(exp => {
  paid[exp.payerId] = (paid[exp.payerId] || 0) + exp.amount;
  const share = exp.amount / exp.beneficiaryIds.length;
  exp.beneficiaryIds.forEach(uid => { owes[uid] = (owes[uid] || 0) + share; });
});
console.log("── STEP 1 · paid / owes");
users.forEach(u =>
  console.log(\`  \${u.name}: paid €\${paid[u.id].toFixed(2)}, owes €\${owes[u.id].toFixed(2)}\`)
);

// ── STEP 2: Net balance (paid − owes) ───────────────────────
const net = {};
users.forEach(u => { net[u.id] = Math.round((paid[u.id] - owes[u.id]) * 100) / 100; });
console.log("\\n── STEP 2 · net balance");
users.forEach(u =>
  console.log(\`  \${u.name}: \${net[u.id] >= 0 ? "+" : ""}\${net[u.id].toFixed(2)}\`)
);

// ── STEP 3: Split into creditors / debtors ──────────────────
const creditors = users
  .filter(u => net[u.id] >  0.01)
  .map(u => ({ ...u, balance: net[u.id] }))
  .sort((a, b) => b.balance - a.balance);
const debtors = users
  .filter(u => net[u.id] < -0.01)
  .map(u => ({ ...u, balance: net[u.id] }))
  .sort((a, b) => a.balance - b.balance);
console.log("\\n── STEP 3 · creditors:", creditors.map(c => \`\${c.name}(+\${c.balance.toFixed(2)})\`).join(", "));
console.log("             debtors:", debtors.map(d => \`\${d.name}(\${d.balance.toFixed(2)})\`).join(", "));

// ── STEP 4: Greedy two-pointer minimization ◄ YOUR TASK ─────
// While there are creditors AND debtors:
//   1. Take the largest creditor (most owed) + largest debtor (most owes).
//   2. Create a transfer for min(creditorBalance, |debtorBalance|).
//   3. Reduce both balances — remove the one that reaches 0.

const transfers = [];
// ↓ YOUR CODE HERE


// ↑ END

console.log("\\n── STEP 4 · simplified transfers");
const rawCount = expenses.reduce((s, e) =>
  s + e.beneficiaryIds.filter(b => b !== e.payerId).length, 0
);
if (transfers.length === 0) {
  console.log("  (nothing yet — complete Step 4)");
  console.log("  Then call sendResponse(transfers) to apply your result to the canvas.");
} else {
  transfers.forEach(t => {
    const fn = users.find(u => u.id === t.from)?.name || t.from;
    const tn = users.find(u => u.id === t.to)?.name   || t.to;
    console.log(\`  \${fn} → \${tn}: €\${t.amount.toFixed(2)}\`);
  });
  console.log(\`\\n  \${rawCount} raw arrows → \${transfers.length} optimized\`);
  sendResponse(transfers);
}
`;

interface JsEditorProps {
  expenses: Expense[];
  users: UserNode[];
  optimalCount: number | null;
  hasStarted: boolean;
  onApplyResponse: (
    transfers: Array<{ id: string; from: string; to: string; amount: number }>,
  ) => void;
  onApplyResponseError: () => void;
}

function isValidTransfers(
  v: unknown,
): v is Array<{ from: string; to: string; amount: number }> {
  if (!Array.isArray(v)) return false;
  return v.every((t) => {
    if (!t || typeof t !== "object") return false;
    const r = t as Record<string, unknown>;
    return (
      typeof r.from === "string" &&
      r.from.length > 0 &&
      typeof r.to === "string" &&
      r.to.length > 0 &&
      typeof r.amount === "number" &&
      (r.amount as number) > 0 &&
      r.from !== r.to
    );
  });
}

interface ConsoleEntry {
  id: number;
  text: string;
  type: "log" | "error" | "warn";
}

interface CompletionItem {
  label: string;
  insertText: string;
  detail: string;
  kind: "variable" | "function" | "snippet" | "property" | "method";
}

interface CompletionContext {
  objectName: string | null;
  prefix: string;
  replaceStart: number;
}

const CORE_COMPLETIONS: CompletionItem[] = [
  {
    label: "sendResponse(transfers)",
    insertText: "sendResponse(transfers)",
    detail: "Apply transfers to canvas",
    kind: "function",
  },
  {
    label: "forEach((item) => { ... })",
    insertText: "forEach((item) => {\n  \n})",
    kind: "snippet",
    detail: "Array method snippet",
  },
  {
    label: "map((item) => ...)",
    insertText: "map((item) => )",
    kind: "snippet",
    detail: "Array method snippet",
  },
  {
    label: "filter((item) => ...)",
    insertText: "filter((item) => )",
    kind: "snippet",
    detail: "Array method snippet",
  },
  {
    label: "reduce((acc, item) => ..., init)",
    insertText: "reduce((acc, item) => , )",
    kind: "snippet",
    detail: "Array method snippet",
  },
  {
    label: "push(value)",
    insertText: "push()",
    kind: "snippet",
    detail: "Array method snippet",
  },
  {
    label: "find((item) => ...)",
    insertText: "find((item) => )",
    kind: "snippet",
    detail: "Array method snippet",
  },
];

const MEMBER_COMPLETIONS: CompletionItem[] = [
  {
    label: "forEach((item) => { ... })",
    insertText: "forEach((item) => {\n  \n})",
    detail: "Array method",
    kind: "method",
  },
  {
    label: "map((item) => ...)",
    insertText: "map((item) => )",
    detail: "Array method",
    kind: "method",
  },
  {
    label: "filter((item) => ...)",
    insertText: "filter((item) => )",
    detail: "Array method",
    kind: "method",
  },
  {
    label: "reduce((acc, item) => ..., init)",
    insertText: "reduce((acc, item) => , )",
    detail: "Array method",
    kind: "method",
  },
  {
    label: "find((item) => ...)",
    insertText: "find((item) => )",
    detail: "Array method",
    kind: "method",
  },
  {
    label: "sort((a, b) => ...)",
    insertText: "sort((a, b) => )",
    detail: "Array method",
    kind: "method",
  },
  {
    label: "push(value)",
    insertText: "push()",
    detail: "Array method",
    kind: "method",
  },
];

function getCompletionContext(code: string, cursor: number): CompletionContext {
  const before = code.slice(0, cursor);
  const dotMatch = before.match(/([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)?$/);
  if (dotMatch) {
    const objectName = dotMatch[1] ?? null;
    const prefix = dotMatch[2] ?? "";
    return {
      objectName,
      prefix,
      replaceStart: cursor - prefix.length,
    };
  }

  const tokenMatch = before.match(/([A-Za-z_$][\w$]*)$/);
  const prefix = tokenMatch?.[1] ?? "";
  return {
    objectName: null,
    prefix,
    replaceStart: cursor - prefix.length,
  };
}

function scoreCompletion(item: CompletionItem, prefix: string): number {
  const label = item.label.toLowerCase();
  const p = prefix.toLowerCase();
  if (!p) return 1;
  if (label === p) return 100;
  if (label.startsWith(p)) return 60;
  if (label.includes(p)) return 25;
  return 0;
}

function getCompletions(
  context: CompletionContext,
  forceAll: boolean,
): CompletionItem[] {
  const source = context.objectName ? MEMBER_COMPLETIONS : CORE_COMPLETIONS;

  const filtered = source
    .map((item) => ({ item, score: scoreCompletion(item, context.prefix) }))
    .filter(({ score }) => forceAll || score > 0)
    .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label))
    .slice(0, 8)
    .map(({ item }) => item);

  return filtered;
}

let _entryId = 0;

function playAlarm(): void {
  try {
    const ctx = new AudioContext();
    // Three descending sawtooth sweeps — siren effect
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      const t = ctx.currentTime + i * 0.55;
      osc.frequency.setValueAtTime(1046, t);
      osc.frequency.exponentialRampToValueAtTime(523, t + 0.35);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.5);
    }
  } catch {
    // Browser may block audio without user gesture
  }
}

export function JsEditor({
  expenses,
  users,
  optimalCount,
  hasStarted,
  onApplyResponse,
  onApplyResponseError,
}: JsEditorProps) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [hintSignal, setHintSignal] = useState(0);
  const [logs, setLogs] = useState<ConsoleEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [userTransferCount, setUserTransferCount] = useState<number | null>(
    null,
  );
  const [expanded, setExpanded] = useState(false);
  const [showCompletions, setShowCompletions] = useState(false);
  const [completionItems, setCompletionItems] = useState<CompletionItem[]>([]);
  const [activeCompletion, setActiveCompletion] = useState(0);
  const [completionTop, setCompletionTop] = useState(42);
  const [completionLeft, setCompletionLeft] = useState(14);
  const completionCtxRef = useRef<CompletionContext>({
    objectName: null,
    prefix: "",
    replaceStart: 0,
  });
  const editorWrapRef = useRef<HTMLDivElement>(null);
  const editorTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const [showAlarm, setShowAlarm] = useState(false);
  const alarmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inject Prism theme only when fallback editor is active.
  useEffect(() => {
    if (USE_MONACO_EDITOR) return;
    if (document.getElementById("prism-cyber-css")) return;
    const style = document.createElement("style");
    style.id = "prism-cyber-css";
    style.textContent = PRISM_THEME;
    document.head.appendChild(style);
  }, []);

  // Alarm timer cleanup
  useEffect(() => {
    return () => {
      if (alarmTimerRef.current) clearTimeout(alarmTimerRef.current);
    };
  }, []);

  const triggerAlarm = useCallback(() => {
    playAlarm();
    setShowAlarm(true);
    if (alarmTimerRef.current) clearTimeout(alarmTimerRef.current);
    alarmTimerRef.current = setTimeout(() => setShowAlarm(false), 5000);
  }, []);

  // Serialized data injected as function params (not in the code itself)
  const expData = expenses.map((e) => ({
    id: e.id,
    name: e.name,
    payerId: e.payerId,
    amount: e.amount,
    beneficiaryIds: e.beneficiaryIds,
  }));
  const usrData = users.map((u) => ({ id: u.id, name: u.name }));

  const updateCompletionAnchor = useCallback((cursor: number, nextCode: string) => {
    const before = nextCode.slice(0, cursor);
    const lines = before.split("\n");
    const line = Math.max(0, lines.length - 1);
    const col = lines[lines.length - 1]?.length ?? 0;
    const left = Math.min(520, 14 + col * 7.1);
    const top = 14 + line * 20.4 + 28;
    setCompletionLeft(left);
    setCompletionTop(top);
  }, []);

  const refreshCompletions = useCallback(
    (nextCode: string, forceAll = false) => {
      const textarea = editorTextareaRef.current;
      if (!textarea) return;

      const cursor = textarea.selectionStart ?? 0;
      const context = getCompletionContext(nextCode, cursor);
      completionCtxRef.current = context;

      const canAutoOpen = forceAll || context.prefix.length > 0 || !!context.objectName;
      if (!canAutoOpen) {
        setShowCompletions(false);
        return;
      }

      const matches = getCompletions(context, forceAll);
      if (matches.length === 0) {
        setShowCompletions(false);
        return;
      }

      updateCompletionAnchor(cursor, nextCode);
      setCompletionItems(matches);
      setActiveCompletion(0);
      setShowCompletions(true);
    },
    [updateCompletionAnchor],
  );

  const applyCompletion = useCallback(
    (item: CompletionItem) => {
      const textarea = editorTextareaRef.current;
      if (!textarea) return;

      const cursor = textarea.selectionStart ?? 0;
      const context = completionCtxRef.current;
      const start = Math.max(0, Math.min(context.replaceStart, cursor));
      const nextCode = `${code.slice(0, start)}${item.insertText}${code.slice(cursor)}`;
      const nextCursor = start + item.insertText.length;

      setCode(nextCode);
      setShowCompletions(false);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.selectionStart = nextCursor;
        textarea.selectionEnd = nextCursor;
      });
    },
    [code],
  );

  useEffect(() => {
    if (!hasStarted) return;
    const root = editorWrapRef.current;
    if (!root) return;
    editorTextareaRef.current = root.querySelector("textarea");
  }, [hasStarted, expanded]);

  const runCode = useCallback(() => {
    setRunning(true);
    const captured: ConsoleEntry[] = [];

    const mockConsole = {
      log: (...args: unknown[]) =>
        captured.push({
          id: _entryId++,
          text: args
            .map((a) =>
              typeof a === "object" ? JSON.stringify(a, null, 2) : String(a),
            )
            .join(" "),
          type: "log",
        }),
      warn: (...args: unknown[]) =>
        captured.push({
          id: _entryId++,
          text: args.map(String).join(" "),
          type: "warn",
        }),
      error: (...args: unknown[]) =>
        captured.push({
          id: _entryId++,
          text: args.map(String).join(" "),
          type: "error",
        }),
    };

    try {
      const sendResponseFn = (transfersArg: unknown): void => {
        if (!isValidTransfers(transfersArg)) {
          captured.push({
            id: _entryId++,
            text: "[sendResponse ERROR] Invalid format. Expected: [{ from: string, to: string, amount: number }, ...]. +1 penalty move applied.",
            type: "error",
          });
          onApplyResponseError();
          return;
        }
        const mapped = (
          transfersArg as Array<{ from: string; to: string; amount: number }>
        ).map((t, i) => ({
          id: `sr-${Date.now()}-${i}`,
          from: t.from,
          to: t.to,
          amount: Math.round(t.amount * 100) / 100,
        }));
        onApplyResponse(mapped);
        captured.push({
          id: _entryId++,
          text: `[sendResponse OK] ${mapped.length} transfer(s) applied to canvas. +1 move counted.`,
          type: "log",
        });
      };

      // expenses, users & sendResponse passed as named params — available in user code
      const fn = new Function(
        "console",
        "expenses",
        "users",
        "sendResponse",
        code,
      );
      fn(mockConsole, expData, usrData, sendResponseFn);
      setLogs(captured);

      // Capture user's 'transfers' variable to compute efficiency
      try {
        const cap: unknown[] = [];
        const hc = { log: () => {}, warn: () => {}, error: () => {} };
        const wrapped = `${code}\nif(typeof transfers!=="undefined"&&Array.isArray(transfers))__c__(transfers);`;
        const fn2 = new Function(
          "console",
          "expenses",
          "users",
          "sendResponse",
          "__c__",
          wrapped,
        );
        fn2(
          hc,
          expData,
          usrData,
          () => {},
          (a: unknown[]) => cap.push(...a),
        );
        setUserTransferCount(cap.length > 0 ? cap.length : null);
      } catch {
        setUserTransferCount(null);
      }
    } catch (err) {
      setLogs([
        ...captured,
        {
          id: _entryId++,
          text: `[ERROR] ${err instanceof Error ? err.message : String(err)}`,
          type: "error",
        },
      ]);
    } finally {
      setRunning(false);
      setTimeout(() => {
        if (consoleRef.current)
          consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }, 50);
    }
  }, [code, expData, usrData, onApplyResponse, onApplyResponseError]);

  const efficiency =
    userTransferCount !== null && optimalCount !== null && optimalCount > 0
      ? Math.min(100, Math.round((optimalCount / userTransferCount) * 100))
      : null;

  // ── Shared JSX fragments ─────────────────────────────────────────
  const headerBar = (
    <div className={styles.header}>
      <span className={styles.headerTitle}>{"// greedy_protocol.js"}</span>
      <div className={styles.headerActions}>
        <button
          className={styles.resetBtn}
          onClick={() => {
            setCode(DEFAULT_CODE);
            setLogs([]);
            setUserTransferCount(null);
          }}
          title="Reset to default"
        >
          ↺ reset
        </button>
        <button
          className={styles.expandBtn}
          onClick={() => setExpanded((v) => !v)}
          title={expanded ? "Collapse editor" : "Expand editor"}
          aria-label={expanded ? "Collapse editor" : "Expand editor"}
        >
          {expanded ? "✕" : "⛶"}
        </button>
      </div>
    </div>
  );

  const editorBody = (
    <>
      {!hasStarted ? (
        <div className={styles.lockScreen}>
          <span className={styles.lockIcon}>⬛</span>
          <p className={styles.lockMsg}>
            Press <strong>START</strong> in the canvas to activate the editor
          </p>
          <p className={styles.lockSub}>
            The code editor unlocks once the simulation begins
          </p>
        </div>
      ) : (
        <>
          <div
            ref={editorWrapRef}
            className={styles.editorWrap}
            onPaste={(e) => {
              if (USE_MONACO_EDITOR) return;
              e.preventDefault();
              triggerAlarm();
            }}
          >
            {USE_MONACO_EDITOR ? (
              <MonacoEditorWrapper
                value={code}
                onChange={setCode}
                onBlockedPaste={triggerAlarm}
                hintSignal={hintSignal}
                expanded={expanded}
              />
            ) : (
              <>
                <Editor
                  value={code}
                  onValueChange={(nextCode) => {
                    setCode(nextCode);
                    refreshCompletions(nextCode);
                  }}
                  highlight={highlight}
                  padding={14}
                  textareaClassName={styles.editorTextarea}
                  preClassName={styles.editorPre}
                  className={styles.editorInner}
                  tabSize={2}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.code === "Space") {
                      e.preventDefault();
                      refreshCompletions(code, true);
                      return;
                    }

                    if (!showCompletions) return;

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setActiveCompletion((prev) =>
                        prev + 1 >= completionItems.length ? 0 : prev + 1,
                      );
                      return;
                    }

                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setActiveCompletion((prev) =>
                        prev - 1 < 0 ? completionItems.length - 1 : prev - 1,
                      );
                      return;
                    }

                    if (e.key === "Escape") {
                      e.preventDefault();
                      setShowCompletions(false);
                      return;
                    }

                    if (e.key === "Enter" || e.key === "Tab") {
                      if (completionItems.length === 0) return;
                      e.preventDefault();
                      applyCompletion(completionItems[activeCompletion]);
                    }
                  }}
                  onBlur={() => {
                    setShowCompletions(false);
                  }}
                />

                {hasStarted && showCompletions && completionItems.length > 0 && (
                  <div
                    className={styles.completions}
                    style={{ top: completionTop, left: completionLeft }}
                    role="listbox"
                    aria-label="Code suggestions"
                  >
                    {completionItems.map((item, idx) => (
                      <button
                        key={`${item.label}-${idx}`}
                        type="button"
                        className={`${styles.completionItem} ${idx === activeCompletion ? styles.completionItemActive : ""}`}
                        role="option"
                        aria-selected={idx === activeCompletion}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applyCompletion(item);
                        }}
                      >
                        <span className={styles.completionMain}>{item.label}</span>
                        <span className={styles.completionMeta}>{item.detail}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.runBar}>
            <GlowButton
              variant="primary"
              size="sm"
              onClick={runCode}
              disabled={running}
            >
              ▶ Run
            </GlowButton>
            <button
              className={styles.hintBtn}
              onClick={() => {
                if (USE_MONACO_EDITOR) {
                  setHintSignal((v) => v + 1);
                  return;
                }
                refreshCompletions(code, true);
              }}
              title="Show code suggestions"
              type="button"
            >
              Hints
            </button>
            <button
              className={styles.clearBtn}
              onClick={() => {
                setLogs([]);
                setUserTransferCount(null);
              }}
            >
              Clear console
            </button>
            {userTransferCount !== null && (
              <span className={styles.result}>
                Your solution: <strong>{userTransferCount}</strong> transfers
                {optimalCount !== null && (
                  <>
                    {" "}
                    · Optimal: <strong>{optimalCount}</strong>
                    {efficiency !== null && (
                      <span
                        className={`${styles.efficiency} ${efficiency === 100 ? styles.efficiencyPerfect : ""}`}
                      >
                        {" "}
                        · {efficiency}% efficient
                      </span>
                    )}
                  </>
                )}
              </span>
            )}
          </div>

          <div className={styles.console} ref={consoleRef} aria-live="polite">
            {logs.length === 0 ? (
              <span className={styles.consolePlaceholder}>
                {">"} awaiting execution...
              </span>
            ) : (
              logs.map((entry) => (
                <div
                  key={entry.id}
                  className={`${styles.logLine} ${styles[`logLine_${entry.type}`]}`}
                >
                  <span className={styles.logPrompt}>{">"}</span>
                  <span className={styles.logText}>{entry.text}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </>
  );

  const alarmJsx = showAlarm ? (
    <div
      className={styles.alarmOverlay}
      onClick={() => setShowAlarm(false)}
      role="alert"
      aria-live="assertive"
    >
      <div className={styles.alarmContent}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/angry_me.png"
          alt="No AI allowed"
          className={styles.alarmImg}
        />
        <p className={styles.alarmTitle}>&#9888; AI DETECTED &#9888;</p>
        <p className={styles.alarmSub}>Paste injection blocked.</p>
        <p className={styles.alarmSub}>Write the code yourself, operator.</p>
        <p className={styles.alarmDismiss}>[ click to clear alert ]</p>
      </div>
    </div>
  ) : null;

  // ── Render ───────────────────────────────────────────────────────
  return (
    <>
      {/* API info panel — shown above editor once started */}
      {hasStarted && (
        <div className={styles.apiPanel}>
          <div className={styles.apiPanelHeader}>
            <span className={styles.apiPanelTag}>API</span>
            <span className={styles.apiPanelTitle}>sendResponse( )</span>
            <span className={styles.apiPanelSubtitle}>
              — submit your solution to the canvas
            </span>
          </div>

          <code className={styles.apiPanelSig}>
            {"sendResponse([ { from, to, amount }, ... ])"}
          </code>

          <div className={styles.apiPanelRow}>
            <span className={styles.apiPanelLabel}>USERS</span>
            <div className={styles.apiPanelBadges}>
              {users.map((u) => (
                <span key={u.id} className={styles.apiPanelBadge}>
                  <span className={styles.apiBadgeName}>{u.name}</span>
                  <span className={styles.apiBadgeId}>{u.id}</span>
                </span>
              ))}
            </div>
          </div>

          <div className={styles.apiPanelWarns}>
            <span className={styles.apiPanelWarnA}>
              <span className={styles.warnIcon}>↺</span>
              replaces ALL canvas transfers · +1 move per call
            </span>
            <span className={styles.apiPanelWarnB}>
              <span className={styles.warnIcon}>✕</span>
              invalid format → canvas unchanged · +1 penalty move
            </span>
          </div>
        </div>
      )}

      {/* Normal (collapsed) container — always in DOM */}
      <div className={styles.root}>
        {headerBar}
        {expanded ? (
          <div className={styles.expandedPlaceholder}>
            <span>{"// editor in fullscreen mode"}</span>
          </div>
        ) : (
          editorBody
        )}
        {!expanded && alarmJsx}
      </div>

      {/* Fullscreen portal — bypasses any parent stacking context */}
      {expanded &&
        createPortal(
          <div className={styles.expandedOverlay}>
            {headerBar}
            {editorBody}
            {alarmJsx}
          </div>,
          document.body,
        )}
    </>
  );
}
