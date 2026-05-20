"use client";
import { useEffect, useState } from "react";

export function usePinProgress(): [number, boolean] {
  const [progress, setProgress] = useState(0);
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    let raf = 0;

    function update() {
      const el = document.querySelector(".pin-shell") as HTMLElement | null;
      if (!el) return;
      const max = el.offsetHeight - window.innerHeight;
      const p = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
      setProgress(p);
      setIsPast(el.getBoundingClientRect().bottom < window.innerHeight * 1.01);
    }

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    // Debounce resize to absorb mobile URL-bar show/hide bounces
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(update, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
    };
  }, []);

  return [progress, isPast];
}