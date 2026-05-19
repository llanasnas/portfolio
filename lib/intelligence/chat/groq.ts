import Groq from "groq-sdk";
import type { ChatMessage } from "../types";
import { buildSystemPrompt } from "./system-prompt";

if (typeof window !== "undefined") {
  throw new Error("groq.ts must never be imported on the client");
}

const PRIMARY_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_MODEL = "llama-3.1-8b-instant";

let client: Groq | null = null;

function getClient(): Groq {
  if (client) return client;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("MISSING_GROQ_API_KEY");
  client = new Groq({ apiKey });
  return client;
}

export interface InterpretInput {
  query: string;
  history: ChatMessage[];
  contextBlock: string;
}

export interface InterpretOutput {
  text: string;
  modelUsed: string;
}

export async function interpretSignal({
  query,
  history,
  contextBlock,
}: InterpretInput): Promise<InterpretOutput> {
  const sys = buildSystemPrompt(contextBlock);
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: sys },
  ];
  for (const h of history.slice(-6)) {
    messages.push({ role: h.role, content: h.content });
  }
  messages.push({ role: "user", content: query });

  const groq = getClient();
  const params = {
    messages,
    temperature: 0.3,
    max_tokens: 380,
    top_p: 0.9,
  } as const;

  try {
    const r = await groq.chat.completions.create({ ...params, model: PRIMARY_MODEL });
    const text = r.choices[0]?.message?.content ?? "";
    if (!text.trim()) throw new Error("EMPTY_RESPONSE");
    return { text: text.trim(), modelUsed: PRIMARY_MODEL };
  } catch (err) {
    console.warn("[interpreter] primary model failed, falling back", err);
    const r = await groq.chat.completions.create({ ...params, model: FALLBACK_MODEL });
    const text = r.choices[0]?.message?.content ?? "";
    if (!text.trim()) throw new Error("EMPTY_RESPONSE");
    return { text: text.trim(), modelUsed: FALLBACK_MODEL };
  }
}

const TAG_RE = /\[(S|P|R):\d+\]|\[BIO\]/g;

export function extractCitations(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(TAG_RE)) out.add(m[0].slice(1, -1));
  return [...out];
}

export function stripInvalidCitations(text: string, valid: Set<string>): string {
  return text.replace(TAG_RE, (m) => {
    const tag = m.slice(1, -1);
    return valid.has(tag) ? m : "";
  });
}
