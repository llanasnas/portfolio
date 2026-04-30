"use client";

import { useEffect, useRef, useState } from "react";

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v));
}

export function useAnimatedNumber(target: number, duration = 700): number {
    const [val, setVal] = useState(target);
    const fromRef = useRef(target);
    const startRef = useRef(performance.now());

    useEffect(() => {
        fromRef.current = val;
        startRef.current = performance.now();
        let raf = 0;
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);
        const step = (now: number) => {
            const t = clamp((now - startRef.current) / duration, 0, 1);
            setVal(lerp(fromRef.current, target, ease(t)));
            if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, duration]);

    return val;
}
