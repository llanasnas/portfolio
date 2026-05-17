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
  const [refreshKey, setRefreshKey] = useState(0);
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
                <h3 className={styles.modalSectionTitle}>
                  // What it simulates
                </h3>
                <p>
                  A group of people share expenses — dinners, trips,
                  subscriptions. Each person may have paid for others, creating
                  a web of debts. The goal is to settle everyone&apos;s balance
                  with as <strong>few money transfers as possible</strong>.
                </p>
                <p>
                  Think Splitwise, but exposed: you can see and edit every raw
                  debt arrow before the algorithm resolves them.
                </p>
              </section>

              <section className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>// Your mission</h3>
                <ul className={styles.modalList}>
                  <li>
                    The canvas shows one arrow per expense between each payer
                    and beneficiary.
                  </li>
                  <li>
                    <strong>Delete</strong> redundant arrows,{" "}
                    <strong>reroute</strong> them, or <strong>add</strong> new
                    ones to pre-simplify the graph.
                  </li>
                  <li>
                    When ready, hit <strong>EXECUTE PROTOCOL</strong> — the
                    greedy algorithm finalizes the solution.
                  </li>
                  <li>The fewer transfers remain, the better your score.</li>
                </ul>
              </section>

              <section className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>
                  // The algorithm (steps 01–04)
                </h3>
                <ul className={styles.modalList}>
                  <li>
                    <strong>01 Accumulate</strong> — sum all debts per expense.
                  </li>
                  <li>
                    <strong>02 Net balance</strong> — collapse per-expense debts
                    into one net balance per person.
                  </li>
                  <li>
                    <strong>03 Partition</strong> — split into creditors
                    (positive) and debtors (negative).
                  </li>
                  <li>
                    <strong>04 Sort</strong> — order both lists by absolute
                    amount.
                  </li>
                  <li>
                    <strong>05 Greedy</strong> — your JS code runs here: match
                    the largest debtor to the largest creditor, repeat until
                    balanced.
                  </li>
                </ul>
              </section>

              <section className={styles.modalSection}>
                <h3 className={styles.modalSectionTitle}>// Scoring</h3>
                <ul className={styles.modalList}>
                  <li>
                    <strong>Efficiency</strong> — ratio of optimal transfers to
                    your manual count. Fewer arrows = higher score.
                  </li>
                  <li>
                    <strong>Speed</strong> — time elapsed from first edit to
                    execution.
                  </li>
                  <li>
                    <strong>Moves</strong> — total reroutes, deletes and adds
                    you made.
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
            ?
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
            : `${state.manualTransfers.length} raw arrows from ${state.input.expenses.length} group expenses · delete, reroute, or add · then run the protocol`}
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
        canEdit={!showOptimal}
      />

      <RunControls
        seed={state.seed}
        expenseCount={state.input.expenses.length}
        initialCount={state.initialTransfers.length}
        manualCount={state.manualTransfers.length}
        manualMoves={state.manualMoves}
        optimalCount={state.result?.transfers.length ?? null}
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
      />

      {showSubmit && breakdown && stats ? (
        <ScoreSubmit
          slug={SLUG}
          seed={state.seed}
          breakdown={breakdown}
          stats={stats}
          onClose={() => setShowSubmit(false)}
          onSubmitted={() => setRefreshKey((k) => k + 1)}
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
