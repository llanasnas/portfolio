const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be", "been",
  "being", "to", "of", "in", "on", "at", "by", "for", "with", "from", "as", "into",
  "this", "that", "these", "those", "it", "its", "his", "her", "their", "they",
  "he", "she", "we", "i", "you", "your", "my", "our", "me", "us", "them", "do",
  "does", "did", "doing", "have", "has", "had", "having", "can", "could", "would",
  "should", "may", "might", "will", "shall", "what", "which", "who", "whom",
  "when", "where", "why", "how", "than", "then", "so", "if", "about", "una", "uno",
  "el", "la", "los", "las", "de", "del", "y", "o", "u", "que", "como", "por", "para",
  "es", "son", "ser", "estar", "este", "esta", "estos", "estas", "su", "sus",
  "lo", "le", "les",
]);

export function tokenize(input: string): string[] {
  if (!input) return [];
  const lower = input.toLowerCase();
  const cleaned = lower.replace(/[^a-z0-9áéíóúñüç+/.# -]+/gi, " ");
  const raw = cleaned.split(/[\s.,;:!?()[\]{}<>"'`]+/);
  const out: string[] = [];
  for (const w of raw) {
    if (!w) continue;
    if (w.length < 2) continue;
    if (STOPWORDS.has(w)) continue;
    out.push(stem(w));
  }
  return out;
}

function stem(w: string): string {
  // Very small stemmer. Conservative on purpose.
  let s = w;
  if (s.endsWith("ing") && s.length > 5) s = s.slice(0, -3);
  else if (s.endsWith("ed") && s.length > 4) s = s.slice(0, -2);
  else if (s.endsWith("ies") && s.length > 4) s = s.slice(0, -3) + "y";
  else if (s.endsWith("es") && s.length > 4) s = s.slice(0, -2);
  else if (s.endsWith("s") && s.length > 3 && !s.endsWith("ss")) s = s.slice(0, -1);
  return s;
}
