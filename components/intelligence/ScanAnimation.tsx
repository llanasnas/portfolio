"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./ScanAnimation.module.css";

interface Props {
  onComplete: () => void;
}

export function ScanAnimation({ onComplete }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      onComplete();
      return;
    }

    const tl = gsap.timeline({ onComplete });
    tl.set([barRef.current, glowRef.current, textRef.current], { opacity: 0 });
    tl.to(textRef.current, { opacity: 1, duration: 0.2 }, 0);
    tl.to(
      barRef.current,
      { opacity: 1, top: "100%", duration: 1.1, ease: "power2.inOut" },
      0.05,
    );
    tl.to(glowRef.current, { opacity: 1, duration: 0.4 }, 0.1);
    tl.to(glowRef.current, { opacity: 0, duration: 0.4 }, 0.9);
    tl.to(textRef.current, { opacity: 0, duration: 0.3 }, 1.0);
    tl.to(barRef.current, { opacity: 0, duration: 0.15 }, 1.05);

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div className={styles.scan} aria-hidden="true">
      <div ref={glowRef} className={styles.scanGlow} />
      <div ref={barRef} className={styles.scanBar} />
      <div ref={textRef} className={styles.scanText}>
        // sweeping signal field
      </div>
    </div>
  );
}
