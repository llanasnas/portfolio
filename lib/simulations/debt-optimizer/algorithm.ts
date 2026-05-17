/**
 * Greedy debt minimization — frontend port of the Groupio settlement engine.
 *
 * Each phase produces a snapshot so the UI can replay it as a cinematic.
 * Pure functions: no React, no DOM. Identical input → identical output.
 */

export interface UserNode {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  name: string;
  payerId: string;
  amount: number;
  beneficiaryIds: string[];
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface Transfer {
  id: string;
  from: string;
  to: string;
  amount: number;
  expenseId?: string;
}

export type PhaseId =
  | "accumulation"
  | "net"
  | "settlements"
  | "sorting"
  | "greedy";

export interface PhaseSnapshotData {
  paid?: Record<string, number>;
  owes?: Record<string, number>;
  net?: Record<string, number>;
  creditors?: Array<[string, number]>;
  debtors?: Array<[string, number]>;
  partialTransfers?: Transfer[];
}

export interface PhaseSnapshot {
  phase: PhaseId;
  label: string;
  log: string[];
  data: PhaseSnapshotData;
}

export interface OptimizeInput {
  users: UserNode[];
  expenses: Expense[];
  appliedSettlements: Settlement[];
}

export interface OptimizeResult {
  transfers: Transfer[];
  phases: PhaseSnapshot[];
  metrics: { transfersCount: number; totalMoved: number };
}

/**
 * Per-expense transfers — one arrow per (expense × non-payer beneficiary).
 * Shows exactly what each person owes for each specific group expense.
 * This is the raw state before any optimization or aggregation.
 */
export function buildPerExpenseTransfers(input: OptimizeInput): Transfer[] {
  const out: Transfer[] = [];
  let i = 0;
  for (const exp of input.expenses) {
    if (exp.beneficiaryIds.length === 0) continue;
    const nonPayers = exp.beneficiaryIds.filter((b) => b !== exp.payerId);
    if (nonPayers.length === 0) continue;
    const share = round2(exp.amount / exp.beneficiaryIds.length);
    for (const beneficiary of nonPayers) {
      out.push({
        id: `${exp.id}-${beneficiary}`,
        from: beneficiary,
        to: exp.payerId,
        amount: share,
        expenseId: exp.id,
      });
      i++;
    }
  }
  return out;
}

/**
 * Naive transfer baseline. Each expense becomes one transfer per beneficiary
 * (payer is reimbursed amount/N). Aggregated per (debtor → creditor) pair.
 * This is the chaotic "before" state shown to the user.
 */
export function buildInitialTransfers(input: OptimizeInput): Transfer[] {
  const map = new Map<string, number>();
  for (const exp of input.expenses) {
    if (exp.beneficiaryIds.length === 0) continue;
    const share = exp.amount / exp.beneficiaryIds.length;
    for (const beneficiary of exp.beneficiaryIds) {
      if (beneficiary === exp.payerId) continue;
      const key = `${beneficiary}->${exp.payerId}`;
      map.set(key, (map.get(key) ?? 0) + share);
    }
  }
  // Subtract any already-applied settlements.
  for (const s of input.appliedSettlements) {
    const key = `${s.from}->${s.to}`;
    const current = map.get(key) ?? 0;
    const remaining = current - s.amount;
    if (remaining <= 0.01) map.delete(key);
    else map.set(key, remaining);
  }
  const out: Transfer[] = [];
  let i = 0;
  for (const [key, amount] of map) {
    if (amount <= 0.01) continue;
    const [from, to] = key.split("->");
    out.push({ id: `t${i++}`, from, to, amount: round2(amount) });
  }
  return out;
}

export function optimizeDebt(input: OptimizeInput): OptimizeResult {
  const phases: PhaseSnapshot[] = [];

  // ------------------------- PHASE 01 — ACCUMULATION
  const paid: Record<string, number> = {};
  const owes: Record<string, number> = {};
  for (const u of input.users) {
    paid[u.id] = 0;
    owes[u.id] = 0;
  }
  const accLog: string[] = ["[ACCUMULATION] indexing expense events..."];
  for (const exp of input.expenses) {
    paid[exp.payerId] = (paid[exp.payerId] ?? 0) + exp.amount;
    const share = exp.amount / Math.max(1, exp.beneficiaryIds.length);
    for (const b of exp.beneficiaryIds) {
      owes[b] = (owes[b] ?? 0) + share;
    }
    accLog.push(
      `  → ${exp.payerId} paid ${exp.amount.toFixed(2)} for ${exp.beneficiaryIds.length} beneficiaries`,
    );
  }
  accLog.push(`[ACCUMULATION] complete · ${input.expenses.length} events processed`);
  phases.push({
    phase: "accumulation",
    label: "PHASE 01 · ACCUMULATION",
    log: accLog,
    data: { paid: roundMap(paid), owes: roundMap(owes) },
  });

  // ------------------------- PHASE 02 — NET BALANCE
  const net: Record<string, number> = {};
  for (const u of input.users) {
    net[u.id] = round2((paid[u.id] ?? 0) - (owes[u.id] ?? 0));
  }
  phases.push({
    phase: "net",
    label: "PHASE 02 · NET BALANCE",
    log: [
      "[NET BALANCE] computing paid − owes per node...",
      ...input.users.map(
        (u) => `  Δ ${u.id} = ${(net[u.id] ?? 0).toFixed(2)}`,
      ),
    ],
    data: { net: { ...net } },
  });

  // ------------------------- PHASE 03 — SETTLEMENTS
  const settlementsLog: string[] = ["[SETTLEMENTS] applying prior payments..."];
  for (const s of input.appliedSettlements) {
    net[s.from] = round2((net[s.from] ?? 0) + s.amount);
    net[s.to] = round2((net[s.to] ?? 0) - s.amount);
    settlementsLog.push(
      `  ✓ ${s.from} → ${s.to} · ${s.amount.toFixed(2)} settled`,
    );
  }
  if (input.appliedSettlements.length === 0) {
    settlementsLog.push("  (none on record)");
  }
  phases.push({
    phase: "settlements",
    label: "PHASE 03 · SETTLEMENTS",
    log: settlementsLog,
    data: { net: { ...net } },
  });

  // ------------------------- PHASE 04 — SORTING
  const creditors: Array<[string, number]> = [];
  const debtors: Array<[string, number]> = [];
  for (const [uid, balance] of Object.entries(net)) {
    if (balance > 0.01) creditors.push([uid, balance]);
    else if (balance < -0.01) debtors.push([uid, balance]);
  }
  creditors.sort((a, b) => b[1] - a[1]);
  debtors.sort((a, b) => a[1] - b[1]);
  phases.push({
    phase: "sorting",
    label: "PHASE 04 · SORTING",
    log: [
      "[SORTING] ranking creditors (desc) and debtors (asc)...",
      `  creditors · ${creditors.map(([id, v]) => `${id}=${v.toFixed(2)}`).join(", ") || "—"}`,
      `  debtors   · ${debtors.map(([id, v]) => `${id}=${v.toFixed(2)}`).join(", ") || "—"}`,
    ],
    data: {
      creditors: creditors.map(([id, v]) => [id, round2(v)] as [string, number]),
      debtors: debtors.map(([id, v]) => [id, round2(v)] as [string, number]),
    },
  });

  // ------------------------- PHASE 05 — GREEDY MINIMIZATION
  const transfers: Transfer[] = [];
  const greedyLog: string[] = [
    "[GREEDY] minimizing transfer count...",
  ];
  let cIdx = 0;
  let dIdx = 0;
  let txId = 0;
  const cWork = creditors.map(([id, v]) => [id, v] as [string, number]);
  const dWork = debtors.map(([id, v]) => [id, v] as [string, number]);
  let safety = 0;
  while (cIdx < cWork.length && dIdx < dWork.length && safety < 1000) {
    safety++;
    const credit = cWork[cIdx][1];
    const debt = -dWork[dIdx][1];
    const amount = round2(Math.min(credit, debt));
    if (amount <= 0.01) {
      if (credit <= 0.01) cIdx++;
      if (debt <= 0.01) dIdx++;
      continue;
    }
    transfers.push({
      id: `g${txId++}`,
      from: dWork[dIdx][0],
      to: cWork[cIdx][0],
      amount,
    });
    greedyLog.push(
      `  ⇒ ${dWork[dIdx][0]} → ${cWork[cIdx][0]} · ${amount.toFixed(2)}`,
    );
    cWork[cIdx][1] = round2(credit - amount);
    dWork[dIdx][1] = round2(dWork[dIdx][1] + amount);
    if (cWork[cIdx][1] <= 0.01) cIdx++;
    if (dWork[dIdx][1] >= -0.01) dIdx++;
  }
  const totalMoved = transfers.reduce((sum, t) => sum + t.amount, 0);
  greedyLog.push(
    `[GREEDY] complete · ${transfers.length} transfer(s) · ${totalMoved.toFixed(2)} moved`,
  );
  phases.push({
    phase: "greedy",
    label: "PHASE 05 · GREEDY MINIMIZATION",
    log: greedyLog,
    data: { partialTransfers: transfers.slice() },
  });

  return {
    transfers,
    phases,
    metrics: {
      transfersCount: transfers.length,
      totalMoved: round2(totalMoved),
    },
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function roundMap(m: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of Object.keys(m)) out[k] = round2(m[k]);
  return out;
}
