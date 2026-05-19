"use client";

import styles from "./FloatingTrigger.module.css";

interface Props {
  onOpen: () => void;
}

export function FloatingTrigger({ onOpen }: Props) {
  return (
    <button
      type="button"
      className={styles.trigger}
      onClick={onOpen}
      aria-label="Open Neural Signal Interpreter"
    >
      <span className={styles.ring} aria-hidden="true" />
      <span className={`${styles.ring} ${styles.ringDelay}`} aria-hidden="true" />
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Chat bubble — angular, cyberpunk silhouette */}
        <path d="M4 6 L18 6 L20 8 L20 15 L18 17 L11 17 L7.5 20.5 L7.5 17 L4 17 Z" />
        {/* Circuit notches on the frame */}
        <path d="M4 10 L2.5 10 M4 13 L2.5 13" opacity="0.7" />
        <path d="M20 10 L21.5 10 M20 13 L21.5 13" opacity="0.7" />
        {/* Inner signal — three message dots */}
        <circle cx="9" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="12" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="15" cy="11.5" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    </button>
  );
}
