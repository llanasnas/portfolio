"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ──────────────────────────────────────────────────────────
   DATA (intacto respecto a tu versión)
   ────────────────────────────────────────────────────────── */
const SKILLS_GRID = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "TailwindCSS", "Vue.js"],
  },
  { category: "Backend", items: ["Node.js", "Express", "PHP", "Laravel"] },
  { category: "Database", items: ["MongoDB", "SQL / MySQL", "Redis"] },
  { category: "Mobile", items: ["React Native", "Expo"] },
  {
    category: "AI & Tools",
    items: [
      "OpenAI API",
      "Anthropic API",
      "Ollama",
      "Claude Code",
      "Open Code",
      "GitHub Copilot",
    ],
  },
  { category: "Infra & DevOps", items: ["Docker", "AWS", "Vercel"] },
];

const TIMELINE = [
  {
    year: "2019",
    title: "First Lines of Code",
    desc: "Started with HTML, CSS and JavaScript building small static sites. Curiosity turned into obsession.",
    type: "education",
  },
  {
    year: "2020–2021",
    title: "DAW — Web Application Development",
    desc: "Formal training in software engineering, algorithms, databases, and full-stack web development.",
    type: "education",
  },
  {
    year: "2022",
    title: "React & Node.js Deep Dive",
    desc: "Mastered the modern JS ecosystem — component-driven UIs, REST APIs, MongoDB integration.",
    type: "work",
  },
  {
    year: "2023",
    title: "First Freelance Projects",
    desc: "Delivered real-world client projects: ecommerce platforms, booking systems, corporate sites.",
    type: "freelance",
  },
  {
    year: "2024",
    title: "Full Stack Engineer",
    desc: "SaaS products, TypeScript everywhere, CI/CD pipelines, and production-grade deployments.",
    type: "work",
  },
  {
    year: "2025–Now",
    title: "AI-Integrated Engineer",
    desc: "Building AI-powered applications with LLMs, multimodal models and agent architectures.",
    type: "ai",
  },
];

const TYPE_COLORS: Record<string, string> = {
  education: "var(--type-education)",
  work: "var(--type-work)",
  freelance: "var(--type-freelance)",
  ai: "var(--accent-violet)",
};

const STATS = [
  { value: 5, suffix: "+", label: "Years coding" },
  { value: 15, suffix: "+", label: "Projects shipped" },
  { value: 6500, suffix: "+", label: "XP earned" },
  { value: null, suffix: "∞", label: "Coffee consumed" },
];

/* ──────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────── */

/** Splits text into per-character spans for stagger reveals. */
function SplitChars({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span key={i} className="gl-char-wrap" aria-hidden="true">
          <span className="gl-char">{ch === " " ? "\u00A0" : ch}</span>
        </span>
      ))}
    </span>
  );
}

/* ──────────────────────────────────────────────────────────
   MAIN COMPONENT
   ────────────────────────────────────────────────────────── */
export default function AboutContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineLineRef = useRef<HTMLDivElement>(null);

  /* ── Lenis + GSAP integration ─────────────────────────── */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expoOut feel
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  /* ── Custom cursor (lerp) ─────────────────────────────── */
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const cursor = cursorRef.current;
    if (!cursor) return;

    document.documentElement.classList.add("has-custom-cursor");
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const tick = () => {
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;
      cursor.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    const hoverables = document.querySelectorAll<HTMLElement>(
      "a, button, [data-cursor-hover]",
    );
    const onEnter = () => cursor.setAttribute("data-hover", "true");
    const onLeave = () => cursor.setAttribute("data-hover", "false");
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      hoverables.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  /* ── GSAP master timeline ─────────────────────────────── */
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      /* ── Hero: char-by-char reveal at load ──────────── */
      gsap.to(".gl-hero-eyebrow .gl-char", {
        y: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.02,
        delay: 0.1,
      });
      gsap.to(".gl-hero-title .gl-char", {
        y: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.025,
        delay: 0.25,
      });
      gsap.to(".gl-hero-pill", {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.9,
      });
      gsap.to(".gl-hero-desc", {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        delay: 1.1,
      });

      /* ── Hero: cinematic scroll-out (zoom + blur) ───── */
      gsap.to(heroTitleRef.current, {
        scale: 1.35,
        filter: "blur(8px)",
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "+=80%",
          scrub: 0.6,
        },
      });

      /* ── Background blobs parallax ──────────────────── */
      gsap.to(blob1Ref.current, {
        y: -180,
        x: 60,
        scale: 1.2,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
      gsap.to(blob2Ref.current, {
        y: 220,
        x: -40,
        scale: 0.85,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      /* ── Generic reveal on scroll ───────────────────── */
      gsap.utils.toArray<HTMLElement>(".gl-reveal").forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });

      /* ── Stats counter animation ────────────────────── */
      gsap.utils.toArray<HTMLElement>("[data-counter]").forEach((el) => {
        const target = Number(el.getAttribute("data-counter"));
        if (Number.isNaN(target)) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
          onUpdate: () => {
            el.textContent = Math.floor(obj.val).toLocaleString();
          },
        });
      });

      /* ── Timeline: progressive line draw ────────────── */
      if (timelineLineRef.current && timelineRef.current) {
        gsap.fromTo(
          timelineLineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top center",
            scrollTrigger: {
              trigger: timelineRef.current,
              start: "top 70%",
              end: "bottom 80%",
              scrub: 0.8,
            },
          },
        );
      }

      /* ── Timeline dots: pop when reached ─────────────── */
      gsap.utils.toArray<HTMLElement>(".gl-timeline-dot").forEach((dot) => {
        gsap.fromTo(
          dot,
          { scale: 0.4, opacity: 0.3 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(2)",
            scrollTrigger: { trigger: dot, start: "top 75%", once: true },
          },
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  /* ── Magnetic buttons ─────────────────────────────────── */
  useEffect(() => {
    const buttons = document.querySelectorAll<HTMLElement>("[data-magnetic]");
    const cleanups: (() => void)[] = [];

    buttons.forEach((btn) => {
      const onMove = (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, {
          x: x * 0.25,
          y: y * 0.25,
          duration: 0.4,
          ease: "power3.out",
        });
      };
      const onLeave = () =>
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)",
        });
      btn.addEventListener("mousemove", onMove);
      btn.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        btn.removeEventListener("mousemove", onMove);
        btn.removeEventListener("mouseleave", onLeave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  /* ── Tilt cards (3D + cursor-following glow) ─────────── */
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".gl-tilt");
    const cleanups: (() => void)[] = [];

    cards.forEach((card) => {
      const onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const px = x / r.width - 0.5;
        const py = y / r.height - 0.5;
        card.style.setProperty("--mx", `${x}px`);
        card.style.setProperty("--my", `${y}px`);
        gsap.to(card, {
          rotateX: -py * 6,
          rotateY: px * 8,
          duration: 0.4,
          ease: "power2.out",
        });
      };
      const onLeave = () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: "power3.out",
        });
      };
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      cleanups.push(() => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  /* ──────────────────────────────────────────────────────
     RENDER
     ────────────────────────────────────────────────────── */
  return (
    <div
      ref={rootRef}
      className="min-h-screen relative overflow-hidden"
      style={{ background: "var(--bg-0)", color: "var(--fg-2)" }}
    >
      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className="gl-cursor"
        data-hover="false"
        aria-hidden="true"
      />

      {/* Background layers */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 gl-grid-bg" />
        <div className="absolute inset-0 gl-noise" />
        <div
          ref={blob1Ref}
          className="absolute rounded-full"
          style={{
            width: 620,
            height: 620,
            top: "-12%",
            right: "-12%",
            background: "rgba(184,123,255,0.14)",
            filter: "blur(100px)",
          }}
        />
        <div
          ref={blob2Ref}
          className="absolute rounded-full"
          style={{
            width: 480,
            height: 480,
            bottom: "5%",
            left: "-10%",
            background: "rgba(106,166,255,0.12)",
            filter: "blur(90px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 pt-28 pb-24">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-12 text-xs font-mono tracking-widest uppercase transition-colors duration-200 hover:text-(--fg-1)"
          style={{ color: "var(--fg-4)" }}
        >
          <span style={{ fontSize: 16 }}>←</span> Back to Portfolio
        </Link>

        {/* HERO */}
        <section className="mb-32">
          <p
            className="gl-hero-eyebrow font-mono text-xs tracking-[0.22em] uppercase mb-4"
            style={{ color: "var(--accent-cyan)" }}
          >
            <SplitChars text="Player Profile" />
          </p>

          <h1
            ref={heroTitleRef}
            className="gl-hero-title text-4xl md:text-6xl lg:text-7xl font-bold mb-5 leading-[1.05]"
            style={{
              color: "var(--fg-1)",
              letterSpacing: "-0.02em",
              willChange: "transform, filter, opacity",
            }}
          >
            <SplitChars text="Gerard Llanas" />
            <br />
            <span
              className="gl-animated-gradient"
              style={{
                background: "var(--grad-level)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              <SplitChars text="Conesa" />
            </span>
          </h1>

          <div className="flex flex-wrap items-center gap-3 mb-8">
            {[
              { label: "LV 6", style: { background: "var(--grad-level)" } },
              {
                label: "Full Stack Developer",
                style: {
                  background: "rgba(90,215,255,0.12)",
                  border: "1px solid rgba(90,215,255,0.35)",
                  color: "var(--accent-cyan)",
                },
              },
              {
                label: "AI-Integrated Engineer",
                style: {
                  background: "rgba(184,123,255,0.12)",
                  border: "1px solid rgba(184,123,255,0.35)",
                  color: "var(--accent-violet)",
                },
              },
              {
                label: "Open to Work",
                style: {
                  background: "rgba(74,222,128,0.12)",
                  border: "1px solid rgba(74,222,128,0.35)",
                  color: "var(--success)",
                },
              },
            ].map(({ label, style }) => (
              <span
                key={label}
                className="gl-hero-pill px-3 py-1.5 rounded-full font-mono text-xs font-semibold tracking-wider text-white"
                style={{ ...style, opacity: 0, transform: "translateY(12px)" }}
              >
                {label}
              </span>
            ))}
          </div>

          <p
            className="gl-hero-desc text-base md:text-lg leading-relaxed max-w-2xl"
            style={{
              color: "var(--fg-2)",
              opacity: 0,
              transform: "translateY(20px)",
            }}
          >
            I build products end-to-end — from pixel-perfect interfaces to
            production APIs and infrastructure. I care about code quality,
            developer experience, and shipping things that actually work at
            scale. Currently focused on AI-integrated applications and real-time
            SaaS platforms.
          </p>
        </section>

        {/* STATS */}
        <section className="mb-24">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="gl-reveal gl-tilt relative p-5 rounded-2xl border flex flex-col gap-1 overflow-hidden"
                style={{
                  background: "rgba(15,18,32,0.7)",
                  borderColor: "var(--glass-stroke-strong)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="gl-tilt-glow" />
                <div className="flex items-baseline gap-0.5">
                  <span
                    data-counter={stat.value ?? undefined}
                    className="font-mono text-3xl font-bold leading-none"
                    style={{
                      background: "var(--grad-xp)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {stat.value !== null ? "0" : ""}
                  </span>
                  <span
                    className="font-mono text-3xl font-bold leading-none"
                    style={{
                      background: "var(--grad-xp)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {stat.suffix}
                  </span>
                </div>
                <span
                  className="font-mono text-xs tracking-wider uppercase"
                  style={{ color: "var(--fg-4)" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SKILLS */}
        <section className="mb-24">
          <div className="gl-reveal">
            <SectionTitle eyebrow="Skill Tree" title="Tech Stack" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {SKILLS_GRID.map(({ category, items }) => (
              <div
                key={category}
                className="gl-reveal gl-tilt relative p-5 rounded-2xl border overflow-hidden"
                style={{
                  background: "rgba(15,18,32,0.6)",
                  borderColor: "var(--glass-stroke)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="gl-tilt-glow" />
                <p
                  className="font-mono text-xs tracking-[0.18em] uppercase mb-4 font-semibold"
                  style={{ color: "var(--fg-3)" }}
                >
                  {category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-1 rounded-full text-xs font-medium border transition-colors duration-200 hover:bg-white/5"
                      style={{
                        color: "var(--fg-2)",
                        background: "rgba(106,166,255,0.06)",
                        borderColor: "rgba(106,166,255,0.18)",
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TIMELINE */}
        <section className="mb-24">
          <div className="gl-reveal">
            <SectionTitle eyebrow="Career Path" title="My Journey" />
          </div>
          <div ref={timelineRef} className="mt-10 relative">
            {/* Static rail */}
            <div
              className="absolute left-1.75 top-0 bottom-0 w-px"
              style={{ background: "var(--glass-stroke)" }}
            />
            {/* Animated draw line */}
            <div
              ref={timelineLineRef}
              className="absolute left-1.75 top-0 bottom-0 w-px origin-top"
              style={{
                background:
                  "linear-gradient(to bottom, var(--accent-cyan), var(--accent-violet))",
                boxShadow: "0 0 12px rgba(184,123,255,0.6)",
              }}
            />

            <div className="flex flex-col gap-8 pl-8">
              {TIMELINE.map((item) => (
                <div key={item.year} className="gl-reveal relative group">
                  <div
                    className="gl-timeline-dot absolute -left-8 top-1 w-3.75 h-3.75 rounded-full border-2"
                    style={{
                      borderColor: TYPE_COLORS[item.type] ?? "var(--fg-4)",
                      background: "var(--bg-1)",
                      boxShadow: `0 0 12px ${TYPE_COLORS[item.type] ?? "transparent"}66`,
                    }}
                  />
                  <div>
                    <span
                      className="font-mono text-xs tracking-wider uppercase font-semibold mb-1.5 inline-block"
                      style={{ color: TYPE_COLORS[item.type] ?? "var(--fg-3)" }}
                    >
                      {item.year}
                    </span>
                    <h3
                      className="font-semibold text-base mb-1.5"
                      style={{ color: "var(--fg-1)" }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--fg-3)" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="mb-24">
          <div className="gl-reveal">
            <SectionTitle eyebrow="Core Attributes" title="How I Work" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            {[
              {
                icon: "⚡",
                title: "Bias for action",
                desc: "I ship fast and iterate. A working prototype beats a perfect design doc every time.",
                color: "var(--warning)",
              },
              {
                icon: "🔎",
                title: "Detail-oriented",
                desc: "Pixel precision on the frontend, clean architecture on the backend. Both matter.",
                color: "var(--accent-cyan)",
              },
              {
                icon: "🤝",
                title: "Product-minded",
                desc: "I think about users and business outcomes, not just technical elegance.",
                color: "var(--success)",
              },
              {
                icon: "📚",
                title: "Continuous learner",
                desc: "From AI models to cloud infra — if it's useful, I'll learn it.",
                color: "var(--accent-violet)",
              },
            ].map(({ icon, title, desc, color }) => (
              <div
                key={title}
                className="gl-reveal gl-tilt relative p-5 rounded-2xl border flex gap-4 overflow-hidden"
                style={{
                  background: "rgba(15,18,32,0.6)",
                  borderColor: "var(--glass-stroke)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div className="gl-tilt-glow" />
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{
                    background: `${color}18`,
                    border: `1px solid ${color}33`,
                  }}
                >
                  {icon}
                </div>
                <div>
                  <h3
                    className="font-semibold text-sm mb-1"
                    style={{ color: "var(--fg-1)" }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--fg-3)" }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="gl-reveal">
          <div
            className="rounded-3xl border p-8 md:p-12 text-center relative overflow-hidden"
            style={{
              background: "rgba(15,18,32,0.7)",
              borderColor: "rgba(184,123,255,0.25)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 100%, rgba(184,123,255,0.14) 0%, transparent 70%)",
              }}
            />
            <p
              className="font-mono text-xs tracking-[0.22em] uppercase mb-3 relative"
              style={{ color: "var(--accent-cyan)" }}
            >
              Open for Missions
            </p>
            <h2
              className="text-2xl md:text-3xl font-bold mb-4 relative"
              style={{ color: "var(--fg-1)" }}
            >
              Let&apos;s build something great
            </h2>
            <p
              className="text-sm mb-8 max-w-md mx-auto relative"
              style={{ color: "var(--fg-3)" }}
            >
              Whether it&apos;s a startup idea, a freelance project, or a
              full-time role — I&apos;m always open to interesting
              conversations.
            </p>
            <div className="flex flex-wrap justify-center gap-3 relative">
              <a
                data-magnetic
                href="mailto:llanasnas@gmail.com"
                className="inline-block px-6 py-3 rounded-full font-mono text-sm font-semibold text-white"
                style={{
                  background: "var(--grad-level)",
                  boxShadow: "0 0 24px rgba(184,123,255,0.4)",
                }}
              >
                ✉ Start a Mission
              </a>

              <a
                data-magnetic
                href="https://github.com/llanasnas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-full font-mono text-sm font-medium border"
                style={{
                  color: "var(--fg-2)",
                  borderColor: "var(--glass-stroke-strong)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                GitHub ↗
              </a>
              <a
                data-magnetic
                href="https://linkedin.com/in/gerard-llanas-conesa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 rounded-full font-mono text-sm font-medium border"
                style={{
                  color: "var(--fg-2)",
                  borderColor: "var(--glass-stroke-strong)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                LinkedIn ↗
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p
        className="font-mono text-xs tracking-[0.22em] uppercase mb-2"
        style={{ color: "var(--fg-4)" }}
      >
        {eyebrow}
      </p>
      <h2
        className="text-2xl md:text-3xl font-bold"
        style={{ color: "var(--fg-1)", letterSpacing: "-0.01em" }}
      >
        {title}
      </h2>
    </div>
  );
}
