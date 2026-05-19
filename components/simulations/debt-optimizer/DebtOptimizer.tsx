"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { HoloPanel } from "@/components/ui/HoloPanel";
import type { RunStats } from "@/lib/simulations/types";
import { getSimulation } from "@/lib/simulations/registry";
import { scoreDebtRun } from "@/lib/simulations/debt-optimizer/scoring";
import { AlgorithmSteps } from "./AlgorithmSteps";
import { DebtCanvas } from "./DebtCanvas";
import { ExpenseList } from "./ExpenseList";
import { JsEditor } from "./JsEditor";
import { RunControls } from "./RunControls";
import { ScoreSubmit } from "./ScoreSubmit";
import type { Transfer } from "@/lib/simulations/debt-optimizer";
import { initState, reducer } from "./state";
import styles from "./DebtOptimizer.module.css";

const SLUG = "debt-optimization-protocol";

function randomSeed(): number {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] >>> 0;
  }
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}

export default function DebtOptimizer() {
  const [seed, setSeed] = useState<number>(() => 0xc0de);
  const [hydrated, setHydrated] = useState(false);
  const [state, dispatch] = useReducer(reducer, seed, initState);
  const [showSubmit, setShowSubmit] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // After mount: pick a real random seed and reset so the user gets variety.
  useEffect(() => {
    if (hydrated) return;
    const fresh = randomSeed();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeed(fresh);
    dispatch({ type: "RESET", seed: fresh });
    setHydrated(true);
  }, [hydrated]);

  // Open submit modal on complete.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state.runState === "complete") setShowSubmit(true);
  }, [state.runState]);

  // Suppress unused warning — reducedMotion kept for potential future use
  void reducedMotion;

  // Net balances for canvas tinting (creditor / debtor coloring).
  const netByUser = useMemo(() => {
    const net: Record<string, number> = {};
    for (const u of state.input.users) net[u.id] = 0;
    for (const e of state.input.expenses) {
      net[e.payerId] = (net[e.payerId] ?? 0) + e.amount;
      const share = e.amount / Math.max(1, e.beneficiaryIds.length);
      for (const b of e.beneficiaryIds) net[b] = (net[b] ?? 0) - share;
    }
    for (const s of state.input.appliedSettlements) {
      net[s.from] = (net[s.from] ?? 0) + s.amount;
      net[s.to] = (net[s.to] ?? 0) - s.amount;
    }
    return net;
  }, [state.input]);

  const manifest = getSimulation(SLUG);
  const scoring = manifest?.scoring;

  const breakdown = useMemo(() => {
    if (!state.result || !state.finishedAt || !state.startedAt || !scoring) {
      return null;
    }
    return scoreDebtRun({
      manualTransfers: state.manualTransfers,
      manualMoves: state.manualMoves,
      optimalResult: state.result,
      initialTransferCount: state.initialTransfers.length,
      timeMs: state.finishedAt - state.startedAt,
      config: scoring,
    });
  }, [
    state.result,
    state.finishedAt,
    state.startedAt,
    state.manualTransfers,
    state.manualMoves,
    state.initialTransfers.length,
    scoring,
  ]);

  const stats = useMemo<RunStats | null>(() => {
    if (!state.result || !state.finishedAt || !state.startedAt || !breakdown) {
      return null;
    }
    return {
      timeMs: Math.round(state.finishedAt - state.startedAt),
      transfersBefore: state.initialTransfers.length,
      transfersAfter: breakdown.effectiveTransferCount,
      manualMoves: state.manualMoves,
      efficiency: breakdown.efficiency,
    };
  }, [state, breakdown]);

  const showOptimal = state.runState === "complete";
  const displayedTransfers = showOptimal
    ? (state.result?.transfers ?? state.manualTransfers)
    : state.manualTransfers;

  const handleSelect = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_TRANSFER", id });
  }, []);
  const handleReroute = useCallback((id: string, newTo: string) => {
    dispatch({ type: "REROUTE_TRANSFER", id, newTo });
  }, []);
  const handleDelete = useCallback((id: string) => {
    dispatch({ type: "DELETE_TRANSFER", id });
  }, []);
  const handleDeleteAll = useCallback(() => {
    dispatch({ type: "DELETE_ALL_TRANSFERS" });
  }, []);
  const handleAddTransfer = useCallback(
    (from: string, to: string, amount: number) => {
      dispatch({ type: "ADD_TRANSFER", from, to, amount });
    },
    [],
  );
  const handleSelectExpense = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_EXPENSE", id });
  }, []);
  const handleRun = useCallback(() => {
    dispatch({ type: "RUN_GREEDY" });
  }, []);
  const handleReset = useCallback(() => {
    const fresh = randomSeed();
    setSeed(fresh);
    dispatch({ type: "RESET", seed: fresh });
    setShowSubmit(false);
    setHasStarted(false);
  }, []);
  const handleStart = useCallback(() => {
    setHasStarted(true);
    dispatch({ type: "START" });
  }, []);
  const handleApplyResponse = useCallback((transfers: Transfer[]) => {
    dispatch({ type: "APPLY_RESPONSE", transfers });
  }, []);
  const handleApplyResponseError = useCallback(() => {
    dispatch({ type: "APPLY_RESPONSE_ERROR" });
  }, []);
  const handleResetToInitial = useCallback(() => {
    dispatch({ type: "RESET_TO_INITIAL" });
  }, []);

  // Transfer count per expense (for ExpenseList badge)
  const transferCountByExpense = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of state.manualTransfers) {
      if (t.expenseId) counts[t.expenseId] = (counts[t.expenseId] ?? 0) + 1;
    }
    return counts;
  }, [state.manualTransfers]);

  const [showExpenses, setShowExpenses] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Real-time timer: tick every 100ms while playing, freeze on complete, reset on new run
  useEffect(() => {
    if (!state.startedAt) {
      setElapsedMs(0); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    if (state.finishedAt) {
      setElapsedMs(state.finishedAt - state.startedAt);
      return;
    }
    const id = setInterval(() => {
      setElapsedMs(performance.now() - state.startedAt!);
    }, 100);
    return () => clearInterval(id);
  }, [state.startedAt, state.finishedAt]);

  return (
    <div className={styles.root}>
      {/* ── Instructions modal ─────────────────────────── */}
      {showInstructions && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowInstructions(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Simulation instructions"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalTag}>SIMULATION BRIEFING</span>
                <h2 className={styles.modalTitle}>
                  Debt Optimization Protocol
                </h2>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setShowInstructions(false)}
                aria-label="Close instructions"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <section className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>{"// The challenge"}</h3>
                <p>
                  A group of people share expenses — dinners, trips,
                  subscriptions. Every payment creates raw debt arrows from
                  payer to each beneficiary. Your mission: write the greedy
                  algorithm that collapses all these arrows into the{" "}
                  <strong>minimum possible transfers</strong>.
                </p>
              </section>

              <section className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>
                  {"// Your tool: the JS editor"}
                </h3>
                <p>
                  Scroll down to the code editor. Steps&nbsp;1–3 are already
                  implemented — they accumulate debts, compute net balances,
                  and split users into creditors and debtors.
                </p>
                <ul className={styles.modalList}>
                  <li>
                    <strong>expenses</strong> and <strong>users</strong> are
                    injected automatically — no imports needed.
                  </li>
                  <li>
                    Implement <strong>Step&nbsp;4</strong>: the greedy
                    two-pointer loop that matches the largest debtor with the
                    largest creditor.
                  </li>
                  <li>
                    Call{" "}
                    <code className={styles.modalCode}>sendResponse(transfers)</code>{" "}
                    with an array of{" "}
                    <code className={styles.modalCode}>
                      {"{ from, to, amount }"}
                    </code>{" "}
                    objects to push your result to the canvas.
                  </li>
                  <li>
                    Hit <strong>EXECUTE PROTOCOL</strong> to run the reference
                    solution and compare.
                  </li>
                </ul>
              </section>

              <section className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>
                  {"// The algorithm"}
                </h3>
                <ul className={styles.modalList}>
                  <li>
                    <strong>01 Accumulate</strong> — sum paid / owed per user
                    across all expenses.
                  </li>
                  <li>
                    <strong>02 Net balance</strong> — one number per person:
                    positive = creditor, negative = debtor.
                  </li>
                  <li>
                    <strong>03 Partition &amp; sort</strong> — two sorted
                    lists: creditors (desc) and debtors (asc by balance).
                  </li>
                  <li>
                    <strong>04 Greedy loop ← your task</strong> — take the top
                    of each list, transfer{" "}
                    <code className={styles.modalCode}>
                      min(credit, |debt|)
                    </code>
                    , reduce both balances, remove whoever hits&nbsp;0. Repeat
                    until both lists are empty.
                  </li>
                </ul>
              </section>

              <section className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>
                  {"// sendResponse(transfers)"}
                </h3>
                <div className={styles.modalCallout}>
                  Call this function inside the editor with your computed array.
                  Each entry needs <strong>from</strong> (userId),{" "}
                  <strong>to</strong> (userId), and <strong>amount</strong>{" "}
                  (number &gt;&nbsp;0). The canvas updates in real time. You can
                  call it multiple times — each call counts as one move.
                </div>
              </section>

              <section className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>{"// Scoring"}</h3>
                <ul className={styles.modalList}>
                  <li>
                    <strong>Efficiency</strong> — your transfer count vs the
                    optimal. Fewer transfers = higher score.
                  </li>
                  <li>
                    <strong>Speed</strong> — time elapsed from START to
                    EXECUTE.
                  </li>
                  <li>
                    <strong>Moves</strong> — how many times{" "}
                    <code className={styles.modalCode}>sendResponse()</code>{" "}
                    was called.
                  </li>
                </ul>
                <p>
                  Score is only recorded when you submit to the leaderboard.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* ── Algorithm steps visual ─────────────────────── */}
      <HoloPanel variant="default">
        <div className={styles.stepsRow}>
          <AlgorithmSteps done={state.runState === "complete"} />
          <button
            className={styles.infoBtn}
            onClick={() => setShowInstructions(true)}
            aria-label="Show simulation instructions"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M4 4.5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M4 7h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M4 9.5h3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Read Brief
          </button>
        </div>
      </HoloPanel>

      {/* ── Expense accordion ──────────────────────────── */}
      <button
        className={styles.expenseToggle}
        onClick={() => setShowExpenses((v) => !v)}
        aria-expanded={showExpenses}
      >
        <span className={styles.expenseToggleIcon}>
          {showExpenses ? "▲" : "▼"}
        </span>
        <span>{state.input.expenses.length} group expenses</span>
        {showExpenses && (
          <span className={styles.expenseToggleBadge}>collapse</span>
        )}
      </button>

      {showExpenses && (
        <HoloPanel variant="default" cornerTicks>
          <ExpenseList
            expenses={state.input.expenses}
            users={state.input.users}
            selectedExpenseId={state.selectedExpenseId}
            onSelectExpense={handleSelectExpense}
            transferCountByExpense={transferCountByExpense}
          />
        </HoloPanel>
      )}

      {/* ── Canvas brief ───────────────────────────────── */}
      <HoloPanel variant="default">
        <p className={styles.intro}>
          <strong>{"// brief."}</strong>{" "}
          {state.selectedExpenseId
            ? `Showing arrows for expense ${state.selectedExpenseId} · click expense again to deselect`
            : `${state.manualTransfers.length} raw arrows from ${state.input.expenses.length} group expenses · press START · implement the algorithm · call sendResponse() · then execute`}
        </p>
      </HoloPanel>

      <DebtCanvas
        users={state.input.users}
        transfers={displayedTransfers}
        selectedTransferId={state.selectedTransferId}
        filterExpenseId={showOptimal ? null : state.selectedExpenseId}
        onSelectTransfer={handleSelect}
        onReroute={handleReroute}
        onDelete={handleDelete}
        onDeleteAll={handleDeleteAll}
        onAddTransfer={handleAddTransfer}
        optimal={showOptimal}
        netByUser={netByUser}
        canEdit={false}
        hasStarted={hasStarted}
        isComplete={showOptimal}
        onStart={handleStart}
        onResetToInitial={handleResetToInitial}
      />

      <RunControls
        seed={state.seed}
        expenseCount={state.input.expenses.length}
        initialCount={state.initialTransfers.length}
        manualCount={state.manualTransfers.length}
        manualMoves={state.manualMoves}
        optimalCount={state.result?.transfers.length ?? null}
        elapsedMs={elapsedMs}
        canRun={
          state.runState !== "phase-playback" && state.runState !== "complete"
        }
        isComplete={state.runState === "complete"}
        onRun={handleRun}
        onReset={handleReset}
      />

      <JsEditor
        expenses={state.input.expenses}
        users={state.input.users}
        optimalCount={state.result?.transfers.length ?? null}
        hasStarted={hasStarted}
        onApplyResponse={handleApplyResponse}
        onApplyResponseError={handleApplyResponseError}
      />

      {showSubmit && breakdown && stats ? (
        <ScoreSubmit
          slug={SLUG}
          seed={state.seed}
          breakdown={breakdown}
          stats={stats}
          onClose={() => setShowSubmit(false)}
          onSubmitted={() => {}}
        />
      ) : null}
    </div>
  );
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduced(mql.matches);
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
