"use client";

import styles from "./ContactTransmit.module.css";

export function TransmitAnimation({ fading }: { fading?: boolean }) {
  return (
    <div
      className={`${styles.overlay} ${fading ? styles.fade : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Transmitting message"
    >
      <span className={styles.beam} aria-hidden="true" />
      <span className={styles.packet} aria-hidden="true" />
      <span className={styles.packet} aria-hidden="true" />
      <span className={styles.packet} aria-hidden="true" />

      <div className={styles.stage}>
        <div className={styles.sub}>{"// transmitting · secure"}</div>

        <svg
          className={styles.svg}
          viewBox="0 0 240 240"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* outer ring */}
          <circle className={styles.ringOuter} cx="120" cy="120" r="100" />
          {/* mid ring */}
          <circle className={styles.ringMid} cx="120" cy="120" r="78" />
          {/* inner spinning arc */}
          <circle className={styles.ringInner} cx="120" cy="120" r="56" />

          {/* corner brackets */}
          <g className={styles.cornerGroup}>
            <path className={styles.corner} d="M30 70 L30 50 L50 50" />
            <path className={styles.corner} d="M210 50 L190 50 L190 70" />
            <path className={styles.corner} d="M50 190 L30 190 L30 170" />
            <path className={styles.corner} d="M190 170 L190 190 L210 190" />
          </g>

          {/* radar sweep beam */}
          <g className={styles.scan}>
            <line x1="120" y1="120" x2="120" y2="22" />
            <line x1="120" y1="120" x2="138" y2="22" opacity="0.4" />
            <line x1="120" y1="120" x2="104" y2="24" opacity="0.4" />
          </g>

          {/* ticks around the dial */}
          <g>
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 360) / 24;
              const inner = 102;
              const outer = i % 6 === 0 ? 116 : 110;
              const rad = (angle * Math.PI) / 180;
              const x1 = 120 + Math.cos(rad) * inner;
              const y1 = 120 + Math.sin(rad) * inner;
              const x2 = 120 + Math.cos(rad) * outer;
              const y2 = 120 + Math.sin(rad) * outer;
              return (
                <line
                  key={i}
                  className={styles.tick}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  opacity={i % 6 === 0 ? 0.9 : 0.45}
                />
              );
            })}
          </g>

          {/* central hexagonal core */}
          <polygon
            className={styles.core}
            points="120,86 150,103 150,137 120,154 90,137 90,103"
          />
          {/* envelope glyph inside core */}
          <g className={styles.coreGlyph}>
            <rect x="104" y="108" width="32" height="22" rx="2" />
            <path d="M104 110 L120 124 L136 110" />
          </g>
        </svg>

        <div className={styles.label}>
          Establishing link<span className={styles.blink}>_</span>
        </div>
      </div>
    </div>
  );
}

export function TransmitSuccess({ onReset }: { onReset?: () => void }) {
  return (
    <div className={styles.success} role="status" aria-live="polite">
      <svg
        className={styles.successCheck}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle className={styles.checkRing} cx="50" cy="50" r="44" />
        <circle className={styles.checkRingActive} cx="50" cy="50" r="44" />
        <path className={styles.checkMark} d="M32 52 L46 66 L70 38" />
      </svg>
      <p className={styles.successKicker}>● transmission complete</p>
      <h3 className={styles.successTitle}>Mission received.</h3>
      <p className={styles.successBody}>
        Signal locked. I&apos;ll reply from llanasnas@gmail.com within a couple
        of days.
      </p>
      <p className={styles.successMono}>{"// stand by · channel closed"}</p>
      {onReset ? (
        <button type="button" className={styles.btnReturn} onClick={onReset}>
          Send another →
        </button>
      ) : null}
    </div>
  );
}
