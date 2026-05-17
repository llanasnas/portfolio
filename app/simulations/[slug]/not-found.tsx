import Link from "next/link";
import { HoloPanel } from "@/components/ui/HoloPanel";
import { GlowButton } from "@/components/ui/GlowButton";

export default function NotFound() {
  return (
    <HoloPanel
      variant="locked"
      cornerTicks
      style={{ textAlign: "center", padding: "64px 32px" }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--fg-3)",
          fontSize: 11,
          marginBottom: 16,
        }}
      >
        {"// access_denied"}
      </div>
      <h1
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 28,
          margin: "0 0 24px",
          color: "var(--fg-1)",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        Protocol Classified
      </h1>
      <p style={{ color: "var(--fg-3)", maxWidth: 480, margin: "0 auto 28px" }}>
        This simulation has not yet been declassified for public access. Return to
        the hub for available protocols.
      </p>
      <Link href="/simulations" style={{ textDecoration: "none" }}>
        <GlowButton variant="ghost">← Return to Hub</GlowButton>
      </Link>
    </HoloPanel>
  );
}
