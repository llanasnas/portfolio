import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";

export function extractIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export function hashIp(ip: string): string {
  const salt = process.env.MONGODB_DB ?? "portfolio";
  return createHash("sha256").update(`${ip}::${salt}`).digest("hex").slice(0, 24);
}
