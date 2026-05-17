"use client";

import { useEffect, useRef } from "react";
import styles from "./HoloSocials.module.css";

interface HoloItem {
  href: string;
  label: string;
  tipLine1: string;
  tipLine2: string;
  Logo: () => React.JSX.Element;
}

const HEX_POINTS = "50,4 88,26 88,74 50,96 12,74 12,26";

const GithubLogo = () => (
  <g>
    <path
      className={styles.logo}
      d="M50 30
         c-9 0 -16 7 -16 16
         c0 7 4.6 13 11 15
         c0.8 0.15 1.1 -0.35 1.1 -0.78
         v-2.7
         c-4.5 1 -5.4 -2.15 -5.4 -2.15
         c-0.73 -1.85 -1.78 -2.35 -1.78 -2.35
         c-1.45 -1 0.1 -0.98 0.1 -0.98
         c1.6 0.1 2.45 1.65 2.45 1.65
         c1.4 2.4 3.7 1.7 4.6 1.3
         c0.14 -1.02 0.55 -1.72 1 -2.12
         c-3.6 -0.4 -7.4 -1.8 -7.4 -8
         c0 -1.77 0.63 -3.22 1.66 -4.36
         c-0.17 -0.4 -0.72 -2.05 0.16 -4.27
         c0 0 1.36 -0.43 4.46 1.66
         c1.3 -0.36 2.7 -0.55 4.1 -0.55
         c1.4 0 2.8 0.18 4.1 0.55
         c3.1 -2.1 4.46 -1.66 4.46 -1.66
         c0.88 2.22 0.33 3.87 0.16 4.27
         c1.04 1.13 1.66 2.59 1.66 4.36
         c0 6.2 -3.8 7.6 -7.4 8
         c0.58 0.5 1.1 1.48 1.1 3
         v4.45
         c0 0.44 0.3 0.95 1.1 0.78
         c6.4 -2.13 11 -8.1 11 -15
         c0 -9 -7 -16 -16 -16 z"
    />
  </g>
);

const LinkedInLogo = () => (
  <g>
    <rect
      className={styles.logoFill}
      x="36"
      y="38"
      width="28"
      height="24"
      rx="2"
    />
    {/* dot of "i" */}
    <circle className={styles.logo} cx="42.5" cy="44" r="1.8" />
    {/* stem of "i" */}
    <path className={styles.logo} d="M41 49 L41 58" />
    {/* "n" */}
    <path
      className={styles.logo}
      d="M48 58 L48 49 M48 52
         c0 -2 1.5 -3 3.5 -3
         c2 0 3.5 1 3.5 3
         L55 58"
    />
  </g>
);

const ITEMS: HoloItem[] = [
  {
    href: "https://github.com/llanasnas",
    label: "GitHub profile",
    tipLine1: "> github.com/llanasnas",
    tipLine2: "> loading profile...",
    Logo: GithubLogo,
  },
  {
    href: "https://linkedin.com/in/gerard-llanas",
    label: "LinkedIn profile",
    tipLine1: "> linkedin profile detected",
    tipLine2: "> open connection...",
    Logo: LinkedInLogo,
  },
];

export default function HoloSocials() {
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stackRef.current;
    if (!el || typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let mx = 0;
    let my = 0;

    const apply = () => {
      raf = 0;
      el.style.setProperty("--mx", mx.toFixed(3));
      el.style.setProperty("--my", my.toFixed(3));
    };

    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
      if (raf === 0) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={stackRef} className={styles.stack} aria-label="Social links">
      {ITEMS.map(({ href, label, tipLine1, tipLine2, Logo }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={styles.item}
        >
          <span className={styles.glow} aria-hidden="true" />
          <span className={styles.particles} aria-hidden="true" />
          <svg
            className={styles.svg}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <polygon className={styles.hex} points={HEX_POINTS} />
            <line className={styles.tick} x1="50" y1="0" x2="50" y2="6" />
            <line className={styles.tick} x1="50" y1="94" x2="50" y2="100" />
            <line className={styles.tick} x1="6" y1="38" x2="12" y2="38" />
            <line className={styles.tick} x1="88" y1="62" x2="94" y2="62" />
            <Logo />
          </svg>
          <span className={styles.scan} aria-hidden="true" />
          <span className={styles.ripple} aria-hidden="true" />
          <div className={styles.tooltip} aria-hidden="true">
            <span className={styles.tipLine1}>{tipLine1}</span>
            <span className={styles.tipLine2}>{tipLine2}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
