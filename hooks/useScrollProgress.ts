"use client";

import { useEffect, useState } from "react";

function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v));
}

export function useScrollProgress(): number {
    const [p, setP] = useState(0);

    useEffect(() => {
        let raf = 0;
        const tick = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const v = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
            setP(v);
        };
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(tick);
        };
        tick();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    return p;
}
