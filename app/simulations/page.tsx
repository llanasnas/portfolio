import { SIMULATIONS } from "@/lib/simulations/registry";
import { SimulationHub } from "@/components/simulations/SimulationHub";

export default function SimulationsHubPage() {
  return <SimulationHub manifests={SIMULATIONS} />;
}
