import type {
  Expense,
  OptimizeInput,
  Settlement,
  UserNode,
} from "./algorithm";

/**
 * mulberry32 — small deterministic PRNG. Same seed → identical sequence.
 * 32-bit state, fast, good enough for content generation.
 */
export function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NICKNAMES = [
  "NEO",
  "GHOST",
  "VEX",
  "ZED",
  "ORI",
  "KAI",
  "NYX",
  "ARC",
  "RIO",
  "LUM",
];

const EXPENSE_NAMES = [
  "Neural interface chips",
  "Neon district taxi",
  "Quantum uplink relay",
  "Synth ramen · sector 7",
  "Encrypted comms bundle",
  "Holofield projector rental",
  "Black market data cache",
  "Exo-suit maintenance",
  "Cyberdeck firmware patch",
  "Plasma conduit repair",
  "Off-grid safe house night",
  "Contraband coolant flush",
  "Optical implant calibration",
  "Ghost protocol license",
  "Neon graffiti supply run",
  "Subdermal tracker removal",
  "Drone fuel cell pack",
  "Signal jammer cartridge",
  "Biomod nutrient pack",
  "Stealth cloak battery",
  "Corporate data bribe",
  "Rooftop generator tap",
  "EMP grenade batch",
  "Augment lubrication kit",
];

export interface GenerateOpts {
  userCount?: number;
  expenseCount?: number;
  settlementProbability?: number;
}

export function generateNetwork(
  seed: number,
  opts: GenerateOpts = {},
): OptimizeInput {
  const rand = mulberry32(seed || 1);
  const userCount = clamp(opts.userCount ?? 6, 4, 8);
  const expenseCount = clamp(opts.expenseCount ?? 10, 5, 18);
  const settlementProb = opts.settlementProbability ?? 0.18;

  const users: UserNode[] = Array.from({ length: userCount }, (_, i) => ({
    id: `U${i + 1}`,
    name: NICKNAMES[i] ?? `OP${i + 1}`,
  }));

  const expenses: Expense[] = [];
  for (let i = 0; i < expenseCount; i++) {
    const payerIdx = Math.floor(rand() * userCount);
    const amount = round2(8 + rand() * 92);
    const beneficiaryCount = 2 + Math.floor(rand() * (userCount - 1));
    const beneficiaryIds = pickN(users, beneficiaryCount, rand, payerIdx);
    const nameIdx = Math.floor(rand() * EXPENSE_NAMES.length);
    expenses.push({
      id: `E${i + 1}`,
      name: EXPENSE_NAMES[nameIdx] ?? `Expense ${i + 1}`,
      payerId: users[payerIdx].id,
      amount,
      beneficiaryIds,
    });
  }

  const appliedSettlements: Settlement[] = [];
  for (let i = 0; i < userCount; i++) {
    for (let j = 0; j < userCount; j++) {
      if (i === j) continue;
      if (rand() < settlementProb) {
        appliedSettlements.push({
          from: users[i].id,
          to: users[j].id,
          amount: round2(5 + rand() * 20),
        });
      }
    }
  }

  return { users, expenses, appliedSettlements };
}

function pickN(
  users: UserNode[],
  n: number,
  rand: () => number,
  forcePayerIdx: number,
): string[] {
  const out = new Set<string>();
  out.add(users[forcePayerIdx].id);
  let safety = 0;
  while (out.size < Math.min(n, users.length) && safety < 50) {
    safety++;
    const idx = Math.floor(rand() * users.length);
    out.add(users[idx].id);
  }
  return Array.from(out);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
