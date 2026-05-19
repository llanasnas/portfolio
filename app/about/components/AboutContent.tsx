"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import styles from "./About.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ──────────────────────────────────────────────────────────
   DATA — extracted from Gerard_Llanas_CV_EN.pdf (lib/)
   ────────────────────────────────────────────────────────── */

const PROFILE = {
  name: "GERARD LLANAS CONESA",
  alias: "gerard.llanas",
  roles: [
    { label: "Full Stack AI Engineer", icon: "ai" as const },
    { label: "LLM Application Developer", icon: "code" as const },
  ],
  location: "Vilanova i la Geltrú · Barcelona, ES",
  availability: "Remote / Hybrid · EU",
  email: "gerard_llanas@outlook.com",
  phone: "+34 689 233 136",
  yearsXp: "07+",
  status: "ACTIVE",
  summary:
    "Full Stack Engineer with 7+ years shipping production web and mobile apps, currently specialized in AI-native products powered by LLMs. I turn unstructured data — text, images, audio, video — into reliable product features through LLM pipelines, structured outputs and tool use. Deep TypeScript / Node.js plus modern AI engineering: spec-driven development, agentic coding, evaluations and MCP integrations.",
};

const SKILL_GROUPS: Array<{
  key: string;
  title: string;
  count: string;
  icon:
    | "ai"
    | "code"
    | "frontend"
    | "backend"
    | "db"
    | "cloud"
    | "tools"
    | "method";
  variant?: "violet" | "green" | "warning";
  items: string[];
}> = [
  {
    key: "ai",
    title: "AI / LLM Engineering",
    count: "PRIMARY",
    icon: "ai",
    items: [
      "Claude",
      "OpenAI",
      "Gemini",
      "Ollama (local)",
      "Prompt engineering",
      "Structured outputs",
      "Function calling / tool use",
      "Agentic workflows",
      "Evaluations",
      "Multimodal pipelines",
    ],
  },
  {
    key: "lang",
    title: "Languages & Runtimes",
    count: "5 / 5",
    icon: "code",
    items: ["TypeScript", "JavaScript (ES2022+)", "Node.js", "PHP", "Java"],
  },
  {
    key: "frontend",
    title: "Frontend",
    count: "5 / 5",
    icon: "frontend",
    variant: "violet",
    items: ["React", "React Native", "Vue.js", "Next.js", "Tailwind CSS"],
  },
  {
    key: "backend",
    title: "Backend",
    count: "5 / 5",
    icon: "backend",
    variant: "green",
    items: [
      "Node.js",
      "Express",
      "Laravel",
      "REST APIs",
      "WebSockets (Socket.IO)",
    ],
  },
  {
    key: "db",
    title: "Databases",
    count: "5 / 5",
    icon: "db",
    items: ["MongoDB", "MySQL", "SQL Server", "PostgreSQL", "Vector stores"],
  },
  {
    key: "cloud",
    title: "Cloud & DevOps",
    count: "5 / 5",
    icon: "cloud",
    variant: "violet",
    items: ["Docker", "AWS", "Linux", "Git", "CI/CD"],
  },
  {
    key: "tools",
    title: "AI Dev Tools",
    count: "7 / 7",
    icon: "tools",
    variant: "warning",
    items: [
      "Claude Code",
      "OpenAI Codex",
      "OpenCode",
      "Cursor",
      "MCP servers",
      "agents.md",
      "Custom skills",
    ],
  },
  {
    key: "method",
    title: "Methodologies",
    count: "4 / 4",
    icon: "method",
    variant: "green",
    items: [
      "Agile",
      "Spec-driven development",
      "Test-driven development",
      "Code reviews",
    ],
  },
];

const TIMELINE: Array<{
  range: string;
  title: string;
  company: string;
  location: string;
  current?: boolean;
  bullets: string[];
}> = [
  {
    range: "FEB 2025 — PRESENT",
    title: "Independent AI Engineer & Full Stack Developer",
    company: "Freelance / Self-directed AI Projects",
    location: "Remote",
    current: true,
    bullets: [
      "Designing and shipping AI-native full-stack applications that integrate LLMs as a core product capability — focused on TypeScript and Node.js.",
      "Building LLM pipelines that extract structured data from text, images, documents and YouTube transcripts for downstream business logic.",
      "Adopting spec-driven development and agentic coding workflows (Claude Code, Codex, OpenCode, MCP) to accelerate delivery while keeping code reviewable.",
      "Reusable skills, agents and prompt frameworks to standardize how AI assistants plug into engineering pipelines.",
      "Completed an intensive Master's program in Full Stack Development (MERN) at Nuclio Digital School in parallel with client projects.",
    ],
  },
  {
    range: "JUN 2020 — JAN 2025",
    title: "Full Stack Developer",
    company: "ITnube",
    location: "Barcelona · Remote",
    bullets: [
      "Designed and shipped custom B2B web applications with Node.js, Vue.js and PHP.",
      "Built real-time collaborative features with Socket.IO.",
      "Developed cross-platform mobile apps with React Native.",
      "Designed and maintained REST APIs against SQL Server and MySQL.",
      "Containerized dev and deployment workflows with Docker on Linux.",
      "Maintained legacy WordPress platforms and internal tools; on-call for production incidents.",
    ],
  },
  {
    range: "JAN 2018 — DEC 2019",
    title: "Full Stack Developer",
    company: "Telanto",
    location: "Barcelona",
    bullets: [
      "Built and maintained web applications using Vue.js and Laravel.",
      "Managed cloud infrastructure on AWS.",
      "Optimized SQL queries and improved overall application performance.",
      "Worked with Git in collaborative team environments.",
    ],
  },
];

const FEATURED = [
  {
    href: "/projects/mincely",
    badge: "AI · OPEN SOURCE",
    title: "Mincely",
    desc: "Recipe Intelligence Engine — turns text, docs, photos or YouTube videos into structured recipes with macros. Multi-provider LLM routing, USDA-backed nutrition.",
    tech: ["Next.js 15", "Anthropic", "OpenAI", "Ollama", "Neon", "Zod"],
    variant: "default" as const,
  },
  {
    href: "/projects/groupio",
    badge: "SAAS · LIVE",
    title: "Groupio",
    desc: "Real-time group management SaaS PWA. AI-assisted automation flows, AI receipt scanning, custom dashboards. Built end-to-end.",
    tech: ["React", "Node.js", "MongoDB", "Socket.IO", "PWA"],
    variant: "violet" as const,
  },
];

const EDUCATION: Array<{
  title: string;
  org: string;
  year: string;
  rarity: "rare" | "epic" | "legendary";
}> = [
  {
    title: "Master in Full Stack Development (MERN)",
    org: "Nuclio Digital School",
    year: "2025",
    rarity: "legendary",
  },
  {
    title: "Higher Technician in Multi-platform Application Development",
    org: "La Salle Gràcia",
    year: "2018",
    rarity: "epic",
  },
  {
    title: "Technician in Telecommunications Installations",
    org: "Salesians de Sarrià",
    year: "2016",
    rarity: "rare",
  },
];

const LANGUAGES = [
  { name: "Spanish", level: "Native", pct: 100 },
  { name: "Catalan", level: "Native", pct: 100 },
  { name: "English", level: "Professional working proficiency", pct: 80 },
];

/* ──────────────────────────────────────────────────────────
   CYBERPUNK SVG ICONS
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

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const common = { width: size, height: size, ...sw };
  switch (name) {
    case "ai":
      return (
        <svg {...common}>
          <rect x="5" y="6" width="14" height="12" rx="2" />
          <path d="M9 6V3M15 6V3M9 21v-3M15 21v-3M3 9h3M3 15h3M18 9h3M18 15h3" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <polyline points="8 6 2 12 8 18" />
          <polyline points="16 6 22 12 16 18" />
          <line x1="14" y1="4" x2="10" y2="20" />
        </svg>
      );
    case "frontend":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M3 9h18" />
          <path d="M7 14h3M14 14h3" />
          <path d="M9 22h6" />
        </svg>
      );
    case "backend":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="6" rx="2" />
          <rect x="3" y="14" width="18" height="6" rx="2" />
          <path d="M7 7h.01M7 17h.01" />
        </svg>
      );
    case "db":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
          <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <path d="M17 18h1a4 4 0 0 0 0-8 6 6 0 0 0-11.6-1A4.5 4.5 0 0 0 6 18h2" />
          <path d="M12 13v8M9 18l3 3 3-3" />
        </svg>
      );
    case "tools":
      return (
        <svg {...common}>
          <path d="m14.7 6.3 3 3" />
          <path d="M9 21H4v-5L15 5l5 5z" />
          <path d="M12 8l4 4" />
        </svg>
      );
    case "method":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M8 9h8M8 13h8M8 17h5" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "signal":
      return (
        <svg {...common}>
          <path
            d="M3 18h2v-2H3zM7 18h2v-6H7zM11 18h2v-10h-2zM15 18h2V4h-2z"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <path d="m3 7 9 7 9-7" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5 12.8 12.8 0 0 0 2.8.7 2 2 0 0 1 1.8 2z" />
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
    case "linkedin":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.4v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...common} strokeWidth={2}>
          <path d="M5 12h14" />
          <path d="m13 5 7 7-7 7" />
        </svg>
      );
    case "hexHud":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          <path d="M20 4 4 12v16l16 8 16-8V12L20 4z" />
          <path d="M20 14 12 18v8l8 4 8-4v-8l-8-4z" opacity="0.5" />
          <circle cx="20" cy="22" r="2" fill="currentColor" />
        </svg>
      );
    case "trophy":
      return (
        <svg {...common}>
          <path d="M8 21h8M12 17v4" />
          <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
          <path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" />
        </svg>
      );
    case "lang":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    default:
      return null;
  }
}

/* ──────────────────────────────────────────────────────────
   PARTICLES
   ────────────────────────────────────────────────────────── */
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}
function Particles({ count = 28 }: { count?: number }) {
  const dots = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: rand(i + 1) * 100,
        duration: 8 + rand(i + 2) * 10,
        delay: rand(i + 3) * 8,
        size: 1 + rand(i + 4) * 2.5,
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
            width: d.size,
            height: d.size,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   MAIN
   ────────────────────────────────────────────────────────── */
export default function AboutContent() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [commandText, setCommandText] = useState("");
  const FULL_CMD = `whoami → ${PROFILE.alias}`;

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

  // Typewriter
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      setCommandText(FULL_CMD);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCommandText(FULL_CMD.slice(0, i));
      if (i >= FULL_CMD.length) window.clearInterval(id);
    }, 55);
    return () => window.clearInterval(id);
  }, [FULL_CMD]);

  // GSAP timelines
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      // Name reveal (per letter, two rows)
      const letters = gsap.utils.toArray<HTMLElement>("[data-name-letter]");
      if (!reduce) {
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .to(letters, {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.035,
            delay: 0.4,
          })
          .from(
            "[data-hero-fade]",
            { y: 30, opacity: 0, stagger: 0.1, duration: 0.9 },
            "-=0.4",
          )
          .from(
            "[data-id-card]",
            { y: 60, opacity: 0, scale: 0.96, duration: 1.1 },
            "-=0.7",
          );
      } else {
        gsap.set([letters, "[data-hero-fade]", "[data-id-card]"], {
          y: 0,
          opacity: 1,
          scale: 1,
        });
      }

      // Generic fadeUp
      gsap.utils.toArray<HTMLElement>(`.${styles.fadeUp}`).forEach((el) => {
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
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      // Career rail draw-on
      gsap.to("[data-log-rail]", {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: "[data-log]",
          start: "top 70%",
          end: "bottom 70%",
          scrub: 0.5,
        },
      });

      // Language bars
      gsap.utils.toArray<HTMLElement>("[data-lang-bar]").forEach((bar) => {
        const target = bar.dataset.target || "70";
        gsap.fromTo(
          bar,
          { ["--w" as string]: "0%" },
          {
            ["--w" as string]: `${target}%`,
            duration: 1.4,
            ease: "expo.out",
            scrollTrigger: {
              trigger: bar,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

  const nameParts = PROFILE.name.split(" ");

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

      {/* ──── SCENE 1 — HERO ──── */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.terminal}>
            <div className={styles.term__head}>
              SESSION · OPERATOR · {PROFILE.status}
            </div>
            <div className={styles.term__prompt}>
              {commandText}
              <span className="inline-block w-[6px] h-[14px] bg-cyan-300 ml-1 align-middle animate-pulse" />
            </div>

            <h1
              className={styles.name}
              data-text={PROFILE.name}
              aria-label={PROFILE.name}
            >
              {nameParts.map((word, w) => (
                <span key={w} className={styles.name__row}>
                  {word.split("").map((ch, i) => (
                    <span key={`${w}-${i}`} data-name-letter>
                      {ch}
                    </span>
                  ))}
                  {w < nameParts.length - 1 && (
                    <span data-name-letter>{" "}</span>
                  )}
                </span>
              ))}
            </h1>

            <div className={styles.roleRow} data-hero-fade>
              {PROFILE.roles.map((r, i) => (
                <span
                  key={r.label}
                  className={`${styles.roleChip} ${i % 2 ? styles.violet : ""}`}
                >
                  <Icon name={r.icon} size={12} />
                  {r.label}
                </span>
              ))}
            </div>

            <p className={styles.summary} data-hero-fade>
              {PROFILE.summary}
            </p>

            <div className={styles.heroActions} data-hero-fade>
              <a href={`mailto:${PROFILE.email}`} className={styles.btnPrimary}>
                <Icon name="mail" size={16} />
                <span>Initiate contact</span>
                <Icon name="arrow" size={14} />
              </a>
              <Link href="/journey" className={styles.btnGhost}>
                <Icon name="hexHud" size={16} />
                <span>View Journey</span>
              </Link>
              <a
                href="/Gerard_Llanas_CV_EN.pdf"
                download="Gerard_Llanas_CV.pdf"
                className={styles.btnCV}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M8 2v8M5 7l3 3 3-3" />
                  <path d="M3 12h10" />
                </svg>
                <span>Download CV</span>
              </a>
            </div>
          </div>

          {/* ID CARD */}
          <aside
            data-id-card
            className={styles.idCard}
            aria-label="Operator ID card"
          >
            <div className={styles.idCard__bg} aria-hidden="true" />
            <div className={styles.idCard__head}>
              <span>
                ID · <strong>GLC-2026</strong>
              </span>
              <span>{PROFILE.status}</span>
            </div>

            <div className={styles.idCard__hex} aria-hidden="true">
              <Icon name="hexHud" size={48} />
            </div>

            <div className={styles.idCard__avatar}>
              <span className={styles.idCard__ring} aria-hidden="true" />
              <span className={styles.idCard__ringInner} aria-hidden="true" />
              <img
                src="/assets/avatar_portfolio.png"
                alt="Gerard Llanas avatar"
                loading="lazy"
              />
            </div>

            <p className={styles.idCard__name}>{PROFILE.name}</p>
            <p className={styles.idCard__sub}>{PROFILE.alias}</p>

            <div className={styles.idCard__stats}>
              <div className={`${styles.idCard__stat} ${styles.accent}`}>
                <span>Years XP</span>
                <strong>{PROFILE.yearsXp}</strong>
              </div>
              <div className={`${styles.idCard__stat} ${styles.violet}`}>
                <span>Mode</span>
                <strong>{PROFILE.availability}</strong>
              </div>
              <div className={styles.idCard__stat}>
                <span>Base</span>
                <strong>Barcelona</strong>
              </div>
              <div className={styles.idCard__stat}>
                <span>Signal</span>
                <strong>Online</strong>
              </div>
            </div>

            <span className={`${styles.hudCorner} ${styles.tl}`} />
            <span className={`${styles.hudCorner} ${styles.tr}`} />
            <span className={`${styles.hudCorner} ${styles.bl}`} />
            <span className={`${styles.hudCorner} ${styles.br}`} />
          </aside>
        </div>
      </section>

      {/* ──── SCENE 2 — SKILL MATRIX ──── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionLabel}>02 / Skill Matrix</span>
          <h2 className={`${styles.h2} ${styles.fadeUp}`}>
            Stack &amp; tooling, in modules.
          </h2>
          <p className={`${styles.sectionLead} ${styles.fadeUp}`}>
            Eight clusters, mapped to how I actually build. AI / LLM engineering
            sits at the core; everything else snaps in around it.
          </p>

          <div className={styles.matrix}>
            {SKILL_GROUPS.map((g) => (
              <article
                key={g.key}
                className={`${styles.skillCard} ${styles.fadeUp} ${g.variant ? styles[g.variant] : ""}`}
              >
                <div className={styles.skillCard__panel}>
                  <div className={styles.skillCard__head}>
                    <span className={styles.skillCard__icon}>
                      <Icon name={g.icon} size={20} />
                    </span>
                    <h3 className={styles.skillCard__title}>{g.title}</h3>
                    <span className={styles.skillCard__count}>{g.count}</span>
                  </div>
                  <ul className={styles.skillCard__list}>
                    {g.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ──── SCENE 3 — CAREER LOG ──── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <span className={`${styles.sectionLabel} ${styles.violet}`}>
            03 / Boot Sequence Log
          </span>
          <h2 className={`${styles.h2} ${styles.fadeUp}`}>Career, replayed.</h2>
          <p className={`${styles.sectionLead} ${styles.fadeUp}`}>
            Eight years of full-stack delivery — from Vue + Laravel B2B apps to
            today&apos;s AI-native pipelines. Each entry is a real role, real
            outputs.
          </p>

          <div className={styles.log} data-log>
            <span
              className={styles.log__rail}
              data-log-rail
              aria-hidden="true"
            />
            {TIMELINE.map((t) => (
              <article
                key={t.range}
                className={`${styles.logItem} ${t.current ? styles.current : ""} ${styles.fadeUp}`}
              >
                <span className={styles.logItem__node} aria-hidden="true" />
                <div className={styles.logItem__meta}>
                  <span>{t.range}</span>
                  {t.current && <span className={styles.live}>● ACTIVE</span>}
                  <span>· {t.location}</span>
                </div>
                <h3 className={styles.logItem__title}>{t.title}</h3>
                <div className={styles.logItem__company}>{t.company}</div>
                <ul className={styles.logItem__bullets}>
                  {t.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ──── SCENE 4 — FEATURED PROJECTS ──── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <span className={`${styles.sectionLabel} ${styles.green}`}>
            04 / Selected Projects
          </span>
          <h2 className={`${styles.h2} ${styles.fadeUp}`}>
            What I&apos;m building.
          </h2>
          <p className={`${styles.sectionLead} ${styles.fadeUp}`}>
            Two AI-native products, both built end-to-end. Full case studies
            inside.
          </p>

          <div className={styles.featGrid}>
            {FEATURED.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className={`${styles.feat} ${styles.fadeUp} ${f.variant === "violet" ? styles.violet : ""}`}
              >
                <div className={styles.feat__head}>
                  <strong>{f.badge}</strong>
                  <span>Case Study</span>
                </div>
                <h3 className={styles.feat__title}>
                  <Icon name="code" size={18} />
                  {f.title}
                </h3>
                <p className={styles.feat__desc}>{f.desc}</p>
                <div className={styles.feat__tech}>
                  {f.tech.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <span className={styles.feat__arrow} aria-hidden="true">
                  <Icon name="arrow" size={22} />
                </span>
                <span className={`${styles.hudCorner} ${styles.tl}`} />
                <span className={`${styles.hudCorner} ${styles.br}`} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──── SCENE 5 — EDUCATION ACHIEVEMENTS ──── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <span className={`${styles.sectionLabel}`}>
            05 / Achievements Unlocked
          </span>
          <h2 className={`${styles.h2} ${styles.fadeUp}`}>Formal training.</h2>
          <p className={`${styles.sectionLead} ${styles.fadeUp}`}>
            Master&apos;s + two technical degrees. Cyber-style rarity for fun —
            but the credentials are real.
          </p>

          <div className={styles.achievements}>
            {EDUCATION.map((e) => (
              <article
                key={e.title}
                className={`${styles.achv} ${styles[e.rarity]} ${styles.fadeUp}`}
              >
                <span className={styles.achv__rarity}>{e.rarity}</span>
                <span className={styles.achv__icon}>
                  <Icon name="trophy" size={22} />
                </span>
                <h3 className={styles.achv__title}>{e.title}</h3>
                <p className={styles.achv__org}>{e.org}</p>
                <div className={styles.achv__year}>{e.year}</div>
                <span className={`${styles.hudCorner} ${styles.tr}`} />
                <span className={`${styles.hudCorner} ${styles.bl}`} />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ──── SCENE 6 — LANGUAGES ──── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <span className={`${styles.sectionLabel} ${styles.violet}`}>
            06 / Languages
          </span>
          <h2 className={`${styles.h2} ${styles.fadeUp}`}>Comms channels.</h2>

          <div className={`${styles.langs} ${styles.fadeUp}`}>
            {LANGUAGES.map((l) => (
              <div key={l.name} className={styles.lang}>
                <div className={styles.lang__head}>
                  <span>
                    <Icon name="lang" size={12} /> &nbsp; {l.name}
                  </span>
                  <em>{l.level}</em>
                </div>
                <div
                  data-lang-bar
                  data-target={l.pct}
                  className={styles.lang__bar}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── SCENE 7 — CONTACT CTA ──── */}
      <section className={styles.cta}>
        <div className={`${styles.ctaCard} ${styles.fadeUp}`}>
          <div className={styles.ctaCmd}>contact --send</div>
          <h2 className={styles.ctaTitle}>Let&apos;s build.</h2>
          <p className={styles.ctaSub}>
            AI-native product? LLM pipeline? Long-running full-stack mission?
            I&apos;m open to remote / hybrid work across the EU. Drop a line.
          </p>
          <div className={styles.ctaButtons}>
            <a href={`/contact`} className={styles.btnPrimary}>
              <Icon name="mail" size={16} />
              <span>CONTACT</span>
              <Icon name="arrow" size={14} />
            </a>
            <a
              href="https://github.com/llanasnas"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnGhost}
            >
              <Icon name="github" size={16} />
              <span>GitHub</span>
            </a>
            <a
              href={`tel:${PROFILE.phone.replace(/\s/g, "")}`}
              className={styles.btnGhost}
            >
              <Icon name="phone" size={16} />
              <span>{PROFILE.phone}</span>
            </a>
          </div>
          <span className={`${styles.hudCorner} ${styles.tl}`} />
          <span className={`${styles.hudCorner} ${styles.tr}`} />
          <span className={`${styles.hudCorner} ${styles.bl}`} />
          <span className={`${styles.hudCorner} ${styles.br}`} />
        </div>
      </section>
    </main>
  );
}
