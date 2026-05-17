import Link from "next/link";
import { HoloPanel } from "@/components/ui/HoloPanel";
import type { SimulationManifest } from "@/lib/simulations/types";
import styles from "./SimulationHub.module.css";

interface SimulationHubProps {
  manifests: readonly SimulationManifest[];
}

export function SimulationHub({ manifests }: SimulationHubProps) {
  const active = manifests.filter((m) => m.status === "active").length;
  const total = manifests.length;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>{"// node.simulations.sys"}</span>
        <h1 className={styles.title}>System Simulations</h1>
        <p className={styles.subtitle}>
          Interactive engineering protocols. Each module reconstructs a real
          algorithm from production work — drag, trigger, observe. Compete on the
          global leaderboard.
        </p>
        <div className={styles.meta}>
          <span>
            ACTIVE PROTOCOLS<strong>{String(active).padStart(2, "0")}</strong>
          </span>
          <span>
            CATALOG<strong>{String(total).padStart(2, "0")}</strong>
          </span>
          <span>
            VERSION<strong>v1.0</strong>
          </span>
        </div>
      </header>

      <div className={styles.grid}>
        {manifests.map((m) => (
          <SimulationCard key={m.slug} manifest={m} />
        ))}
      </div>
    </div>
  );
}

function SimulationCard({ manifest }: { manifest: SimulationManifest }) {
  const locked = manifest.status === "locked";

  const inner = (
    <HoloPanel
      variant={locked ? "locked" : "rare"}
      cornerTicks
      className={`${styles.card} ${locked ? styles.cardLocked : ""}`}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardIndex}>{`PROTOCOL // ${manifest.index}`}</span>
        <span className={styles.cardClass}>{manifest.classification}</span>
      </div>

      <div>
        <h2 className={styles.cardCodename}>{manifest.codename}</h2>
        <p className={styles.cardTitle}>{manifest.title}</p>
      </div>

      <p className={styles.cardDescription}>
        {locked ? "███████████████ ████████████ ██████ ███." : manifest.shortDescription}
      </p>

      <div className={styles.cardFooter}>
        <span className={styles.stat}>
          DUR<strong>{manifest.estimatedDuration}</strong>
        </span>
        <span className={styles.difficulty} aria-label={`Difficulty ${manifest.difficulty} of 5`}>
          {[1, 2, 3, 4, 5].map((d) => (
            <span
              key={d}
              className={`${styles.dot} ${d > manifest.difficulty ? styles.dotOff : ""}`}
            />
          ))}
        </span>
        <span className={styles.enterCta}>
          {locked ? `${"//"} classified` : "[ enter ] →"}
        </span>
      </div>
    </HoloPanel>
  );

  if (locked) return inner;
  return (
    <Link href={`/simulations/${manifest.slug}`} className={styles.card}>
      {inner}
    </Link>
  );
}
