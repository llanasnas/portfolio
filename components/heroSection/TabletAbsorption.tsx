"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./TabletAbsorption.module.css";

interface TabletAbsorptionProps {
  onPush: () => void;
  onComplete: () => void;
}

export default function TabletAbsorption({ onPush, onComplete }: TabletAbsorptionProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          if (!pushedRef.current) {
            pushedRef.current = true;
            onPush();
          }
          onComplete();
        },
      });

      // Direct zoom — ghost expands from tablet position to fullscreen
      tl.to(
        `.${styles.tabletGhost}`,
        {
          top: "50%",
          left: "50%",
          xPercent: -50,
          yPercent: -50,
          width: "150vmax",
          height: "150vmax",
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          duration: 0.55,
          ease: "power3.in",
        },
        0,
      ).to(
        `.${styles.vignette}`,
        { opacity: 0.7, duration: 0.45, ease: "power2.in" },
        0.05,
      );

      // Scan sweep across viewport mid-zoom
      tl.fromTo(
        `.${styles.scanSheet}`,
        { yPercent: -100, opacity: 0 },
        {
          yPercent: 100,
          opacity: 1,
          duration: 0.38,
          ease: "power2.inOut",
        },
        0.28,
      );

      // Flash burst near end
      tl.to(
        `.${styles.flash}`,
        { opacity: 1, scale: 3.5, duration: 0.22, ease: "power3.out" },
        0.45,
      );

      // Hold final frame briefly before push
      tl.to({}, { duration: 0.05 }, ">");
    }, root);

    return () => ctx.revert();
  }, [onPush, onComplete]);

  return (
    <div ref={rootRef} className={styles.overlay} aria-hidden="true" role="presentation">
      <div className={styles.tabletGhost}>
        <div className={styles.tabletGlow} />
        <div className={styles.tabletScanlines} />
      </div>
      <div className={styles.scanSheet} />
      <div className={styles.flash} />
      <div className={styles.vignette} />
    </div>
  );
}
