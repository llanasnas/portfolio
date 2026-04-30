"use client";

import { useState } from "react";
import type {
  EquippedSkill,
  LevelResult,
  BurstParticle,
} from "@/types/progression";
import { XPFill } from "./xp";
import { SkillBadge } from "./skills";

interface HUDProps {
  name: string;
  role: string;
  levelObj: LevelResult["current"];
  animatedXp: number;
  nextXp: number;
  equipped: EquippedSkill[];
  pulseLvl: boolean;
  pulseXP: boolean;
  bursts: BurstParticle[];
  isHidden: boolean;
}

export function HUD({
  name,
  role,
  levelObj,
  animatedXp,
  nextXp,
  equipped,
  pulseLvl,
  pulseXP,
  bursts,
  isHidden,
}: HUDProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={`hud-overlay${pulseLvl ? " is-flashing" : ""}${isHidden ? " is-hidden" : ""}`}
    >
      {/* ── Collapsed bar (mobile only) ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? "Collapse HUD" : "Expand HUD"}
        className="hud-collapsed-bar"
      >
        <div className="hud-collapsed-bar__left">
          <div className="hud-avatar hud-avatar--sm">GL</div>
          <div>
            <div className="hud-name" style={{ fontSize: 12 }}>
              {name.split(" ")[0]} {name.split(" ")[1]}
            </div>
            <div className="hud-rank-title" style={{ fontSize: 10 }}>
              {levelObj.title}
            </div>
          </div>
        </div>
        <div className="hud-collapsed-bar__right">
          <div
            className={`hud-pip hud-pip--sm${pulseLvl ? " is-pulsing" : ""}`}
          >
            LV {levelObj.level}
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 300ms",
            }}
            aria-hidden="true"
          >
            <path
              d="M3 5l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {/* ── Full HUD content (always visible on desktop, toggled on mobile) ── */}
      <div className={`hud-body${expanded ? " hud-body--open" : ""}`}>
        <div className="hud-top">
          <div className="hud-avatar">GL</div>
          <div className="hud-id">
            <div className="hud-name">{name}</div>
            <div className="hud-role">{role}</div>
          </div>
          <div className={`hud-pip${pulseLvl ? " is-pulsing" : ""}`}>
            LV {levelObj.level}
          </div>
        </div>

        <div className="hud-rank">
          <span className="hud-label">Rank</span>
          <span className="hud-rank-title">{levelObj.title}</span>
        </div>

        <div className="xpbar-head">
          <span className="hud-label">XP</span>
          <span className="hud-value numeric">
            {Math.round(animatedXp).toLocaleString()} /{" "}
            {nextXp.toLocaleString()}
          </span>
        </div>

        <div
          className={`xpbar-track${pulseXP ? " is-pulsing" : ""}`}
          style={{ position: "relative" }}
        >
          <XPFill xp={animatedXp} />
          {bursts.map((b) => (
            <span
              key={b.id}
              className="burst"
              style={{
                right: 0,
                top: "50%",
                transform: `translate(${b.dx}px, ${b.dy}px) scale(${0.6 + Math.random() * 0.6})`,
                opacity: 0,
                animation:
                  "burst-out 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
              }}
            />
          ))}
        </div>

        <div className="hud-skills">
          <div className="hud-skills-head">
            <span className="hud-label">Equipped skills</span>
            <span className="text-meta numeric">{equipped.length}</span>
          </div>
          <div className="hud-skills-grid">
            {equipped.length === 0 && (
              <span style={{ color: "var(--fg-4)", fontSize: 11 }}>
                Scroll to unlock skills.
              </span>
            )}
            {equipped.map((s, i) => (
              <SkillBadge
                key={s.name}
                name={s.name}
                count={s.count}
                delay={i * 30}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
