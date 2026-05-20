"use client";

import { type CSSProperties } from "react";
import type { Milestone } from "@/types/progression";
import { milestoneRarity } from "@/lib/progression-system";
import { SkillBadge } from "./skills";
import Link from "next/link";

interface TimelineProps {
  milestones: Milestone[];
  activeIdx: number;
  railPct: number;
  onScrollToContact: () => void;
  onScrollToMilestone: (idx: number) => void;
}

/**
 * Static layout for the journey timeline. Card position, scale, opacity,
 * exit-time CSS vars (`--exit-t`, `--exit-jit`, `--depth-blur`) and tilt
 * (`--rx`, `--ry`) are written directly by the master GSAP timeline mounted
 * in HomeClient, so this component does NOT re-render during scroll. It
 * receives only the milestone data and the discrete `activeIdx` (used for
 * the rail nodes + the `is-active`/`is-near` class on the active card).
 */
export function Timeline({
  milestones,
  activeIdx,
  railPct,
  onScrollToContact,
  onScrollToMilestone,
}: TimelineProps) {
  void onScrollToContact;
  const N = milestones.length;

  return (
    <div className="track-wrap">
      <div className="track-cards">
        {milestones.map((m, i) => {
          const dist = Math.abs(activeIdx - i);
          let cls = "";
          if (dist === 0) cls = "is-active";
          else if (dist === 1) cls = "is-near";

          const rarity = milestoneRarity(m.xp);
          const SKILL_CAP = 5;
          const extra = Math.max(0, m.skillsUnlocked.length - SKILL_CAP);

          return (
            <article
              key={i}
              data-card-index={i}
              className={`mslide mslide--${m.type} mslide--${rarity}${cls ? ` ${cls}` : ""}`}
            >
              <span
                className="mslide__bracket mslide__bracket--tl"
                aria-hidden="true"
              />
              <span
                className="mslide__bracket mslide__bracket--tr"
                aria-hidden="true"
              />
              <span
                className="mslide__bracket mslide__bracket--bl"
                aria-hidden="true"
              />
              <span
                className="mslide__bracket mslide__bracket--br"
                aria-hidden="true"
              />
              <span className="mslide__scanline" aria-hidden="true" />

              <div className="mslide__inner">
                <header className="mslide__head">
                  <span className="mslide__num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mslide__codename">{m.title}</span>
                  <span className={`mslide__chip type-${m.type}`}>
                    {m.type}
                  </span>
                </header>

                {m.role && <div className="mslide__role">{m.role}</div>}
                <div className="mslide__date">{m.dateRange}</div>

                <p
                  className="mslide__desc"
                  dangerouslySetInnerHTML={{ __html: m.description }}
                />

                <footer className="mslide__foot">
                  <span className="mslide__xp">
                    +{m.xp.toLocaleString()} XP
                  </span>
                  <div className="mslide__skills">
                    {m.skillsUnlocked.slice(0, SKILL_CAP).map((s) => (
                      <SkillBadge key={s} name={s} />
                    ))}
                    {extra > 0 && (
                      <span className="skill-badge skill-badge--more">
                        +{extra}
                      </span>
                    )}
                  </div>
                </footer>
              </div>
            </article>
          );
        })}

        {(() => {
          const dist = Math.abs(activeIdx - N);
          const cls = dist === 0 ? "is-active" : dist === 1 ? "is-near" : "";
          return (
            <article
              data-card-index={N}
              className={`mslide mslide--contact mslide--legendary${cls ? ` ${cls}` : ""}`}
            >
              <span
                className="mslide__bracket mslide__bracket--tl"
                aria-hidden="true"
              />
              <span
                className="mslide__bracket mslide__bracket--tr"
                aria-hidden="true"
              />
              <span
                className="mslide__bracket mslide__bracket--bl"
                aria-hidden="true"
              />
              <span
                className="mslide__bracket mslide__bracket--br"
                aria-hidden="true"
              />
              <span className="mslide__scanline" aria-hidden="true" />

              <div className="mslide__inner">
                <header className="mslide__head">
                  <span className="mslide__num mslide__num--contact">!</span>
                  <span className="mslide__codename">Open Position</span>
                  <span className="mslide__chip mslide__chip--hire">HIRE</span>
                </header>

                <div className="mslide__role">Available · 2026</div>
                <div className="mslide__date">Make me level up</div>

                <div className="mslide__contact-links">
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
                  <Link className="btn-mission" href="/contact">
                    ↓ Begin Mission
                  </Link>
                </div>
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
