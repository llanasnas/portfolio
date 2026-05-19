"use client";

import { useEffect, useState } from "react";
import styles from "./ArrivalGate.module.css";

const FLAG = "tablet-absorption";

export default function ArrivalGate() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const flag = sessionStorage.getItem(FLAG);
    if (!flag) return;
    sessionStorage.removeItem(FLAG);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.gate} aria-hidden="true" role="presentation">
      <div className={styles.flash} />
      <div className={styles.scan} />
      <div className={styles.text}>
        {"// simulations decrypted"}
        <span className={styles.caret} />
      </div>
    </div>
  );
}
