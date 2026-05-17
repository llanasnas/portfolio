import Link from "next/link";
import type { ReactNode } from "react";
import { GlowButton } from "@/components/ui/GlowButton";
import type { SimulationManifest } from "@/lib/simulations/types";
import styles from "./SimulationFrame.module.css";

interface SimulationFrameProps {
  manifest: SimulationManifest;
  children: ReactNode;
}

export function SimulationFrame({ manifest, children }: SimulationFrameProps) {
  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <div className={styles.left}>
          <span className={styles.crumb}>
            <Link href="/simulations">{"// simulations"}</Link>
            {" / "}
            {manifest.classification}
          </span>
          <h1 className={styles.codename}>{manifest.codename}</h1>
        </div>
        <div className={styles.right}>
          <span className={styles.live}>
            <span className={styles.liveDot} aria-hidden="true" />
            {"session // active"}
          </span>
          <Link href="/simulations" style={{ textDecoration: "none" }}>
            <GlowButton variant="ghost" size="sm">
              ← Exit
            </GlowButton>
          </Link>
        </div>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
