"use client";
import { useEffect, useRef, useState } from "react";
import { useSectionParallax } from "@/hooks/useSectionParallax";
import { TransmitAnimation, TransmitSuccess } from "./ContactTransmit";

const MIN_TRANSMIT_MS = 1600;

type RequestType = "freelance" | "job" | "message";

const LABELS: Record<RequestType, string> = {
  freelance: "Freelance",
  job: "Job Request",
  message: "Say Hello",
};

const SUBJECTS: Record<RequestType, string> = {
  freelance: "Freelance Request",
  job: "Job Opportunity",
  message: "Hello",
};

const PLACEHOLDERS: Record<RequestType, string> = {
  freelance: "Describe your project, timeline, and budget...",
  job: "Tell me about the role, stack, and company...",
  message: "What's on your mind?",
};

type SendStatus = "idle" | "sending" | "sent" | "error";

export function ContactSection() {
  const [type, setType] = useState<RequestType>("freelance");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<SendStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [company, setCompany] = useState(""); // honeypot
  const formOpenedRef = useRef<number>(0);
  const { ref, y } = useSectionParallax(0.22);

  useEffect(() => {
    formOpenedRef.current = Date.now();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMsg("");
    const startedAt = Date.now();
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          type: SUBJECTS[type],
          company,
          ts: formOpenedRef.current,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Send failed");
      }
      // Let the transmission animation play a minimum duration
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, MIN_TRANSMIT_MS - elapsed);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, 600 - elapsed);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Send failed");
    }
  }

  function resetForm() {
    setStatus("idle");
    setErrorMsg("");
    formOpenedRef.current = Date.now();
  }

  return (
    <section
      id="contact"
      ref={ref as React.RefObject<HTMLElement>}
      className="page-section contact-section"
    >
      {/* Parallax decorative blobs — legendary gold tones */}
      <div
        aria-hidden="true"
        className="section-blob"
        style={{
          width: 640,
          height: 640,
          top: "-15%",
          left: "-18%",
          background: "rgba(251,191,36,0.13)",
          transform: `translateY(${y}px)`,
        }}
      />
      <div
        aria-hidden="true"
        className="section-blob"
        style={{
          width: 480,
          height: 480,
          bottom: "-10%",
          right: "-12%",
          background: "rgba(245,158,11,0.09)",
          transform: `translateY(${-y * 0.7}px)`,
        }}
      />
      <div
        aria-hidden="true"
        className="section-blob"
        style={{
          width: 300,
          height: 300,
          top: "50%",
          right: "30%",
          background: "rgba(251,191,36,0.07)",
          transform: `translateY(${y * 1.4}px)`,
        }}
      />

      <div className="section-inner" style={{ color: "var(--fg-1)" }}>
        {/* Header */}
        <div className="section-eyebrow">
          <span className="eyebrow-line" />
          <span className="eyebrow-text">Open for Missions</span>
          <span className="eyebrow-line" />
        </div>
        <h2 className="section-title">Start a Mission</h2>
        <p className="section-sub">
          Select your request type and send a message
        </p>

        {/* Layout: info card + form */}
        <div
          className="flex flex-col gap-7 md:grid md:gap-10"
          style={{ gridTemplateColumns: "300px 1fr" }}
        >
          {/* Info card — legendary gold outline */}
          <aside
            className="chamfer-md border p-6 h-fit backdrop-blur-md"
            style={{
              background: "rgba(20,24,42,0.7)",
              borderColor: "rgba(251,191,36,0.45)",
              boxShadow:
                "0 18px 44px -18px rgba(0,0,0,0.7), 0 0 0 1px rgba(251,191,36,0.14), 0 0 28px rgba(251,191,36,0.22), 0 0 64px rgba(245,158,11,0.18)",
              position: "relative",
              overflow: "hidden",
              color: "var(--fg-1)",
            }}
          >
            {/* Rarity bar */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: "24%",
                right: "24%",
                height: 2,
                borderRadius: "0 0 4px 4px",
                background: "var(--rarity-legendary)",
                boxShadow:
                  "0 0 12px var(--rarity-legendary), 0 0 24px rgba(251,191,36,0.55)",
              }}
            />
            <p
              className="font-mono text-[9px] tracking-[0.26em] uppercase mb-5 pb-3 border-b"
              style={{
                color: "var(--fg-4)",
                borderColor: "var(--glass-stroke)",
              }}
            >
              Mission Control
            </p>

            <div className="flex flex-col">
              {[
                {
                  href: "mailto:llanasnas@gmail.com",
                  icon: "✉",
                  label: "Email",
                  value: "llanasnas@gmail.com",
                },
                {
                  href: "https://github.com/llanasnas",
                  icon: "/icons/simple-icons/githubcopilot.svg",
                  label: "GitHub",
                  value: "llanasnas",
                  external: true,
                },
                {
                  href: "https://www.linkedin.com/in/gerard-llanas-conesa-b07402158/",
                  icon: "/icons/simple-icons/linkedin.svg",
                  label: "LinkedIn",
                  value: "Gerard Llanas Conesa",
                  external: true,
                },
              ].map((link, i, arr) => (
                <a
                  key={link.label}
                  href={link.href}
                  {...(link.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={`flex items-center gap-3 py-3 no-underline transition-colors duration-200 hover:text-white${
                    i < arr.length - 1 ? " border-b" : ""
                  }`}
                  style={{
                    color: "inherit",
                    borderColor: "var(--glass-stroke)",
                  }}
                >
                  <span
                    className="chamfer-corner flex items-center justify-center w-8 h-8 shrink-0 text-sm border"
                    style={{
                      background: "rgba(251,191,36,0.08)",
                      borderColor: "rgba(251,191,36,0.35)",
                      color: "var(--rarity-legendary)",
                      boxShadow:
                        "0 0 10px rgba(251,191,36,0.22), inset 0 0 8px rgba(251,191,36,0.12)",
                    }}
                  >
                    {link.icon.startsWith("/") ? (
                      <img
                        src={link.icon}
                        alt={link.label}
                        className="w-4 h-4"
                        style={{
                          filter:
                            "brightness(0) saturate(100%) invert(78%) sepia(55%) saturate(500%) hue-rotate(355deg) brightness(103%) contrast(98%)",
                        }}
                      />
                    ) : (
                      link.icon
                    )}
                  </span>
                  <div className="min-w-0">
                    <p
                      className="font-mono text-[9px] tracking-[0.14em] uppercase m-0"
                      style={{ color: "var(--fg-4)" }}
                    >
                      {link.label}
                    </p>
                    <p
                      className="text-[13px] font-medium mt-0.5 m-0 truncate"
                      style={{ color: "var(--fg-2)" }}
                    >
                      {link.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            <div
              className="flex items-center gap-2 mt-4 pt-3 border-t"
              style={{ borderColor: "var(--glass-stroke)" }}
            >
              <span className="contact-status__dot" />
              <span
                className="font-mono text-[10px] tracking-[0.12em]"
                style={{ color: "var(--success)" }}
              >
                Available for new missions
              </span>
            </div>
          </aside>

          {/* Form */}
          <div style={{ position: "relative" }}>
            {status === "sent" ? (
              <TransmitSuccess onReset={resetForm} />
            ) : (
              <>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Honeypot — hidden from humans, bots will fill it */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-9999px",
                width: 1,
                height: 1,
                opacity: 0,
                pointerEvents: "none",
              }}
            />

            {/* Type tabs */}
            <div className="flex gap-1.5">
              {(["freelance", "job", "message"] as RequestType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className="chamfer-corner flex-1 py-2 px-2 font-mono text-[10px] tracking-widest uppercase cursor-pointer transition-all duration-200 border"
                  style={{
                    background:
                      type === t
                        ? "rgba(251,191,36,0.10)"
                        : "rgba(255,255,255,0.03)",
                    borderColor:
                      type === t
                        ? "rgba(251,191,36,0.55)"
                        : "var(--glass-stroke)",
                    color:
                      type === t ? "var(--rarity-legendary)" : "var(--fg-3)",
                    boxShadow:
                      type === t
                        ? "0 0 18px rgba(251,191,36,0.32), 0 0 38px rgba(245,158,11,0.22), inset 0 0 12px rgba(251,191,36,0.12)"
                        : "none",
                  }}
                >
                  {LABELS[t]}
                </button>
              ))}
            </div>

            {/* Name + Email */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-mono text-[9px] tracking-[0.18em] uppercase"
                  style={{ color: "var(--fg-3)" }}
                >
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="chamfer-sm w-full px-3.5 py-2.5 text-sm outline-none transition-all duration-200 border"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "var(--glass-stroke)",
                    color: "var(--fg-1)",
                    boxShadow: "0 0 0 1px rgba(251,191,36,0) inset",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(251,191,36,0.6)";
                    e.currentTarget.style.background = "rgba(251,191,36,0.05)";
                    e.currentTarget.style.boxShadow =
                      "0 0 16px rgba(251,191,36,0.32), 0 0 36px rgba(245,158,11,0.18), inset 0 0 12px rgba(251,191,36,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--glass-stroke)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-mono text-[9px] tracking-[0.18em] uppercase"
                  style={{ color: "var(--fg-3)" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="chamfer-sm w-full px-3.5 py-2.5 text-sm outline-none transition-all duration-200 border"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "var(--glass-stroke)",
                    color: "var(--fg-1)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(251,191,36,0.6)";
                    e.currentTarget.style.background = "rgba(251,191,36,0.05)";
                    e.currentTarget.style.boxShadow =
                      "0 0 16px rgba(251,191,36,0.32), 0 0 36px rgba(245,158,11,0.18), inset 0 0 12px rgba(251,191,36,0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--glass-stroke)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label
                className="font-mono text-[9px] tracking-[0.18em] uppercase"
                style={{ color: "var(--fg-3)" }}
              >
                Message
              </label>
              <textarea
                placeholder={PLACEHOLDERS[type]}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                className="chamfer-sm w-full px-3.5 py-2.5 text-sm outline-none transition-all duration-200 border resize-y"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "var(--glass-stroke)",
                  color: "var(--fg-1)",
                  fontFamily: "inherit",
                  minHeight: 120,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(251,191,36,0.6)";
                  e.currentTarget.style.background = "rgba(251,191,36,0.05)";
                  e.currentTarget.style.boxShadow =
                    "0 0 18px rgba(251,191,36,0.3), 0 0 42px rgba(245,158,11,0.18), inset 0 0 14px rgba(251,191,36,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--glass-stroke)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={status === "sending"}
              className="chamfer-sm w-full flex items-center justify-center gap-2.5 py-3.5 px-7 font-mono text-[11px] font-bold tracking-[0.16em] uppercase cursor-pointer transition-all duration-200 border-none disabled:cursor-wait disabled:opacity-70"
              style={{
                background:
                  "linear-gradient(135deg, #fbbf24 0%, #f59e0b 60%, #fbbf24 100%)",
                color: "#0a0c14",
                boxShadow:
                  "0 0 28px rgba(251,191,36,0.45), 0 0 64px rgba(245,158,11,0.28), 0 6px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
              }}
              onMouseEnter={(e) => {
                if (status === "sending") return;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 0 48px rgba(251,191,36,0.65), 0 0 96px rgba(245,158,11,0.42), 0 8px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.32)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow =
                  "0 0 28px rgba(251,191,36,0.45), 0 0 64px rgba(245,158,11,0.28), 0 6px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.25)";
              }}
            >
              {status === "sending"
                ? "Sending…"
                : status === "sent"
                  ? "Sent ✓"
                  : "Begin Mission"}
              {status === "idle" || status === "error" ? (
                <span className="text-sm">↗</span>
              ) : null}
            </button>

            {status === "sent" ? (
              <p
                className="font-mono text-[10px] tracking-[0.14em] uppercase"
                style={{ color: "var(--success)" }}
                role="status"
              >
                ● Mission received — I’ll reply soon
              </p>
            ) : null}
            {status === "error" ? (
              <p
                className="font-mono text-[10px] tracking-[0.14em] uppercase"
                style={{ color: "#ff6b6b" }}
                role="alert"
              >
                ● {errorMsg || "Send failed — try again"}
              </p>
            ) : null}
          </form>
                {status === "sending" ? <TransmitAnimation /> : null}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
