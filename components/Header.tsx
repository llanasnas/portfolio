"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: "About", href: "/about" },
    { label: "Journey", href: "/journey" },
    { label: "Simulations", href: "/simulations" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-65",
          "transition-all duration-300",
          scrolled
            ? "bg-[rgba(5,6,10,0.85)] backdrop-blur-xl border-b border-white/6 shadow-[0_2px_24px_rgba(0,0,0,0.5)]"
            : "bg-transparent",
        ].join(" ")}
        style={{ height: "var(--header-h, 56px)" }}
      >
        <div className="max-w-7xl mx-auto h-full px-5 md:px-8 flex items-center justify-between gap-6">
          {/* Logo / Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group select-none"
            aria-label="Gerard Llanas — Home"
          >
            <img
              src="/assets/avatar_portfolio.png"
              alt="Gerard Llanas Logo"
              className="w-8 h-8 rounded-lg drop-shadow-[0_0_6px_rgba(184,123,255,0.5)] group-hover:drop-shadow-[0_0_10px_rgba(184,123,255,0.8)] transition-all duration-300"
            />
            <span className="hidden sm:block font-semibold text-[13px] text-(--fg-1) tracking-wide">
              Gerard Llanas
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {navItems.map(({ label, href }) => (
              <Link key={label} href={href} className="nav-link-btn">
                {label}
              </Link>
            ))}

            {/* CTA */}
            <a
              href="mailto:llanasnas@gmail.com"
              className="ml-3 px-4 py-2 rounded-full text-xs font-semibold font-mono tracking-wider text-white transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: "var(--grad-level)",
                boxShadow: "0 0 18px rgba(184,123,255,0.3)",
                letterSpacing: "0.12em",
              }}
            >
              HIRE ME
            </a>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center gap-1.25 w-9 h-9 rounded-lg border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span
              className={[
                "block w-4 h-[1.5px] bg-(--fg-2) transition-all duration-300 origin-center",
                menuOpen ? "rotate-45 translate-y-[6.5px]" : "",
              ].join(" ")}
            />
            <span
              className={[
                "block w-4 h-[1.5px] bg-(--fg-2) transition-all duration-300",
                menuOpen ? "opacity-0" : "",
              ].join(" ")}
            />
            <span
              className={[
                "block w-4 h-[1.5px] bg-(--fg-2) transition-all duration-300 origin-center",
                menuOpen ? "-rotate-45 translate-y-[-6.5px]" : "",
              ].join(" ")}
            />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={[
          "fixed inset-0 z-64 md:hidden transition-all duration-300",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div
          className={[
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            menuOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer panel */}
        <nav
          className={[
            "absolute top-(--header-h) left-0 right-0",
            "bg-[rgba(10,12,20,0.97)] backdrop-blur-2xl border-b border-white/8",
            "px-5 py-4 flex flex-col gap-1",
            "transition-all duration-300",
            menuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
          ].join(" ")}
          aria-label="Mobile navigation"
        >
          {navItems.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="mobile-nav-item"
            >
              {label}
            </Link>
          ))}

          <a
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold font-mono tracking-wider text-white"
            style={{ background: "var(--grad-level)" }}
          >
            ✉ HIRE ME
          </a>
        </nav>
      </div>
    </>
  );
}
