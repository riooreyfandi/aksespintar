import crypto from "node:crypto";
import { Response } from "express";
import { env } from "../config/env";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "sid";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const cookieOptions = {
  httpOnly: true, // tidak bisa dibaca JavaScript di browser
  // Produksi (frontend dan API beda domain): SameSite=None + Secure agar cookie terkirim.
  sameSite: env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  secure: env.NODE_ENV === "production", // wajib HTTPS saat produksi
  path: "/",
};

type SessionMeta = {
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function createSession(userId: string, res: Response, meta: SessionMeta = {}) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      ipAddress: meta.ipAddress ?? null,
      userAgent: meta.userAgent ?? null,
    },
  });

  res.cookie(SESSION_COOKIE, token, { ...cookieOptions, expires: expiresAt });
}

// Catat aktivitas terakhir. Dipanggil tanpa await supaya tidak memperlambat respons,
// dan dibatasi agar tidak menulis ke database pada setiap request.
export function touchSession(sessionId: string, lastSeenAt: Date) {
  if (Date.now() - lastSeenAt.getTime() < 60_000) {
    return;
  }
  void prisma.session
    .update({ where: { id: sessionId }, data: { lastSeenAt: new Date() } })
    .catch(() => undefined);
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, cookieOptions);
}