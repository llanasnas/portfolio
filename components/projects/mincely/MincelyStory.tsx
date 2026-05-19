"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "./MincelyStory.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SCENE_IDS = [
  "hero",
  "engine",
  "formats",
  "maker",
  "triptych",
  "macros",
  "stack",
  "final",
] as const;
type SceneId = (typeof SCENE_IDS)[number];

// ─────────────────────────────────────────────────────────────
// FULLSCREEN BUTTON
// ─────────────────────────────────────────────────────────────
function FullscreenBtn({
  targetRef,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
}) {
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = () => {
    const el = targetRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <button
      onClick={toggle}
      className={styles.fsBtn}
      aria-label={isFs ? "Exit fullscreen" : "Enter fullscreen"}
      title={isFs ? "Exit fullscreen" : "Fullscreen"}
    >
      {isFs ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 3v3a2 2 0 0 1-2 2H3" />
          <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
          <path d="M3 16h3a2 2 0 0 1 2 2v3" />
          <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7V3h4" />
          <path d="M21 7V3h-4" />
          <path d="M3 17v4h4" />
          <path d="M21 17v4h-4" />
        </svg>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// CYBERPUNK SVG ICONS
// ─────────────────────────────────────────────────────────────
function ChefHat({ className }: { className?: string }) {
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
        <linearGradient id="chefGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5ad7ff" />
          <stop offset="50%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#b87bff" />
        </linearGradient>
      </defs>
      <g stroke="url(#chefGrad)">
        {/* Hat body */}
        <path d="M25 56c-6 0-12-6-12-13s5-13 12-13c1-8 8-14 17-14 5 0 9 2 13 5 3-3 7-5 12-5 9 0 16 6 17 14 7 0 12 6 12 13s-6 13-12 13" />
        {/* Hat band */}
        <rect x="22" y="56" width="56" height="14" rx="2" />
        {/* Cyber circuit accents */}
        <path d="M30 70v8M50 70v8M70 70v8" />
        <circle cx="30" cy="80" r="2" />
        <circle cx="50" cy="80" r="2" />
        <circle cx="70" cy="80" r="2" />
        {/* Inner detail */}
        <path d="M34 56v-6M50 56v-12M66 56v-6" opacity="0.5" />
      </g>
    </svg>
  );
}

function CodeBraces({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" />
      <path d="M16 21h1a2 2 0 0 0 2-2v-5a2 2 0 0 1 2-2 2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1" />
    </svg>
  );
}

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-1.96c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.51-1.47.11-3.07 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.21-1.49 3.18-1.18 3.18-1.18.62 1.6.23 2.78.11 3.07.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.68.79.56 4.57-1.52 7.86-5.83 7.86-10.91C23.5 5.74 18.27.5 12 .5z" />
    </svg>
  );
}

function FormatIcon({
  variant,
}: {
  variant: "text" | "docx" | "image" | "youtube";
}) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (variant === "text")
    return (
      <svg {...common}>
        <path d="M4 7h16" />
        <path d="M4 12h12" />
        <path d="M4 17h16" />
        <circle cx="20" cy="12" r="0.8" fill="currentColor" />
      </svg>
    );
  if (variant === "docx")
    return (
      <svg {...common}>
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <path d="M14 3v6h6" />
        <path d="M8 13h8M8 17h5" />
      </svg>
    );
  if (variant === "image")
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="2.5" y="6" width="19" height="12" rx="3" />
      <path d="m11 9 5 3-5 3z" fill="currentColor" />
    </svg>
  );
}

function ProviderIcon({
  variant,
}: {
  variant: "anthropic" | "openai" | "ollama";
}) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (variant === "anthropic")
    return (
      <svg {...common}>
        <path d="M12 3 4 21h4l1.5-4h5L16 21h4Z" />
        <path d="m10 13 2-5 2 5z" fill="currentColor" stroke="none" />
      </svg>
    );
  if (variant === "openai")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4 18.4 5.6" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="9" cy="10" r="3" />
      <circle cx="15" cy="10" r="3" />
      <path d="M5 18c0-2.5 3-4 7-4s7 1.5 7 4" />
      <path d="M3 13c1-3 4-5 9-5s8 2 9 5" />
    </svg>
  );
}

function ArrowRight({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// HERO TITLE
// ─────────────────────────────────────────────────────────────
function HeroTitle({ text }: { text: string }) {
  return (
    <div>
      <ChefHat className={styles.brandIcon} />
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

const GITHUB_URL = "https://github.com/llanasnas/Mincelly";

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function MincelyStory() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroPreviewRef = useRef<HTMLDivElement | null>(null);
  const heroPreviewInnerRef = useRef<HTMLDivElement | null>(null);
  const engineVideoRef = useRef<HTMLVideoElement | null>(null);
  const engineFrameRef = useRef<HTMLDivElement | null>(null);
  const makerVideoRef = useRef<HTMLVideoElement | null>(null);
  const makerFrameRef = useRef<HTMLDivElement | null>(null);
  const [activeScene, setActiveScene] = useState<SceneId>("hero");
  const [activePanel, setActivePanel] = useState<0 | 1 | 2>(0);

  // Lenis + GSAP
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

  // Hero mouse parallax
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
      tx = x * 8;
      ty = y * 8;
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
        gsap.set(heroPreviewRef.current, { y: 120, opacity: 0, scale: 0.9 });
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

      // HERO parallax (no fade)
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

      // ── generic fadeUp / fadeIn entries
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

      // ── PINNED / SCRUBBED SCENES — desktop only
      // (mobile flows naturally; CSS resets pin containers)
      mm.add("(min-width: 1024px)", () => {
        // ENGINE pinned scene
        const engineTl = gsap.timeline();
        engineTl
          .fromTo(
            "[data-engine-video]",
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
            "[data-engine-copy] [data-stagger]",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, ease: "none", duration: 0.7 },
            0.1,
          )
          .to(
            "[data-engine-video]",
            { scale: 1.06, y: -40, ease: "none", duration: 1 },
            1,
          );
        ScrollTrigger.create({
          trigger: "[data-pin='engine']",
          start: "top top",
          end: "+=220%",
          scrub: 1,
          pin: "[data-pin-content='engine']",
          anticipatePin: 1,
          animation: engineTl,
        });

        // FORMATS pinned scene
        const formatsTl = gsap.timeline();
        formatsTl
          .fromTo(
            "[data-formats-frame]",
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
            "[data-formats-copy] [data-stagger]",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, ease: "none", duration: 0.7 },
            0.1,
          )
          .to(
            "[data-formats-frame]",
            { scale: 1.06, y: -40, ease: "none", duration: 1 },
            1,
          );
        ScrollTrigger.create({
          trigger: "[data-pin='formats']",
          start: "top top",
          end: "+=220%",
          scrub: 1,
          pin: "[data-pin-content='formats']",
          anticipatePin: 1,
          animation: formatsTl,
        });

        // MAKER pinned scene
        const makerTl = gsap.timeline();
        makerTl
          .fromTo(
            "[data-maker-frame]",
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
            "[data-maker-copy] [data-stagger]",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, ease: "none", duration: 0.7 },
            0.1,
          )
          .to(
            "[data-maker-frame]",
            { scale: 1.06, y: -40, ease: "none", duration: 1 },
            1,
          );
        ScrollTrigger.create({
          trigger: "[data-pin='maker']",
          start: "top top",
          end: "+=220%",
          scrub: 1,
          pin: "[data-pin-content='maker']",
          anticipatePin: 1,
          animation: makerTl,
        });

        // TRIPTYCH stacked cards pin
        const panels = gsap.utils.toArray<HTMLElement>("[data-recipe-panel]");
        if (panels.length === 3) {
          gsap.set(panels[0], { xPercent: -50, yPercent: -50, y: 0, scale: 1, opacity: 1, rotateY: 0, zIndex: 3 });
          gsap.set(panels[1], { xPercent: -50, yPercent: -50, y: 80, scale: 0.9, opacity: 0, rotateY: -10, zIndex: 2 });
          gsap.set(panels[2], { xPercent: -50, yPercent: -50, y: 160, scale: 0.82, opacity: 0, rotateY: -14, zIndex: 1 });

          const triTl = gsap.timeline();
          triTl
            .to(panels[0], { y: -80, scale: 0.9, opacity: 0, rotateY: 10, ease: "none" }, 0)
            .to(panels[1], { y: 0, scale: 1, opacity: 1, rotateY: 0, ease: "none" }, 0)
            .to(panels[2], { y: 80, scale: 0.9, opacity: 0.6, rotateY: -10, ease: "none" }, 0)
            .to(panels[1], { y: -80, scale: 0.9, opacity: 0, rotateY: 10, ease: "none" }, 1)
            .to(panels[2], { y: 0, scale: 1, opacity: 1, rotateY: 0, ease: "none" }, 1);

          ScrollTrigger.create({
            trigger: "[data-pin='triptych']",
            start: "top top",
            end: "+=280%",
            scrub: 1,
            pin: "[data-pin-content='triptych']",
            anticipatePin: 1,
            animation: triTl,
            onUpdate: (self) => {
              const p = self.progress;
              if (p < 0.34) setActivePanel(0);
              else if (p < 0.67) setActivePanel(1);
              else setActivePanel(2);
            },
          });
        }
      });

      // Mobile / tablet fallback — pins disabled, fade scenes on entry
      mm.add("(max-width: 1023px)", () => {
        const fadeTargets = root.querySelectorAll<HTMLElement>(
          "[data-engine-copy], [data-engine-video], " +
            "[data-formats-copy], [data-formats-frame], " +
            "[data-maker-copy], [data-maker-frame], " +
            "[data-recipe-panel]",
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

      // ── MACROS bars fill
      gsap.utils.toArray<HTMLElement>("[data-macro-bar]").forEach((bar) => {
        const target = bar.dataset.target || "50";
        gsap.fromTo(
          bar,
          { ["--w" as string]: "0%" },
          {
            ["--w" as string]: `${target}%`,
            duration: 1.4,
            ease: "expo.out",
            scrollTrigger: {
              trigger: bar,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      // ── FINAL title
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

      // ── Scene tracker
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

  // Video autoplay on visible
  useEffect(() => {
    const observe = (vid: HTMLVideoElement | null) => {
      if (!vid) return () => {};
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) vid.play().catch(() => {});
            else vid.pause();
          });
        },
        { threshold: 0.25 },
      );
      io.observe(vid);
      return () => io.disconnect();
    };
    const a = observe(engineVideoRef.current);
    const b = observe(makerVideoRef.current);
    return () => {
      a();
      b();
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
          <div className={styles.kicker}>● In Development · Open Source</div>
          <HeroTitle text="MINCELY" />
          <p className={styles.subtitle} data-hero-fade>
            Recipe Intelligence Engine.
          </p>
          <p className={styles.desc} data-hero-fade>
            Turn any recipe — pasted text, a Word document, a photo, or a
            YouTube video — into structured data with ingredients, steps,
            categories and nutrition macros. In seconds.
          </p>

          <div className={styles.heroButtons} data-hero-fade>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.cta}
            >
              <GithubIcon size={18} />
              <span>View on GitHub</span>
              <span className={styles.ctaArrow}>
                <ArrowRight size={16} />
              </span>
            </a>
            <a href="#engine" className={styles.ctaGhost}>
              <CodeBraces size={18} />
              <span>How it works</span>
            </a>
          </div>

          <div ref={heroPreviewRef} className={styles.heroPreview}>
            <div ref={heroPreviewInnerRef} className={styles.heroPreviewInner}>
              <Image
                src="/mincely/recetas_list.png"
                alt="Mincely recipe library"
                width={2200}
                height={1300}
                priority
                quality={92}
                sizes="(max-width: 1100px) 92vw, 1100px"
              />
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

      {/* ──────────── SCENE 2 — AI ENGINE (video) ──────────── */}
      <section
        id="engine"
        data-scene="engine"
        data-pin="engine"
        className={styles.engineWrap}
      >
        <div data-pin-content="engine" className={styles.enginePin}>
          <div className={styles.engineLayout}>
            <div data-engine-copy>
              <span className={styles.sectionLabel}>02 / AI Engine</span>
              <h2 className={styles.h2} data-stagger>
                From raw input to structured recipe.
              </h2>
              <p className={styles.lead} data-stagger>
                Drop in any source. The AI extracts the title, ingredients,
                steps, categories and nutrition macros — then surfaces every
                field for review with inline warnings on anything it&apos;s
                unsure about. You stay in control.
              </p>

              <ul className={styles.featureList}>
                <li data-stagger>Multi-provider routing — Anthropic, OpenAI, Ollama</li>
                <li data-stagger>Live editing of generated data before saving</li>
                <li data-stagger>Inline warnings on low-confidence fields</li>
                <li data-stagger>USDA-backed nutrition with LLM fallback</li>
              </ul>

              <div data-stagger className={styles.providers}>
                <div className={styles.provider}>
                  <ProviderIcon variant="anthropic" />
                  <strong>Anthropic</strong>
                  <span>Claude Haiku 4.5 — fast &amp; accurate</span>
                </div>
                <div className={`${styles.provider} ${styles.violet}`}>
                  <ProviderIcon variant="openai" />
                  <strong>OpenAI</strong>
                  <span>GPT-4o-mini — broad model coverage</span>
                </div>
                <div className={`${styles.provider} ${styles.green}`}>
                  <ProviderIcon variant="ollama" />
                  <strong>Ollama</strong>
                  <span>Local / offline — no API key required</span>
                </div>
              </div>

              <div className={styles.warnCard} data-stagger>
                <strong>● Heuristic mode</strong>
                Set `LLM_PROVIDER=none` to fall back to the built-in heuristic
                parser. Works on plain-text recipes with `Ingredientes` /
                `Preparación` sections — no API key, no model required.
              </div>
            </div>

            <div
              ref={engineFrameRef}
              data-engine-video
              className={styles.videoFrame}
            >
              <video
                ref={engineVideoRef}
                src="/mincely/pre-create-receta.mp4"
                muted
                playsInline
                loop
                preload="metadata"
              />
              <FullscreenBtn targetRef={engineFrameRef} />
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

      {/* ──────────── SCENE 3 — FORMATS ──────────── */}
      <section
        data-scene="formats"
        data-pin="formats"
        className={styles.splitWrap}
      >
        <div data-pin-content="formats" className={styles.splitPin}>
          <div className={styles.splitInner}>
            <div data-formats-copy className={styles.copy}>
              <span className={`${styles.sectionLabel} ${styles.violet}`}>
                03 / Import
              </span>
              <h2 className={styles.h2} data-stagger>
                Any source. One pipeline.
              </h2>
              <p data-stagger>
                Mincely accepts the messy reality of how recipes actually live:
                pasted text, screenshots, a Word document your aunt emailed, or
                a YouTube cooking video. One pipeline, one structured output.
              </p>

              <div className={styles.formats} data-stagger>
                <div className={styles.format}>
                  <FormatIcon variant="text" />
                  <strong>Plain text</strong>
                  <span>Paste &amp; parse</span>
                </div>
                <div className={styles.format}>
                  <FormatIcon variant="docx" />
                  <strong>.docx</strong>
                  <span>Word documents</span>
                </div>
                <div className={styles.format}>
                  <FormatIcon variant="image" />
                  <strong>Image</strong>
                  <span>JPG · PNG · WebP</span>
                </div>
                <div className={styles.format}>
                  <FormatIcon variant="youtube" />
                  <strong>YouTube</strong>
                  <span>From URL</span>
                </div>
              </div>

              <div className={`${styles.callout} ${styles.violet}`} data-stagger>
                <strong>● Vision pipeline</strong>
                Image inputs flow through a vision model (or Tesseract + local
                LLM in Ollama mode) before structured extraction.
              </div>
            </div>

            <div
              data-formats-frame
              className={styles.shotFrame}
              style={
                {
                  ["--shotGlow" as keyof React.CSSProperties as string]:
                    "rgba(184, 123, 255, 0.35)",
                } as React.CSSProperties
              }
            >
              <Image
                src="/mincely/recetas_maker.png"
                alt="Mincely recipe maker"
                width={2000}
                height={1250}
                quality={92}
                sizes="(max-width: 1024px) 92vw, 48vw"
              />
              <span className={styles.shotGlow} aria-hidden="true" />
              <span className={`${styles.hudCorner} ${styles.tl}`} />
              <span className={`${styles.hudCorner} ${styles.br}`} />
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── SCENE 4 — RECIPE MAKER / EDIT ──────────── */}
      <section
        data-scene="maker"
        data-pin="maker"
        className={styles.splitWrap}
      >
        <div data-pin-content="maker" className={styles.splitPin}>
          <div className={`${styles.splitInner} ${styles.reverse} ${styles.wideImg}`}>
            <div data-maker-copy className={styles.copy}>
              <span className={`${styles.sectionLabel} ${styles.green}`}>
                04 / Edit &amp; Review
              </span>
              <h2 className={styles.h2} data-stagger>
                You stay in the loop.
              </h2>
              <p data-stagger>
                Every field generated by the AI is editable before you save.
                Mincely surfaces low-confidence fields with inline warnings, so
                you know exactly where to double-check.
              </p>
              <p data-stagger>
                Categories and ingredients are auto-detected and chip-tagged —
                add, remove or rename in one click. Full preview, full edit,
                full ownership of the data.
              </p>

              <div className={styles.tags} data-stagger>
                <span className={styles.tag}>Inline warnings</span>
                <span className={styles.tag}>Live preview</span>
                <span className={styles.tag}>Zod-validated</span>
                <span className={styles.tag}>Categories</span>
              </div>
            </div>

            <div
              ref={makerFrameRef}
              data-maker-frame
              className={styles.videoFrame}
            >
              <video
                ref={makerVideoRef}
                src="/mincely/pre-create-receta.mp4"
                muted
                playsInline
                loop
                preload="metadata"
              />
              <FullscreenBtn targetRef={makerFrameRef} />
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

      {/* ──────────── SCENE 5 — TRIPTYCH (recipe detail) ──────────── */}
      <section
        data-scene="triptych"
        data-pin="triptych"
        className={styles.triptychWrap}
      >
        <div data-pin-content="triptych" className={styles.triptychPin}>
          <div className={styles.triptychStage}>
            <div className={styles.triptychCopy}>
              <span className={styles.sectionLabel}>05 / Recipe Detail</span>
              <h2 className={styles.h2}>
                Every recipe, fully readable.
              </h2>
              <p className={styles.lead}>
                Each saved recipe gets a clean, structured detail page —
                ingredients, step-by-step preparation, macros, and source
                metadata. Scroll to walk through the three views.
              </p>
              <ul className={styles.featureList}>
                <li>Ingredients with USDA-backed quantities</li>
                <li>Numbered preparation steps</li>
                <li>Nutrition macros + per-serving breakdown</li>
                <li>One-click PDF export of the full page</li>
              </ul>

              <div className={styles.triptychProgress} aria-hidden="true">
                <span className={activePanel >= 0 ? styles.active : ""} />
                <span className={activePanel >= 1 ? styles.active : ""} />
                <span className={activePanel >= 2 ? styles.active : ""} />
              </div>
            </div>

            <div className={styles.triptychPanels}>
              {[
                {
                  src: "/mincely/receipt_view.png",
                  tag: "01 · Header & ingredients",
                  alt: "Recipe header and ingredient list",
                },
                {
                  src: "/mincely/receipt_view_2.png",
                  tag: "02 · Preparation steps",
                  alt: "Recipe preparation steps",
                },
                {
                  src: "/mincely/receipt_view_3.png",
                  tag: "03 · Macros & export",
                  alt: "Recipe nutrition macros and PDF export",
                },
              ].map((p, i) => (
                <div
                  key={p.src}
                  data-recipe-panel
                  className={styles.recipePanel}
                >
                  <span className={styles.panelTag}>{p.tag}</span>
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={1600}
                    height={2200}
                    quality={92}
                    sizes="(max-width: 1024px) 92vw, 720px"
                    priority={i === 0}
                  />
                  <span className={styles.frameEdge} aria-hidden="true" />
                  <span className={`${styles.hudCorner} ${styles.tl}`} />
                  <span className={`${styles.hudCorner} ${styles.br}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── SCENE 6 — MACROS ──────────── */}
      <section data-scene="macros" className={styles.macrosScene}>
        <div className={styles.macrosInner}>
          <div className={styles.copy}>
            <span className={`${styles.sectionLabel} ${styles.green}`}>
              06 / Nutrition
            </span>
            <h2 className={`${styles.h2} ${styles.fadeUp}`}>
              Real macros, from real data.
            </h2>
            <p className={styles.fadeUp}>
              Mincely queries the USDA FoodData Central API to compute calories,
              protein, carbs and fat per ingredient — then aggregates per
              recipe and per serving.
            </p>
            <p className={styles.fadeUp}>
              When USDA has no match, the LLM steps in with a structured
              fallback. You always see which fields came from USDA and which
              are AI-estimated.
            </p>
            <div className={`${styles.callout} ${styles.green} ${styles.fadeUp}`}>
              <strong>● Quantity parser</strong>
              A custom unit parser converts &ldquo;2 cups flour&rdquo; or
              &ldquo;300 g chicken&rdquo; into normalized grams before macro
              calculation.
            </div>
          </div>

          <div className={`${styles.macroPanel} ${styles.fadeUp}`}>
            <div className={styles.macroHeader}>
              <span>● Macros · per serving</span>
              <span>USDA + LLM</span>
            </div>
            <div className={styles.macroRow}>
              <b>Calories</b>
              <span
                data-macro-bar
                data-target="78"
                className={styles.macroBar}
                style={
                  {
                    ["--barColor" as string]:
                      "linear-gradient(90deg, var(--accent-cyan), var(--success))",
                    ["--barGlow" as string]: "rgba(90, 215, 255, 0.5)",
                  } as React.CSSProperties
                }
              />
              <em>624 kcal</em>
            </div>
            <div className={styles.macroRow}>
              <b>Protein</b>
              <span
                data-macro-bar
                data-target="64"
                className={styles.macroBar}
                style={
                  {
                    ["--barColor" as string]:
                      "linear-gradient(90deg, var(--success), var(--accent-cyan))",
                    ["--barGlow" as string]: "rgba(74, 222, 128, 0.5)",
                  } as React.CSSProperties
                }
              />
              <em>42 g</em>
            </div>
            <div className={styles.macroRow}>
              <b>Carbs</b>
              <span
                data-macro-bar
                data-target="48"
                className={styles.macroBar}
                style={
                  {
                    ["--barColor" as string]:
                      "linear-gradient(90deg, var(--accent-violet), var(--accent-blue))",
                    ["--barGlow" as string]: "rgba(184, 123, 255, 0.5)",
                  } as React.CSSProperties
                }
              />
              <em>58 g</em>
            </div>
            <div className={styles.macroRow}>
              <b>Fat</b>
              <span
                data-macro-bar
                data-target="36"
                className={styles.macroBar}
                style={
                  {
                    ["--barColor" as string]:
                      "linear-gradient(90deg, var(--warning), var(--accent-violet))",
                    ["--barGlow" as string]: "rgba(251, 191, 36, 0.5)",
                  } as React.CSSProperties
                }
              />
              <em>22 g</em>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── SCENE 7 — TECH STACK ──────────── */}
      <section data-scene="stack" className={styles.stack}>
        <div className={styles.stackInner}>
          <span className={`${styles.sectionLabel} ${styles.violet}`}>
            07 / Stack
          </span>
          <h2 className={`${styles.h2} ${styles.fadeUp}`}>Built modern.</h2>
          <p className={`${styles.lead} ${styles.fadeUp}`} style={{ margin: "0 auto" }}>
            Production-grade architecture from day one — strict typing,
            schema-first validation, multi-provider AI abstraction, edge-ready
            database.
          </p>

          <div className={styles.stackGrid}>
            {[
              "Next.js 15",
              "TypeScript",
              "Tailwind v4",
              "shadcn/ui",
              "Framer Motion",
              "Neon Postgres",
              "Anthropic",
              "OpenAI",
              "Ollama",
              "USDA API",
              "Cloudinary",
              "Zod 4",
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
            ● Status — In Development · MVP shipped
          </div>
          <h2 data-final-title className={styles.finalTitle}>
            Cook smarter.
          </h2>
          <p className={`${styles.finalSubtitle} ${styles.fadeUp}`}>
            Mincely started as a way to organize my father&apos;s recipes — it
            grew into a production-grade AI playground for prompt engineering,
            multi-provider routing, secure API design and a polished UI. Still
            evolving, fully open source.
          </p>

          <div className={styles.finalCards}>
            <div className={`${styles.finalCard} ${styles.fadeUp}`}>
              <h5>Open Source</h5>
              <p>MIT-licensed. Fork it, extend it, run it locally.</p>
            </div>
            <div className={`${styles.finalCard} ${styles.fadeUp}`}>
              <h5>Roadmap</h5>
              <p>
                Auth (Better Auth), Langfuse observability, pgvector recipe
                search, TikTok / Instagram import.
              </p>
            </div>
            <div className={`${styles.finalCard} ${styles.fadeUp}`}>
              <h5>MVP-only</h5>
              <p>
                Anthropic in prod. OpenAI / Ollama wired but not yet
                deployed.
              </p>
            </div>
          </div>

          <div className={styles.ctaRow}>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.cta} ${styles.fadeUp}`}
            >
              <GithubIcon size={18} />
              <span>Open on GitHub</span>
              <span className={styles.ctaArrow}>
                <ArrowRight size={16} />
              </span>
            </a>
            <a
              href="/projects"
              className={`${styles.ctaGhost} ${styles.fadeUp}`}
            >
              <CodeBraces size={18} />
              <span>All projects</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
