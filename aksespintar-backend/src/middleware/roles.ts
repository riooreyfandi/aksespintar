import { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { AppError } from "../lib/errors";

// Pakai SETELAH requireAuth. Contoh: requireRole("admin")
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "UNAUTHENTICATED", "Silakan login terlebih dahulu."));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "FORBIDDEN", "Anda tidak memiliki akses ke sumber daya ini."));
    }
    next();
  };
}