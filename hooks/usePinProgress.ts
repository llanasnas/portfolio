"use client";
import { useEffect, useState } from "react";

export function usePinProgress(): [number, boolean] {
  const [progress, setProgress] = useState(0);
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    let raf = 0;
    // Cache a stable viewport height. On mobile, the address-bar
    // appearing/disappearing changes window.innerHeight by ~56-80 px
    // on every scroll event, which makes progress jump and causes the
    // cards to flicker in/out. We only update stableVh on genuine
    // resizes (rotation, desktop resize) where the delta is > 150 px.
    let stableVh = window.innerHeight;

    function update() {
      const el = document.querySelector(".pin-shell") as HTMLElement | null;
      if (!el) return;
      const max = el.offsetHeight - stableVh;
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
    // Debounce resize to absorb mobile URL-bar show/hide bounces.
    // Only update stableVh when the change is large enough to be a
    // real resize (rotation/desktop window resize), not a URL-bar toggle.
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const newH = window.innerHeight;
        if (Math.abs(newH - stableVh) > 150) {
          stableVh = newH;
        }
        update();
      }, 200);
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