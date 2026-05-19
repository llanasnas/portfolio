import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { HoloChromeBackground } from "@/components/ui/HoloChromeBackground";
import { Scanlines } from "@/components/ui/Scanlines";
import ArrivalGate from "@/components/simulations/ArrivalGate";
import styles from "./layout.module.css";

export const metadata: Metadata = {
  title: "System Simulations · Gerard Llanas",
  description:
    "Engineering protocols and interactive simulations based on real algorithms from production projects.",
};

export const viewport: Viewport = {
  themeColor: "#05060a",
};

export default function SimulationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div data-zone="simulations" className={styles.shell}>
      <HoloChromeBackground />
      <Scanlines fixed sweep />
      <ArrivalGate />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
