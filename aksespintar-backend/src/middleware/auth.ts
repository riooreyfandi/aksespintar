import { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { hashToken, SESSION_COOKIE, touchSession } from "../lib/session";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "student" | "contributor" | "admin";
  avatar: string | null;
  mustChangePassword: boolean;
};

async function authenticate(req: Request): Promise<AuthUser> {
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

  const { id, name, email, role, avatar, mustChangePassword } = session.user;
  return { id, name, email, role, avatar, mustChangePassword };
}

// Login biasa. Akun yang wajib mengganti kata sandi (mis. masih memakai sandi
// bawaan) ditolak dari semua endpoint kecuali ubah sandi dan logout.
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await authenticate(req);
    if (user.mustChangePassword) {
      throw new AppError(
        403,
        "PASSWORD_CHANGE_REQUIRED",
        "Kamu harus mengganti kata sandi sebelum melanjutkan.",
      );
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

// Varian tanpa cek wajib ganti sandi, dipakai oleh /auth/me, /auth/logout,
// dan /auth/change-password.
export async function requireAuthRaw(req: Request, _res: Response, next: NextFunction) {
  try {
    req.user = await authenticate(req);
    next();
  } catch (err) {
    next(err);
  }
}

// Untuk area sensitif (panel admin): pengunjung yang belum masuk atau bukan
// admin mendapat 404, bukan 401/403, sehingga keberadaan endpoint tidak
// terkonfirmasi. Akun yang wajib ganti sandi tetap ditolak dengan 403.
export async function requireAuthHidden(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await authenticate(req);
    if (user.mustChangePassword) {
      throw new AppError(
        403,
        "PASSWORD_CHANGE_REQUIRED",
        "Kamu harus mengganti kata sandi sebelum melanjutkan.",
      );
    }
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError && err.status === 403) return next(err);
    if (err instanceof AppError) return next(new AppError(404, "NOT_FOUND", "Endpoint tidak ditemukan."));
    next(err);
  }
}
