import { profile } from "../profile";
import type { RetrieveResult } from "./retrieve";

/**
 * Turn retrieval result into the bracketed context block injected into the system prompt.
 * Each retrieved doc gets its full structured shape so the model can cite specific fields.
 */
export function formatContext(r: RetrieveResult): string {
  const lines: string[] = [];

  for (const h of r.hits) {
    if (h.kind === "skill") {
      const idx = parseInt(h.id.slice(2), 10) - 1;
      const s = profile.skills[idx];
      if (!s) continue;
      lines.push(`[${h.id}] ${s.name} (category: ${s.category}, confidence: ${s.confidence})`);
      const evi = s.signals.map((sig) => `${sig.value} (${sig.source})`).join("; ");
      if (evi) lines.push(`  signals: ${evi}`);
      if (s.gaps.length > 0) lines.push(`  gaps: ${s.gaps.join("; ")}`);
    } else if (h.kind === "project") {
      const idx = parseInt(h.id.slice(2), 10) - 1;
      const p = profile.projects[idx];
      if (!p) continue;
      lines.push(`[${h.id}] ${p.name} — ${p.blurb}`);
      if (p.signals.strengths.length > 0)
        lines.push(`  strengths: ${p.signals.strengths.join("; ")}`);
      if (p.signals.weaknesses.length > 0)
        lines.push(`  weaknesses: ${p.signals.weaknesses.join("; ")}`);
    } else if (h.kind === "relation") {
      const idx = parseInt(h.id.slice(2), 10) - 1;
      const rel = profile.relations[idx];
      if (!rel) continue;
      lines.push(
        `[${h.id}] ${rel.skill} supported by ${rel.supported_by.join(", ")} (confidence: ${rel.confidence})`,
      );
    }
  }

  lines.push("");
  lines.push(`[${r.pinnedBio.id}] ${r.pinnedBio.text}`);

  return lines.join("\n");
}

/**
 * Build the set of valid citation tags that the model is allowed to use,
 * derived from the retrieved context. Used server-side to strip hallucinated cites.
 */
export function validCitations(r: RetrieveResult): Set<string> {
  const s = new Set<string>();
  for (const h of r.hits) s.add(h.id);
  s.add(r.pinnedBio.id);
  return s;
}
