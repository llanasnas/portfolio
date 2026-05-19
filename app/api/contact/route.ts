import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

// Required env vars (Gmail App Password — https://myaccount.google.com/apppasswords):
//   GMAIL_USER             — your Gmail address (also recipient)
//   GMAIL_APP_PASSWORD     — 16-char app password
//   CONTACT_TO (optional)  — override recipient (defaults to GMAIL_USER)

type Body = {
  name?: string;
  email?: string;
  message?: string;
  type?: string;
  company?: string; // honeypot — must stay empty
  ts?: number; // form open timestamp (ms)
};

const MAX = { name: 120, email: 200, message: 5000, type: 40 };

// Rate limit: max 3 submissions per IP per 10 minutes (in-memory)
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MIN_FORM_TIME_MS = 2000;
const hits = new Map<string, number[]>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  if (arr.length >= RATE_LIMIT_MAX) {
    hits.set(ip, arr);
    return false;
  }
  arr.push(now);
  hits.set(ip, arr);
  // Cheap GC — prevent map growth
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      const fresh = v.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (fresh.length === 0) hits.delete(k);
      else hits.set(k, fresh);
    }
  }
  return true;
}

function getIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function clean(s: unknown, max: number) {
  if (typeof s !== "string") return "";
  return s.trim().slice(0, max);
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot — bots auto-fill all fields, humans never see this
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true }); // silently pretend success
  }

  // Min form-fill time — instant submits are bots
  if (typeof body.ts === "number" && Date.now() - body.ts < MIN_FORM_TIME_MS) {
    return NextResponse.json({ error: "Too fast" }, { status: 429 });
  }

  // Rate limit per IP
  const ip = getIp(req);
  if (!rateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests — try again later" },
      { status: 429 },
    );
  }

  const name = clean(body.name, MAX.name);
  const email = clean(body.email, MAX.email);
  const message = clean(body.message, MAX.message);
  const type = clean(body.type, MAX.type) || "message";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    return NextResponse.json(
      { error: "Mailer not configured" },
      { status: 500 },
    );
  }

  const to = process.env.CONTACT_TO || user;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const subject = `[Portfolio · ${type}] ${name}`;
  const text = `Name: ${name}\nEmail: ${email}\nType: ${type}\n\n${message}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#111">
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Type:</strong> ${escapeHtml(type)}</p>
      <hr/>
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${user}>`,
      to,
      replyTo: `"${name}" <${email}>`,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("[contact] sendMail failed", err);
    return NextResponse.json({ error: "Send failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
