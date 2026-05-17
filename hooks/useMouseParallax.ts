"use client";

import { useEffect } from "react";

/**
 * Subtle blob parallax follow on desktop only.
 * - Skips on touch / coarse-pointer devices (no benefit, mobile GPU hit).
 * - Skips when user prefers reduced motion.
 * - Coalesces moves through a single RAF; writes transform directly.
 * - No CSS custom property writes on :root (was forcing full-viewport bg repaint).
 */
export function useMouseParallax(): void {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const coarse = window.matchMedia("(pointer: coarse)").matches;
        const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        if (coarse || reduced) return;

        const blobs = Array.from(
            document.querySelectorAll<HTMLElement>(".blob")
        );
        if (blobs.length === 0) return;

        let raf = 0;
        let pendingMx = 50;
        let pendingMy = 30;

        const apply = () => {
            raf = 0;
            for (let i = 0; i < blobs.length; i++) {
                const f = (i + 1) * 6;
                const dx = ((pendingMx - 50) * f) / 50;
                const dy = ((pendingMy - 50) * f) / 50;
                blobs[i].style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
            }
        };

        const onMove = (e: MouseEvent) => {
            pendingMx = (e.clientX / window.innerWidth) * 100;
            pendingMy = (e.clientY / window.innerHeight) * 100;
            if (raf === 0) raf = requestAnimationFrame(apply);
        };

        window.addEventListener("mousemove", onMove, { passive: true });
        return () => {
            window.removeEventListener("mousemove", onMove);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);
}
