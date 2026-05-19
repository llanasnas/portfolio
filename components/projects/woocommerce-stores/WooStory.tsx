"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "./WooStory.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SCENE_IDS = [
  "hero",
  "ecosystem",
  "craft",
  "plugin",
  "admin",
  "security",
  "stack",
  "final",
] as const;
type SceneId = (typeof SCENE_IDS)[number];

const LIVE_URL = "https://zeroshot.es";
const PLUGIN_REPO =
  "https://github.com/llanasnas/woocomerce-dni-nie-validation-plugin";

// ─────────────────────────────────────────────────────────────
// ICONS — cyberpunk SVGs (no external libs)
// ─────────────────────────────────────────────────────────────
const sw = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const c = { width: size, height: size, ...sw };
  switch (name) {
    case "cart":
      return (
        <svg {...c}>
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="17" cy="20" r="1.4" />
          <path d="M3 4h2l2.4 11.5a2 2 0 0 0 2 1.5h7.6a2 2 0 0 0 2-1.5L21 8H6" />
        </svg>
      );
    case "wordpress":
      return (
        <svg {...c}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3.5 9.5 9 21M14 3.5 17.5 21M21 11l-4.5 9.5M3.5 14 8 4" />
        </svg>
      );
    case "store":
      return (
        <svg {...c}>
          <path d="M3 9 5 4h14l2 5" />
          <path d="M3 9v11h18V9" />
          <path d="M3 9c0 1.7 1.3 3 3 3s3-1.3 3-3 1.3 3 3 3 3-1.3 3-3 1.3 3 3 3 3-1.3 3-3" />
        </svg>
      );
    case "seo":
      return (
        <svg {...c}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
          <path d="M8 11h6M11 8v6" />
        </svg>
      );
    case "blog":
      return (
        <svg {...c}>
          <path d="M5 3h11l3 3v15H5z" />
          <path d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      );
    case "theme":
      return (
        <svg {...c}>
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M3 9h18M7 4v5" />
          <path d="m9 14 2-2 3 3 2-2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...c}>
          <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "lock":
      return (
        <svg {...c}>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        </svg>
      );
    case "id":
      return (
        <svg {...c}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="12" r="2.4" />
          <path d="M14 10h5M14 14h5M5 17c.6-1.6 2.2-2.6 4-2.6S12.4 15.4 13 17" />
        </svg>
      );
    case "upload":
      return (
        <svg {...c}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="m7 9 5-5 5 5" />
          <path d="M12 4v12" />
        </svg>
      );
    case "check":
      return (
        <svg {...c}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </svg>
      );
    case "trash":
      return (
        <svg {...c}>
          <path d="M3 6h18" />
          <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      );
    case "gdpr":
      return (
        <svg {...c}>
          <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
          <path d="M9 12h6M12 9v6" />
        </svg>
      );
    case "code":
      return (
        <svg {...c}>
          <path d="m8 6-6 6 6 6" />
          <path d="m16 6 6 6-6 6" />
        </svg>
      );
    case "github":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-1.96c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.51-1.47.11-3.07 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.6.23 2.78.11 3.07.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.79.56 4.57-1.52 7.86-5.83 7.86-10.91C23.5 5.74 18.27.5 12 .5z" />
        </svg>
      );
    case "arrow":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14" />
          <path d="m13 5 7 7-7 7" />
        </svg>
      );
    case "external":
      return (
        <svg {...c}>
          <path d="M14 4h6v6" />
          <path d="M10 14 20 4" />
          <path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />
        </svg>
      );
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Brand storefront SVG — hero centerpiece
// ─────────────────────────────────────────────────────────────
function StorefrontMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wooGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="55%" stopColor="#5ad7ff" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>
      <g stroke="url(#wooGrad)">
        <path d="M18 38 24 22h52l6 16" />
        <path d="M18 38v44h64V38" />
        <path d="M18 38c0 5 4 9 8 9s8-4 8-9 4 9 8 9 8-4 8-9 4 9 8 9 8-4 8-9 4 9 8 9 8-4 8-9" />
        <rect x="38" y="56" width="24" height="26" />
        <path d="M28 56h6v10h-6zM66 56h6v10h-6z" />
        <circle cx="58" cy="69" r="1.6" fill="url(#wooGrad)" />
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// HERO TITLE
// ─────────────────────────────────────────────────────────────
function HeroTitle({ text }: { text: string }) {
  return (
    <div>
      <StorefrontMark className={styles.brandIcon} />
      <h1 className={styles.title} aria-label={text}>
        {text.split("").map((ch, i) => (
          <span key={i} data-letter>
            {ch === " " ? " " : ch}
          </span>
        ))}
      </h1>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PARTICLES
// ─────────────────────────────────────────────────────────────
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}
function Particles({ count = 36 }: { count?: number }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (rand(i + 1) * 100).toFixed(2),
        duration: (8 + rand(i + 2) * 10).toFixed(2),
        delay: (rand(i + 3) * 8).toFixed(2),
        size: (1 + rand(i + 4) * 2.5).toFixed(2),
        key: i,
      })),
    [count],
  );
  return (
    <div className={styles.particles} aria-hidden="true">
      {dots.map((d) => (
        <span
          key={d.key}
          style={{
            left: `${d.left}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CHECKOUT MOCKUP SVG — for plugin scene (decorative)
// ─────────────────────────────────────────────────────────────
function CheckoutMockup() {
  return (
    <svg
      viewBox="0 0 360 240"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={styles.mockupSvg}
    >
      <defs>
        <linearGradient id="mockGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#5ad7ff" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="348" height="228" rx="10" stroke="rgba(168,85,247,0.4)" />
      <path d="M6 36h348" stroke="rgba(168,85,247,0.3)" />
      <circle cx="20" cy="21" r="2.4" stroke="#a855f7" />
      <circle cx="30" cy="21" r="2.4" stroke="#5ad7ff" />
      <circle cx="40" cy="21" r="2.4" stroke="#4ade80" />
      <rect x="20" y="52" width="120" height="6" rx="3" stroke="rgba(90,215,255,0.6)" />
      <rect x="20" y="68" width="200" height="14" rx="3" stroke="rgba(255,255,255,0.18)" />
      <rect x="20" y="92" width="200" height="14" rx="3" stroke="rgba(255,255,255,0.18)" />
      <rect x="20" y="120" width="140" height="6" rx="3" stroke="rgba(168,85,247,0.7)" />
      <rect x="20" y="134" width="320" height="60" rx="6" stroke="url(#mockGrad)" />
      <path d="M40 156 50 166 70 146" stroke="#4ade80" />
      <rect x="84" y="150" width="80" height="6" rx="3" stroke="rgba(255,255,255,0.4)" />
      <rect x="84" y="164" width="140" height="6" rx="3" stroke="rgba(255,255,255,0.18)" />
      <rect x="20" y="208" width="80" height="18" rx="9" fill="url(#mockGrad)" stroke="none" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function WooStory() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroPreviewRef = useRef<HTMLDivElement | null>(null);
  const heroPreviewInnerRef = useRef<HTMLDivElement | null>(null);
  const pluginFrameRef = useRef<HTMLDivElement | null>(null);
  const adminFrameRef = useRef<HTMLDivElement | null>(null);
  const [activeScene, setActiveScene] = useState<SceneId>("hero");

  // Lenis + GSAP ticker
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  // Hero mouse parallax (tilt)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = heroPreviewInnerRef.current;
    if (!el) return;
    let rx = 0,
      ry = 0,
      tx = 0,
      ty = 0,
      raf = 0;
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      tx = x * 6;
      ty = y * 6;
    };
    const tick = () => {
      rx += (ty - rx) * 0.06;
      ry += (tx - ry) * 0.06;
      el.style.transform = `rotateX(${-rx}deg) rotateY(${ry}deg)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // GSAP timelines
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // HERO intro
      const letters = gsap.utils.toArray<HTMLElement>("[data-letter]");
      if (!reduce) {
        gsap.set(letters, { y: 120, opacity: 0 });
        gsap.set("[data-hero-fade]", { y: 40, opacity: 0 });
        gsap.set(heroPreviewRef.current, { y: 100, opacity: 0, scale: 0.92 });
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .to(letters, { y: 0, opacity: 1, duration: 1.1, stagger: 0.05 })
          .to(
            "[data-hero-fade]",
            { y: 0, opacity: 1, duration: 1, stagger: 0.1 },
            "-=0.6",
          )
          .to(
            heroPreviewRef.current,
            { y: 0, opacity: 1, scale: 1, duration: 1.3 },
            "-=0.7",
          );
      } else {
        gsap.set([letters, "[data-hero-fade]", heroPreviewRef.current], {
          y: 0,
          opacity: 1,
          scale: 1,
        });
      }

      // HERO parallax
      gsap.to(
        [heroPreviewRef.current, "[data-hero-fade]", "[data-letter]"],
        {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-scene='hero']",
            start: "top top",
            end: "+=80%",
            scrub: 1,
          },
          immediateRender: false,
        },
      );

      // generic fades
      gsap.utils.toArray<HTMLElement>(`.${styles.fadeUp}`).forEach((el) => {
        gsap.fromTo(
          el,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
      gsap.utils.toArray<HTMLElement>(`.${styles.fadeIn}`).forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      // ── PINNED scenes — desktop only (mobile flows naturally via CSS reset)
      mm.add("(min-width: 1024px)", () => {
        // PLUGIN pinned
        const pluginTl = gsap.timeline();
        pluginTl
          .fromTo(
            "[data-plugin-frame]",
            { scale: 0.78, opacity: 0, rotateX: 8, filter: "blur(10px)" },
            {
              scale: 1,
              opacity: 1,
              rotateX: 0,
              filter: "blur(0px)",
              ease: "none",
              duration: 1,
            },
          )
          .fromTo(
            "[data-plugin-copy] [data-stagger]",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, ease: "none", duration: 0.7 },
            0.1,
          )
          .to(
            "[data-plugin-frame]",
            { scale: 1.05, y: -30, ease: "none", duration: 1 },
            1,
          );
        ScrollTrigger.create({
          trigger: "[data-pin='plugin']",
          start: "top top",
          end: "+=220%",
          scrub: 1,
          pin: "[data-pin-content='plugin']",
          anticipatePin: 1,
          animation: pluginTl,
        });

        // ADMIN pinned
        const adminTl = gsap.timeline();
        adminTl
          .fromTo(
            "[data-admin-frame]",
            { scale: 0.78, opacity: 0, rotateX: 8, filter: "blur(10px)" },
            {
              scale: 1,
              opacity: 1,
              rotateX: 0,
              filter: "blur(0px)",
              ease: "none",
              duration: 1,
            },
          )
          .fromTo(
            "[data-admin-copy] [data-stagger]",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, ease: "none", duration: 0.7 },
            0.1,
          )
          .to(
            "[data-admin-frame]",
            { scale: 1.05, y: -30, ease: "none", duration: 1 },
            1,
          );
        ScrollTrigger.create({
          trigger: "[data-pin='admin']",
          start: "top top",
          end: "+=220%",
          scrub: 1,
          pin: "[data-pin-content='admin']",
          anticipatePin: 1,
          animation: adminTl,
        });
      });

      // Mobile / tablet fallback — pins disabled, fade scenes on entry
      mm.add("(max-width: 1023px)", () => {
        const fadeTargets = root.querySelectorAll<HTMLElement>(
          "[data-plugin-copy], [data-plugin-frame], " +
            "[data-admin-copy], [data-admin-frame]",
        );
        fadeTargets.forEach((el) => {
          gsap.fromTo(
            el,
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                toggleActions: "play none none reverse",
              },
            },
          );
        });
        root.querySelectorAll<HTMLElement>("[data-stagger]").forEach((el) => {
          gsap.fromTo(
            el,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.6,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                toggleActions: "play none none reverse",
              },
            },
          );
        });

        const nonHero = root.querySelectorAll<HTMLElement>(
          "[data-scene]:not([data-scene='hero'])",
        );
        nonHero.forEach((scene) => {
          const items = scene.querySelectorAll<HTMLElement>(
            "h2, h3, h4, p, ul, ol, article",
          );
          items.forEach((el) => {
            gsap.fromTo(
              el,
              { y: 28, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.7,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: el,
                  start: "top 92%",
                  toggleActions: "play none none reverse",
                },
                overwrite: "auto",
              },
            );
          });
        });
      });

      // FINAL title
      gsap.fromTo(
        "[data-final-title]",
        { y: 80, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: {
            trigger: "[data-scene='final']",
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        },
      );

      // Scene tracker
      SCENE_IDS.forEach((id) => {
        ScrollTrigger.create({
          trigger: `[data-scene='${id}']`,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => {
            if (self.isActive) setActiveScene(id);
          },
        });
      });

      ScrollTrigger.refresh();
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    const t1 = window.setTimeout(refresh, 400);
    const t2 = window.setTimeout(refresh, 1500);
    window.addEventListener("load", refresh);
    const imgs = Array.from(root.querySelectorAll("img"));
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", refresh, { once: true });
    });

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return (
    <main ref={rootRef} className={styles.root}>
      {/* Ambient layers */}
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.beams} aria-hidden="true">
        <span className={styles.beam} />
        <span className={styles.beam} />
        <span className={styles.beam} />
        <span className={styles.beam} />
      </div>
      <Particles count={36} />

      {/* Progress rail */}
      <nav className={styles.rail} aria-label="Story progress">
        {SCENE_IDS.map((id) => (
          <span
            key={id}
            className={`${styles.railDot} ${activeScene === id ? styles.active : ""}`}
            aria-current={activeScene === id ? "step" : undefined}
          />
        ))}
      </nav>

      {/* ──────────── SCENE 1 — HERO ──────────── */}
      <section data-scene="hero" className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.kicker}>● Freelance · WordPress / WooCommerce</div>
          <HeroTitle text="STOREFRONTS" />
          <p className={styles.subtitle} data-hero-fade>
            Multiple WooCommerce builds. Theme, SEO, blog &amp; a custom verification plugin.
          </p>
          <p className={styles.desc} data-hero-fade>
            Two production WooCommerce stores delivered end-to-end — from a blank
            WordPress install to a tuned, indexed, content-rich shop. One of them
            ships with a bespoke WordPress plugin that gates restricted products
            behind DNI/NIE verification, GDPR-safe.
          </p>

          <div className={styles.heroButtons} data-hero-fade>
            <a
              href={LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cta}
            >
              <Icon name="external" size={16} />
              <span>Visit zeroshot.es</span>
              <span className={styles.ctaArrow}>
                <Icon name="arrow" size={16} />
              </span>
            </a>
            <a
              href={PLUGIN_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaGhost}
            >
              <Icon name="github" size={18} />
              <span>Plugin repo</span>
            </a>
          </div>

          <div ref={heroPreviewRef} className={styles.heroPreview}>
            <div ref={heroPreviewInnerRef} className={styles.heroPreviewInner}>
              <div className={styles.heroMockGrid}>
                <div className={styles.heroMockCard}>
                  <Icon name="store" size={28} />
                  <strong>From zero to live</strong>
                  <span>Hosting, WP setup, WooCommerce config, payments, shipping, taxes.</span>
                </div>
                <div className={`${styles.heroMockCard} ${styles.violet}`}>
                  <Icon name="seo" size={28} />
                  <strong>Technical SEO</strong>
                  <span>Schema, sitemaps, perf budgets, on-page tuning &amp; indexing.</span>
                </div>
                <div className={`${styles.heroMockCard} ${styles.green}`}>
                  <Icon name="shield" size={28} />
                  <strong>Custom plugin</strong>
                  <span>DNI/NIE gating, GDPR-safe, HPOS-compatible. Blocks &amp; classic checkout.</span>
                </div>
              </div>
              <span className={`${styles.hudCorner} ${styles.tl}`} />
              <span className={`${styles.hudCorner} ${styles.tr}`} />
              <span className={`${styles.hudCorner} ${styles.bl}`} />
              <span className={`${styles.hudCorner} ${styles.br}`} />
            </div>
          </div>
        </div>

        <div className={styles.scrollHint} aria-hidden="true">
          SCROLL TO ENTER
        </div>
      </section>

      {/* ──────────── SCENE 2 — ECOSYSTEM ──────────── */}
      <section data-scene="ecosystem" className={styles.ecosystem}>
        <div className={styles.ecosystemInner}>
          <span className={styles.sectionLabel}>02 / Builds</span>
          <h2 className={`${styles.h2} ${styles.fadeUp}`}>
            Two stores. Same playbook.
          </h2>
          <p className={`${styles.lead} ${styles.fadeUp}`}>
            Both sites started from an empty WordPress install. Same end-to-end
            playbook: provisioning, theme baseline, catalog modelling, checkout
            tuning, SEO foundation and a content engine. Only one is publicly
            linked here — the other ships behind a private NDA.
          </p>

          <div className={styles.ecosystemGrid}>
            <article className={`${styles.ecoCard} ${styles.fadeUp}`}>
              <div className={styles.ecoCardHead}>
                <Icon name="store" size={26} />
                <span className={styles.ecoTag}>Live</span>
              </div>
              <h3>zeroshot.es</h3>
              <p>
                WooCommerce store with the bespoke DNI/NIE verification plugin
                wired into checkout. Botiga theme, custom SEO and blog.
              </p>
              <a
                href={LIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ecoLink}
              >
                Visit site
                <Icon name="external" size={14} />
              </a>
            </article>

            <article className={`${styles.ecoCard} ${styles.violet} ${styles.fadeUp}`}>
              <div className={styles.ecoCardHead}>
                <Icon name="lock" size={26} />
                <span className={`${styles.ecoTag} ${styles.violet}`}>NDA</span>
              </div>
              <h3>Local retail #2</h3>
              <p>
                Same end-to-end build for a second local business. Cannot
                publicly link — same patterns, same stack, different vertical.
              </p>
              <span className={styles.ecoLinkMuted}>Reference on request</span>
            </article>

            <article className={`${styles.ecoCard} ${styles.green} ${styles.fadeUp}`}>
              <div className={styles.ecoCardHead}>
                <Icon name="code" size={26} />
                <span className={`${styles.ecoTag} ${styles.green}`}>OSS</span>
              </div>
              <h3>DNI/NIE plugin</h3>
              <p>
                Born inside zeroshot.es, extracted as a reusable WordPress
                plugin. GPL v2, GDPR-safe, HPOS-ready.
              </p>
              <a
                href={PLUGIN_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ecoLink}
              >
                GitHub
                <Icon name="github" size={14} />
              </a>
            </article>
          </div>
        </div>
      </section>

      {/* ──────────── SCENE 3 — CRAFT (theme/seo/blog) ──────────── */}
      <section data-scene="craft" className={styles.craft}>
        <div className={styles.craftInner}>
          <span className={`${styles.sectionLabel} ${styles.violet}`}>
            03 / Craft
          </span>
          <h2 className={`${styles.h2} ${styles.fadeUp}`}>
            Theme. SEO. Content.
          </h2>
          <p className={`${styles.lead} ${styles.fadeUp}`}>
            Where I spent most of the time wasn&apos;t the cart — it was making
            the store findable, fast and pleasant to read. Custom Botiga
            theming, a technical SEO pass and a maintained blog stack.
          </p>

          <div className={styles.craftGrid}>
            <article className={`${styles.craftCard} ${styles.fadeUp}`}>
              <div className={styles.craftIcon}>
                <Icon name="theme" size={28} />
              </div>
              <h4>Botiga theme tuning</h4>
              <ul>
                <li>Header / footer rebuild for brand identity</li>
                <li>Product card &amp; archive layout overrides</li>
                <li>Cart &amp; checkout polish — block + classic</li>
                <li>Typography, colour tokens, dark accents</li>
              </ul>
            </article>

            <article className={`${styles.craftCard} ${styles.violet} ${styles.fadeUp}`}>
              <div className={styles.craftIcon}>
                <Icon name="seo" size={28} />
              </div>
              <h4>Technical SEO</h4>
              <ul>
                <li>Schema.org product / breadcrumb / FAQ markup</li>
                <li>XML sitemaps, robots, canonical hygiene</li>
                <li>Core Web Vitals — image, font &amp; script budget</li>
                <li>On-page tuning per product category</li>
              </ul>
            </article>

            <article className={`${styles.craftCard} ${styles.green} ${styles.fadeUp}`}>
              <div className={styles.craftIcon}>
                <Icon name="blog" size={28} />
              </div>
              <h4>Blog engine</h4>
              <ul>
                <li>Editorial categories &amp; tag taxonomy</li>
                <li>Featured image / OG image pipeline</li>
                <li>Related-products embeds in posts</li>
                <li>Author / editorial workflow</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* ──────────── SCENE 4 — PLUGIN (pinned, image 1) ──────────── */}
      <section
        data-scene="plugin"
        data-pin="plugin"
        className={styles.pinWrap}
      >
        <div data-pin-content="plugin" className={styles.pinInner}>
          <div className={styles.splitInner}>
            <div data-plugin-copy className={styles.copy}>
              <span className={`${styles.sectionLabel} ${styles.violet}`}>
                04 / Custom Plugin
              </span>
              <h2 className={styles.h2} data-stagger>
                DNI/NIE gating at checkout.
              </h2>
              <p data-stagger>
                Some products in zeroshot.es can&apos;t be sold without
                verifying the buyer&apos;s identity. WooCommerce doesn&apos;t
                ship that — so I built it. A WordPress plugin that injects a
                required upload field into the checkout (classic <em>and</em>{" "}
                the new Blocks checkout) whenever the cart contains a flagged
                product.
              </p>

              <div className={styles.featureGrid} data-stagger>
                <div className={styles.feat}>
                  <Icon name="id" size={20} />
                  <strong>DNI / NIE upload</strong>
                  <span>JPG · PNG · WebP · PDF · up to 5MB</span>
                </div>
                <div className={styles.feat}>
                  <Icon name="upload" size={20} />
                  <strong>Drag &amp; drop</strong>
                  <span>Native file picker + DnD area</span>
                </div>
                <div className={styles.feat}>
                  <Icon name="cart" size={20} />
                  <strong>Cart-aware</strong>
                  <span>Field appears only when needed</span>
                </div>
                <div className={styles.feat}>
                  <Icon name="check" size={20} />
                  <strong>Verified once</strong>
                  <span>Saved per user — no re-uploads later</span>
                </div>
              </div>

              <div className={`${styles.callout} ${styles.violet}`} data-stagger>
                <strong>● Both checkouts supported</strong>
                Classic PHP hooks + a JS injector for WooCommerce Blocks. Same
                validation rules, one source of truth.
              </div>
            </div>

            <div
              ref={pluginFrameRef}
              data-plugin-frame
              className={styles.shotFrame}
            >
              <Image
                src="/woocomerces/dni_required_plugin.png"
                alt="DNI/NIE upload field injected into the WooCommerce checkout"
                width={1400}
                height={900}
                quality={92}
                sizes="(max-width: 1024px) 92vw, 50vw"
              />
              <span className={styles.scanline} aria-hidden="true" />
              <span className={styles.frameEdge} aria-hidden="true" />
              <span className={`${styles.hudCorner} ${styles.tl}`} />
              <span className={`${styles.hudCorner} ${styles.tr}`} />
              <span className={`${styles.hudCorner} ${styles.bl}`} />
              <span className={`${styles.hudCorner} ${styles.br}`} />
              <div className={styles.mockupBg} aria-hidden="true">
                <CheckoutMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── SCENE 5 — ADMIN VERIFICATION (pinned, image 2) ──────────── */}
      <section
        data-scene="admin"
        data-pin="admin"
        className={styles.pinWrap}
      >
        <div data-pin-content="admin" className={styles.pinInner}>
          <div className={`${styles.splitInner} ${styles.reverse}`}>
            <div data-admin-copy className={styles.copy}>
              <span className={`${styles.sectionLabel} ${styles.green}`}>
                05 / Admin Flow
              </span>
              <h2 className={styles.h2} data-stagger>
                Orders wait. Admin verifies. Done.
              </h2>
              <p data-stagger>
                Orders containing gated products land in{" "}
                <strong>On hold</strong> automatically. The order page gets a
                meta box rendering the uploaded document (image inline, PDF as
                download) with Verify / Reject actions. On verify, the order
                moves to Processing and the file is wiped from disk — GDPR by
                default.
              </p>

              <ol className={styles.flowList} data-stagger>
                <li>
                  <span className={styles.flowNum}>1</span>
                  <div>
                    <strong>Cart triggers field</strong>
                    <span>Customer uploads DNI + consents to GDPR clause.</span>
                  </div>
                </li>
                <li>
                  <span className={styles.flowNum}>2</span>
                  <div>
                    <strong>Order on hold</strong>
                    <span>Status auto-pauses until human review.</span>
                  </div>
                </li>
                <li>
                  <span className={styles.flowNum}>3</span>
                  <div>
                    <strong>Admin verifies</strong>
                    <span>Inline preview, one-click Verify or Reject.</span>
                  </div>
                </li>
                <li>
                  <span className={styles.flowNum}>4</span>
                  <div>
                    <strong>File auto-deleted</strong>
                    <span>Verified user flagged — no re-uploads, no stored doc.</span>
                  </div>
                </li>
              </ol>

              <div className={`${styles.callout} ${styles.green}`} data-stagger>
                <strong>● HPOS-compatible</strong>
                Built against WooCommerce&apos;s High-Performance Order Storage
                — works on both legacy posts and the new orders table.
              </div>
            </div>

            <div
              ref={adminFrameRef}
              data-admin-frame
              className={styles.shotFrame}
            >
              <Image
                src="/woocomerces/dni_user_verification.png"
                alt="WooCommerce order page showing DNI verification meta box with Verify / Reject actions"
                width={1400}
                height={900}
                quality={92}
                sizes="(max-width: 1024px) 92vw, 50vw"
              />
              <span className={styles.scanline} aria-hidden="true" />
              <span className={styles.frameEdge} aria-hidden="true" />
              <span className={`${styles.hudCorner} ${styles.tl}`} />
              <span className={`${styles.hudCorner} ${styles.tr}`} />
              <span className={`${styles.hudCorner} ${styles.bl}`} />
              <span className={`${styles.hudCorner} ${styles.br}`} />
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── SCENE 6 — SECURITY / GDPR ──────────── */}
      <section data-scene="security" className={styles.security}>
        <div className={styles.securityInner}>
          <div className={styles.copy}>
            <span className={`${styles.sectionLabel} ${styles.green}`}>
              06 / Security &amp; GDPR
            </span>
            <h2 className={`${styles.h2} ${styles.fadeUp}`}>
              Personal data, treated like it matters.
            </h2>
            <p className={`${styles.lead} ${styles.fadeUp}`}>
              The whole point of the plugin is handling ID documents —
              everything else flows from that. Files never live in a
              publicly-reachable path, only valid MIME types pass, consent is
              explicit, and verified docs are erased on the spot.
            </p>
            <div className={`${styles.callout} ${styles.green} ${styles.fadeUp}`}>
              <strong>● Defense in depth</strong>
              Uploads land outside the web root, served via an authenticated
              AJAX endpoint that re-checks admin caps on every request.
            </div>
          </div>

          <div className={styles.secGrid}>
            <div className={`${styles.secCard} ${styles.fadeUp}`}>
              <Icon name="lock" size={22} />
              <h5>Out of web root</h5>
              <p>
                Files stored under <code>/uploads</code> with a hard{" "}
                <code>.htaccess</code> deny — no direct URL access.
              </p>
            </div>
            <div className={`${styles.secCard} ${styles.fadeUp}`}>
              <Icon name="shield" size={22} />
              <h5>Strict validation</h5>
              <p>
                MIME + extension check, 5MB cap, executable types rejected,
                unique timestamped filenames.
              </p>
            </div>
            <div className={`${styles.secCard} ${styles.fadeUp}`}>
              <Icon name="gdpr" size={22} />
              <h5>Explicit consent</h5>
              <p>
                Customer must tick a GDPR clause before the upload field
                accepts a file. No tick, no submission.
              </p>
            </div>
            <div className={`${styles.secCard} ${styles.fadeUp}`}>
              <Icon name="trash" size={22} />
              <h5>Auto-erase on verify</h5>
              <p>
                On successful verification the file is physically deleted; only
                a boolean &ldquo;verified&rdquo; flag is kept on the user.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── SCENE 7 — STACK ──────────── */}
      <section data-scene="stack" className={styles.stack}>
        <div className={styles.stackInner}>
          <span className={`${styles.sectionLabel} ${styles.violet}`}>
            07 / Stack
          </span>
          <h2 className={`${styles.h2} ${styles.fadeUp}`}>Built on what works.</h2>
          <p className={`${styles.lead} ${styles.fadeUp}`} style={{ margin: "0 auto" }}>
            WordPress + WooCommerce as the platform, Botiga as the theme base,
            custom PHP for the verification layer. No bloated builder, no
            unnecessary plugins.
          </p>

          <div className={styles.stackGrid}>
            {[
              "WordPress",
              "WooCommerce",
              "PHP 7.4+",
              "Botiga Theme",
              "WC Blocks",
              "HPOS",
              "MySQL",
              "JavaScript",
              "AJAX",
              ".htaccess",
              "Schema.org",
              "GDPR",
            ].map((t) => (
              <div key={t} className={`${styles.stackChip} ${styles.fadeUp}`}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── SCENE 8 — FINAL ──────────── */}
      <section data-scene="final" className={styles.final}>
        <div className={styles.finalInner}>
          <div className={styles.finalKicker}>
            ● Status — Live in production · Plugin open source
          </div>
          <h2 data-final-title className={styles.finalTitle}>
            Ship the store.
          </h2>
          <p className={`${styles.finalSubtitle} ${styles.fadeUp}`}>
            These projects forced me to think like a shop owner first — what
            sells, what ranks, what the buyer trusts — then like an engineer.
            The plugin proves the second half: when WooCommerce stops short,
            you build the rest.
          </p>

          <div className={styles.finalCards}>
            <div className={`${styles.finalCard} ${styles.fadeUp}`}>
              <h5>Live store</h5>
              <p>
                zeroshot.es — full WooCommerce build, theme, SEO and DNI gating
                wired into checkout.
              </p>
            </div>
            <div className={`${styles.finalCard} ${styles.fadeUp}`}>
              <h5>Open source plugin</h5>
              <p>
                GPL v2 WordPress plugin. Drop in, configure flagged products,
                done.
              </p>
            </div>
            <div className={`${styles.finalCard} ${styles.fadeUp}`}>
              <h5>Same playbook</h5>
              <p>
                Reused across two local-business stores — provisioning to
                production in weeks, not months.
              </p>
            </div>
          </div>

          <div className={styles.ctaRow}>
            <a
              href={LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.cta} ${styles.fadeUp}`}
            >
              <Icon name="external" size={16} />
              <span>Visit zeroshot.es</span>
              <span className={styles.ctaArrow}>
                <Icon name="arrow" size={16} />
              </span>
            </a>
            <a
              href={PLUGIN_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.ctaGhost} ${styles.fadeUp}`}
            >
              <Icon name="github" size={18} />
              <span>Plugin repo</span>
            </a>
            <a href="/projects" className={`${styles.ctaGhost} ${styles.fadeUp}`}>
              <Icon name="code" size={18} />
              <span>All projects</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
