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

export async function createSession(userId: string, res: Response) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MS);

  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });

  res.cookie(SESSION_COOKIE, token, { ...cookieOptions, expires: expiresAt });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, cookieOptions);
}