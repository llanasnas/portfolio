"use client";

import { useEffect, useRef, useState } from "react";

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}
function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v));
}

/**
 * Animated number with throttled React state updates (~30fps).
 * - Old impl: setState every RAF (~60fps) → cascading rerenders.
 * - New impl: emits at most every 33ms during ease, plus guaranteed final frame.
 * - Last commit forces an exact-target sync so consumers never see mid-ease values.
 */
export function useAnimatedNumber(target: number, duration = 700): number {
    const [val, setVal] = useState(target);
    const fromRef = useRef(target);
    const startRef = useRef(0);
    const lastEmitRef = useRef(0);

    useEffect(() => {
        fromRef.current = val;
        startRef.current = performance.now();
        lastEmitRef.current = 0;
        let raf = 0;

        const ease = (t: number) => 1 - Math.pow(1 - t, 3);

        const step = (now: number) => {
            const t = clamp((now - startRef.current) / duration, 0, 1);
            const next = lerp(fromRef.current, target, ease(t));
            // Throttle to ~30fps; always emit final frame.
            if (t >= 1 || now - lastEmitRef.current >= 33) {
                lastEmitRef.current = now;
                setVal(next);
            }
            if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, duration]);

    return val;
}
