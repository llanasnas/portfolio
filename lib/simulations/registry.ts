import type { SimulationManifest } from "./types";

export const SIMULATIONS: readonly SimulationManifest[] = [
  {
    slug: "debt-optimization-protocol",
    codename: "DEBT_OPTIMIZATION_PROTOCOL",
    title: "Debt Optimization Protocol",
    index: "01",
    status: "active",
    classification: "// PROJECT: GROUPIO",
    shortDescription: "Greedy minimization of inter-tenant debt graphs.",
    longDescription:
      "A holographic recreation of the real settlement algorithm powering Groupio. " +
      "Reduce a chaotic web of transfers down to the mathematical minimum — manually, " +
      "then watch the greedy optimizer collapse it phase by phase.",
    estimatedDuration: "2–4 MIN",
    difficulty: 3,
    scoring: {
      weights: { efficiency: 0.6, time: 0.3, manualBonus: 0.1 },
      timeFloorMs: 30_000,
      timeCeilingMs: 240_000,
    },
    load: () =>
      import(
        "@/components/simulations/debt-optimizer/DebtOptimizer"
      ) as Promise<{
        default: import("react").ComponentType;
      }>,
  },
  {
    slug: "neural-routing",
    codename: "NEURAL_ROUTING_GRID",
    title: "Neural Routing Grid",
    index: "02",
    status: "locked",
    classification: "// CLASSIFIED",
    shortDescription: "Latency-aware packet routing across a hostile mesh.",
    longDescription:
      "Reroute traffic through a graph of unstable nodes while minimizing latency and packet loss.",
    estimatedDuration: "—",
    difficulty: 4,
    scoring: {
      weights: { efficiency: 0.5, time: 0.4, manualBonus: 0.1 },
      timeFloorMs: 60_000,
      timeCeilingMs: 300_000,
    },
  },
  {
    slug: "entropy-cascade",
    codename: "ENTROPY_CASCADE",
    title: "Entropy Cascade",
    index: "03",
    status: "locked",
    classification: "// CLASSIFIED",
    shortDescription: "Sort cascading data streams under temporal pressure.",
    longDescription:
      "Stabilize a collapsing dataset before its entropy hits the failure threshold.",
    estimatedDuration: "—",
    difficulty: 5,
    scoring: {
      weights: { efficiency: 0.5, time: 0.4, manualBonus: 0.1 },
      timeFloorMs: 45_000,
      timeCeilingMs: 240_000,
    },
  },
];

export function getSimulation(slug: string): SimulationManifest | undefined {
  return SIMULATIONS.find((s) => s.slug === slug);
}

export function getActiveSimulations(): SimulationManifest[] {
  return SIMULATIONS.filter((s) => s.status === "active");
}

export function getActiveSlugs(): string[] {
  return SIMULATIONS.filter((s) => s.status === "active").map((s) => s.slug);
}
