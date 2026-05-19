"use client";

import { useState } from "react";
import Image from "next/image";
import type {
  EquippedSkill,
  LevelResult,
  BurstParticle,
} from "@/types/progression";
import { skillBySlug, iconUrl } from "@/lib/progression-system";

const BUILD = "v2.6";
const SEGMENTS = 10;

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
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  const firstName = name.split(" ")[0]?.toUpperCase() ?? name.toUpperCase();
  const xpPct = nextXp > 0 ? Math.min(1, animatedXp / nextXp) : 0;

  return (
    <aside
      className={`hud-frame${pulseLvl ? " is-flashing" : ""}${isHidden ? " is-hidden" : ""}`}
    >
      <span className="hud-corner hud-corner--tl" aria-hidden />
      <span className="hud-corner hud-corner--br" aria-hidden />

      {/* TELEMETRY STRIP */}
      <header className="hud-strip">
        <span className="hud-led" aria-hidden />
        <span className="hud-strip__kv">
          <span className="hud-strip__k">STATUS</span>
          <span className="hud-strip__sep">{"//"}</span>
          <span className="hud-strip__v">ACTIVE</span>
        </span>
        <span className="hud-strip__kv hud-strip__kv--end">
          <span className="hud-strip__k">BUILD</span>
          <span className="hud-strip__sep">{"//"}</span>
          <span className="hud-strip__v">{BUILD}</span>
        </span>
        <button
          type="button"
          className="hud-strip__toggle"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse HUD" : "Expand HUD"}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            aria-hidden
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 280ms",
            }}
          >
            <path
              d="M2 4l3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.4"
              fill="none"
              strokeLinecap="square"
            />
          </svg>
        </button>
      </header>

      <div className={`hud-body${expanded ? " hud-body--open" : ""}`}>
        {/* IDENTITY */}
        <section className="hud-id">
          {/* <div className="hud-id__avatar" aria-hidden>
            {initials}
          </div> */}
          <img
            src={`/assets/avatar_portfolio.png`}
            alt={`${name}'s avatar`}
            className="hud-id__avatar"
          />
          <div className="hud-id__text">
            <h2 className="hud-id__name">{name}</h2>
            <p className="hud-id__role">{role}</p>
          </div>
          <div className={`hud-id__lv${pulseLvl ? " is-pulsing" : ""}`}>
            <span className="hud-id__lv-label">LV</span>
            <span className="hud-id__lv-num">
              {String(levelObj.level).padStart(2, "0")}
            </span>
          </div>
        </section>

        {/* META */}
        <dl className="hud-meta">
          <div className="hud-meta__row">
            <dt>PROFILE</dt>
            <dd>{firstName}</dd>
          </div>
          <div className="hud-meta__row">
            <dt>CLASS</dt>
            <dd>FULL STACK</dd>
          </div>
          <div className="hud-meta__row">
            <dt>RANK</dt>
            <dd>{levelObj.title.toUpperCase()}</dd>
          </div>
        </dl>

        {/* XP */}
        <section className={`hud-xp${pulseXP ? " is-pulsing" : ""}`}>
          <div className="hud-xp__head">
            <span className="hud-xp__label">XP</span>
            <span className="hud-xp__value numeric">
              {Math.round(animatedXp).toLocaleString()}
              <span className="hud-xp__sep"> / </span>
              {nextXp.toLocaleString()}
            </span>
          </div>
          <div
            className="hud-xp__seg"
            style={{ "--xp-pct": xpPct } as React.CSSProperties}
            role="progressbar"
            aria-valuenow={Math.round(animatedXp)}
            aria-valuemin={0}
            aria-valuemax={nextXp}
          >
            <div className="hud-xp__seg-fill" />
            <div className="hud-xp__seg-grid" aria-hidden>
              {Array.from({ length: SEGMENTS - 1 }).map((_, i) => (
                <span
                  key={i}
                  style={{ left: `${((i + 1) / SEGMENTS) * 100}%` }}
                />
              ))}
            </div>
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
        </section>

        {/* LOADOUT */}
        <section className="hud-loadout">
          <div className="hud-loadout__head">
            <span className="hud-loadout__label">LOADOUT</span>
            <span className="hud-loadout__count numeric">
              {String(equipped.length).padStart(2, "0")} EQUIPPED
            </span>
          </div>
          <div className="hud-loadout__grid">
            {equipped.length === 0 && (
              <span className="hud-loadout__empty">
                SCROLL TO ACQUIRE SKILLS
              </span>
            )}
            {equipped.map((s, i) => {
              const skill = skillBySlug(s.name);
              if (!skill) return null;
              return (
                <span
                  key={s.name}
                  className={`hud-slot rarity-${skill.rarity}`}
                  title={`${skill.name}${s.count > 1 ? ` ×${s.count}` : ""}`}
                  style={{ animationDelay: `${i * 24}ms` }}
                >
                  <Image
                    src={iconUrl(skill.icon)}
                    alt={skill.name}
                    width={16}
                    height={16}
                    unoptimized
                  />
                  {s.count > 1 && (
                    <span className="hud-slot__count numeric">×{s.count}</span>
                  )}
                </span>
              );
            })}
          </div>
        </section>
      </div>
    </aside>
  );
}
