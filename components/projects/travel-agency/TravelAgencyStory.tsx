"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "./TravelAgencyStory.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SCENE_IDS = [
  "hero",
  "dashboard",
  "country",
  "itineraries",
  "detail",
  "gallery",
  "modules",
  "final",
] as const;
type SceneId = (typeof SCENE_IDS)[number];

/* ──────────────────────────────────────────────────────────
   ICONS — cyberpunk
   ────────────────────────────────────────────────────────── */
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
    case "globe":
      return (
        <svg {...c}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "pin":
      return (
        <svg {...c}>
          <path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "map":
      return (
        <svg {...c}>
          <path d="M3 6v15l6-3 6 3 6-3V3l-6 3-6-3-6 3z" />
          <path d="M9 3v15M15 6v15" />
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
    case "edit":
      return (
        <svg {...c}>
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
    case "faq":
      return (
        <svg {...c}>
          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          <path d="M9.1 9.5a3 3 0 1 1 4.4 3c-.7.5-1.5 1-1.5 2" />
          <circle cx="12" cy="17" r="0.6" fill="currentColor" />
        </svg>
      );
    case "home":
      return (
        <svg {...c}>
          <path d="m3 11 9-8 9 8v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" />
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
    case "filter":
      return (
        <svg {...c}>
          <path d="M3 4h18l-7 9v6l-4 2v-8z" />
        </svg>
      );
    case "lightbox":
      return (
        <svg {...c}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M8 12l3 3 5-6" />
        </svg>
      );
    case "cms":
      return (
        <svg {...c}>
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M3 9h18M7 14h4" />
          <circle cx="6.5" cy="6.5" r="0.6" fill="currentColor" />
        </svg>
      );
    case "github":
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
    case "arrow":
      return (
        <svg {...c} strokeWidth={2}>
          <path d="M5 12h14" />
          <path d="m13 5 7 7-7 7" />
        </svg>
      );
    default:
      return null;
  }
}

/* Cyberpunk plane brand SVG */
function PlaneIcon({ className }: { className?: string }) {
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
        <linearGradient id="planeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5ad7ff" />
          <stop offset="55%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#b87bff" />
        </linearGradient>
      </defs>
      <g stroke="url(#planeGrad)">
        <path d="M16 56l34-32 8 8-18 24h22l8-8 6 6-22 22-6-6 4-12-24 18-6-6 14-22-20 8z" />
        <circle cx="50" cy="50" r="32" opacity="0.35" />
        <path d="M14 78l72 2" opacity="0.4" />
      </g>
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────
   PARTICLES
   ────────────────────────────────────────────────────────── */
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}
function Particles({ count = 32 }: { count?: number }) {
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

/* ──────────────────────────────────────────────────────────
   HERO TITLE
   ────────────────────────────────────────────────────────── */
function HeroTitle({ text }: { text: string }) {
  return (
    <div>
      <PlaneIcon className={styles.brandIcon} />
      <h1 className={styles.title} aria-label={text}>
        {text.split("").map((ch, i) => (
          <span key={i} data-letter>
            {ch === " " ? " " : ch}
          </span>
        ))}
      </h1>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   MAIN
   ────────────────────────────────────────────────────────── */
export default function TravelAgencyStory() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const heroPreviewRef = useRef<HTMLDivElement | null>(null);
  const heroPreviewInnerRef = useRef<HTMLDivElement | null>(null);
  const [activeScene, setActiveScene] = useState<SceneId>("hero");

  // Lenis
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

      // HERO scroll parallax (no fade)
      gsap.to([heroPreviewRef.current, "[data-hero-fade]", "[data-letter]"], {
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-scene='hero']",
          start: "top top",
          end: "+=180%",
          scrub: 1,
        },
        immediateRender: false,
      });

      // Generic fadeUp / fadeIn
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
              start: "top 185%",
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
              start: "top 185%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      // Pinned / scrubbed scenes — desktop only
      // (mobile flows naturally; CSS resets pin containers)
      mm.add("(min-width: 1024px)", () => {
        const buildPin = (key: string) => {
          const tl = gsap.timeline();
          tl.fromTo(
            `[data-${key}-frame]`,
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
              `[data-${key}-copy] [data-stagger]`,
              { y: 40, opacity: 0 },
              { y: 0, opacity: 1, stagger: 0.12, ease: "none", duration: 0.7 },
              0.1,
            )
            .to(
              `[data-${key}-frame]`,
              { scale: 1.06, y: -40, ease: "none", duration: 1 },
              1,
            );
          ScrollTrigger.create({
            trigger: `[data-pin='${key}']`,
            start: "top top",
            end: "+=220%",
            scrub: 1,
            pin: `[data-pin-content='${key}']`,
            anticipatePin: 1,
            animation: tl,
          });
        };
        buildPin("dashboard");
        buildPin("country");
        buildPin("itineraries");
        buildPin("detail");
        buildPin("gallery");
      });

      // Mobile / tablet fallback — pins disabled, fade scenes on entry
      mm.add("(max-width: 1023px)", () => {
        const keys = ["dashboard", "country", "itineraries", "detail", "gallery"];
        keys.forEach((key) => {
          const sels = [`[data-${key}-copy]`, `[data-${key}-frame]`];
          sels.forEach((sel) => {
            const el = root.querySelector<HTMLElement>(sel);
            if (!el) return;
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
            start: "top 170%",
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
      {/* Ambient */}
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.beams} aria-hidden="true">
        <span className={styles.beam} />
        <span className={styles.beam} />
        <span className={styles.beam} />
        <span className={styles.beam} />
      </div>
      <Particles count={32} />

      {/* Rail */}
      <nav className={styles.rail} aria-label="Story progress">
        {SCENE_IDS.map((id) => (
          <span
            key={id}
            className={`${styles.railDot} ${activeScene === id ? styles.active : ""}`}
            aria-current={activeScene === id ? "step" : undefined}
          />
        ))}
      </nav>

      {/* ──── SCENE 1 — HERO ──── */}
      <section data-scene="hero" className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.kicker}>
            ● Freelance · Custom CMS · Not public
          </div>
          <HeroTitle text="TRAVEL AGENCY" />
          <p className={styles.subtitle} data-hero-fade>
            A bespoke mini-CMS for a real agency.
          </p>
          <p className={styles.desc} data-hero-fade>
            Countries, itineraries, gallery with lightbox, FAQs and home content
            — every block editable from a custom backoffice, without ever
            touching the SEO keyword set.
          </p>

          <div className={styles.heroButtons} data-hero-fade>
            <a href="#dashboard" className={styles.cta}>
              <Icon name="cms" size={16} />
              <span>Tour the backoffice</span>
              <span className={styles.ctaArrow}>
                <Icon name="arrow" size={14} />
              </span>
            </a>
            <Link href="/projects" className={styles.ctaGhost}>
              <Icon name="map" size={16} />
              <span>All projects</span>
            </Link>
          </div>

          <div ref={heroPreviewRef} className={styles.heroPreview}>
            <div ref={heroPreviewInnerRef} className={styles.heroPreviewInner}>
              <Image
                src="/yeriyef/ininerarios_list.png"
                alt="Travel agency itineraries list"
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

      {/* ──── SCENE 2 — DASHBOARD (pinned scrubbed) ──── */}
      <section
        id="dashboard"
        data-scene="dashboard"
        data-pin="dashboard"
        className={styles.splitWrap}
      >
        <div data-pin-content="dashboard" className={styles.splitPin}>
          <div className={styles.splitInner}>
            <div data-dashboard-copy className={styles.copy}>
              <span className={styles.sectionLabel}>02 / Backoffice</span>
              <h2 className={styles.h2} data-stagger>
                A custom CMS, tuned for travel.
              </h2>
              <p data-stagger>
                Not WordPress. Not Strapi. A bespoke admin built around the
                agency&apos;s real workflow — Countries, Itineraries, Gallery,
                FAQs and Home content, each with its own editor surface.
              </p>
              <ul className={styles.featureList}>
                <li data-stagger>One menu per content domain</li>
                <li data-stagger>
                  Auto-optimized image uploads (resize + webp)
                </li>
                <li data-stagger>Inline preview before publishing</li>
                <li data-stagger>SEO keywords kept separate from content</li>
              </ul>
              <div
                className={`${styles.callout} ${styles.warning}`}
                data-stagger
              >
                <strong>● Privacy note</strong>
                Public site stays unlisted in this case study — only the
                backoffice is shown, to keep client&apos;s real data off the
                portfolio.
              </div>
            </div>

            <div
              data-dashboard-frame
              className={styles.shotFrame}
              style={
                {
                  ["--shotGlow" as keyof React.CSSProperties as string]:
                    "rgba(90, 215, 255, 0.32)",
                } as React.CSSProperties
              }
            >
              <Image
                src="/yeriyef/dashboard.png"
                alt="Travel agency custom dashboard"
                width={2000}
                height={1250}
                quality={92}
                sizes="(max-width: 1024px) 92vw, 48vw"
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

      {/* ──── SCENE 3 — COUNTRIES MODULE (pinned scrubbed) ──── */}
      <section
        data-scene="country"
        data-pin="country"
        className={styles.splitWrap}
      >
        <div data-pin-content="country" className={styles.splitPin}>
          <div className={styles.splitInner}>
            <div data-country-copy className={styles.copy}>
              <span className={`${styles.sectionLabel} ${styles.violet}`}>
                03 / Countries
              </span>
              <h2 className={styles.h2} data-stagger>
                One country, one page.
              </h2>
              <p data-stagger>
                Every country is created from the backoffice with its own hero
                image, copy blocks and metadata. Itineraries snap onto a country
                once it exists — country lives at the top of the content tree.
              </p>
              <ul className={styles.featureList}>
                <li data-stagger>Hero image per country, uploaded + optimized</li>
                <li data-stagger>Rich content blocks (title, lead, sections)</li>
                <li data-stagger>Country page auto-published with SEO routes</li>
                <li data-stagger>Drives the itineraries filter on the public site</li>
              </ul>
            </div>

            <div data-country-frame className={styles.countryCard}>
              <div className={styles.countryCard__head}>
                <span>
                  <Icon name="globe" size={14} /> &nbsp;{" "}
                  <strong>NEW COUNTRY</strong>
                </span>
                <span>cms · v2</span>
              </div>
              <div className={styles.countryFields}>
                <div className={styles.countryField}>
                  <b>Name</b>
                  <span>Senegal</span>
                </div>
                <div className={styles.countryField}>
                  <b>Slug</b>
                  <span>/senegal</span>
                </div>
                <div className={styles.countryField}>
                  <b>Hero copy</b>
                  <span>
                    Where the desert meets the Atlantic — &nbsp;
                    <em>edit ▸</em>
                  </span>
                </div>
                <div className={styles.countryField}>
                  <b>SEO terms</b>
                  <span>
                    senegal, sahel, dakar &nbsp; <em>edit ▸</em>
                  </span>
                </div>
              </div>
              <div className={styles.heroSlot}>
                Hero image · 1920×1080 · auto-webp
              </div>
              <span className={`${styles.hudCorner} ${styles.tl}`} />
              <span className={`${styles.hudCorner} ${styles.br}`} />
            </div>
          </div>
        </div>
      </section>

      {/* ──── SCENE 4 — ITINERARIES LIST (pinned scrubbed) ──── */}
      <section
        data-scene="itineraries"
        data-pin="itineraries"
        className={styles.splitWrap}
      >
        <div data-pin-content="itineraries" className={styles.splitPin}>
          <div className={`${styles.splitInner} ${styles.reverse}`}>
            <div data-itineraries-copy className={styles.copy}>
              <span className={`${styles.sectionLabel} ${styles.green}`}>
                04 / Itineraries
              </span>
              <h2 className={styles.h2} data-stagger>
                Cards on rails.
              </h2>
              <p data-stagger>
                Itineraries are created and attached to a country. Each one gets
                two editable surfaces: the <em>card</em> (the preview tile in
                the list) and the <em>content</em> (the detail page).
              </p>
              <p data-stagger>
                The public itineraries page filters by country — pick a flag,
                see the trips. The card preview is faithful to what the visitor
                will see.
              </p>
              <div className={styles.tags} data-stagger>
                <span className={styles.tag}>Card editor</span>
                <span className={styles.tag}>Content editor</span>
                <span className={styles.tag}>Filter by country</span>
                <span className={styles.tag}>Auto-routed</span>
              </div>
            </div>

            <div
              data-itineraries-frame
              className={styles.shotFrame}
              style={
                {
                  ["--shotGlow" as keyof React.CSSProperties as string]:
                    "rgba(184, 123, 255, 0.32)",
                } as React.CSSProperties
              }
            >
              <Image
                src="/yeriyef/ininerarios_list.png"
                alt="Itineraries list with country filters"
                width={2000}
                height={1250}
                quality={92}
                sizes="(max-width: 1024px) 92vw, 48vw"
              />
              <span className={styles.frameEdge} aria-hidden="true" />
              <span className={`${styles.hudCorner} ${styles.tl}`} />
              <span className={`${styles.hudCorner} ${styles.br}`} />
            </div>
          </div>
        </div>
      </section>

      {/* ──── SCENE 5 — ITINERARY DETAIL (pinned scrubbed) ──── */}
      <section
        data-scene="detail"
        data-pin="detail"
        className={styles.splitWrap}
      >
        <div data-pin-content="detail" className={styles.splitPin}>
          <div className={styles.splitInner}>
            <div data-detail-copy className={styles.copy}>
              <span className={styles.sectionLabel}>05 / Itinerary detail</span>
              <h2 className={styles.h2} data-stagger>
                Every block, editable.
              </h2>
              <p data-stagger>
                The detail page is composed from editable blocks: hero,
                day-by-day plan, highlights, gallery and pricing notes. Reorder,
                rewrite or replace any of them from the backoffice without
                touching the codebase.
              </p>
              <div className={`${styles.callout}`} data-stagger>
                <strong>● Content blocks</strong>
                Hero · Highlights · Day-by-day · Gallery · Pricing · FAQs. Each
                block is its own row in the CMS — add, hide, reorder.
              </div>
            </div>

            <div
              data-detail-frame
              className={styles.shotFrame}
              style={
                {
                  ["--shotGlow" as keyof React.CSSProperties as string]:
                    "rgba(251, 191, 36, 0.32)",
                } as React.CSSProperties
              }
            >
              <Image
                src="/yeriyef/itinerarios.png"
                alt="Itinerary detail page"
                width={2000}
                height={1250}
                quality={92}
                sizes="(max-width: 1024px) 92vw, 48vw"
              />
              <span className={styles.frameEdge} aria-hidden="true" />
              <span className={`${styles.hudCorner} ${styles.tr}`} />
              <span className={`${styles.hudCorner} ${styles.bl}`} />
            </div>
          </div>
        </div>
      </section>

      {/* ──── SCENE 6 — GALLERY (pinned scrubbed) ──── */}
      <section
        data-scene="gallery"
        data-pin="gallery"
        className={styles.splitWrap}
      >
        <div data-pin-content="gallery" className={styles.splitPin}>
          <div className={`${styles.splitInner} ${styles.reverse}`}>
            <div data-gallery-copy className={styles.copy}>
              <span className={`${styles.sectionLabel} ${styles.warning}`}>
                06 / Gallery
              </span>
              <h2 className={styles.h2} data-stagger>
                Upload heavy, serve light.
              </h2>
              <p data-stagger>
                The client uploads full-res photos straight from their phone.
                The server resizes, converts to webp and stores variants.
                Visitors browse the gallery through a lightbox — fast and smooth
                on mobile.
              </p>
              <ul className={styles.featureList}>
                <li data-stagger>Auto resize + webp on upload</li>
                <li data-stagger>Responsive `srcset` per image</li>
                <li data-stagger>Lightbox viewer with keyboard navigation</li>
                <li data-stagger>Per-country galleries (Senegal, etc.)</li>
              </ul>
            </div>

            <div
              data-gallery-frame
              className={styles.shotFrame}
              style={
                {
                  ["--shotGlow" as keyof React.CSSProperties as string]:
                    "rgba(74, 222, 128, 0.32)",
                } as React.CSSProperties
              }
            >
              <Image
                src="/yeriyef/senegal_galeria.png"
                alt="Senegal gallery with lightbox"
                width={2000}
                height={1250}
                quality={92}
                sizes="(max-width: 1024px) 92vw, 48vw"
              />
              <span className={styles.frameEdge} aria-hidden="true" />
              <span className={`${styles.hudCorner} ${styles.tl}`} />
              <span className={`${styles.hudCorner} ${styles.br}`} />
            </div>
          </div>
        </div>
      </section>

      {/* ──── SCENE 7 — FAQ / HOME / SEO modules ──── */}
      <section data-scene="modules" className={styles.section}>
        <div className={styles.sectionInner}>
          <span className={`${styles.sectionLabel} ${styles.violet}`}>
            07 / The rest of the CMS
          </span>
          <h2 className={`${styles.h2} ${styles.fadeUp}`}>
            FAQs, home content, SEO.
          </h2>
          <p className={`${styles.lead} ${styles.fadeUp}`}>
            Three more editor surfaces close the loop. The home page reshapes
            itself from the CMS without ever touching the indexed keyword set.
          </p>

          <div className={styles.featGrid} style={{ marginTop: "2rem" }}>
            <article className={`${styles.featCard} ${styles.fadeUp}`}>
              <span className={styles.featCard__icon}>
                <Icon name="faq" size={22} />
              </span>
              <h3 className={styles.featCard__title}>FAQs</h3>
              <p className={styles.featCard__desc}>
                Question / answer pairs, reorderable. Used on the landing and on
                each itinerary&apos;s detail page.
              </p>
            </article>
            <article
              className={`${styles.featCard} ${styles.violet} ${styles.fadeUp}`}
            >
              <span className={styles.featCard__icon}>
                <Icon name="home" size={22} />
              </span>
              <h3 className={styles.featCard__title}>Home content</h3>
              <p className={styles.featCard__desc}>
                Hero block, intro copy, featured countries, gallery teaser. The
                landing is fully editable without code deploys.
              </p>
            </article>
            <article
              className={`${styles.featCard} ${styles.warning} ${styles.fadeUp}`}
            >
              <span className={styles.featCard__icon}>
                <Icon name="seo" size={22} />
              </span>
              <h3 className={styles.featCard__title}>SEO keywords</h3>
              <p className={styles.featCard__desc}>
                Keywords live on a separate config decoupled from the editable
                content — so daily content tweaks never pollute the indexed term
                set.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ──── STACK ──── */}
      <section className={styles.stack}>
        <div className={styles.stackInner}>
          <span className={`${styles.sectionLabel}`}>08 / Stack</span>
          <h2 className={`${styles.h2} ${styles.fadeUp}`}>Pragmatic build.</h2>
          <p
            className={`${styles.lead} ${styles.fadeUp}`}
            style={{ margin: "0 auto" }}
          >
            Picked tools that the client could host cheaply, that handle media
            well, and that I can extend fast when the agency asks for the next
            feature.
          </p>

          <div className={styles.stackGrid}>
            {[
              "Next.js",
              "React",
              "MongoDB",
              "Tailwind CSS",
              "Node.js",
              "Image optimization",
              "Lightbox",
              "Admin UI",
              "REST API",
              "Auth",
              "Webp pipeline",
              "Vercel",
            ].map((t) => (
              <div key={t} className={`${styles.stackChip} ${styles.fadeUp}`}>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── FINAL ──── */}
      <section data-scene="final" className={styles.final}>
        <div className={styles.finalInner}>
          <div className={styles.finalKicker}>
            ● Status — Built · Live (private) · Owned by client
          </div>
          <h2 data-final-title className={styles.finalTitle}>
            Built for the road.
          </h2>
          <p className={`${styles.finalSubtitle} ${styles.fadeUp}`}>
            The site is in production and serving real customers. It&apos;s not
            linked publicly here to protect the client&apos;s data — the case
            study lives entirely on these screens.
          </p>

          <div className={styles.finalCards}>
            <div className={`${styles.finalCard} ${styles.fadeUp}`}>
              <h5>Freelance · 2025</h5>
              <p>
                Designed, built and handed over end-to-end. Client owns the
                code.
              </p>
            </div>
            <div className={`${styles.finalCard} ${styles.fadeUp}`}>
              <h5>Bespoke CMS</h5>
              <p>
                Custom backoffice, not a CMS framework. Less surface area,
                tighter UX for the team.
              </p>
            </div>
            <div className={`${styles.finalCard} ${styles.fadeUp}`}>
              <h5>SEO-safe</h5>
              <p>
                Keywords decoupled from content. Editing copy never affects the
                indexed term set.
              </p>
            </div>
          </div>

          <div className={styles.ctaRow}>
            <Link href="/projects" className={`${styles.cta} ${styles.fadeUp}`}>
              <Icon name="map" size={16} />
              <span>Back to projects</span>
              <span className={styles.ctaArrow}>
                <Icon name="arrow" size={14} />
              </span>
            </Link>
            <a
              href="mailto:gerard_llanas@outlook.com"
              className={`${styles.ctaGhost} ${styles.fadeUp}`}
            >
              <Icon name="github" size={16} />
              <span>Ask me about it</span>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
