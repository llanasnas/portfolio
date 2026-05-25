"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { computeLevel } from "@/lib/progression-system";
import { progressionData } from "@/lib/progression-data";
import type { BurstParticle, EquippedSkill } from "@/types/progression";
import { HUD } from "./hud";
import { Timeline } from "./timeline";
import { TunnelGrid } from "./TunnelGrid";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

const { profile, milestones } = progressionData;
const N = milestones.length; // 8 milestone cards
const DISPLAY_N = N + 1; // +1 for contact card (index 8)

const INTRO = 0.08;
const OUTRO = 0.96;
const STEP = (OUTRO - INTRO) / (DISPLAY_N - 1); // 0.88 / 8 = 0.11

// Tunnel + card constants (mirror what the master GSAP timeline writes).
const DEPTH_GAP = 620;
const RING_GAP = 1700;
const RING_FADE_FROM = 500;
const RING_HIDE_AT = 1300;

const FORWARD_DESKTOP = 2.4;
const BACKWARD_DESKTOP = 0.75;
const FORWARD_MOBILE = 1.6;
const BACKWARD_MOBILE = 0.5;

const EXIT_Z_DESKTOP = 315; // = 420 * 0.75
const EXIT_SCALE_DESKTOP = 1.45; // = 1 + 0.75 * (420/700 — visual heuristic)
const EXIT_Z_MOBILE = 210;
const EXIT_SCALE_MOBILE = 1.15;

function mPosFromProgress(p: number) {
  if (p <= INTRO) return -0.5 * (1 - p / INTRO);
  if (p >= OUTRO) return DISPLAY_N - 1;
  return (p - INTRO) / STEP;
}

export function HomeClient() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Reactive state — only triggers a render when it actually changes.
  const [activeIdx, setActiveIdx] = useState(0);
  const [targetXp, setTargetXp] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [isPastPin, setIsPastPin] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Refs used to diff-guard state writes from inside the GSAP onUpdate
  // callback — without these, every scroll tick would re-render HomeClient.
  const activeIdxRef = useRef(0);
  const showIntroRef = useRef(true);
  const isPastPinRef = useRef(false);
  const targetXpRef = useRef(0);

  // Detect coarse pointer once for downstream React-only effects
  // (the GSAP path uses its own gsap.matchMedia).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px), (pointer: coarse)");
    const apply = (m: boolean) => setIsMobile(m);
    apply(mq.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Lenis smooth scroll. NOTE: do NOT call ScrollTrigger.normalizeScroll(true)
  // here — it scroll-jacks on the JS thread and cancels native scroll events,
  // which breaks `position: sticky` on `.pin-stage` in Firefox (sticky needs
  // the native browser scroll thread to update). Lenis uses native scrollTo
  // under the hood so it stays compatible with sticky.
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let lenis: Lenis | null = null;
    let rafCb: ((t: number) => void) | null = null;
    if (!reduced) {
      lenis = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      rafCb = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(rafCb);
      gsap.ticker.lagSmoothing(0);
      lenis.on("scroll", ScrollTrigger.update);
    }
    return () => {
      if (rafCb) gsap.ticker.remove(rafCb);
      lenis?.destroy();
    };
  }, []);

  // Master scrub timeline — owns every per-frame transform on the page.
  // Cards, rings and the intro overlay are all driven from here so React
  // doesn't reconcile them during scroll. State updates go through the
  // diff-guarded handlers below.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onProgress = (p: number) => {
      const mPos = mPosFromProgress(p);
      const next = clamp(Math.round(mPos), 0, N - 1);
      if (next !== activeIdxRef.current) {
        activeIdxRef.current = next;
        setActiveIdx(next);
      }

      // XP — diff-guard so HomeClient only re-renders when the rounded
      // target moves more than 10 XP. useAnimatedNumber easings the
      // visible counter from there.
      let xp = 0;
      if (mPos <= 0) xp = Math.max(0, (1 + mPos) * milestones[0].xp);
      else if (mPos >= N - 1) {
        let cum = 0;
        for (let i = 0; i < N; i++) cum += milestones[i].xp;
        xp = cum;
      } else {
        const i = Math.floor(clamp(mPos, 0, N - 2));
        const frac = mPos - i;
        let cumI = 0;
        for (let k = 0; k <= i; k++) cumI += milestones[k].xp;
        xp = cumI + frac * (milestones[i + 1]?.xp ?? 0);
      }
      if (Math.abs(xp - targetXpRef.current) > 10) {
        targetXpRef.current = xp;
        setTargetXp(xp);
      }

      const introVisible = p < INTRO * 0.6;
      if (introVisible !== showIntroRef.current) {
        showIntroRef.current = introVisible;
        setShowIntro(introVisible);
      }
      const past = p > OUTRO;
      if (past !== isPastPinRef.current) {
        isPastPinRef.current = past;
        setIsPastPin(past);
      }

      // Direct DOM write for the % readout — avoids re-rendering for
      // every integer percent change.
      const pctEl = root.querySelector<HTMLElement>("[data-progress-pct]");
      if (pctEl) pctEl.textContent = `${Math.round(p * 100)}%`;
    };

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: "(pointer: fine)",
          isMobile: "(pointer: coarse)",
        },
        (context) => {
          const conds = context.conditions ?? {};
          const isDesktop = !!conds.isDesktop;
          const onMobile = !!conds.isMobile;
          const FORWARD = onMobile ? FORWARD_MOBILE : FORWARD_DESKTOP;
          const BACKWARD = onMobile ? BACKWARD_MOBILE : BACKWARD_DESKTOP;
          const EXIT_Z = onMobile ? EXIT_Z_MOBILE : EXIT_Z_DESKTOP;
          const EXIT_SCALE = onMobile ? EXIT_SCALE_MOBILE : EXIT_SCALE_DESKTOP;

          const cards = gsap.utils.toArray<HTMLElement>(".pin-stage .mslide");
          const rings = gsap.utils.toArray<HTMLElement>(
            ".pin-stage [data-tunnel-ring]",
          );

          // Base pose for every card — xPercent/yPercent supersede the
          // old CSS translate(-50%, -50%) so GSAP can animate transforms
          // without inline-style fights.
          gsap.set(cards, {
            xPercent: -50,
            yPercent: -50,
            force3D: true,
            transformOrigin: "center center",
          });

          // Initial per-card pose at progress=0 (matches the old cardStyle
          // values when pinScroll=0 ⇒ mPos = -0.5).
          cards.forEach((el, i) => {
            const cdi0 = Math.min(FORWARD, Math.max(0, i + 0.5));
            const opacity0 = cdi0 >= FORWARD ? 0 : 1 - cdi0 * 0.32;
            gsap.set(el, {
              z: -cdi0 * DEPTH_GAP,
              scale: 1 - cdi0 * 0.07,
              opacity: opacity0,
            });
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: ".pin-shell",
              start: "top top",
              end: "bottom bottom",
              scrub: onMobile ? true : 1,
              // Replace native CSS `position: sticky` with GSAP pinning —
              // Firefox does not honor sticky reliably when combined with
              // smooth-scroll libraries or 3D content. ScrollTrigger.pin
              // uses position:fixed + spacer and works cross-browser.
              pin: ".pin-stage",
              pinSpacing: false,
              onUpdate: (self) => onProgress(self.progress),
              invalidateOnRefresh: true,
            },
            defaults: { ease: "none" },
          });

          // Card tweens
          cards.forEach((el, i) => {
            const approachStart = Math.max(0, INTRO + (i - FORWARD) * STEP);
            const active = INTRO + i * STEP;
            const exitEnd = Math.min(1, INTRO + (i + BACKWARD) * STEP);
            const isContact = i === N;

            // Approach → active. We always tween into the active pose;
            // the per-card initial pose set above guarantees the right
            // starting state at progress = 0.
            tl.to(
              el,
              {
                z: 0,
                scale: 1,
                opacity: 1,
                duration: Math.max(0.0001, active - approachStart),
                ...(isDesktop && {
                  "--depth-blur": "0px" as unknown as number,
                }),
              },
              approachStart,
            );

            // Exit → warp toward camera (cards 0..N-1; contact stays).
            if (!isContact && exitEnd > active) {
              tl.to(
                el,
                {
                  z: EXIT_Z,
                  scale: EXIT_SCALE,
                  opacity: 0,
                  duration: exitEnd - active,
                  ...(isDesktop && {
                    "--exit-t": 1,
                    "--exit-jit": 6,
                  }),
                  // Warped-past cards sit invisibly at z=+EXIT_Z, IN FRONT
                  // of every other card in 3D space. Without dropping
                  // pointer-events here the exited card's mslide rectangle
                  // still intercepts clicks meant for the contact card
                  // behind it (e.g. the "Begin Mission" CTA on the last
                  // milestone). Scrub-reversible: reverse callback runs
                  // when ScrollTrigger rewinds past the exit-start.
                  onComplete: () => el.classList.add("is-exited"),
                  onReverseComplete: () => el.classList.remove("is-exited"),
                },
                active,
              );
            }
          });

          // Tunnel rings — continuous z, opacity fade in their personal
          // [fadeFrom, hideAt] window.
          rings.forEach((ring, i) => {
            const startZ = -(i + 2) * RING_GAP;
            const endZ = 10 * RING_GAP - (i + 2) * RING_GAP;
            const fadeStartZ = RING_FADE_FROM;
            const hideZ = RING_HIDE_AT;
            const totalZ = endZ - startZ; // = 10 * RING_GAP
            const fadeStart = clamp((fadeStartZ - startZ) / totalZ, 0, 1);
            const fadeEnd = clamp((hideZ - startZ) / totalZ, 0, 1);

            gsap.set(ring, {
              xPercent: -50,
              yPercent: -50,
              force3D: true,
              z: startZ,
              opacity: 1,
            });

            tl.to(ring, { z: endZ, duration: 1 }, 0);
            if (fadeEnd > fadeStart) {
              tl.fromTo(
                ring,
                { opacity: 1 },
                {
                  opacity: 0,
                  duration: fadeEnd - fadeStart,
                },
                fadeStart,
              );
            }
          });

          // Intro overlay fade
          const introEl = root.querySelector<HTMLElement>(".intro-title");
          if (introEl) {
            tl.to(introEl, { opacity: 0, duration: 0.04 }, INTRO * 0.6 - 0.04);
          }

          // Scroll hint fade
          const hintEl = document.querySelector<HTMLElement>(".hint");
          if (hintEl) {
            tl.to(hintEl, { opacity: 0, duration: 0.04 }, 0.05);
          }

          // Anchor timeline duration to exactly 1 so scroll progress
          // maps directly to playhead position.
          tl.to({}, { duration: 0 }, 1);

          // Desktop only — 3D hover tilt on the active card via quickTo.
          if (isDesktop) {
            let activeEl: HTMLElement | null = null;
            let setRX: ((v: number) => gsap.core.Tween) | null = null;
            let setRY: ((v: number) => gsap.core.Tween) | null = null;
            const onMove = (e: PointerEvent) => {
              if (!activeEl || !setRX || !setRY) return;
              const r = activeEl.getBoundingClientRect();
              if (r.width === 0) return;
              const x = (e.clientX - r.left) / r.width - 0.5;
              const y = (e.clientY - r.top) / r.height - 0.5;
              setRX(x * 14);
              setRY(-y * 10);
            };
            const onLeave = () => {
              if (!setRX || !setRY) return;
              setRX(0);
              setRY(0);
            };

            const bind = (idx: number) => {
              if (activeEl) {
                activeEl.removeEventListener("pointermove", onMove);
                activeEl.removeEventListener("pointerleave", onLeave);
                onLeave();
              }
              activeEl = cards[idx] ?? null;
              if (!activeEl) return;
              setRX = gsap.quickTo(activeEl, "--rx", {
                duration: 0.35,
                ease: "power3.out",
              });
              setRY = gsap.quickTo(activeEl, "--ry", {
                duration: 0.35,
                ease: "power3.out",
              });
              activeEl.addEventListener("pointermove", onMove);
              activeEl.addEventListener("pointerleave", onLeave);
            };

            // Subscribe to activeIdx via a MutationObserver on the
            // [data-active-idx] attribute we set on root. Keeps GSAP
            // scope decoupled from React state.
            bind(activeIdxRef.current);
            const obs = new MutationObserver(() => {
              const idxAttr = root.getAttribute("data-active-idx");
              const idx = idxAttr ? Number(idxAttr) : 0;
              bind(idx);
            });
            obs.observe(root, {
              attributes: true,
              attributeFilter: ["data-active-idx"],
            });

            return () => {
              obs.disconnect();
              if (activeEl) {
                activeEl.removeEventListener("pointermove", onMove);
                activeEl.removeEventListener("pointerleave", onLeave);
              }
            };
          }
        },
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const animatedXp = useAnimatedNumber(targetXp, 600);

  const cumXp = useMemo(() => {
    let s = 0;
    return milestones.map((m) => (s += m.xp));
  }, []);

  const equipped = useMemo<EquippedSkill[]>(() => {
    if (activeIdx < 0) return [];
    const order: string[] = [];
    const counts = new Map<string, number>();
    for (let i = 0; i <= activeIdx; i++) {
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
  }, [activeIdx]);

  const levelObj = computeLevel(animatedXp);
  const currentLevel = levelObj.current.level;
  const currentTitle = levelObj.current.title;
  const lastLevelRef = useRef(1);
  const [pulseLvl, setPulseLvl] = useState(false);
  const [toast, setToast] = useState<{ level: number; title: string } | null>(
    null,
  );
  const [pulseXP, setPulseXP] = useState(false);

  useEffect(() => {
    if (currentLevel !== lastLevelRef.current) {
      const goingUp = currentLevel > lastLevelRef.current;
      lastLevelRef.current = currentLevel;
      setPulseLvl(true);
      setPulseXP(true);
      if (goingUp && !isMobile)
        setToast({ level: currentLevel, title: currentTitle });
      const t1 = setTimeout(() => setPulseLvl(false), 900);
      const t2 = setTimeout(() => setPulseXP(false), 900);
      const t3 = setTimeout(() => setToast(null), 1600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [currentLevel, currentTitle, isMobile]);

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

  const railPct = clamp(activeIdx / (N - 1), 0, 1) * 100;
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
    <div ref={rootRef} data-active-idx={activeIdx}>
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
            <span className="num" data-progress-pct>
              0%
            </span>
          </span>
        </div>
      </div>

      {/* Scroll pin shell */}
      <main className="pin-shell relative z-10 mt-10 md:mt-0">
        <div className="pin-stage">
          <TunnelGrid />
          <div className="cv-dust" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

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
      <div className={`hint${isPastPin ? " is-hidden" : ""}`}>
        <span>Scroll</span>
        <span className="hint__arrow">↓</span>
      </div>

      {/* Level-up lateral toast (HUD stays visible) */}
      {!isMobile && toast && (
        <div
          key={toast.level}
          className="lvlup-toast"
          role="status"
          aria-live="polite"
          aria-label={`Level up! Level ${toast.level} — ${toast.title}`}
        >
          <span className="lvlup-toast__label">LEVEL UP</span>
          <span className="lvlup-toast__num">LV {toast.level}</span>
          <span className="lvlup-toast__rank">{toast.title}</span>
        </div>
      )}
    </div>
  );
}
