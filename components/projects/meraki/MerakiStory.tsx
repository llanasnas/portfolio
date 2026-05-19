"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "./MerakiStory.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SCENE_IDS = [
  "hero",
  "marketplace",
  "shop",
  "product",
  "seller",
  "realtime",
  "admin",
  "stack",
  "final",
] as const;
type SceneId = (typeof SCENE_IDS)[number];

// ─────────────────────────────────────────────────────────────
// ICONS — cyberpunk SVGs
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
    case "shops":
      return (
        <svg {...c}>
          <path d="M3 9 5 4h14l2 5" />
          <path d="M3 9v11h18V9" />
          <path d="M3 9c0 1.7 1.3 3 3 3s3-1.3 3-3 1.3 3 3 3 3-1.3 3-3 1.3 3 3 3 3-1.3 3-3" />
        </svg>
      );
    case "cart":
      return (
        <svg {...c}>
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="17" cy="20" r="1.4" />
          <path d="M3 4h2l2.4 11.5a2 2 0 0 0 2 1.5h7.6a2 2 0 0 0 2-1.5L21 8H6" />
        </svg>
      );
    case "chat":
      return (
        <svg {...c}>
          <path d="M21 11.5a8.4 8.4 0 0 1-8.4 8.4 8.6 8.6 0 0 1-4-1l-4.6 1.2 1.3-4.4a8.4 8.4 0 0 1 15.7-4.2z" />
        </svg>
      );
    case "map":
      return (
        <svg {...c}>
          <path d="M3 6v15l6-3 6 3 6-3V3l-6 3-6-3-6 3z" />
          <path d="M9 3v15M15 6v15" />
        </svg>
      );
    case "truck":
      return (
        <svg {...c}>
          <path d="M2 6h13v10H2z" />
          <path d="M15 9h4l3 3v4h-7" />
          <circle cx="6" cy="18" r="1.8" />
          <circle cx="18" cy="18" r="1.8" />
        </svg>
      );
    case "chart":
      return (
        <svg {...c}>
          <path d="M3 21V3" />
          <path d="M3 21h18" />
          <path d="m6 16 4-4 3 3 5-7" />
          <circle cx="18" cy="8" r="1.4" />
        </svg>
      );
    case "users":
      return (
        <svg {...c}>
          <circle cx="9" cy="9" r="3" />
          <path d="M3 20c.6-3 3-5 6-5s5.4 2 6 5" />
          <circle cx="17" cy="10" r="2.4" />
          <path d="M15 20c.5-2.4 2-4 4-4s3.5 1.6 4 4" />
        </svg>
      );
    case "star":
      return (
        <svg {...c}>
          <path d="m12 3 2.6 5.4 6 .9-4.3 4.2 1 6L12 16.8 6.7 19.5l1-6L3.4 9.3l6-.9z" />
        </svg>
      );
    case "filter":
      return (
        <svg {...c}>
          <path d="M3 5h18" />
          <path d="M6 12h12" />
          <path d="M10 19h4" />
        </svg>
      );
    case "search":
      return (
        <svg {...c}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case "package":
      return (
        <svg {...c}>
          <path d="m3 7 9-4 9 4-9 4z" />
          <path d="M3 7v10l9 4 9-4V7" />
          <path d="M12 11v10" />
        </svg>
      );
    case "image":
      return (
        <svg {...c}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      );
    case "layout":
      return (
        <svg {...c}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 9v12" />
        </svg>
      );
    case "bell":
      return (
        <svg {...c}>
          <path d="M6 8a6 6 0 1 1 12 0v5l2 3H4l2-3z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );
    case "shield":
      return (
        <svg {...c}>
          <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "socket":
      return (
        <svg {...c}>
          <circle cx="5" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
          <path d="M7 12h3M14 12h3" />
          <path d="M11 9v6M13 9v6" />
        </svg>
      );
    case "code":
      return (
        <svg {...c}>
          <path d="m8 6-6 6 6 6" />
          <path d="m16 6 6 6-6 6" />
        </svg>
      );
    case "arrow":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14" />
          <path d="m13 5 7 7-7 7" />
        </svg>
      );
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────
// Brand marketplace SVG — hero centerpiece
// ─────────────────────────────────────────────────────────────
function MerakiMark({ className }: { className?: string }) {
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
        <linearGradient id="merakiGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="55%" stopColor="#5ad7ff" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <g stroke="url(#merakiGrad)">
        <path d="M14 40 22 22h56l8 18" />
        <path d="M14 40v44h72V40" />
        <path d="M14 40c0 4.4 3.6 8 8 8s8-3.6 8-8 3.6 8 8 8 8-3.6 8-8 3.6 8 8 8 8-3.6 8-8 3.6 8 8 8 8-3.6 8-8" />
        <rect x="28" y="56" width="16" height="22" />
        <rect x="56" y="56" width="16" height="22" />
        <path d="M28 64h16M56 64h16" />
        <circle cx="50" cy="70" r="2.2" fill="url(#merakiGrad)" stroke="none" />
        <path d="M50 70v8" />
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
      <MerakiMark className={styles.brandIcon} />
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
function Particles({ count = 40 }: { count?: number }) {
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
export default function MerakiStory() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroPreviewRef = useRef<HTMLDivElement | null>(null);
  const heroPreviewInnerRef = useRef<HTMLDivElement | null>(null);
  const [activeScene, setActiveScene] = useState<SceneId>("hero");
  const [activePanel, setActivePanel] = useState<0 | 1>(0);

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

      // ── PINNED scenes — desktop only
      mm.add("(min-width: 1024px)", () => {
        // MARKETPLACE pinned (shop_list)
        const mpTl = gsap.timeline();
        mpTl
          .fromTo(
            "[data-marketplace-frame]",
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
            "[data-marketplace-copy] [data-stagger]",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, ease: "none", duration: 0.7 },
            0.1,
          )
          .to(
            "[data-marketplace-frame]",
            { scale: 1.05, y: -30, ease: "none", duration: 1 },
            1,
          );
        ScrollTrigger.create({
          trigger: "[data-pin='marketplace']",
          start: "top top",
          end: "+=220%",
          scrub: 1,
          pin: "[data-pin-content='marketplace']",
          anticipatePin: 1,
          animation: mpTl,
        });

        // SHOP pinned (shop_page)
        const shopTl = gsap.timeline();
        shopTl
          .fromTo(
            "[data-shop-frame]",
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
            "[data-shop-copy] [data-stagger]",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, ease: "none", duration: 0.7 },
            0.1,
          )
          .to(
            "[data-shop-frame]",
            { scale: 1.05, y: -30, ease: "none", duration: 1 },
            1,
          );
        ScrollTrigger.create({
          trigger: "[data-pin='shop']",
          start: "top top",
          end: "+=220%",
          scrub: 1,
          pin: "[data-pin-content='shop']",
          anticipatePin: 1,
          animation: shopTl,
        });

        // PRODUCT pinned (product detail + related)
        const prodTl = gsap.timeline();
        prodTl
          .fromTo(
            "[data-product-frame]",
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
            "[data-product-copy] [data-stagger]",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, ease: "none", duration: 0.7 },
            0.1,
          )
          .to(
            "[data-product-frame]",
            { scale: 1.05, y: -30, ease: "none", duration: 1 },
            1,
          );
        ScrollTrigger.create({
          trigger: "[data-pin='product']",
          start: "top top",
          end: "+=220%",
          scrub: 1,
          pin: "[data-pin-content='product']",
          anticipatePin: 1,
          animation: prodTl,
        });

        // SELLER triptych — two-panel stack (backoffice + edit_shop_form)
        const panels = gsap.utils.toArray<HTMLElement>("[data-seller-panel]");
        if (panels.length === 2) {
          gsap.set(panels[0], {
            xPercent: -50,
            yPercent: -50,
            y: 0,
            scale: 1,
            opacity: 1,
            rotateY: 0,
            zIndex: 2,
          });
          gsap.set(panels[1], {
            xPercent: -50,
            yPercent: -50,
            y: 80,
            scale: 0.9,
            opacity: 0,
            rotateY: -10,
            zIndex: 1,
          });

          const sellerTl = gsap.timeline();
          sellerTl
            .to(panels[0], { y: -80, scale: 0.9, opacity: 0, rotateY: 10, ease: "none" }, 0)
            .to(panels[1], { y: 0, scale: 1, opacity: 1, rotateY: 0, ease: "none" }, 0);

          ScrollTrigger.create({
            trigger: "[data-pin='seller']",
            start: "top top",
            end: "+=260%",
            scrub: 1,
            pin: "[data-pin-content='seller']",
            anticipatePin: 1,
            animation: sellerTl,
            onUpdate: (self) => {
              setActivePanel(self.progress < 0.5 ? 0 : 1);
            },
          });
        }

        // REALTIME pinned (shipment_real_time)
        const rtTl = gsap.timeline();
        rtTl
          .fromTo(
            "[data-realtime-frame]",
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
            "[data-realtime-copy] [data-stagger]",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.12, ease: "none", duration: 0.7 },
            0.1,
          )
          .to(
            "[data-realtime-frame]",
            { scale: 1.05, y: -30, ease: "none", duration: 1 },
            1,
          );
        ScrollTrigger.create({
          trigger: "[data-pin='realtime']",
          start: "top top",
          end: "+=220%",
          scrub: 1,
          pin: "[data-pin-content='realtime']",
          anticipatePin: 1,
          animation: rtTl,
        });

        // ADMIN pinned (admin_dashboard)
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

      // ── MOBILE / TABLET fallback — pins disabled below 1024px,
      // so each pinned scene gets a plain fade-in on entry instead.
      mm.add("(max-width: 1023px)", () => {
        const fadeTargets = root.querySelectorAll<HTMLElement>(
          "[data-marketplace-copy], [data-marketplace-frame], " +
            "[data-shop-copy], [data-shop-frame], " +
            "[data-product-copy], [data-product-frame], " +
            "[data-realtime-copy], [data-realtime-frame], " +
            "[data-admin-copy], [data-admin-frame], " +
            "[data-seller-panel]",
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

        // Per-scene stagger fades for headings / bullets / callouts
        const staggers = root.querySelectorAll<HTMLElement>("[data-stagger]");
        staggers.forEach((el) => {
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

        // Broad mobile fallback — fade every content element inside any
        // non-hero scene so nothing pops in without an entry.
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

    // Re-measure after images / fonts settle — many pinned scenes push
    // later triggers off-screen until layout stabilises.
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
      <Particles count={40} />

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
          <div className={styles.kicker}>● Master&apos;s Thesis · Team of 3 · MERN</div>
          <HeroTitle text="MERAKI" />
          <p className={styles.subtitle} data-hero-fade>
            A full-stack marketplace. Many shops. One platform.
          </p>
          <p className={styles.desc} data-hero-fade>
            Meraki Marketplace is a multi-shop e-commerce platform built on
            MongoDB · Express · React · Node. Buyers browse and order across
            many sellers, sellers run their own storefront and dashboard inside
            the same app, and shipments stream live on a Mapbox map over
            WebSockets. Final master&apos;s project, three developers, six
            months.
          </p>

          <div className={styles.heroButtons} data-hero-fade>
            <a href="#marketplace" className={styles.cta}>
              <Icon name="shops" size={16} />
              <span>Tour the platform</span>
              <span className={styles.ctaArrow}>
                <Icon name="arrow" size={16} />
              </span>
            </a>
            <a href="#stack" className={styles.ctaGhost}>
              <Icon name="code" size={18} />
              <span>Architecture</span>
            </a>
          </div>

          <div ref={heroPreviewRef} className={styles.heroPreview}>
            <div ref={heroPreviewInnerRef} className={styles.heroPreviewInner}>
              <div className={styles.heroMockGrid}>
                <div className={styles.heroMockCard}>
                  <Icon name="shops" size={28} />
                  <strong>Multi-shop</strong>
                  <span>Many vendors in one marketplace, each with their own storefront.</span>
                </div>
                <div className={`${styles.heroMockCard} ${styles.blue}`}>
                  <Icon name="socket" size={28} />
                  <strong>Real-time</strong>
                  <span>Socket.IO chat &amp; live shipment tracking on Mapbox.</span>
                </div>
                <div className={`${styles.heroMockCard} ${styles.violet}`}>
                  <Icon name="chart" size={28} />
                  <strong>Analytics</strong>
                  <span>Event-based metrics — sales, views, conversion, per-product breakdown.</span>
                </div>
              </div>
              <span className={`${styles.hudCorner} ${styles.tl}`} />
              <span className={`${styles.hudCorner} ${styles.tr}`} />
              <span className={`${styles.hudCorner} ${styles.bl}`} />
              <span className={`${styles.hudCorner} ${styles.br}`} />
            </div>
          </div>

          <div className={styles.heroNote} data-hero-fade>
            <span className={styles.heroNoteDot} />
            Heads up — product data was generated by an AI seeder for the
            demo. Don&apos;t mind the mountain photos on a t-shirt card; the
            engine doesn&apos;t care.
          </div>
        </div>

        <div className={styles.scrollHint} aria-hidden="true">
          SCROLL TO ENTER
        </div>
      </section>

      {/* ──────────── SCENE 2 — MARKETPLACE (shop_list pinned) ──────────── */}
      <section
        id="marketplace"
        data-scene="marketplace"
        data-pin="marketplace"
        className={styles.pinWrap}
      >
        <div data-pin-content="marketplace" className={styles.pinInner}>
          <div className={styles.splitInner}>
            <div data-marketplace-copy className={styles.copy}>
              <span className={styles.sectionLabel}>02 / Discover</span>
              <h2 className={styles.h2} data-stagger>
                Many shops, one search bar.
              </h2>
              <p data-stagger>
                Meraki is built around the idea that one platform can host
                dozens of independent storefronts. The shop directory lets
                buyers explore vendors by category and name — each card is a
                live, self-managed business.
              </p>

              <div className={styles.featureGrid} data-stagger>
                <div className={styles.feat}>
                  <Icon name="search" size={20} />
                  <strong>Full-text search</strong>
                  <span>Shops &amp; products, instant filter</span>
                </div>
                <div className={styles.feat}>
                  <Icon name="filter" size={20} />
                  <strong>Category filters</strong>
                  <span>Multi-tag taxonomy on both axes</span>
                </div>
                <div className={styles.feat}>
                  <Icon name="users" size={20} />
                  <strong>3 user roles</strong>
                  <span>Buyer · Seller · Admin</span>
                </div>
                <div className={styles.feat}>
                  <Icon name="shield" size={20} />
                  <strong>JWT auth + Google</strong>
                  <span>Token-based sessions, OAuth fallback</span>
                </div>
              </div>
            </div>

            <div data-marketplace-frame className={styles.shotFrame}>
              <Image
                src="/meraki/shop_list.png"
                alt="Meraki shop directory — list of vendors with category filters"
                width={1800}
                height={1400}
                quality={92}
                priority
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

      {/* ──────────── SCENE 3 — SHOP PAGE (pinned) ──────────── */}
      <section
        data-scene="shop"
        data-pin="shop"
        className={styles.pinWrap}
      >
        <div data-pin-content="shop" className={styles.pinInner}>
          <div className={`${styles.splitInner} ${styles.reverse}`}>
            <div data-shop-copy className={styles.copy}>
              <span className={`${styles.sectionLabel} ${styles.blue}`}>
                03 / Storefront
              </span>
              <h2 className={styles.h2} data-stagger>
                Every seller, their own shop.
              </h2>
              <p data-stagger>
                Each vendor gets a full storefront inside the platform — hero
                slider, featured products, active offers, full catalogue with
                category filter on the side. Every block is toggleable from the
                seller dashboard, so vendors compose their own page without
                touching code.
              </p>

              <ul className={styles.bulletList} data-stagger>
                <li>Custom hero slider with per-shop images &amp; copy</li>
                <li>Featured products block — drag-to-pick from catalogue</li>
                <li>Offers section auto-populated from discounted SKUs</li>
                <li>Side-panel category filter on the product grid</li>
                <li>Per-shop reviews &amp; star rating aggregate</li>
              </ul>

              <div className={`${styles.callout} ${styles.blue}`} data-stagger>
                <strong>● Composable storefront</strong>
                Each section is opt-in. Slider, featured, offers and grid all
                live independently — seller toggles, layout reflows.
              </div>
            </div>

            <div data-shop-frame className={styles.shotFrame}>
              <Image
                src="/meraki/shop_page.png"
                alt="Boutique Elegance shop page with hero slider and featured products"
                width={1600}
                height={2000}
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

      {/* ──────────── SCENE 4 — PRODUCT DETAIL (pinned) ──────────── */}
      <section
        data-scene="product"
        data-pin="product"
        className={styles.pinWrap}
      >
        <div data-pin-content="product" className={styles.pinInner}>
          <div className={styles.splitInner}>
            <div data-product-copy className={styles.copy}>
              <span className={`${styles.sectionLabel} ${styles.violet}`}>
                04 / Product
              </span>
              <h2 className={styles.h2} data-stagger>
                Full product page. Reviews. Related.
              </h2>
              <p data-stagger>
                Product detail page ships with image gallery, description, live
                stock status, star rating with written reviews and a buy CTA
                wired straight into the cart. Below it, a related-products
                strip pulls from the same taxonomy to keep buyers in the
                funnel.
              </p>

              <div className={styles.featureGrid} data-stagger>
                <div className={styles.feat}>
                  <Icon name="star" size={20} />
                  <strong>Reviews &amp; ratings</strong>
                  <span>Per-product, per-user, moderated</span>
                </div>
                <div className={styles.feat}>
                  <Icon name="package" size={20} />
                  <strong>Stock state</strong>
                  <span>Real-time availability badge</span>
                </div>
                <div className={styles.feat}>
                  <Icon name="cart" size={20} />
                  <strong>One-click add</strong>
                  <span>Optimistic cart updates</span>
                </div>
                <div className={styles.feat}>
                  <Icon name="layout" size={20} />
                  <strong>Related grid</strong>
                  <span>Category-based recommendation</span>
                </div>
              </div>

              <div className={`${styles.callout} ${styles.violet}`} data-stagger>
                <strong>● Related products</strong>
                Pulled by shared categories. Cross-shop — buyers stay in the
                marketplace even if they leave the current vendor.
              </div>
            </div>

            <div data-product-frame className={styles.shotStack}>
              <div className={`${styles.shotFrame} ${styles.shotMain}`}>
                <Image
                  src="/meraki/product_details_page.png"
                  alt="Product detail page with reviews and rating"
                  width={1400}
                  height={1600}
                  quality={92}
                  sizes="(max-width: 1024px) 92vw, 40vw"
                />
                <span className={styles.scanline} aria-hidden="true" />
                <span className={styles.frameEdge} aria-hidden="true" />
                <span className={`${styles.hudCorner} ${styles.tl}`} />
                <span className={`${styles.hudCorner} ${styles.br}`} />
              </div>
              <div className={`${styles.shotFrame} ${styles.shotOverlay}`}>
                <Image
                  src="/meraki/related_products.png"
                  alt="Related products strip"
                  width={1600}
                  height={400}
                  quality={92}
                  sizes="(max-width: 1024px) 92vw, 36vw"
                />
                <span className={styles.frameEdge} aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── SCENE 5 — SELLER DASHBOARD (triptych pin) ──────────── */}
      <section
        data-scene="seller"
        data-pin="seller"
        className={styles.triptychWrap}
      >
        <div data-pin-content="seller" className={styles.triptychPin}>
          <div className={styles.triptychStage}>
            <div className={styles.triptychCopy}>
              <span className={`${styles.sectionLabel} ${styles.blue}`}>
                05 / Seller Dashboard
              </span>
              <h2 className={styles.h2}>
                Run a whole shop. From a side panel.
              </h2>
              <p className={styles.lead}>
                Sellers get a complete back-office: live sales analytics,
                product CRUD, order pipeline, shop appearance editor and a
                featured-products picker. No external tooling — everything from
                opening the shop to publishing a slider hero lives inside
                Meraki.
              </p>

              <ul className={styles.bulletList}>
                <li>Sales / orders / views over time, daily breakdown</li>
                <li>Product CRUD with image upload + categories</li>
                <li>Order pipeline — paid, shipped, delivered</li>
                <li>Appearance editor — slider, featured, offers, copy</li>
                <li>Featured-product picker, drag-to-promote</li>
              </ul>

              <div className={styles.triptychProgress} aria-hidden="true">
                <span className={activePanel >= 0 ? styles.active : ""} />
                <span className={activePanel >= 1 ? styles.active : ""} />
              </div>
            </div>

            <div className={styles.triptychPanels}>
              <div data-seller-panel className={styles.sellerPanel}>
                <span className={styles.panelTag}>01 · Analytics dashboard</span>
                <Image
                  src="/meraki/backoffice dashboard.png"
                  alt="Seller analytics dashboard with revenue and orders charts"
                  width={1800}
                  height={1400}
                  quality={92}
                  sizes="(max-width: 1024px) 92vw, 720px"
                  priority
                />
                <span className={styles.frameEdge} aria-hidden="true" />
                <span className={`${styles.hudCorner} ${styles.tl}`} />
                <span className={`${styles.hudCorner} ${styles.br}`} />
              </div>
              <div data-seller-panel className={styles.sellerPanel}>
                <span className={styles.panelTag}>02 · Shop editor</span>
                <Image
                  src="/meraki/edit_shop_form.png"
                  alt="Shop editor form — name, description, categories and social links"
                  width={1800}
                  height={1200}
                  quality={92}
                  sizes="(max-width: 1024px) 92vw, 720px"
                />
                <span className={styles.frameEdge} aria-hidden="true" />
                <span className={`${styles.hudCorner} ${styles.tl}`} />
                <span className={`${styles.hudCorner} ${styles.br}`} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────── SCENE 6 — REAL-TIME (shipment map pinned) ──────────── */}
      <section
        data-scene="realtime"
        data-pin="realtime"
        className={styles.pinWrap}
      >
        <div data-pin-content="realtime" className={styles.pinInner}>
          <div className={`${styles.splitInner} ${styles.reverse}`}>
            <div data-realtime-copy className={styles.copy}>
              <span className={`${styles.sectionLabel} ${styles.green}`}>
                06 / Real-Time
              </span>
              <h2 className={styles.h2} data-stagger>
                Watch the courier move.
              </h2>
              <p data-stagger>
                Once an order ships, buyers open the order page and see a live
                Mapbox view of the courier. A Socket.IO channel pipes a fresh
                GPS coordinate every ~10 seconds straight from the delivery
                client into the browser — no polling, no refresh.
              </p>

              <div className={styles.featureGrid} data-stagger>
                <div className={styles.feat}>
                  <Icon name="socket" size={20} />
                  <strong>Socket.IO</strong>
                  <span>Bidirectional WS channel</span>
                </div>
                <div className={styles.feat}>
                  <Icon name="map" size={20} />
                  <strong>Mapbox GL</strong>
                  <span>Live marker + ETA pill</span>
                </div>
                <div className={styles.feat}>
                  <Icon name="truck" size={20} />
                  <strong>Courier ping</strong>
                  <span>~10s GPS heartbeat</span>
                </div>
                <div className={styles.feat}>
                  <Icon name="chat" size={20} />
                  <strong>Live chat</strong>
                  <span>Same socket layer — buyer ↔ shop</span>
                </div>
              </div>

              <div className={`${styles.callout} ${styles.green}`} data-stagger>
                <strong>● One socket, many channels</strong>
                The same WS infrastructure powers buyer-seller chat and
                shipment tracking — single connection, rooms per concern.
              </div>
            </div>

            <div data-realtime-frame className={styles.shotFrame}>
              <Image
                src="/meraki/shipment_real_time.png"
                alt="Live shipment tracking on a Mapbox map showing courier route"
                width={1400}
                height={1200}
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

      {/* ──────────── SCENE 7 — ADMIN (admin_dashboard pinned) ──────────── */}
      <section
        data-scene="admin"
        data-pin="admin"
        className={styles.pinWrap}
      >
        <div data-pin-content="admin" className={styles.pinInner}>
          <div className={styles.splitInner}>
            <div data-admin-copy className={styles.copy}>
              <span className={`${styles.sectionLabel} ${styles.violet}`}>
                07 / Admin
              </span>
              <h2 className={styles.h2} data-stagger>
                The board for whoever runs the marketplace.
              </h2>
              <p data-stagger>
                Platform admins land on a global dashboard — revenue, orders,
                users, sellers, products and a live recent-orders feed. The
                same event pipeline that powers seller analytics aggregates
                upwards into platform-wide KPIs.
              </p>

              <div className={styles.featureGrid} data-stagger>
                <div className={styles.feat}>
                  <Icon name="chart" size={20} />
                  <strong>Global revenue</strong>
                  <span>All-time + today snapshot</span>
                </div>
                <div className={styles.feat}>
                  <Icon name="package" size={20} />
                  <strong>Order funnel</strong>
                  <span>Recent · pending · completed</span>
                </div>
                <div className={styles.feat}>
                  <Icon name="users" size={20} />
                  <strong>User growth</strong>
                  <span>New today · this week · sellers vs buyers</span>
                </div>
                <div className={styles.feat}>
                  <Icon name="shops" size={20} />
                  <strong>Catalog scale</strong>
                  <span>Shops · products · featured count</span>
                </div>
              </div>

              <div className={styles.callout} data-stagger>
                <strong>● Cron-backed reports</strong>
                Scheduled tasks pre-aggregate analytics every night so the
                dashboard stays instant even as data grows.
              </div>
            </div>

            <div data-admin-frame className={styles.shotFrame}>
              <Image
                src="/meraki/admin_dashboard.png"
                alt="Platform admin dashboard with global revenue, orders and users metrics"
                width={1800}
                height={1300}
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

      {/* ──────────── SCENE 8 — STACK ──────────── */}
      <section id="stack" data-scene="stack" className={styles.stack}>
        <div className={styles.stackInner}>
          <span className={`${styles.sectionLabel} ${styles.blue}`}>
            08 / Stack
          </span>
          <h2 className={`${styles.h2} ${styles.fadeUp}`}>MERN, split clean.</h2>
          <p className={`${styles.lead} ${styles.fadeUp}`} style={{ margin: "0 auto" }}>
            Two repos — React frontend, Express/Node API — communicating over
            REST and a shared Socket.IO channel. MongoDB for storage, JWT for
            auth (Google OAuth as fallback), Mapbox for geospatial UI, cron
            workers for nightly aggregation.
          </p>

          <div className={styles.stackGrid}>
            {[
              "React",
              "Node.js",
              "Express",
              "MongoDB",
              "Mongoose",
              "Socket.IO",
              "Mapbox GL",
              "JWT",
              "Google OAuth",
              "Cron",
              "REST",
              "Cloudinary",
            ].map((t) => (
              <div key={t} className={`${styles.stackChip} ${styles.fadeUp}`}>
                {t}
              </div>
            ))}
          </div>

          <div className={styles.archGrid}>
            <article className={`${styles.archCard} ${styles.fadeUp}`}>
              <div className={styles.archIcon}>
                <Icon name="layout" size={26} />
              </div>
              <h4>Frontend</h4>
              <p>
                React SPA — routes for buyers, sellers and admins; shared
                state via context; optimistic UI on cart and chat. Mapbox GL
                for the live tracker.
              </p>
            </article>
            <article className={`${styles.archCard} ${styles.blue} ${styles.fadeUp}`}>
              <div className={styles.archIcon}>
                <Icon name="code" size={26} />
              </div>
              <h4>Backend</h4>
              <p>
                Express API exposing auth, shops, products, orders, reviews,
                analytics and notifications. Socket.IO server bound to the
                same process for chat &amp; courier pings.
              </p>
            </article>
            <article className={`${styles.archCard} ${styles.violet} ${styles.fadeUp}`}>
              <div className={styles.archIcon}>
                <Icon name="package" size={26} />
              </div>
              <h4>Data</h4>
              <p>
                MongoDB document model — shops own products, products own
                reviews, orders link users to shops. Event collections feed
                seller and admin dashboards.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ──────────── SCENE 9 — FINAL ──────────── */}
      <section data-scene="final" className={styles.final}>
        <div className={styles.finalInner}>
          <div className={styles.finalKicker}>
            ● Status — Master&apos;s project · Team of 3 · Not currently hosted
          </div>
          <h2 data-final-title className={styles.finalTitle}>
            Built to ship.
          </h2>
          <p className={`${styles.finalSubtitle} ${styles.fadeUp}`}>
            Meraki was the capstone of my master&apos;s — designed and shipped
            with two teammates over six months. We split the surface area
            (frontend, backend, dashboards, real-time), then converged on the
            integration. The codebase is shared and currently offline, but the
            patterns — multi-tenant marketplace, event analytics, sockets for
            live data — still hold up.
          </p>

          <div className={styles.finalCards}>
            <div className={`${styles.finalCard} ${styles.fadeUp}`}>
              <h5>Multi-tenant by design</h5>
              <p>
                Every model lives under a shop scope — sellers never leak
                into each other&apos;s data.
              </p>
            </div>
            <div className={`${styles.finalCard} ${styles.fadeUp}`}>
              <h5>Event-driven analytics</h5>
              <p>
                Views, carts, orders — captured as events, aggregated by cron
                into snapshot collections for fast dashboards.
              </p>
            </div>
            <div className={`${styles.finalCard} ${styles.fadeUp}`}>
              <h5>Sockets done right</h5>
              <p>
                One Socket.IO server, rooms per shop and per courier — chat
                and shipment tracking share the same pipe.
              </p>
            </div>
          </div>

          <div className={styles.ctaRow}>
            <a href="/projects" className={`${styles.ctaGhost} ${styles.fadeUp}`}>
              <Icon name="code" size={18} />
              <span>All projects</span>
            </a>
            <a href="#hero" className={`${styles.ctaGhost} ${styles.fadeUp}`}>
              <Icon name="arrow" size={18} />
              <span>Back to top</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
