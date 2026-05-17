import { getDb } from "./mongo";

interface RateLimitDoc {
  _id: string;
  hits: number;
  windowStart: Date;
  expiresAt: Date;
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter?: number;
}

export async function checkAndRecordRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const db = await getDb();
  const col = db.collection<RateLimitDoc>("rate_limits");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);

  const existing = await col.findOne({ _id: key });

  if (!existing || existing.expiresAt.getTime() <= now.getTime()) {
    await col.replaceOne(
      { _id: key },
      { hits: 1, windowStart: now, expiresAt },
      { upsert: true },
    );
    return { ok: true, remaining: limit - 1 };
  }

  if (existing.hits >= limit) {
    const retryAfter = Math.max(
      1,
      Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000),
    );
    return { ok: false, remaining: 0, retryAfter };
  }

  await col.updateOne({ _id: key }, { $inc: { hits: 1 } });
  return { ok: true, remaining: limit - existing.hits - 1 };
}
