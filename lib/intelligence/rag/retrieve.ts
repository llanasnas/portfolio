import { profile } from "../profile";
import type { ProfileDataset, RetrievedDoc } from "../types";
import { tokenize } from "./tokenize";
import { expandTokens } from "./aliases";

interface IndexedDoc {
  id: string;
  kind: RetrievedDoc["kind"];
  label: string;
  text: string;
  tf: Map<string, number>;
  len: number;
}

interface Index {
  docs: IndexedDoc[];
  idf: Map<string, number>;
}

let cached: Index | null = null;

function buildIndex(p: ProfileDataset): Index {
  const docs: IndexedDoc[] = [];

  p.skills.forEach((s, i) => {
    const signalText = s.signals.map((sig) => sig.value).join(". ");
    const sourceText = s.signals.map((sig) => sig.source).join(" ");
    const text = `${s.name}. ${s.category}. ${signalText}. ${sourceText}. ${s.gaps.join(". ")}`;
    docs.push({
      id: `S:${i + 1}`,
      kind: "skill",
      label: s.name,
      text,
      tf: new Map(),
      len: 0,
    });
  });

  p.projects.forEach((pr, i) => {
    const text = `${pr.name}. ${pr.blurb}. ${pr.signals.strengths.join(". ")}. ${pr.signals.weaknesses.join(". ")}`;
    docs.push({
      id: `P:${i + 1}`,
      kind: "project",
      label: pr.name,
      text,
      tf: new Map(),
      len: 0,
    });
  });

  p.relations.forEach((r, i) => {
    const text = `${r.skill} supported by ${r.supported_by.join(" ")}`;
    docs.push({
      id: `R:${i + 1}`,
      kind: "relation",
      label: `${r.skill} ← ${r.supported_by.join(", ")}`,
      text,
      tf: new Map(),
      len: 0,
    });
  });

  const timelineText = p.timeline
    .map((t) => `${t.role} at ${t.org} ${t.from} to ${t.to}. ${t.notes.join(". ")}`)
    .join(". ");
  const educationText = p.education.map((e) => `${e.title} ${e.org} ${e.year}`).join(". ");
  const langText = p.languages.map((l) => `${l.name} ${l.level}`).join(", ");
  docs.push({
    id: "BIO",
    kind: "bio",
    label: "Bio + Career",
    text: `${p.bio} ${timelineText} ${educationText} Languages: ${langText}. Contact: ${p.contact.location}.`,
    tf: new Map(),
    len: 0,
  });

  const df = new Map<string, number>();
  for (const d of docs) {
    const toks = tokenize(d.text);
    d.len = toks.length || 1;
    for (const t of toks) {
      d.tf.set(t, (d.tf.get(t) ?? 0) + 1);
    }
    for (const t of new Set(toks)) {
      df.set(t, (df.get(t) ?? 0) + 1);
    }
  }

  const N = docs.length;
  const idf = new Map<string, number>();
  for (const [t, c] of df) {
    idf.set(t, Math.log(1 + N / (1 + c)));
  }

  return { docs, idf };
}

function getIndex(): Index {
  if (!cached) cached = buildIndex(profile);
  return cached;
}

export interface RetrieveResult {
  pinnedBio: RetrievedDoc;
  hits: RetrievedDoc[];
  totalScore: number;
}

export function retrieve(query: string, k = 6): RetrieveResult {
  const idx = getIndex();
  const queryToks = tokenize(query);
  const expanded = expandTokens(queryToks);

  const scored: { doc: IndexedDoc; score: number }[] = [];

  for (const d of idx.docs) {
    if (d.kind === "bio") continue;
    let score = 0;
    for (const { token, weight } of expanded) {
      const tf = d.tf.get(token);
      if (!tf) continue;
      const idf = idx.idf.get(token) ?? 0;
      score += weight * (tf / d.len) * idf;
    }
    if (score > 0) scored.push({ doc: d, score });
  }

  scored.sort((a, b) => b.score - a.score);

  const picked: { doc: IndexedDoc; score: number }[] = [];
  const kindCounts: Record<string, number> = { skill: 0, project: 0, relation: 0 };

  for (const item of scored) {
    if (picked.length >= k) break;
    const diversityPenalty = (kindCounts[item.doc.kind] ?? 0) * 0.15;
    const adjusted = item.score - diversityPenalty;
    if (adjusted <= 0) continue;
    picked.push(item);
    kindCounts[item.doc.kind] = (kindCounts[item.doc.kind] ?? 0) + 1;
  }

  // Diversity guarantee: ensure ≥1 skill + ≥1 project if any matched.
  const hasSkill = picked.some((p) => p.doc.kind === "skill");
  const hasProj = picked.some((p) => p.doc.kind === "project");
  if (!hasSkill) {
    const firstSkill = scored.find((s) => s.doc.kind === "skill" && !picked.includes(s));
    if (firstSkill) {
      if (picked.length >= k) picked.pop();
      picked.push(firstSkill);
    }
  }
  if (!hasProj) {
    const firstProj = scored.find((s) => s.doc.kind === "project" && !picked.includes(s));
    if (firstProj) {
      if (picked.length >= k) picked.pop();
      picked.push(firstProj);
    }
  }

  const bioDoc = idx.docs.find((d) => d.kind === "bio")!;
  const pinnedBio: RetrievedDoc = {
    id: bioDoc.id,
    kind: bioDoc.kind,
    label: bioDoc.label,
    text: bioDoc.text,
    score: 0,
  };

  const hits: RetrievedDoc[] = picked.map((p) => ({
    id: p.doc.id,
    kind: p.doc.kind,
    label: p.doc.label,
    text: p.doc.text,
    score: p.score,
  }));

  const totalScore = picked.reduce((sum, p) => sum + p.score, 0);

  return { pinnedBio, hits, totalScore };
}
