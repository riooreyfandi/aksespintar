import { Request } from "express";
import { AppError, asyncHandler } from "./errors";
import { prisma } from "./prisma";
import { getClientIp } from "./request-meta";

export type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
  message?: string;
};

// Menaikkan penghitung untuk sebuah kunci. Bila batas terlampaui, lempar
// AppError 429 beserta saran waktu tunggu. Disimpan di database supaya tidak
// bisa diakali dengan berpindah instance serverless.
export async function consumeRateLimit(options: RateLimitOptions): Promise<void> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + options.windowMs);
  const existing = await prisma.rateLimit.findUnique({ where: { key: options.key } });

  if (!existing || existing.expiresAt <= now) {
    await prisma.rateLimit.upsert({
      where: { key: options.key },
      create: { key: options.key, count: 1, windowStart: now, expiresAt },
      update: { count: 1, windowStart: now, expiresAt },
    });
    // Bersihkan kunci kedaluwarsa sesekali tanpa membebani setiap permintaan.
    if (Math.random() < 0.05) {
      void prisma.rateLimit.deleteMany({ where: { expiresAt: { lt: now } } }).catch(() => undefined);
    }
    return;
  }

  if (existing.count >= options.limit) {
    const retryAfter = Math.max(1, Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000));
    const message =
      options.message ?? `Terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.`;
    throw new AppError(429, "RATE_LIMITED", message, undefined, retryAfter);
  }

  await prisma.rateLimit.update({
    where: { key: options.key },
    data: { count: { increment: 1 } },
  });
}

export async function resetRateLimit(key: string): Promise<void> {
  await prisma.rateLimit.deleteMany({ where: { key } }).catch(() => undefined);
}

type MiddlewareOptions = {
  scope: string;
  limit: number;
  windowMs: number;
  message?: string;
  key?: (req: Request) => string;
  includeIp?: boolean;
};

// Middleware siap pakai: membatasi berdasarkan IP (default) atau kunci khusus.
export function rateLimit(options: MiddlewareOptions) {
  return asyncHandler(async (req, _res, next) => {
    const ip = getClientIp(req) ?? "tanpa-ip";
    let key = options.key ? options.key(req) : ip;
    if (options.includeIp) key = `${key}:${ip}`;
    await consumeRateLimit({
      key: `${options.scope}:${key}`,
      limit: options.limit,
      windowMs: options.windowMs,
      message: options.message,
    });
    next();
  });
}
