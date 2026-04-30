"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Returns a ref to attach to a section and a `style` object with
 * `transform: translateY(Xpx)` for decorative blobs inside that section.
 *
 * @param speed  Fraction of the element's offset from viewport center (0.1–0.3 works well).
 */
export function useSectionParallax(speed = 0.18) {
    const ref = useRef<HTMLElement>(null);
    const [y, setY] = useState(0);

    useEffect(() => {
        let raf = 0;

        function update() {
            const el = ref.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
            setY(centerOffset * speed);
        }

        function onScroll() {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(update);
        }

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", update);
            cancelAnimationFrame(raf);
        };
    }, [speed]);

    return { ref, y, blobStyle: { transform: `translateY(${y}px)` } };
}
