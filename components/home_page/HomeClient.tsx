"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { usePinProgress } from "@/hooks/usePinProgress";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { useMouseParallax } from "@/hooks/useMouseParallax";
import { computeLevel } from "@/lib/progression-system";
import { progressionData } from "@/lib/progression-data";
import type { BurstParticle, EquippedSkill } from "@/types/progression";
import { HUD } from "./hud";
import { Timeline } from "./timeline";
import { ProjectsSection } from "./projects";
import { ContactSection } from "./contact";

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

const { profile, milestones } = progressionData;
const N = milestones.length; // 8 milestone cards
const DISPLAY_N = N + 1; // +1 for contact card (index 8)

const INTRO = 0.08;
const OUTRO = 0.96;
const STEP = (OUTRO - INTRO) / (DISPLAY_N - 1); // 0.88 / 8 = 0.11

export function HomeClient() {
  const [pinScroll, isPastPin] = usePinProgress();
  useMouseParallax();

  // Continuous display position 0..(DISPLAY_N-1), includes contact card at N
  const mPos = useMemo(() => {
    if (pinScroll <= INTRO) return -0.5 * (1 - pinScroll / INTRO);
    if (pinScroll >= OUTRO)
      return DISPLAY_N - 1 + 0.5 * ((pinScroll - OUTRO) / (1 - OUTRO));
    return (pinScroll - INTRO) / STEP;
  }, [pinScroll]);

  // activeIdx: only milestone indices 0..N-1 (contact card not a milestone)
  const activeIdx = clamp(Math.round(mPos), 0, N - 1);

  // Cumulative XP per milestone
  const cumXp = useMemo(() => {
    let s = 0;
    return milestones.map((m) => (s += m.xp));
  }, []);

  const targetXp = useMemo(() => {
    if (mPos <= 0) return Math.max(0, (1 + mPos) * milestones[0].xp);
    if (mPos >= N - 1) return cumXp[N - 1];
    const i = Math.floor(clamp(mPos, 0, N - 2));
    const frac = mPos - i;
    const base = i > 0 ? cumXp[i - 1] : 0;
    return cumXp[i] + frac * (milestones[i + 1]?.xp ?? 0);
  }, [mPos, cumXp]);

  const animatedXp = useAnimatedNumber(targetXp, 600);

  // Equipped skills
  const equipped = useMemo<EquippedSkill[]>(() => {
    const upTo = clamp(Math.floor(mPos + 0.5), -1, N - 1);
    if (upTo < 0) return [];
    const order: string[] = [];
    const counts = new Map<string, number>();
    for (let i = 0; i <= upTo; i++) {
      for (const s of milestones[i].skillsUnlocked) {
        if (counts.has(s)) {
          counts.set(s, counts.get(s)! + 1);
          const ix = order.indexOf(s);
          if (ix >= 0) {
            order.splice(ix, 1);
            order.push(s);
          }
        } else {
          counts.set(s, 1);
          order.push(s);
        }
      }
    }
    return order.map((name) => ({ name, count: counts.get(name)! }));
  }, [mPos]);

  // Level + level-up detection
  const levelObj = computeLevel(animatedXp);
  const lastLevelRef = useRef(1);
  const [pulseLvl, setPulseLvl] = useState(false);
  const [toast, setToast] = useState<{ level: number; title: string } | null>(
    null,
  );
  const [pulseXP, setPulseXP] = useState(false);

  useEffect(() => {
    if (levelObj.current.level !== lastLevelRef.current) {
      const goingUp = levelObj.current.level > lastLevelRef.current;
      lastLevelRef.current = levelObj.current.level;
      setPulseLvl(true);
      setPulseXP(true);
      if (goingUp)
        setToast({
          level: levelObj.current.level,
          title: levelObj.current.title,
        });
      const t1 = setTimeout(() => setPulseLvl(false), 900);
      const t2 = setTimeout(() => setPulseXP(false), 900);
      const t3 = setTimeout(() => setToast(null), 1000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [levelObj.current.level]);

  // Burst particles on milestone advance
  const lastActiveRef = useRef(activeIdx);
  const [bursts, setBursts] = useState<BurstParticle[]>([]);
  useEffect(() => {
    if (activeIdx > lastActiveRef.current) {
      const id = Date.now();
      const newBursts: BurstParticle[] = Array.from({ length: 10 }, (_, i) => ({
        id: id + i,
        dx: (Math.random() - 0.5) * 80,
        dy: -Math.random() * 60 - 10,
      }));
      setBursts(newBursts);
      const t = setTimeout(() => setBursts([]), 800);
      lastActiveRef.current = activeIdx;
      return () => clearTimeout(t);
    }
    lastActiveRef.current = activeIdx;
  }, [activeIdx]);

  // Rail fills 0..100% as milestones 0..N-1 are traversed
  const railPct = clamp(mPos / (N - 1), 0, 1) * 100;

  const showIntro = pinScroll < INTRO * 0.6;
  const nextXp = levelObj.next?.xpRequired ?? cumXp[N - 1];

  const scrollToContact = useCallback(() => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToMilestone = useCallback((idx: number) => {
    const shell = document.querySelector(".pin-shell") as HTMLElement | null;
    if (!shell) return;
    const max = shell.offsetHeight - window.innerHeight;
    if (max <= 0) return;
    const targetPinScroll = INTRO + idx * STEP;
    window.scrollTo({ top: targetPinScroll * max, behavior: "smooth" });
  }, []);

  return (
    <>
      {/* Animated background */}
      <div className="bg" aria-hidden="true">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
      </div>

      {/* Top chrome */}
      <div className={`top-chrome${isPastPin ? " is-hidden" : ""}`}>
        <div className="brand-mini">
          <div>
            <div className="brand-mini__name">Gerard Llanas</div>
            <div className="brand-mini__role">Developer · Profile</div>
          </div>
        </div>
        <div className={`chrome-level${pulseLvl ? " is-leveling" : ""}`}>
          LV {levelObj.current.level}
          <span className="chrome-level__title">{levelObj.current.title}</span>
        </div>
        <div className="scrub-meta hidden md:flex">
          <span>
            Milestone{" "}
            <span className="num">
              {String(clamp(activeIdx + 1, 1, N)).padStart(2, "0")}
            </span>{" "}
            / {String(N).padStart(2, "0")}
          </span>
          <span>
            <span className="num">{Math.round(pinScroll * 100)}%</span>
          </span>
        </div>
      </div>

      {/* Scroll pin shell */}
      <main className="pin-shell relative z-10 mt-10 md:mt-0">
        <div className="pin-stage">
          {/* Intro overlay */}
          <div className={`intro-title${!showIntro ? " is-fading" : ""}`}>
            <div className="intro-title__eyebrow">
              Cinematic Developer Profile · Lv 1 → 6
            </div>
            <h1 className="intro-title__h">Scroll to play the journey</h1>
            <p className="intro-title__sub">
              Eight milestones. {cumXp[N - 1].toLocaleString()} XP to unlock.
            </p>
          </div>

          <Timeline
            milestones={milestones}
            mPos={mPos}
            activeIdx={activeIdx}
            railPct={railPct}
            onScrollToContact={scrollToContact}
            onScrollToMilestone={scrollToMilestone}
          />
        </div>
      </main>

      {/* HUD overlay */}
      <HUD
        name={profile.name}
        role={profile.role}
        levelObj={levelObj.current}
        animatedXp={animatedXp}
        nextXp={nextXp}
        equipped={equipped}
        pulseLvl={pulseLvl}
        pulseXP={pulseXP}
        bursts={bursts}
        isHidden={isPastPin}
      />

      {/* Scroll hint */}
      <div
        className={`hint${pinScroll > 0.05 ? " is-hidden" : ""}${isPastPin ? " is-hidden" : ""}`}
      >
        <span>Scroll</span>
        <span className="hint__arrow">↓</span>
      </div>

      {/* Level-up dramatic overlay */}
      {toast && (
        <div
          key={toast.level}
          className="lvlup-overlay"
          aria-live="assertive"
          aria-label={`Level up! Level ${toast.level} — ${toast.title}`}
        >
          <div className="lvlup-bg-flash" aria-hidden="true" />
          <div className="lvlup-card">
            <p className="lvlup-label">LEVEL UP</p>
            <div className="lvlup-num">LV {toast.level}</div>
            <div className="lvlup-rank">{toast.title}</div>
            <div className="lvlup-sub">UNLOCKED</div>
          </div>
        </div>
      )}

      {/* Post-pin sections */}
      <ProjectsSection />
      <ContactSection />
    </>
  );
}
