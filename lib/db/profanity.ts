/**
 * Minimal profanity filter — substring check against a small static list.
 * Not a content-moderation system; just blocks the most obvious abuse.
 * For production at scale, swap in a managed service (Perspective, OpenAI mod).
 */

const BAD = [
  "FUCK",
  "SHIT",
  "BITCH",
  "CUNT",
  "DICK",
  "PUSSY",
  "FAGGOT",
  "NIGGER",
  "NIGGA",
  "RAPE",
  "RETARD",
  "KIKE",
  "CHINK",
  "SPIC",
  "WHORE",
  "SLUT",
  "PORN",
  "NAZI",
  "HITLER",
  "PEDO",
];

const LEET_MAP: Record<string, string> = {
  "0": "O",
  "1": "I",
  "3": "E",
  "4": "A",
  "5": "S",
  "7": "T",
  "@": "A",
  $: "S",
  "!": "I",
};

function canonicalize(input: string): string {
  return input
    .toUpperCase()
    .split("")
    .map((c) => LEET_MAP[c] ?? c)
    .join("")
    .replace(/[^A-Z]/g, "");
}

export function containsProfanity(nickname: string): boolean {
  if (!nickname) return false;
  const c = canonicalize(nickname);
  for (const word of BAD) {
    if (c.includes(word)) return true;
  }
  return false;
}
