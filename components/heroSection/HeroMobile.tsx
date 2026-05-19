"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./HeroMobile.module.css";

interface HeroMobileProps {
  onEnterArchive: () => void;
  onEnterSimulations?: () => void;
  onEnterProjects?: () => void;
}

const NAME = "GERARD LLANAS";
const ROLE_TEXT = "Full Stack Developer";
const HEX_POINTS = "50,4 88,26 88,74 50,96 12,74 12,26";

interface Particle {
  x: number;
  y: number;
  size: number;
  d: number;
  delay: number;
}

const PARTICLES_PANEL1: Particle[] = [
  { x: 8, y: 12, size: 3, d: 9, delay: -1 },
  { x: 92, y: 8, size: 2, d: 11, delay: -3 },
  { x: 18, y: 28, size: 2, d: 10, delay: -5 },
  { x: 85, y: 35, size: 3, d: 12, delay: -2 },
  { x: 6, y: 78, size: 2, d: 9, delay: -4 },
  { x: 90, y: 72, size: 3, d: 10, delay: -6 },
  { x: 22, y: 88, size: 2, d: 11, delay: -1.5 },
  { x: 78, y: 92, size: 2, d: 9, delay: -3.5 },
  { x: 50, y: 6, size: 2, d: 12, delay: -7 },
  { x: 12, y: 50, size: 1.5, d: 10, delay: -2.5 },
  { x: 88, y: 52, size: 1.5, d: 11, delay: -5.5 },
  { x: 36, y: 80, size: 1.5, d: 9, delay: -4.5 },
  { x: 64, y: 82, size: 1.5, d: 10, delay: -6.5 },
  { x: 50, y: 96, size: 2, d: 13, delay: -8 },
];

const PARTICLES_PANEL2: Particle[] = [
  { x: 10, y: 8, size: 3, d: 10, delay: -1 },
  { x: 90, y: 10, size: 2, d: 11, delay: -3 },
  { x: 22, y: 18, size: 2, d: 9, delay: -5 },
  { x: 78, y: 20, size: 3, d: 12, delay: -2 },
  { x: 6, y: 32, size: 2, d: 10, delay: -4 },
  { x: 94, y: 30, size: 2, d: 11, delay: -6 },
  { x: 40, y: 12, size: 1.5, d: 9, delay: -7 },
  { x: 60, y: 8, size: 1.5, d: 10, delay: -2.5 },
  { x: 4, y: 86, size: 2, d: 11, delay: -3.5 },
  { x: 96, y: 90, size: 2, d: 12, delay: -5.5 },
  { x: 50, y: 96, size: 1.5, d: 9, delay: -4.5 },
  { x: 14, y: 98, size: 1.5, d: 10, delay: -6.5 },
];

function ParticleField({ particles }: { particles: Particle[] }) {
  return (
    <div className={styles.particleField} aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className={styles.particle}
          style={
            {
              "--x": `${p.x}%`,
              "--y": `${p.y}%`,
              "--size": `${p.size}px`,
              "--d": `${p.d}s`,
              "--delay": `${p.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function CornerBrackets() {
  return (
    <div className={styles.corners} aria-hidden="true">
      <span className={`${styles.corner} ${styles.cornerTl}`} />
      <span className={`${styles.corner} ${styles.cornerTr}`} />
      <span className={`${styles.corner} ${styles.cornerBl}`} />
      <span className={`${styles.corner} ${styles.cornerBr}`} />
    </div>
  );
}

function splitName(name: string) {
  return name.split("").map((ch, i) => {
    if (ch === " ") {
      return <span key={i} className={styles.space} aria-hidden="true" />;
    }
    return (
      <span key={i} className={styles.char}>
        {ch}
      </span>
    );
  });
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon className={styles.cardIconHex} points={HEX_POINTS} />
      <path
        className={styles.cardIconLogo}
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
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon className={styles.cardIconHex} points={HEX_POINTS} />
      <rect
        className={styles.cardIconLogoFill}
        x="36"
        y="38"
        width="28"
        height="24"
        rx="2"
      />
      <circle className={styles.cardIconLogo} cx="42.5" cy="44" r="1.8" />
      <path className={styles.cardIconLogo} d="M41 49 L41 58" />
      <path
        className={styles.cardIconLogo}
        d="M48 58 L48 49 M48 52
           c0 -2 1.5 -3 3.5 -3
           c2 0 3.5 1 3.5 3
           L55 58"
      />
    </svg>
  );
}

function SimulationsIcon() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon className={styles.cardIconHex} points={HEX_POINTS} />
      <circle className={styles.cardIconLogo} cx="50" cy="50" r="14" />
      <circle className={styles.cardIconLogo} cx="34" cy="38" r="3" />
      <circle className={styles.cardIconLogo} cx="66" cy="38" r="3" />
      <circle className={styles.cardIconLogo} cx="34" cy="62" r="3" />
      <circle className={styles.cardIconLogo} cx="66" cy="62" r="3" />
      <line className={styles.cardIconLogo} x1="36" y1="40" x2="46" y2="46" />
      <line className={styles.cardIconLogo} x1="64" y1="40" x2="54" y2="46" />
      <line className={styles.cardIconLogo} x1="36" y1="60" x2="46" y2="54" />
      <line className={styles.cardIconLogo} x1="64" y1="60" x2="54" y2="54" />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon className={styles.cardIconHex} points={HEX_POINTS} />
      <rect className={styles.cardIconLogo} x="30" y="34" width="18" height="14" rx="1.5" />
      <rect className={styles.cardIconLogo} x="52" y="34" width="18" height="14" rx="1.5" />
      <rect className={styles.cardIconLogo} x="30" y="52" width="18" height="14" rx="1.5" />
      <rect className={styles.cardIconLogo} x="52" y="52" width="18" height="14" rx="1.5" />
      <line className={styles.cardIconLogo} x1="34" y1="40" x2="44" y2="40" strokeWidth="1" />
      <line className={styles.cardIconLogo} x1="56" y1="40" x2="66" y2="40" strokeWidth="1" />
      <line className={styles.cardIconLogo} x1="34" y1="58" x2="44" y2="58" strokeWidth="1" />
      <line className={styles.cardIconLogo} x1="56" y1="58" x2="66" y2="58" strokeWidth="1" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon className={styles.cardIconHex} points={HEX_POINTS} />
      <path
        className={styles.cardIconLogo}
        d="M30 38 L46 38 L50 44 L70 44 L70 64 L30 64 Z"
      />
      <line
        className={styles.cardIconLogo}
        x1="36"
        y1="52"
        x2="64"
        y2="52"
        strokeWidth="1"
      />
      <line
        className={styles.cardIconLogo}
        x1="36"
        y1="58"
        x2="56"
        y2="58"
        strokeWidth="1"
      />
    </svg>
  );
}

export default function HeroMobile({ onEnterArchive, onEnterSimulations, onEnterProjects }: HeroMobileProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const exitingRef = useRef(false);
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Panel 1 entry timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(
        ".gl-avatar-hex, .gl-avatar-tick",
        { strokeDasharray: 400, strokeDashoffset: 400, opacity: 0 },
        {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 1.1,
          stagger: 0.04,
        },
      )
        .fromTo(
          ".gl-avatar-photo",
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 0.7, stagger: 0.06 },
          "-=0.6",
        )
        .fromTo(
          ".gl-eyebrow",
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          "-=0.3",
        )
        .fromTo(
          ".gl-name .gl-char",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.035 },
          "-=0.2",
        )
        .fromTo(
          ".gl-role",
          { width: 0 },
          {
            width: "100%",
            duration: 1.1,
            ease: "steps(22)",
          },
          "-=0.2",
        )
        .fromTo(
          ".gl-pill",
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" },
          "-=0.5",
        )
        .fromTo(
          ".gl-hint",
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          "-=0.2",
        );

      // Actions panel — stagger CTA cards on enter
      ScrollTrigger.create({
        trigger: ".gl-panel-actions",
        start: "top 75%",
        once: true,
        onEnter: () => {
          gsap.to(".gl-actions-header", {
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
          });
          gsap.to(".gl-card", {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.14,
            ease: "power3.out",
            delay: 0.1,
          });
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // Slide the clicked CTA card then navigate
  const slideThenRun = useCallback((el: HTMLElement, cb: () => void) => {
    if (exitingRef.current) return;
    if (typeof window === "undefined") {
      cb();
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      cb();
      return;
    }
    exitingRef.current = true;
    gsap.to(el, {
      xPercent: 12,
      opacity: 0,
      filter: "blur(4px)",
      duration: 0.38,
      ease: "power3.in",
      onComplete: cb,
    });
  }, []);

  const handleArchive = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => slideThenRun(e.currentTarget, onEnterArchive),
    [slideThenRun, onEnterArchive],
  );
  const handleSimulations = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onEnterSimulations) slideThenRun(e.currentTarget, onEnterSimulations);
  }, [slideThenRun, onEnterSimulations]);
  const handleProjects = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (onEnterProjects) slideThenRun(e.currentTarget, onEnterProjects);
  }, [slideThenRun, onEnterProjects]);
  const handleExternal = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
      const el = e.currentTarget;
      slideThenRun(el, () => {
        window.open(url, "_blank", "noopener,noreferrer");
        // Reset so the user can interact again after returning to the page
        exitingRef.current = false;
        gsap.set(el, { clearProps: "all" });
      });
    },
    [slideThenRun],
  );

  const hh = time ? String(time.getHours()).padStart(2, "0") : "--";
  const mm = time ? String(time.getMinutes()).padStart(2, "0") : "--";

  return (
    <div ref={rootRef} className={styles.hero}>
      <header className={styles.topbar}>
        <span>
          <span className={styles.live} />
          Workspace · Live
        </span>
        <span className={styles.clock}>
          {hh}:{mm}
          <span>· BCN</span>
        </span>
      </header>

      {/* ---------- Panel 1 — Identity ---------- */}
      <section className={`${styles.panel} ${styles.identity}`}>
        <ParticleField particles={PARTICLES_PANEL1} />
        <div className={`${styles.panelHalo} ${styles.haloTopRight}`} aria-hidden="true" />
        <div className={`${styles.scanPulse} gl-scan-1`} aria-hidden="true" />
        <div className={styles.avatar}>
          <div className={styles.avatarGlow} aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/avatar_portfolio.png"
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
            className={`${styles.avatarPhoto} gl-avatar-photo`}
          />
          <div className={`${styles.avatarTint} gl-avatar-photo`} aria-hidden="true" />
          <div className={`${styles.avatarScan} gl-avatar-photo`} aria-hidden="true" />
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <polygon className={`${styles.avatarHex} gl-avatar-hex`} points={HEX_POINTS} />
            <line className={`${styles.avatarTick} gl-avatar-tick`} x1="50" y1="0" x2="50" y2="6" />
            <line className={`${styles.avatarTick} gl-avatar-tick`} x1="50" y1="94" x2="50" y2="100" />
            <line className={`${styles.avatarTick} gl-avatar-tick`} x1="6" y1="38" x2="12" y2="38" />
            <line className={`${styles.avatarTick} gl-avatar-tick`} x1="88" y1="62" x2="94" y2="62" />
          </svg>
        </div>
        <div className={`${styles.eyebrow} gl-eyebrow`}>{"// portfolio_v1.0.sys"}</div>
        <h1 className={`${styles.name} gl-name`}>{splitName(NAME)}</h1>
        <div className={`${styles.role} gl-role`}>{ROLE_TEXT}</div>
        <div className={`${styles.pill} gl-pill`}>
          <span className={styles.pillDot} />
          BCN · Available
        </div>
        <div className={`${styles.scrollHint} gl-hint`} aria-hidden="true">
          <span>scroll to boot</span>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 10 L12 16 L18 10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ---------- Panel 2 — Action stack ---------- */}
      <section className={`${styles.panel} gl-panel-actions`}>
        <ParticleField particles={PARTICLES_PANEL2} />
        <div className={`${styles.panelHalo} ${styles.haloCenter}`} aria-hidden="true" />
        <div className={`${styles.scanPulse} gl-scan-3`} aria-hidden="true" />
        <CornerBrackets />
        <div className={styles.actions}>
          <div className={styles.statBars} aria-hidden="true">
            <span className={styles.statBar} style={{ "--w": "62%", "--d": "3.8s", "--delay": "0s" } as React.CSSProperties} />
            <span className={styles.statBar} style={{ "--w": "84%", "--d": "4.2s", "--delay": "-1.2s" } as React.CSSProperties} />
            <span className={styles.statBar} style={{ "--w": "44%", "--d": "3.4s", "--delay": "-2.4s" } as React.CSSProperties} />
          </div>
          <div className={`${styles.actionsHeader} gl-actions-header`}>
            {"// select endpoint"}
          </div>

          {onEnterSimulations ? (
            <button
              type="button"
              onClick={handleSimulations}
              className={`${styles.card} ${styles.cardPrimary} gl-card`}
              aria-label="Enter system simulations"
            >
              <span className={styles.cardIcon}>
                <SimulationsIcon />
              </span>
              <span className={styles.cardBody}>
                <span className={styles.cardLabel}>System Simulations</span>
                <span className={styles.cardSub}>&gt; engineering.protocols</span>
              </span>
              <span className={styles.cardCta}>[BOOT] →</span>
            </button>
          ) : null}

          {onEnterProjects ? (
            <button
              type="button"
              onClick={handleProjects}
              className={`${styles.card} ${styles.cardPrimary} gl-card`}
              aria-label="Browse projects"
            >
              <span className={styles.cardIcon}>
                <ProjectsIcon />
              </span>
              <span className={styles.cardBody}>
                <span className={styles.cardLabel}>Projects</span>
                <span className={styles.cardSub}>&gt; build.archive</span>
              </span>
              <span className={styles.cardCta}>[VIEW] →</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleArchive}
            className={`${styles.card} ${styles.cardPrimary} gl-card`}
            aria-label="Open archive"
          >
            <span className={styles.cardIcon}>
              <ArchiveIcon />
            </span>
            <span className={styles.cardBody}>
              <span className={styles.cardLabel}>Open Archive</span>
              <span className={styles.cardSub}>&gt; career.log</span>
            </span>
            <span className={styles.cardCta}>[ENTER] →</span>
          </button>

          <button
            type="button"
            onClick={(e) => handleExternal(e, "https://github.com/llanasnas")}
            className={`${styles.card} gl-card`}
            aria-label="GitHub profile"
          >
            <span className={styles.cardIcon}>
              <GithubIcon />
            </span>
            <span className={styles.cardBody}>
              <span className={styles.cardLabel}>GitHub</span>
              <span className={styles.cardSub}>&gt; github.com/llanasnas</span>
            </span>
            <span className={styles.cardCta}>→</span>
          </button>

          <button
            type="button"
            onClick={(e) => handleExternal(e, "https://linkedin.com/in/gerard-llanas")}
            className={`${styles.card} gl-card`}
            aria-label="LinkedIn profile"
          >
            <span className={styles.cardIcon}>
              <LinkedInIcon />
            </span>
            <span className={styles.cardBody}>
              <span className={styles.cardLabel}>LinkedIn</span>
              <span className={styles.cardSub}>&gt; open connection</span>
            </span>
            <span className={styles.cardCta}>→</span>
          </button>
        </div>
      </section>

      <footer className={styles.footer}>
        <span>v1.0.sys</span>
        <span>·</span>
        <span>BCN</span>
      </footer>
    </div>
  );
}
