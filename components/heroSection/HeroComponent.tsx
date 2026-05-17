"use client";

/**
 * HeroComponent.tsx — Next.js (App Router) port of the workspace hero.
 *
 * Drop-in usage:
 *   1. Place this file at:        app/components/HeroComponent.tsx
 *   2. Place the room photo at:   public/assets/room.png
 *   3. Place the styles at:       app/components/HeroComponent.module.css
 *      (full CSS is at the bottom of this file — copy it into the .module.css)
 *   4. In app/page.tsx:
 *
 *        import HeroComponent from "@/app/components/HeroComponent";
 *        export default function Home() {
 *          return <HeroComponent onEnterArchive={() => router.push("/career")} />;
 *        }
 *
 *   5. Make sure your global CSS (or layout) sets `html, body { margin: 0; }`
 *      and that you have Inter + JetBrains Mono available (next/font/google
 *      recommended — see the layout.tsx snippet at the bottom).
 */

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styles from "./HeroComponent.module.css";

interface HeroComponentProps {
  /** Called when the laptop folder or the tablet code surface is activated. */
  onEnterArchive?: () => void;
  /** Override the room background image (public/ relative). Default: /assets/room.png */
  photoSrc?: string;
}

/* ============================================================
 * CODE LINES — typed onto the tablet
 * ============================================================ */
const CODE_LINES: { html: string }[] = [
  { html: '<span class="com">// pair_program.ts</span>' },
  {
    html: '<span class="kw">import</span> <span class="pl">{ gerard }</span> <span class="kw">from</span> <span class="str">"@portfolio"</span><span class="pn">;</span>',
  },
  { html: "" },
  {
    html: '<span class="kw">await</span> <span class="pl">gerard</span><span class="pn">.</span><span class="fn">collaborate</span><span class="pn">({</span>',
  },
  {
    html: '  <span class="pl">with</span><span class="pn">:</span> <span class="str">"you"</span><span class="pn">,</span>',
  },
  {
    html: '  <span class="pl">on</span><span class="pn">:</span> <span class="str">"the future"</span><span class="pn">,</span>',
  },
  {
    html: '  <span class="pl">stack</span><span class="pn">:</span> <span class="pn">[</span><span class="str">"react"</span><span class="pn">,</span> <span class="str">"ai"</span><span class="pn">],</span>',
  },
  { html: '<span class="pn">});</span>' },
  { html: "" },
  {
    html: '<span class="com">→ shipping <span class="num">∞</span> ideas</span>',
  },
];

function stripHtml(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]+>/g, "");
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.textContent || "";
}

function renderPartial(html: string, n: number): string {
  if (!html) return "";
  let out = "";
  let count = 0;
  let i = 0;
  while (i < html.length && count < n) {
    if (html[i] === "<") {
      const end = html.indexOf(">", i);
      if (end === -1) break;
      out += html.slice(i, end + 1);
      i = end + 1;
    } else {
      out += html[i];
      count++;
      i++;
    }
  }
  const opens = [...out.matchAll(/<(\w+)[^>]*>/g)].map((m) => m[1]);
  const closes = [...out.matchAll(/<\/(\w+)>/g)].map((m) => m[1]);
  const stack: string[] = [];
  opens.forEach((o) => stack.push(o));
  closes.forEach((c) => {
    const idx = stack.lastIndexOf(c);
    if (idx >= 0) stack.splice(idx, 1);
  });
  while (stack.length) out += `</${stack.pop()}>`;
  return out;
}

/* ============================================================
 * TABLET CODE SURFACE
 * ============================================================ */
function TabletSurface({ onActivate }: { onActivate: () => void }) {
  const [touch, setTouch] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [charsOnLast, setCharsOnLast] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const targetMs = hovered ? 26 : 70;
    const tick = (now: number) => {
      if (now - last > targetMs) {
        last = now;
        setCharsOnLast((c) => c + 1);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hovered]);

  useEffect(() => {
    if (revealed >= CODE_LINES.length) return;
    const txt = stripHtml(CODE_LINES[revealed].html || "");
    if (charsOnLast >= txt.length) {
      const t = setTimeout(() => {
        setRevealed((r) => r + 1);
        setCharsOnLast(0);
      }, 80);
      return () => clearTimeout(t);
    }
  }, [charsOnLast, revealed]);

  useEffect(() => {
    if (revealed >= CODE_LINES.length) {
      const t = setTimeout(() => {
        setRevealed(0);
        setCharsOnLast(0);
      }, 3200);
      return () => clearTimeout(t);
    }
  }, [revealed]);

  return (
    <div
      className={`${styles.tabletZone} ${touch ? styles.touch : ""}`}
      role="link"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onTouchStart={() => setTouch(true)}
      onTouchEnd={() => setTimeout(() => setTouch(false), 800)}
      aria-label="Code with me"
    >
      <div className={styles.tabletSpill} />
      <div className={styles.tabletScreen}>
        <div className={styles.tabletTab}>
          <span className={styles.dot} />
          pair.ts
        </div>
        <div className={styles.tabletCode}>
          {CODE_LINES.map((line, i) => {
            if (i < revealed) {
              return (
                <span
                  key={i}
                  className={styles.ln}
                  dangerouslySetInnerHTML={{ __html: line.html || "&nbsp;" }}
                />
              );
            }
            if (i === revealed) {
              const partial = renderPartial(line.html, charsOnLast);
              return (
                <span key={i} className={styles.ln}>
                  <span
                    dangerouslySetInnerHTML={{ __html: partial || "&nbsp;" }}
                  />
                  <span className={styles.tabletCursor} />
                </span>
              );
            }
            return (
              <span key={i} className={styles.ln}>
                &nbsp;
              </span>
            );
          })}
        </div>
        <div className={styles.tabletHint}>code with me ⟶</div>
      </div>
    </div>
  );
}

/* ============================================================
 * LAPTOP FOLDER
 * ============================================================ */
function LaptopFolder({ onActivate }: { onActivate: () => void }) {
  const [touch, setTouch] = useState(false);
  return (
    <div
      className={`${styles.laptopZone} ${touch ? styles.touch : ""}`}
      role="link"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      onTouchStart={() => setTouch(true)}
      onTouchEnd={() => setTimeout(() => setTouch(false), 600)}
      aria-label="Open expedient"
    >
      <div className={styles.laptopGlow} />
      <div className={styles.laptopFolder}>
        <div className={styles.laptopFolderIcon}>
          <svg viewBox="0 0 100 76" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="folderTab" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6aa6ff" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#5ad7ff" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="folderBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a2244" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#0a0c14" stopOpacity="0.96" />
              </linearGradient>
              <linearGradient id="folderEdge" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a8c8ff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#6aa6ff" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <path
              d="M 6 10 L 40 10 L 46 18 L 94 18 L 94 26 L 6 26 Z"
              fill="url(#folderTab)"
              opacity="0.85"
            />
            <rect
              x="6"
              y="22"
              width="88"
              height="48"
              rx="3"
              fill="url(#folderBody)"
              stroke="url(#folderEdge)"
              strokeWidth="0.8"
            />
            <line
              x1="14"
              y1="36"
              x2="74"
              y2="36"
              stroke="rgba(106,166,255,0.4)"
              strokeWidth="0.6"
            />
            <line
              x1="14"
              y1="44"
              x2="62"
              y2="44"
              stroke="rgba(106,166,255,0.28)"
              strokeWidth="0.6"
            />
            <line
              x1="14"
              y1="52"
              x2="68"
              y2="52"
              stroke="rgba(106,166,255,0.20)"
              strokeWidth="0.6"
            />
            <circle cx="84" cy="36" r="1.6" fill="#5ad7ff">
              <animate
                attributeName="opacity"
                values="0.4;1;0.4"
                dur="2.2s"
                repeatCount="indefinite"
              />
            </circle>
            <path d="M 76 22 L 94 22 L 94 30 Z" fill="rgba(106,166,255,0.18)" />
          </svg>
        </div>
        <div className={styles.laptopFolderLabel}>See my expedient</div>
        <div className={styles.laptopFolderSub}>Career Log ⟶</div>
      </div>
    </div>
  );
}

/* ============================================================
 * MAIN COMPONENT
 * ============================================================ */
export default function HeroComponent({
  onEnterArchive,
  photoSrc = "/assets/room.png",
}: HeroComponentProps) {
  const [time, setTime] = useState<Date | null>(null);

  // Defer the clock until mount so SSR doesn't mismatch.
  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const enterArchive = useCallback(() => {
    if (onEnterArchive) {
      onEnterArchive();
    } else {
      // fallback — replace with router.push("/career") in your page.
      // eslint-disable-next-line no-console
      console.info("[Hero] onEnterArchive not provided — wire to your router.");
    }
  }, [onEnterArchive]);

  const hh = time ? String(time.getHours()).padStart(2, "0") : "--";
  const mm = time ? String(time.getMinutes()).padStart(2, "0") : "--";

  return (
    <div className={styles.hero} data-screen-label="01 Workspace Hero">
      <div className={styles.stage}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.stagePhoto} src={photoSrc} alt="" />
        <div className={styles.stageVignette} />

        <LaptopFolder onActivate={enterArchive} />
        <TabletSurface onActivate={enterArchive} />
      </div>

      <div className={`${styles.mark} ${styles.tl}`}>
        <span className={styles.live} />
        <span>Workspace · Live</span>
      </div>
      <div className={`${styles.mark} ${styles.br}`}>
        <span>
          {hh}:{mm}
        </span>
        <span style={{ color: "var(--fg-4, #5a6082)" }}>· BCN</span>
      </div>
    </div>
  );
}
