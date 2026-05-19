import { NextResponse, type NextRequest } from "next/server";
import { extractIp, hashIp } from "@/lib/db/ip";
import { checkAndRecordRateLimit } from "@/lib/db/rate-limit";
import { retrieve } from "@/lib/intelligence/rag/retrieve";
import { formatContext, validCitations } from "@/lib/intelligence/rag/format-context";
import {
  extractCitations,
  interpretSignal,
  stripInvalidCitations,
} from "@/lib/intelligence/chat/groq";
import type {
  ChatMessage,
  InterpreterApiErr,
  InterpreterApiResponse,
} from "@/lib/intelligence/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_QUERY_LEN = 600;
const MAX_HISTORY = 6;

function rateLimitFor(): number {
  const env = Number(process.env.INTELLIGENCE_RATELIMIT_PER_HOUR);
  if (!Number.isFinite(env) || env <= 0) return 15;
  return Math.floor(env);
}

interface InboundBody {
  query?: unknown;
  history?: unknown;
}

function isMsg(v: unknown): v is ChatMessage {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    (r.role === "user" || r.role === "assistant") &&
    typeof r.content === "string" &&
    r.content.length > 0 &&
    r.content.length < 4000
  );
}

const memoryRateLimits = new Map<string, { hits: number; expiresAt: number }>();

function memoryRateLimitFallback(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const cur = memoryRateLimits.get(key);
  if (!cur || cur.expiresAt <= now) {
    memoryRateLimits.set(key, { hits: 1, expiresAt: now + windowMs });
    return { ok: true as const, remaining: limit - 1 };
  }
  if (cur.hits >= limit) {
    return {
      ok: false as const,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((cur.expiresAt - now) / 1000)),
    };
  }
  cur.hits += 1;
  return { ok: true as const, remaining: limit - cur.hits };
}

function err(body: InterpreterApiErr, status: number): NextResponse {
  return NextResponse.json(body satisfies InterpreterApiResponse, { status });
}

export async function POST(req: NextRequest) {
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return err({ ok: false, error: "INVALID_PAYLOAD" }, 400);
  }

  if (!process.env.GROQ_API_KEY) {
    return err(
      {
        ok: false,
        error: "MISSING_KEY",
        fallbackText:
          "Signal absent. Interpreter offline — provider key not configured in current environment.",
      },
      503,
    );
  }

  let body: InboundBody;
  try {
    body = (await req.json()) as InboundBody;
  } catch {
    return err({ ok: false, error: "INVALID_PAYLOAD" }, 400);
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query || query.length > MAX_QUERY_LEN) {
    return err({ ok: false, error: "INVALID_PAYLOAD" }, 400);
  }

  const history: ChatMessage[] = Array.isArray(body.history)
    ? (body.history as unknown[]).filter(isMsg).slice(-MAX_HISTORY)
    : [];

  const ipHash = hashIp(extractIp(req));
  const limitKey = `intelligence:${ipHash}`;
  const limit = rateLimitFor();

  try {
    const rate = await checkAndRecordRateLimit(limitKey, limit, RATE_WINDOW_MS);
    if (!rate.ok) {
      return err(
        { ok: false, error: "RATE_LIMITED", retryAfter: rate.retryAfter },
        429,
      );
    }
  } catch (e) {
    console.warn("[intelligence][rateLimit] mongo unreachable, using memory", e);
    const rate = memoryRateLimitFallback(limitKey, limit, RATE_WINDOW_MS);
    if (!rate.ok) {
      return err(
        { ok: false, error: "RATE_LIMITED", retryAfter: rate.retryAfter },
        429,
      );
    }
  }

  const retrieval = retrieve(query, 6);

  // Empty-retrieval shortcut: skip LLM, return signal-language fallback.
  if (retrieval.hits.length === 0) {
    const fallback =
      "Low signal density area. Query did not match any indexed skill, project or relation. Available domains: React/Next.js, LLM application engineering, backend API engineering, Supabase, WordPress/WooCommerce, real-time apps. [BIO]";
    const payload: InterpreterApiResponse = {
      ok: true,
      text: fallback,
      citations: ["BIO"],
      retrieved: [
        {
          id: retrieval.pinnedBio.id,
          kind: retrieval.pinnedBio.kind,
          label: retrieval.pinnedBio.label,
        },
      ],
    };
    return NextResponse.json(payload);
  }

  const contextBlock = formatContext(retrieval);
  const valid = validCitations(retrieval);

  try {
    const result = await interpretSignal({ query, history, contextBlock });
    const cleaned = stripInvalidCitations(result.text, valid);
    const citations = extractCitations(cleaned);

    const payload: InterpreterApiResponse = {
      ok: true,
      text: cleaned,
      citations,
      retrieved: [
        { id: retrieval.pinnedBio.id, kind: retrieval.pinnedBio.kind, label: retrieval.pinnedBio.label },
        ...retrieval.hits.map((h) => ({ id: h.id, kind: h.kind, label: h.label })),
      ],
    };
    return NextResponse.json(payload);
  } catch (e) {
    console.error("[intelligence] provider error", e);
    return err(
      {
        ok: false,
        error: "PROVIDER_UNAVAILABLE",
        fallbackText:
          "Interpreter offline. Provider channel returned no signal. Try sweep again in a moment.",
      },
      502,
    );
  }
}
