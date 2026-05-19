"use client";

import { type CSSProperties } from "react";
import type { Milestone } from "@/types/progression";
import { milestoneRarity } from "@/lib/progression-system";
import { SkillBadge } from "./skills";
import Link from "next/link";

interface TimelineProps {
  milestones: Milestone[];
  mPos: number;
  activeIdx: number;
  railPct: number;
  onScrollToContact: () => void;
  onScrollToMilestone: (idx: number) => void;
}

const DEPTH_GAP = 620;
const FORWARD_RANGE = 2.2; // upcoming cards visible up to this dist
const BACKWARD_RANGE = 1.1; // passed cards visible up to this dist

function cardStyle(i: number, mPos: number): CSSProperties {
  const di = i - mPos;

  if (di > FORWARD_RANGE || di < -BACKWARD_RANGE) {
    return { display: "none" };
  }

  let tz: number;
  let tyPct: number;
  let opacity: number;

  if (di >= 0) {
    // upcoming/active — sit in tunnel at depth
    tz = -di * DEPTH_GAP;
    tyPct = -50;
    opacity = 1;
  } else {
    // passed — fly upward and fade
    const t = -di; // 0..BACKWARD_RANGE
    tz = -t * DEPTH_GAP * 0.45;
    tyPct = -50 - t * 140;
    opacity = Math.max(0, 1 - t / BACKWARD_RANGE);
  }

  const zIndex = 1000 - Math.round(Math.abs(tz));
  return {
    transform: `translate3d(-50%, ${tyPct}%, ${tz}px)`,
    opacity,
    zIndex,
    pointerEvents: Math.abs(di) < 0.5 ? "auto" : "none",
  };
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

  return (
    <div className="track-wrap">
      <div className="track-cards">
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
              style={cardStyle(i, mPos)}
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

        {(() => {
          const dist = Math.abs(mPos - N);
          const cls = dist < 0.4 ? "is-active" : dist < 1.2 ? "is-near" : "";
          return (
            <article
              className={`mslide mslide--contact mslide--legendary${cls ? ` ${cls}` : ""}`}
              style={cardStyle(N, mPos)}
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
                    width="26"
                    height="26"
                    viewBox="0 0 32 32"
                    fill="none"
                    className="cyber-level-icon"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="cyber-level-grad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="32"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor="#5ad7ff" />
                        <stop offset="55%" stopColor="#b87bff" />
                        <stop offset="100%" stopColor="#ff2dcf" />
                      </linearGradient>
                    </defs>
                    {/* hex frame */}
                    <path
                      d="M16 2 L28 9 L28 23 L16 30 L4 23 L4 9 Z"
                      stroke="url(#cyber-level-grad)"
                      strokeWidth="1.5"
                      strokeLinejoin="miter"
                      opacity="0.55"
                    />
                    {/* chase chevrons */}
                    <path
                      className="cyber-level-icon__chev cyber-level-icon__chev--1"
                      d="M9 19 L16 13 L23 19"
                      stroke="url(#cyber-level-grad)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      className="cyber-level-icon__chev cyber-level-icon__chev--2"
                      d="M9 23 L16 17 L23 23"
                      stroke="url(#cyber-level-grad)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* corner blips */}
                    <circle cx="4" cy="9" r="1.2" fill="#5ad7ff" />
                    <circle cx="28" cy="9" r="1.2" fill="#5ad7ff" />
                    <circle cx="16" cy="30" r="1.2" fill="#ff2dcf" />
                  </svg>
                  Make me level up!
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

              <div className="mslide__contact-cta w-full px-0">
                <Link className="btn-mission w-full px-0 block" href="/contact">
                  ↓ Begin Mission
                </Link>
              </div>
            </article>
          );
        })()}
      </div>

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
    </div>
  );
}
