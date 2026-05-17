import { HoloPanel } from "@/components/ui/HoloPanel";

export default function Loading() {
  return (
    <HoloPanel variant="rare" cornerTicks>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          fontSize: 13,
          color: "var(--accent-cyan)",
          padding: "12px 4px",
        }}
      >
        &gt; decrypting protocol<span className="dots">...</span>
      </div>
    </HoloPanel>
  );
}
