import { NextResponse, type NextRequest } from "next/server";
import { getDb } from "@/lib/db/mongo";
import { extractIp, hashIp } from "@/lib/db/ip";
import { containsProfanity } from "@/lib/db/profanity";
import { checkAndRecordRateLimit } from "@/lib/db/rate-limit";
import { getActiveSlugs, getSimulation } from "@/lib/simulations/registry";
import { composeScore } from "@/lib/simulations/scoring";
import type {
  LeaderboardResponse,
  RunStats,
  ScoreEntry,
  SubmitScoreError,
  SubmitScoreResponse,
} from "@/lib/simulations/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NICK_RE = /^[A-Z0-9_]{3,16}$/;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function rateLimitFor(): number {
  const env = Number(process.env.LEADERBOARD_RATELIMIT_PER_HOUR);
  if (!Number.isFinite(env) || env <= 0) return 5;
  return Math.floor(env);
}

function errorResponse(
  body: SubmitScoreError,
  init?: ResponseInit,
): NextResponse {
  return NextResponse.json(body, init);
}

// ============================================================================
// GET /api/leaderboard?slug=...&limit=10
// ============================================================================

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug") ?? "";
  const limitRaw = Number(url.searchParams.get("limit") ?? 10);
  const limit = Number.isFinite(limitRaw)
    ? Math.max(1, Math.min(50, Math.floor(limitRaw)))
    : 10;

  if (!getActiveSlugs().includes(slug)) {
    return NextResponse.json(
      { error: "INVALID_SLUG" satisfies SubmitScoreError["error"] },
      { status: 400 },
    );
  }

  try {
    const db = await getDb();
    const col = db.collection<ScoreEntry>("scores");
    const cursor = col
      .find({ simulationSlug: slug })
      .sort({ score: -1, createdAt: -1 })
      .limit(limit);
    const raw = await cursor.toArray();
    const total = await col.countDocuments({ simulationSlug: slug });

    const entries: LeaderboardResponse["entries"] = raw.map((doc, i) => ({
      rank: i + 1,
      nickname: doc.nickname,
      score: doc.score,
      stats: doc.stats,
      createdAt:
        typeof doc.createdAt === "string"
          ? doc.createdAt
          : new Date(doc.createdAt as unknown as Date).toISOString(),
    }));

    const payload: LeaderboardResponse = { slug, entries, total };
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[leaderboard][GET]", err);
    return NextResponse.json(
      { error: "INTERNAL" satisfies SubmitScoreError["error"] },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST /api/leaderboard
// ============================================================================

interface SubmitBody {
  slug?: unknown;
  nickname?: unknown;
  score?: unknown;
  seed?: unknown;
  stats?: unknown;
}

function isStats(v: unknown): v is RunStats {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.timeMs === "number" &&
    typeof s.transfersBefore === "number" &&
    typeof s.transfersAfter === "number" &&
    typeof s.manualMoves === "number" &&
    typeof s.efficiency === "number" &&
    s.timeMs >= 0 &&
    s.transfersBefore >= 0 &&
    s.transfersAfter >= 0 &&
    s.manualMoves >= 0 &&
    s.efficiency >= 0 &&
    s.efficiency <= 1
  );
}

export async function POST(req: NextRequest) {
  if (req.headers.get("content-type")?.includes("application/json") !== true) {
    return errorResponse(
      { ok: false, error: "INVALID_PAYLOAD" },
      { status: 400 },
    );
  }

  let body: SubmitBody;
  try {
    body = (await req.json()) as SubmitBody;
  } catch {
    return errorResponse(
      { ok: false, error: "INVALID_PAYLOAD" },
      { status: 400 },
    );
  }

  const slug = typeof body.slug === "string" ? body.slug : "";
  const nickname = typeof body.nickname === "string" ? body.nickname.toUpperCase() : "";
  const score = typeof body.score === "number" ? body.score : NaN;
  const seed = typeof body.seed === "number" ? body.seed : 0;

  const manifest = getSimulation(slug);
  if (!manifest || manifest.status !== "active") {
    return errorResponse({ ok: false, error: "INVALID_SLUG" }, { status: 400 });
  }
  if (!NICK_RE.test(nickname)) {
    return errorResponse(
      { ok: false, error: "INVALID_NICKNAME" },
      { status: 400 },
    );
  }
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    return errorResponse(
      { ok: false, error: "INVALID_PAYLOAD" },
      { status: 400 },
    );
  }
  if (!isStats(body.stats)) {
    return errorResponse(
      { ok: false, error: "INVALID_PAYLOAD" },
      { status: 400 },
    );
  }
  const stats = body.stats;

  if (containsProfanity(nickname)) {
    return errorResponse({ ok: false, error: "PROFANITY" }, { status: 400 });
  }

  const ip = extractIp(req);
  const ipHash = hashIp(ip);

  try {
    const rate = await checkAndRecordRateLimit(
      `leaderboard:${ipHash}`,
      rateLimitFor(),
      RATE_WINDOW_MS,
    );
    if (!rate.ok) {
      return errorResponse(
        { ok: false, error: "RATE_LIMITED", retryAfter: rate.retryAfter },
        {
          status: 429,
          headers: rate.retryAfter
            ? { "Retry-After": String(rate.retryAfter) }
            : undefined,
        },
      );
    }
  } catch (err) {
    console.error("[leaderboard][rateLimit]", err);
    return errorResponse({ ok: false, error: "INTERNAL" }, { status: 500 });
  }

  // Server-side re-score from stats — guards against trivial tampering.
  const efficiencyScore =
    stats.efficiency > 0
      ? Math.min(1, stats.efficiency)
      : 0;
  const cfg = manifest.scoring;
  const timeNorm =
    stats.timeMs <= cfg.timeFloorMs
      ? 1
      : stats.timeMs >= cfg.timeCeilingMs
        ? 0
        : 1 - (stats.timeMs - cfg.timeFloorMs) / (cfg.timeCeilingMs - cfg.timeFloorMs);
  const manualNorm =
    stats.transfersBefore > 0
      ? Math.min(stats.manualMoves, stats.transfersBefore * 2) /
        (stats.transfersBefore * 2)
      : 0;
  const serverScore = composeScore({
    efficiency: efficiencyScore,
    time: timeNorm,
    manualBonus: manualNorm,
    weights: cfg.weights,
  });
  const finalScore = Math.abs(score - serverScore) > 0.5 ? serverScore : score;

  try {
    const db = await getDb();
    const col = db.collection<ScoreEntry>("scores");
    const doc: ScoreEntry = {
      simulationSlug: slug,
      nickname,
      score: finalScore,
      stats,
      seed,
      createdAt: new Date().toISOString(),
    };
    const insert = await col.insertOne(doc as unknown as Omit<ScoreEntry, "_id">);
    const rankCursor = await col.countDocuments({
      simulationSlug: slug,
      $or: [
        { score: { $gt: finalScore } },
        { score: finalScore, createdAt: { $lt: doc.createdAt } },
      ],
    });
    const rank = rankCursor + 1;

    const payload: SubmitScoreResponse = {
      ok: true,
      entry: { ...doc, _id: String(insert.insertedId) },
      rank,
    };
    return NextResponse.json(payload, { status: 201 });
  } catch (err) {
    console.error("[leaderboard][POST]", err);
    return errorResponse({ ok: false, error: "INTERNAL" }, { status: 500 });
  }
}
