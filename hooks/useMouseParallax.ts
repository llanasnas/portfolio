"use client";

import { useEffect } from "react";

export function useMouseParallax(): void {
    useEffect(() => {
        let raf = 0;
        let mx = 50;
        let my = 30;

        const onMove = (e: MouseEvent) => {
            mx = (e.clientX / window.innerWidth) * 100;
            my = (e.clientY / window.innerHeight) * 100;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                document.documentElement.style.setProperty("--mx", mx + "%");
                document.documentElement.style.setProperty("--my", my + "%");
                const blobs = document.querySelectorAll<HTMLElement>(".blob");
                blobs.forEach((b, i) => {
                    const f = (i + 1) * 6;
                    const dx = ((mx - 50) * f) / 50;
                    const dy = ((my - 50) * f) / 50;
                    b.style.transform = `translate(${dx}px, ${dy}px)`;
                });
            });
        };

        window.addEventListener("mousemove", onMove);
        return () => {
            window.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(raf);
        };
    }, []);
}
