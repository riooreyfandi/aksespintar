import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { AppError } from "./errors";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function allowedOrigins(): string[] {
  return env.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, "");
  return allowedOrigins().includes(normalized);
}

function isSameHost(req: Request, origin: string): boolean {
  const host = req.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// Cookie sesi memakai SameSite=None di produksi agar bisa lintas domain,
// sehingga permintaan yang mengubah data harus dipastikan berasal dari origin
// yang kita izinkan (proteksi CSRF).
export function originCheck(req: Request, _res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get("origin");
  const fetchSite = req.get("sec-fetch-site");

  if (fetchSite === "cross-site" && !isAllowedOrigin(origin)) {
    return next(new AppError(403, "CROSS_SITE_BLOCKED", "Permintaan lintas situs tidak diizinkan."));
  }

  if (origin && !isAllowedOrigin(origin) && !isSameHost(req, origin)) {
    return next(new AppError(403, "ORIGIN_BLOCKED", "Asal permintaan tidak diizinkan."));
  }

  next();
}
