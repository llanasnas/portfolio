"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import type { Expense, UserNode } from "@/lib/simulations/debt-optimizer";
import { GlowButton } from "@/components/ui/GlowButton";
import styles from "./JsEditor.module.css";

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
} else {
  transfers.forEach(t => {
    const fn = users.find(u => u.id === t.from)?.name || t.from;
    const tn = users.find(u => u.id === t.to)?.name   || t.to;
    console.log(\`  \${fn} → \${tn}: €\${t.amount.toFixed(2)}\`);
  });
  console.log(\`\\n  \${rawCount} raw arrows → \${transfers.length} optimized\`);
}
`;

interface JsEditorProps {
  expenses: Expense[];
  users: UserNode[];
  optimalCount: number | null;
}

interface ConsoleEntry {
  id: number;
  text: string;
  type: "log" | "error" | "warn";
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

export function JsEditor({ expenses, users, optimalCount }: JsEditorProps) {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [logs, setLogs] = useState<ConsoleEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [userTransferCount, setUserTransferCount] = useState<number | null>(
    null,
  );
  const consoleRef = useRef<HTMLDivElement>(null);
  const [showAlarm, setShowAlarm] = useState(false);
  const alarmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inject Prism cyberpunk theme once on client
  useEffect(() => {
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
      // expenses & users passed as named params — available in user code without declaration
      const fn = new Function("console", "expenses", "users", code);
      fn(mockConsole, expData, usrData);
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
          "__c__",
          wrapped,
        );
        fn2(hc, expData, usrData, (a: unknown[]) => cap.push(...a));
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
  }, [code, expData, usrData]);

  const efficiency =
    userTransferCount !== null && optimalCount !== null && optimalCount > 0
      ? Math.min(100, Math.round((optimalCount / userTransferCount) * 100))
      : null;

  return (
    <div className={styles.root}>
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
        </div>
      </div>

      <div
        className={styles.editorWrap}
        onPaste={(e) => {
          e.preventDefault();
          triggerAlarm();
        }}
      >
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={highlight}
          padding={14}
          textareaClassName={styles.editorTextarea}
          preClassName={styles.editorPre}
          className={styles.editorInner}
          tabSize={2}
        />
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

      {/* ── Anti-paste alarm ──────────────────────────── */}
      {showAlarm && (
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
      )}
    </div>
  );
}
