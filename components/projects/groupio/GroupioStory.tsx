"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "./GroupioStory.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SCENE_IDS = [
  "hero",
  "scanner",
  "dashboard",
  "expense",
  "rotating",
  "calendar",
  "social",
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
        // Compress icon
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
        // Expand icon
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
// HERO TITLE
// ─────────────────────────────────────────────────────────────
function HeroTitle({ text }: { text: string }) {
  return (
    <div>
      <img
        src="/groupio/groupio.png"
        alt="Groupio logo"
        className={styles.logo}
      />
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
// deterministic pseudo-random from index — keeps render pure
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function Particles({ count = 28 }: { count?: number }) {
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
// MAIN
// ─────────────────────────────────────────────────────────────
export default function GroupioStory() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroPreviewRef = useRef<HTMLDivElement | null>(null);
  const heroPreviewInnerRef = useRef<HTMLDivElement | null>(null);
  const scannerVideoRef = useRef<HTMLVideoElement | null>(null);
  const dashboardVideoRef = useRef<HTMLVideoElement | null>(null);
  const scannerFrameRef = useRef<HTMLDivElement | null>(null);
  const dashFrameRef = useRef<HTMLDivElement | null>(null);
  const [activeScene, setActiveScene] = useState<SceneId>("hero");

  // Lenis + GSAP integration
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

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

  // Hero parallax (mouse) — preview tilts subtly
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;
    const el = heroPreviewInnerRef.current;
    if (!el) return;

    let rx = 0;
    let ry = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;

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

      // ─────────────────────────────────────────────
      // HERO INTRO
      // ─────────────────────────────────────────────
      const letters = gsap.utils.toArray<HTMLElement>("[data-letter]");
      if (!reduce) {
        gsap.set(letters, { y: 120, opacity: 0 });
        gsap.set("[data-hero-fade]", { y: 40, opacity: 0 });
        gsap.set(heroPreviewRef.current, { y: 120, opacity: 0, scale: 0.9 });

        const introTl = gsap.timeline({ defaults: { ease: "expo.out" } });

        introTl
          .to(letters, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.045,
          })
          .to(
            "[data-hero-fade]",
            {
              y: 0,
              opacity: 1,
              duration: 1,
              stagger: 0.12,
            },
            "-=0.6",
          )
          .to(
            heroPreviewRef.current,
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 1.3,
            },
            "-=0.7",
          );
      } else {
        gsap.set([letters, "[data-hero-fade]", heroPreviewRef.current], {
          y: 0,
          opacity: 1,
          scale: 1,
        });
      }

      // HERO scroll parallax — gentle lift, NO fade-out (content stays readable)
      const heroTl = gsap.timeline({ defaults: { ease: "none" } });

      heroTl
        .to(
          heroPreviewRef.current,
          { y: -80, scale: 1.04, duration: 1, immediateRender: false },
          0,
        )
        .to(
          "[data-hero-fade]",
          { y: -30, duration: 1, immediateRender: false },
          0,
        )
        .to(
          "[data-letter]",
          { y: -50, duration: 1, immediateRender: false },
          0,
        );

      ScrollTrigger.create({
        trigger: "[data-scene='hero']",
        start: "top top",
        end: "+=80%",
        scrub: 1,
        animation: heroTl,
      });

      // ─────────────────────────────────────────────
      // PINNED / SCRUBBED SCENES — desktop only
      // (mobile flows naturally; CSS resets pin containers)
      // ─────────────────────────────────────────────
      mm.add("(min-width: 1024px)", () => {
        // SCANNER SCENE
        const scannerTl = gsap.timeline();
        scannerTl
          .fromTo(
            "[data-scanner-video]",
            { scale: 0.72, opacity: 0, rotateX: 8, filter: "blur(10px)" },
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
            "[data-scanner-copy] [data-stagger]",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, ease: "none", duration: 0.7 },
            0.1,
          )
          .to(
            "[data-scanner-video]",
            { scale: 1.08, y: -60, ease: "none", duration: 1 },
            1,
          );

        ScrollTrigger.create({
          trigger: "[data-pin='scanner']",
          start: "top top",
          end: "+=220%",
          scrub: 1,
          pin: "[data-pin-content='scanner']",
          anticipatePin: 1,
          animation: scannerTl,
        });

        // DASHBOARD SCENE
        const dashboardTl = gsap.timeline();
        dashboardTl
          .fromTo(
            "[data-dash-video]",
            { scale: 0.78, opacity: 0, rotateX: 10, y: 120 },
            {
              scale: 1,
              opacity: 1,
              rotateX: 0,
              y: 0,
              ease: "none",
              duration: 1,
            },
          )
          .fromTo(
            "[data-dash-copy] [data-stagger]",
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, ease: "none", duration: 0.7 },
            0,
          )
          .to(
            "[data-dash-video]",
            { scale: 1.06, y: -50, ease: "none", duration: 1 },
            1,
          );

        ScrollTrigger.create({
          trigger: "[data-pin='dashboard']",
          start: "top top",
          end: "+=220%",
          scrub: 1,
          pin: "[data-pin-content='dashboard']",
          anticipatePin: 1,
          animation: dashboardTl,
        });

        // SPLIT SCENES — expense / rotating / calendar / social
        gsap.utils
          .toArray<HTMLElement>(
            "[data-scene='expense'], [data-scene='rotating'], [data-scene='calendar'], [data-scene='social']",
          )
          .forEach((section) => {
            const frame = section.querySelector("[data-split-frame]");
            const fadeEls = section.querySelectorAll(`.${styles.fadeUp}`);
            const tags = section.querySelectorAll(`.${styles.tag}`);

            const tl = gsap.timeline();

            tl.fromTo(
              frame,
              {
                scale: 0.72,
                opacity: 0,
                rotateX: 10,
                y: 120,
                filter: "blur(10px)",
              },
              {
                scale: 1,
                opacity: 1,
                rotateX: 0,
                y: 0,
                filter: "blur(0px)",
                ease: "none",
                duration: 1,
              },
            )
              .fromTo(
                fadeEls,
                { y: 50, opacity: 0 },
                {
                  y: 0,
                  opacity: 1,
                  stagger: 0.14,
                  ease: "none",
                  duration: 0.8,
                },
                0.05,
              )
              .fromTo(
                tags,
                { opacity: 0, y: 20, scale: 0.9 },
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  stagger: 0.06,
                  ease: "none",
                  duration: 0.4,
                },
                0.3,
              )
              .to(
                frame,
                { scale: 1.05, y: -80, ease: "none", duration: 1 },
                1,
              );

            ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: "+=180%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              animation: tl,
            });
          });

        // FINAL SECTION
        const finalTl = gsap.timeline();
        finalTl
          .fromTo(
            "[data-final-title]",
            { y: 120, opacity: 0, scale: 0.85 },
            { y: 0, opacity: 1, scale: 1, ease: "none", duration: 1 },
          )
          .fromTo(
            `.${styles.finalSubtitle}`,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, ease: "none", duration: 0.6 },
            0.2,
          )
          .fromTo(
            `.${styles.finalCard}`,
            { y: 40, opacity: 0, scale: 0.9 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              stagger: 0.12,
              ease: "none",
              duration: 0.6,
            },
            0.4,
          )
          .fromTo(
            [`.${styles.cta}`, `.${styles.cta_simulation}`],
            { opacity: 0, y: 30, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              stagger: 0.1,
              ease: "none",
              duration: 0.5,
            },
            0.8,
          );

        ScrollTrigger.create({
          trigger: "[data-scene='final']",
          start: "top top",
          end: "+=160%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          animation: finalTl,
        });
      });

      // Mobile / tablet fallback — pins disabled, fade scenes on entry
      mm.add("(max-width: 1023px)", () => {
        const fadeTargets = root.querySelectorAll<HTMLElement>(
          "[data-scanner-copy], [data-scanner-frame], " +
            "[data-dash-copy], [data-dash-frame], " +
            "[data-split-frame], [data-final-title]",
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

      // ─────────────────────────────────────────────
      // ACTIVE SCENE TRACKER
      // ─────────────────────────────────────────────
      SCENE_IDS.forEach((id) => {
        ScrollTrigger.create({
          trigger: `[data-scene='${id}']`,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) {
              setActiveScene(id);
            }
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

  // Autoplay videos when in view (perf + reliability)
  useEffect(() => {
    const playWhenVisible = (vid: HTMLVideoElement | null) => {
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
    const a = playWhenVisible(scannerVideoRef.current);
    const b = playWhenVisible(dashboardVideoRef.current);
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

      {/* ────────── SCENE 1 — HERO ────────── */}
      <section data-scene="hero" className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.kicker}>Live · Free · Beta features</div>
          <HeroTitle text="GROUPIO" />
          <p className={styles.subtitle} data-hero-fade>
            The collaborative living system.
          </p>
          <p className={styles.desc} data-hero-fade>
            Expenses, recurring tasks, AI receipt scanning, dashboards and
            shared organization — all in one place.
          </p>

          <div ref={heroPreviewRef} className={styles.heroPreview}>
            <div ref={heroPreviewInnerRef} className={styles.heroPreviewInner}>
              <Image
                src="/groupio/groupio_dashboard.png"
                alt="Groupio dashboard preview"
                width={2200}
                height={1300}
                priority
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

      {/* ────────── SCENE 2 — AI RECEIPT SCANNING ────────── */}
      <section
        data-scene="scanner"
        data-pin="scanner"
        className={styles.scannerWrap}
      >
        <div data-pin-content="scanner" className={styles.scannerPin}>
          <div className={styles.scannerLayout}>
            <div data-scanner-copy className={styles.scannerCopy}>
              <span className={styles.sectionLabel}>02 / Vision</span>
              <h2 className={styles.h2} data-stagger>
                AI-powered receipt scanning.
              </h2>
              <p className={styles.lead} data-stagger>
                Point your camera at any receipt. Groupio extracts items, prices
                and totals — then turns them into shared expenses, split between
                the right people automatically.
              </p>

              <ul className={styles.featureList}>
                <li data-stagger>Automatic OCR &amp; text extraction</li>
                <li data-stagger>Item-by-item line parsing</li>
                <li data-stagger>Auto-generated expenses</li>
                <li data-stagger>Smart shared cost splitting</li>
              </ul>

              <div className={styles.betaCard} data-stagger>
                <strong>● Beta — bring your own key</strong>
                Scanner is currently in beta. Plug in your own OpenAI API key —
                you pay only your own usage, no markup. A free Cerebras mode is
                available out of the box.
              </div>

              <div className={styles.modes} data-stagger>
                <div className={styles.mode}>
                  <h4>OpenAI mode</h4>
                  <p>
                    Vision model reads the image directly. Best accuracy across
                    fonts, layouts and lighting.
                  </p>
                  <ul>
                    <li>True image understanding</li>
                    <li>Robust with noisy photos</li>
                    <li>You pay your own API usage</li>
                  </ul>
                </div>
                <div className={`${styles.mode} ${styles.violet}`}>
                  <h4>Cerebras mode (free)</h4>
                  <p>
                    No image understanding. Tesseract performs the OCR, then a
                    fast LLM structures the result.
                  </p>
                  <ul>
                    <li>Use good, natural lighting</li>
                    <li>Flatten wrinkled receipts</li>
                    <li>Avoid strong colored backgrounds</li>
                    <li>Higher quality photo = better extraction</li>
                  </ul>
                </div>
              </div>
            </div>

            <div
              ref={scannerFrameRef}
              data-scanner-video
              className={styles.videoFrame}
            >
              <video
                ref={scannerVideoRef}
                src="/groupio/ticket_scanner.mp4"
                muted
                playsInline
                loop
                preload="metadata"
              />
              <FullscreenBtn targetRef={scannerFrameRef} />
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

      {/* ────────── SCENE 3 — DASHBOARD ────────── */}
      <section
        data-scene="dashboard"
        data-pin="dashboard"
        className={styles.dashWrap}
      >
        <div data-pin-content="dashboard" className={styles.dashPin}>
          <div className={styles.dashStage}>
            <div data-dash-copy>
              <span className={styles.sectionLabel}>03 / Control Center</span>
              <h2 className={styles.h2} data-stagger>
                Your control center.
              </h2>
              <p className={styles.lead} data-stagger>
                A fully customizable dashboard. Drag widgets, pick the charts
                you actually need, and design a personal analytics surface for
                your shared life.
              </p>
              <ul className={styles.featureList}>
                <li data-stagger>Draggable, resizable widgets</li>
                <li data-stagger>Custom charts &amp; KPIs</li>
                <li data-stagger>Personalized expense insights</li>
                <li data-stagger>Modular layout that scales with you</li>
              </ul>
            </div>

            <div
              ref={dashFrameRef}
              data-dash-video
              className={styles.dashVideo}
            >
              <video
                ref={dashboardVideoRef}
                src="/groupio/dashboard_groupio.mp4"
                muted
                playsInline
                loop
                preload="metadata"
              />
              <FullscreenBtn targetRef={dashFrameRef} />
              <span className={`${styles.hudCorner} ${styles.tl}`} />
              <span className={`${styles.hudCorner} ${styles.tr}`} />
              <span className={`${styles.hudCorner} ${styles.bl}`} />
              <span className={`${styles.hudCorner} ${styles.br}`} />
            </div>
          </div>
        </div>
      </section>

      {/* ────────── SCENE 4 — SMART EXPENSE CREATION ────────── */}
      <section data-scene="expense" className={styles.split}>
        <div className={styles.splitInner}>
          <div className={styles.copy}>
            <span className={styles.sectionLabel}>04 / Expenses</span>
            <h2 className={`${styles.h2} ${styles.fadeUp}`}>
              Smart, recurring, shared.
            </h2>
            <p className={styles.fadeUp}>
              Every shared cost — captured once, automated forever. Add a
              recurring Netflix subscription, a monthly rent share, or a one-off
              dinner — Groupio handles the math, the splits and the reminders.
            </p>
            <p className={styles.fadeUp}>
              Recurring expenses regenerate on schedule. Everyone sees the same
              ledger. No spreadsheets, no group chats, no chasing.
            </p>

            <div className={styles.tags}>
              <span className={styles.tag}>Recurring</span>
              <span className={styles.tag}>Auto-split</span>
              <span className={styles.tag}>Subscriptions</span>
              <span className={styles.tag}>Ledger</span>
            </div>

            <div className={`${styles.callout} ${styles.fadeUp}`}>
              <strong>● Example</strong>
              Add Netflix as a recurring expense — Groupio regenerates it every
              month and splits it across your household automatically.
            </div>
          </div>

          <div
            data-split-frame
            className={styles.shotFrame}
            style={
              {
                ["--shotGlow" as keyof React.CSSProperties as string]:
                  "rgba(106, 166, 255, 0.35)",
              } as React.CSSProperties
            }
          >
            <Image
              src="/groupio/expense.png"
              alt="Groupio expense creation"
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
      </section>

      {/* ────────── SCENE 5 — ROTATING TASKS ────────── */}
      <section data-scene="rotating" className={styles.split}>
        <div
          className={`${styles.splitInner} ${styles.reverse} ${styles.wideImg}`}
        >
          <div className={styles.copy}>
            <span className={styles.sectionLabel}>05 / Rotation</span>
            <h2 className={`${styles.h2} ${styles.fadeUp}`}>
              Shared living without chaos.
            </h2>
            <p className={styles.fadeUp}>
              Recurring chores rotate automatically between members. This week
              you clean the kitchen, next week it&apos;s someone else — Groupio
              handles the rotation, the schedule and the reminders.
            </p>
            <p className={styles.fadeUp}>
              No more “whose turn was it?”. Just an honest, transparent system
              that everyone trusts.
            </p>

            <div className={styles.tags}>
              <span className={styles.tag}>Auto-assign</span>
              <span className={styles.tag}>Rotation</span>
              <span className={styles.tag}>Recurring</span>
              <span className={styles.tag}>Collaboration</span>
            </div>

            <div
              className={`${styles.callout} ${styles.violet} ${styles.fadeUp}`}
            >
              <strong>● Example</strong>
              Kitchen cleaning rotates weekly across 4 housemates — automatic
              assignments, automatic reminders, zero arguments.
            </div>
          </div>

          <div
            data-split-frame
            className={styles.shotFrame}
            style={
              {
                ["--shotGlow" as keyof React.CSSProperties as string]:
                  "rgba(184, 123, 255, 0.35)",
              } as React.CSSProperties
            }
          >
            <Image
              src="/groupio/task_creation.png"
              alt="Groupio rotating task creation"
              width={2000}
              height={1250}
              quality={100}
              style={{ objectFit: "contain" }}
              sizes="(max-width: 1024px) 92vw, 1250px"
            />
            <span className={styles.shotGlow} aria-hidden="true" />
            <span className={`${styles.hudCorner} ${styles.tr}`} />
            <span className={`${styles.hudCorner} ${styles.bl}`} />
          </div>
        </div>
      </section>

      {/* ────────── SCENE 6 — CALENDAR ────────── */}
      <section data-scene="calendar" className={styles.split}>
        <div className={styles.splitInner}>
          <div className={styles.copy}>
            <span className={styles.sectionLabel}>06 / Calendar</span>
            <h2 className={`${styles.h2} ${styles.fadeUp}`}>
              A timeline for everyone.
            </h2>
            <p className={styles.fadeUp}>
              An integrated calendar puts every recurring schedule, chore and
              shared event in a single view. Visibility for everyone in the
              group — no surprises.
            </p>
            <p className={styles.fadeUp}>
              Sync straight to the calendars you already use. One click and
              tasks land on your phone, your laptop, your watch.
            </p>

            <div className={styles.integrations}>
              <span>Google Calendar</span>
              <span>Outlook</span>
              <span>iCal feed</span>
            </div>

            <div
              className={`${styles.callout} ${styles.green} ${styles.fadeUp}`}
            >
              <strong>● One-click sync</strong>
              Create a task in Groupio and instantly push it into Google
              Calendar or Outlook as a real event.
            </div>
          </div>

          <div
            data-split-frame
            className={styles.shotFrame}
            style={
              {
                ["--shotGlow" as keyof React.CSSProperties as string]:
                  "rgba(90, 215, 255, 0.35)",
              } as React.CSSProperties
            }
          >
            <Image
              src="/groupio/tasks_calendar.png"
              alt="Groupio shared task calendar"
              width={2100}
              height={1250}
              quality={100}
              style={{ objectFit: "contain" }}
              sizes="(max-width: 1024px) 92vw, 1200px"
            />
            <span className={styles.shotGlow} aria-hidden="true" />
            <span className={`${styles.hudCorner} ${styles.tl}`} />
            <span className={`${styles.hudCorner} ${styles.br}`} />
          </div>
        </div>
      </section>

      {/* ────────── SCENE 7 — SOCIAL / TASK DETAILS ────────── */}
      <section data-scene="social" className={styles.split}>
        <div
          className={`${styles.splitInner} ${styles.reverse} ${styles.narrowImg}`}
        >
          <div className={styles.copy}>
            <span className={styles.sectionLabel}>07 / Conversation</span>
            <h2 className={`${styles.h2} ${styles.fadeUp}`}>
              Tasks that talk back.
            </h2>
            <p className={styles.fadeUp}>
              Every task is a thread. Comment, mention housemates, decide
              together — no jumping between Groupio and a chat app.
            </p>
            <p className={styles.fadeUp}>
              Mention someone with @ and they get a push notification — one tap
              and they jump straight into the task.
            </p>

            <div className={styles.tags}>
              <span className={styles.tag}>Comments</span>
              <span className={styles.tag}>@mentions</span>
              <span className={styles.tag}>Push</span>
              <span className={styles.tag}>Realtime</span>
            </div>
          </div>

          <div
            data-split-frame
            className={styles.shotFrame}
            style={
              {
                ["--shotGlow" as keyof React.CSSProperties as string]:
                  "rgba(184, 123, 255, 0.4)",
              } as React.CSSProperties
            }
          >
            <Image
              src="/groupio/task_details.png"
              alt="Groupio task details with comments and mentions"
              width={2000}
              height={1250}
              quality={92}
              sizes="(max-width: 1024px) 92vw, 560px"
            />
            <span className={styles.shotGlow} aria-hidden="true" />
            <span className={`${styles.hudCorner} ${styles.tl}`} />
            <span className={`${styles.hudCorner} ${styles.br}`} />
          </div>
        </div>
      </section>

      {/* ────────── SCENE 8 — PWA / FINAL ────────── */}
      <section data-scene="final" className={styles.final}>
        <div className={styles.finalInner}>
          <div className={styles.finalKicker}>08 / Always with you</div>
          <h2 data-final-title className={styles.finalTitle}>
            Organize your shared life.
          </h2>
          <p className={`${styles.finalSubtitle} ${styles.fadeUp}`}>
            Groupio is a Progressive Web App. Install it on desktop, on your
            phone, on your tablet — it&apos;s fast, lightweight and always one
            tap away. Free to use, built for the way modern households actually
            work.
          </p>

          <div className={styles.finalCards}>
            <div className={`${styles.finalCard} ${styles.fadeUp}`}>
              <h5>PWA · Installable</h5>
              <p>One-tap install on desktop and mobile. Works offline-first.</p>
            </div>
            <div className={`${styles.finalCard} ${styles.fadeUp}`}>
              <h5>Free</h5>
              <p>
                Core features are free. Bring your own AI key if you want
                vision.
              </p>
            </div>
            <div className={`${styles.finalCard} ${styles.fadeUp}`}>
              <h5>AI-powered</h5>
              <p>Receipt scanning, smart splits, intelligent automation.</p>
            </div>
          </div>

          <div className={styles.ctaRow}>
            <a
              href="https://groupio.llanasdev.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.cta} ${styles.fadeUp}`}
            >
              <img
                src="/groupio/groupio.png"
                alt=""
                aria-hidden="true"
                className={styles.ctaLogo}
              />
              <span>Enter Groupio</span>
              <svg
                className={styles.ctaArrow}
                width="18"
                height="18"
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
            </a>

            <a
              href="/simulations"
              className={`${styles.cta_simulation} ${styles.fadeUp}`}
            >
              <span className={styles.ctaCodeIcon} aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="8 6 2 12 8 18" />
                  <polyline points="16 6 22 12 16 18" />
                  <line x1="14" y1="4" x2="10" y2="20" />
                </svg>
              </span>
              <span className={styles.ctaSimLabel}>
                <span className={styles.ctaSimKicker}>NEXT</span>
                Explore code simulations
              </span>
              <svg
                className={styles.ctaSimArrow}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m13 5 7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
