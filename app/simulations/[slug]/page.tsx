import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { SimulationFrame } from "@/components/simulations/SimulationFrame";
import { getSimulation } from "@/lib/simulations/registry";

const COMPONENT_BY_SLUG: Record<string, ComponentType> = {
  "debt-optimization-protocol": dynamic(
    () => import("@/components/simulations/debt-optimizer/DebtOptimizer"),
    {
      loading: () => (
        <div style={{ padding: 48, fontFamily: "var(--font-mono)" }}>
          {"> loading protocol module..."}
        </div>
      ),
    },
  ),
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SimulationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const manifest = getSimulation(slug);
  if (!manifest || manifest.status !== "active") {
    notFound();
  }
  const SimulationComponent = COMPONENT_BY_SLUG[slug];
  if (!SimulationComponent) {
    notFound();
  }

  return (
    <SimulationFrame manifest={manifest}>
      <SimulationComponent />
    </SimulationFrame>
  );
}

export function generateStaticParams() {
  return [];
}
