import {
  buildPerExpenseTransfers,
  optimizeDebt,
  type OptimizeInput,
  type OptimizeResult,
  type Transfer,
} from "@/lib/simulations/debt-optimizer";
import { generateNetwork } from "@/lib/simulations/debt-optimizer/seed";

export type RunState =
  | "idle"
  | "manual"
  | "running"
  | "phase-playback"
  | "complete";

export interface State {
  seed: number;
  input: OptimizeInput;
  initialTransfers: Transfer[];
  manualTransfers: Transfer[];
  selectedTransferId: string | null;
  selectedExpenseId: string | null;
  manualMoves: number;
  result: OptimizeResult | null;
  currentPhaseIndex: number;
  runState: RunState;
  startedAt: number | null;
  finishedAt: number | null;
}

export type Action =
  | { type: "INIT"; seed: number }
  | { type: "SELECT_TRANSFER"; id: string | null }
  | { type: "SELECT_EXPENSE"; id: string | null }
  | { type: "REROUTE_TRANSFER"; id: string; newTo: string }
  | { type: "DELETE_TRANSFER"; id: string }
  | { type: "DELETE_ALL_TRANSFERS" }
  | { type: "ADD_TRANSFER"; from: string; to: string; amount: number }
  | { type: "START" }
  | { type: "APPLY_RESPONSE"; transfers: Transfer[] }
  | { type: "APPLY_RESPONSE_ERROR" }
  | { type: "RESET_TO_INITIAL" }
  | { type: "RUN_GREEDY" }
  | { type: "STEP_PHASE" }
  | { type: "COMPLETE" }
  | { type: "RESET"; seed: number };

export function initState(seed: number): State {
  const input = generateNetwork(seed);
  const initialTransfers = buildPerExpenseTransfers(input);
  return {
    seed,
    input,
    initialTransfers,
    manualTransfers: initialTransfers.map((t) => ({ ...t })),
    selectedTransferId: null,
    selectedExpenseId: null,
    manualMoves: 0,
    result: null,
    currentPhaseIndex: -1,
    runState: "idle",
    startedAt: null,
    finishedAt: null,
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INIT":
    case "RESET":
      return initState(action.seed);

    case "START":
      if (state.startedAt !== null) return state;
      return { ...state, startedAt: performance.now(), runState: "manual" };

    case "SELECT_TRANSFER":
      return { ...state, selectedTransferId: action.id };

    case "SELECT_EXPENSE":
      return {
        ...state,
        selectedExpenseId: state.selectedExpenseId === action.id ? null : action.id,
        selectedTransferId: null,
      };

    case "DELETE_ALL_TRANSFERS": {
      if (state.runState === "phase-playback" || state.runState === "complete") {
        return state;
      }
      return {
        ...state,
        manualTransfers: [],
        manualMoves: state.manualMoves + 1,
        runState: "manual",
        startedAt: state.startedAt ?? performance.now(),
        selectedTransferId: null,
      };
    }

    case "ADD_TRANSFER": {
      if (state.runState === "phase-playback" || state.runState === "complete") {
        return state;
      }
      if (action.from === action.to || action.amount <= 0) return state;
      const newTransfer: Transfer = {
        id: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        from: action.from,
        to: action.to,
        amount: Math.round(action.amount * 100) / 100,
      };
      return {
        ...state,
        manualTransfers: [...state.manualTransfers, newTransfer],
        manualMoves: state.manualMoves + 1,
        runState: "manual",
        startedAt: state.startedAt ?? performance.now(),
        selectedTransferId: null,
      };
    }

    case "REROUTE_TRANSFER": {
      if (state.runState === "phase-playback" || state.runState === "complete") {
        return state;
      }
      const idx = state.manualTransfers.findIndex((t) => t.id === action.id);
      if (idx < 0) return state;
      const tx = state.manualTransfers[idx];
      if (tx.to === action.newTo || tx.from === action.newTo) return state;
      const next = state.manualTransfers.slice();
      next[idx] = { ...tx, to: action.newTo };
      return {
        ...state,
        manualTransfers: next,
        manualMoves: state.manualMoves + 1,
        runState: "manual",
        startedAt: state.startedAt ?? performance.now(),
        selectedTransferId: null,
      };
    }

    case "DELETE_TRANSFER": {
      if (state.runState === "phase-playback" || state.runState === "complete") {
        return state;
      }
      const next = state.manualTransfers.filter((t) => t.id !== action.id);
      if (next.length === state.manualTransfers.length) return state;
      return {
        ...state,
        manualTransfers: next,
        manualMoves: state.manualMoves + 1,
        runState: "manual",
        startedAt: state.startedAt ?? performance.now(),
        selectedTransferId: null,
      };
    }

    case "APPLY_RESPONSE": {
      if (state.runState === "phase-playback" || state.runState === "complete") return state;
      const now = performance.now();
      return {
        ...state,
        manualTransfers: action.transfers,
        manualMoves: state.manualMoves + 1,
        runState: "manual",
        startedAt: state.startedAt ?? now,
        selectedTransferId: null,
      };
    }

    case "APPLY_RESPONSE_ERROR": {
      const now = performance.now();
      return {
        ...state,
        manualMoves: state.manualMoves + 1,
        startedAt: state.startedAt ?? now,
      };
    }

    case "RESET_TO_INITIAL": {
      if (state.runState === "phase-playback" || state.runState === "complete") return state;
      return {
        ...state,
        manualTransfers: state.initialTransfers.map((t) => ({ ...t })),
        selectedTransferId: null,
      };
    }

    case "RUN_GREEDY": {
      if (state.result) return state;
      const result = optimizeDebt(state.input);
      const now = performance.now();
      return {
        ...state,
        result,
        runState: "complete",
        currentPhaseIndex: result.phases.length - 1,
        selectedTransferId: null,
        startedAt: state.startedAt ?? now,
        finishedAt: now,
      };
    }

    case "STEP_PHASE": {
      if (!state.result) return state;
      const next = state.currentPhaseIndex + 1;
      if (next >= state.result.phases.length) {
        return {
          ...state,
          currentPhaseIndex: state.result.phases.length - 1,
          runState: "complete",
          finishedAt: performance.now(),
        };
      }
      return { ...state, currentPhaseIndex: next };
    }

    case "COMPLETE":
      return {
        ...state,
        runState: "complete",
        finishedAt: state.finishedAt ?? performance.now(),
      };

    default:
      return state;
  }
}
