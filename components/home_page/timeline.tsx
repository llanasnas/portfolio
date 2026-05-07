"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Milestone } from "@/types/progression";
import { milestoneRarity } from "@/lib/progression-system";
import { SkillBadge } from "./skills";

interface TimelineProps {
  milestones: Milestone[];
  mPos: number;
  activeIdx: number;
  railPct: number;
  onScrollToContact: () => void;
  onScrollToMilestone: (idx: number) => void;
}

export function Timeline({
  milestones,
  mPos,
  activeIdx,
  railPct,
  onScrollToContact,
  onScrollToMilestone,
}: TimelineProps) {
  const N = milestones.length;
  const [innerWidth, setInnerWidth] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInnerWidth(window.innerWidth);
    const handleResize = () => setInnerWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mobile: convert horizontal swipe into vertical page scroll
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let scrollStart = 0;
    let tracking = false;

    function onTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      scrollStart = window.scrollY;
      tracking = true;
    }

    function onTouchMove(e: TouchEvent) {
      if (!tracking) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      // Only intercept clearly horizontal gestures
      if (Math.abs(dx) < Math.abs(dy) * 0.8) return;
      e.preventDefault();
      // 1 px swipe ≈ 1.6 px vertical scroll (empirical)
      window.scrollTo({
        top: scrollStart - dx * 1.6,
        behavior: "instant" as ScrollBehavior,
      });
    }

    function onTouchEnd() {
      tracking = false;
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const cardWidth = useMemo(() => {
    if (innerWidth === 0) return 440; // SSR / first render: default desktop width
    // Must match CSS: mobile ≤760px → width: min(320px, 100vw - 48px)
    const slideWidth = innerWidth <= 760 ? Math.min(320, innerWidth - 48) : 440;
    return slideWidth + innerWidth * 0.08;
  }, [innerWidth]);
  const trackTransform = `translate3d(${-mPos * cardWidth}px, 0, 0)`;

  return (
    <div ref={wrapRef} className="track-wrap p-12 md:p-12">
      <div
        className="track-rail"
        style={{ "--prog-pct": `${railPct}%` } as CSSProperties}
      >
        {milestones.map((m, i) => {
          const left = (i / (N - 1)) * 100;
          const passed = i < activeIdx;
          const isActive = i === activeIdx;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onScrollToMilestone(i)}
              aria-label={`Go to milestone ${i + 1}: ${m.title}`}
              className={[
                "rail-node",
                passed ? "is-passed" : "",
                isActive ? "is-active" : "",
                i === N - 1 ? "is-final" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ left: `${left}%` }}
            >
              <span className="rail-node-label">
                {m.dateRange.split(" – ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="track-cards is-scrubbing"
        style={{ transform: trackTransform, marginTop: 80 }}
      >
        {/* Milestone cards */}
        {milestones.map((m, i) => {
          const dist = Math.abs(mPos - i);
          let cls = "";
          if (dist < 0.4) cls = "is-active";
          else if (dist < 1.2) cls = "is-near";

          const rarity = milestoneRarity(m.xp);

          return (
            <article
              key={i}
              className={`mslide mslide--${m.type} mslide--${rarity}${cls ? ` ${cls}` : ""}`}
            >
              <header className="mslide__card-header">
                <div className="mslide__badge">
                  <span className="mslide__badge-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mslide__badge-label">
                    {rarity.toUpperCase()}
                  </span>
                </div>
                <div className="mslide__header-body">
                  <h3 className="mslide__title">{m.title}</h3>
                  <span className="mslide__date">{m.dateRange}</span>
                </div>
                <span className={`mslide__type-chip type-${m.type}`}>
                  {m.type}
                </span>
              </header>

              <p
                className="mslide__desc"
                dangerouslySetInnerHTML={{ __html: m.description }}
              />

              <div className="mslide__footer">
                <div className="mslide__xp-row">
                  <span className="mslide__xp-label">XP Reward</span>
                  <span className="mslide__xp">+{m.xp.toLocaleString()}</span>
                </div>
                <div className="mslide__skills">
                  {m.skillsUnlocked.slice(0, 6).map((s) => (
                    <SkillBadge key={s} name={s} />
                  ))}
                  {m.skillsUnlocked.length > 6 && (
                    <span className="skill-badge rarity-common">
                      +{m.skillsUnlocked.length - 6}
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {/* Request Mission contact card */}
        {(() => {
          const dist = Math.abs(mPos - N);
          const cls = dist < 0.4 ? "is-active" : dist < 1.2 ? "is-near" : "";
          return (
            <article
              className={`mslide mslide--contact mslide--legendary${cls ? ` ${cls}` : ""}`}
            >
              <header className="mslide__card-header">
                <div className="mslide__badge">
                  <span className="mslide__badge-num mslide__badge-num--contact">
                    !
                  </span>
                  <span className="mslide__badge-label">OPEN</span>
                </div>
                <div className="mslide__header-body">
                  <h3 className="mslide__title">Request Mission</h3>
                  <span className="mslide__date">Available Now · 2026</span>
                </div>
                <span className="mslide__type-chip mslide__type-chip--hire">
                  HIRE
                </span>
              </header>

              <div className="mslide__contact-links">
                <p
                  className="p-2 flex items-center gap-2"
                  style={{ color: "var(--fg-1)" }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-up-wide-narrow-icon lucide-arrow-up-wide-narrow transform animate-bounce"
                  >
                    <path d="m3 8 4-4 4 4" />
                    <path d="M7 4v16" />
                    <path d="M11 12h10" />
                    <path d="M11 16h7" />
                    <path d="M11 20h4" />
                  </svg>
                  Make me level up!{" "}
                </p>
                <a href="mailto:llanasnas@gmail.com" className="contact-link">
                  <span className="contact-link__icon">✉</span>
                  llanasnas@gmail.com
                </a>
                <a
                  href="https://github.com/llanasnas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  <span className="contact-link__icon">◈</span>
                  GitHub · llanasnas
                </a>
                <a
                  href="https://linkedin.com/in/gerard-llanas-conesa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  <span className="contact-link__icon">◆</span>
                  LinkedIn · Gerard Llanas
                </a>
              </div>

              <div className="mslide__contact-cta">
                <button className="btn-mission" onClick={onScrollToContact}>
                  ↓ Begin Mission
                </button>
              </div>
            </article>
          );
        })()}
      </div>
    </div>
  );
}
