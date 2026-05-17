"use client";

import { useEffect } from "react";

/**
 * Tactical cursor — desktop pointer-fine only.
 * - Two layers: solid dot (snaps) + soft ring (eases toward target).
 * - All animation via RAF + refs writing transform/opacity directly. No React state.
 * - Detects interactive targets via `a, button, [role="button"], [data-cursor="hover"]`
 *   and toggles a single class for hover state.
 * - Auto-disabled on touch / coarse-pointer / reduced-motion.
 */
export function TacticalCursor() {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const fine = window.matchMedia("(pointer: fine)").matches;
        const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        if (!fine || reduced) return;

        const html = document.documentElement;
        html.classList.add("has-custom-cursor");

        // Build DOM
        const wrap = document.createElement("div");
        wrap.className = "gl-cursor-wrap";
        wrap.setAttribute("aria-hidden", "true");

        const ring = document.createElement("div");
        ring.className = "gl-cursor-ring";

        const dot = document.createElement("div");
        dot.className = "gl-cursor-dot";

        wrap.appendChild(ring);
        wrap.appendChild(dot);
        document.body.appendChild(wrap);

        // Targets ring/dot positions
        let mx = window.innerWidth / 2;
        let my = window.innerHeight / 2;
        let rx = mx;
        let ry = my;
        let raf = 0;
        let visible = false;
        let hovering = false;

        const interactiveSel =
            "a, button, [role='button'], [data-cursor='hover'], input, textarea, select, label";

        const onMove = (e: MouseEvent) => {
            mx = e.clientX;
            my = e.clientY;
            if (!visible) {
                visible = true;
                wrap.style.opacity = "1";
            }
            // dot snaps every frame; the loop handles ring + dot transform
            if (raf === 0) raf = requestAnimationFrame(loop);
        };

        const onLeave = () => {
            visible = false;
            wrap.style.opacity = "0";
        };

        const onOver = (e: MouseEvent) => {
            const t = e.target as Element | null;
            const next = !!(t && t.closest && t.closest(interactiveSel));
            if (next !== hovering) {
                hovering = next;
                wrap.classList.toggle("is-hovering", hovering);
            }
        };

        const loop = () => {
            // soft ease ring (~12-frame settle)
            rx += (mx - rx) * 0.18;
            ry += (my - ry) * 0.18;
            ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
            dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
            const settled =
                Math.abs(mx - rx) < 0.4 && Math.abs(my - ry) < 0.4;
            if (settled) {
                raf = 0;
            } else {
                raf = requestAnimationFrame(loop);
            }
        };

        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("mouseleave", onLeave, { passive: true });
        document.addEventListener("mouseover", onOver, { passive: true });

        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseleave", onLeave);
            document.removeEventListener("mouseover", onOver);
            if (raf) cancelAnimationFrame(raf);
            html.classList.remove("has-custom-cursor");
            wrap.remove();
        };
    }, []);

    return null;
}
