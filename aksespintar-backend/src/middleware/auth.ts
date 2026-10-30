import { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { hashToken, SESSION_COOKIE, touchSession } from "../lib/session";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[SESSION_COOKIE];
    if (typeof token !== "string" || !token) {
      throw new AppError(401, "UNAUTHENTICATED", "Silakan login terlebih dahulu.");
    }

    const session = await prisma.session.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date()) {
      throw new AppError(401, "UNAUTHENTICATED", "Sesi tidak valid atau sudah berakhir.");
    }

    touchSession(session.id, session.lastSeenAt);

    const { id, name, email, role, avatar } = session.user;
    req.user = { id, name, email, role, avatar };
    next();
  } catch (err) {
    next(err);
  }
}