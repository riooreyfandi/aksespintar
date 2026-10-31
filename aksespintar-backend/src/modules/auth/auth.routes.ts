import { Router } from "express";
import argon2 from "argon2";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { AppError, asyncHandler } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { recordAudit } from "../../lib/audit";
import { getClientIp, getClientUserAgent } from "../../lib/request-meta";
import { requireAuthRaw } from "../../middleware/auth";
import { clearSessionCookie, createSession, hashToken, SESSION_COOKIE } from "../../lib/session";
import {
  isCommonPassword,
  isDisposableEmail,
  MIN_PASSWORD_LENGTH,
  passwordProblem,
} from "../../lib/password";
import { consumeRateLimit, rateLimit, resetRateLimit } from "../../lib/rate-limit";

const router = Router();

const emailSchema = z.string().trim().toLowerCase().email("Format email tidak valid.").max(255);

const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(100, "Nama maksimal 100 karakter."),
  email: emailSchema,
  password: z.string().min(1, "Kata sandi wajib diisi.").max(128),
  // Honeypot: kolom tersembunyi yang hanya diisi bot.
  website: z.string().max(200).optional(),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Kata sandi wajib diisi.").max(128),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi.").max(128),
  newPassword: z.string().min(1, "Kata sandi baru wajib diisi.").max(128),
});

// Hash palsu: dipakai agar waktu respons sama, baik email ada maupun tidak
let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= argon2.hash("kata-sandi-palsu", { type: argon2.argon2id }));

const userShape = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  mustChangePassword: true,
} as const;

const loginIpLimit = rateLimit({
  scope: "auth.login.ip",
  limit: 20,
  windowMs: 15 * 60 * 1000,
  message: "Terlalu banyak percobaan masuk. Coba lagi beberapa menit lagi.",
});

const registerIpLimit = rateLimit({
  scope: "auth.register.ip",
  limit: 5,
  windowMs: 60 * 60 * 1000,
  message: "Terlalu banyak pendaftaran dari jaringan ini. Coba lagi nanti.",
});

const changePasswordLimit = rateLimit({
  scope: "auth.change-password",
  limit: 10,
  windowMs: 60 * 60 * 1000,
  includeIp: true,
  key: (req) => req.user?.id ?? "anonim",
});

router.post(
  "/register",
  registerIpLimit,
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);

    if (data.website && data.website.trim() !== "") {
      throw new AppError(400, "REGISTRATION_REJECTED", "Registrasi tidak dapat diproses.");
    }
    if (isDisposableEmail(data.email)) {
      throw new AppError(400, "EMAIL_NOT_ALLOWED", "Gunakan email yang aktif, bukan email sekali pakai.");
    }

    const problem = passwordProblem(data.password, { email: data.email, name: data.name });
    if (problem) {
      throw new AppError(400, "WEAK_PASSWORD", problem);
    }

    const passwordHash = await argon2.hash(data.password, { type: argon2.argon2id });

    try {
      const user = await prisma.user.create({
        data: { name: data.name, email: data.email, passwordHash },
        select: userShape,
      });

      await recordAudit({
        actorId: user.id,
        action: "auth.register",
        entityType: "user",
        entityId: user.id,
        metadata: {
          ip: getClientIp(req),
          userAgent: getClientUserAgent(req),
        },
      });

      res.status(201).json({ user });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new AppError(409, "EMAIL_TAKEN", "Email sudah terdaftar.");
      }
      throw err;
    }
  }),
);

router.post(
  "/login",
  loginIpLimit,
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);

    // Batasi juga per email agar satu akun tidak bisa di-brute force dari
    // banyak IP sekaligus.
    await consumeRateLimit({
      key: `auth.login.email:${data.email}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
      message: "Terlalu banyak percobaan masuk untuk akun ini. Coba lagi nanti.",
    });

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    const hash = user ? user.passwordHash : await getDummyHash();
    const valid = await argon2.verify(hash, data.password);

    const ip = getClientIp(req);
    const userAgent = getClientUserAgent(req);

    // Pesan sengaja sama untuk "email tidak ada" dan "password salah"
    if (!user || !valid) {
      if (user) {
        await recordAudit({
          actorId: user.id,
          action: "auth.login-failed",
          entityType: "session",
          metadata: { ip, userAgent },
        });
      }
      throw new AppError(401, "INVALID_CREDENTIALS", "Email atau kata sandi salah.");
    }

    const weakPassword = isCommonPassword(data.password) || data.password.length < MIN_PASSWORD_LENGTH;
    const mustChangePassword = user.mustChangePassword || (user.role === "admin" && weakPassword);

    if (mustChangePassword && !user.mustChangePassword) {
      await prisma.user.update({
        where: { id: user.id },
        data: { mustChangePassword: true },
      });
      await recordAudit({
        actorId: user.id,
        action: "auth.weak-password-detected",
        entityType: "user",
        entityId: user.id,
        metadata: { ip, userAgent },
      });
    }

    await createSession(user.id, res, { ipAddress: ip, userAgent });
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { loginCount: { increment: 1 }, lastLoginAt: new Date() },
      select: { loginCount: true },
    });

    await recordAudit({
      actorId: user.id,
      action: "auth.login",
      entityType: "session",
      metadata: {
        ip,
        userAgent,
        loginKe: updated.loginCount,
      },
    });

    await resetRateLimit(`auth.login.email:${data.email}`);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        mustChangePassword,
      },
    });
  }),
);

router.post(
  "/change-password",
  requireAuthRaw,
  changePasswordLimit,
  asyncHandler(async (req, res) => {
    const data = changePasswordSchema.parse(req.body);
    const user = req.user!;

    const record = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true, email: true, name: true },
    });
    if (!record) {
      throw new AppError(401, "UNAUTHENTICATED", "Sesi tidak valid.");
    }

    const validCurrent = await argon2.verify(record.passwordHash, data.currentPassword);
    if (!validCurrent) {
      throw new AppError(400, "INVALID_CURRENT_PASSWORD", "Kata sandi saat ini salah.");
    }

    if (data.currentPassword === data.newPassword) {
      throw new AppError(400, "SAME_PASSWORD", "Kata sandi baru harus berbeda dari yang lama.");
    }

    const problem = passwordProblem(data.newPassword, { email: record.email, name: record.name });
    if (problem) {
      throw new AppError(400, "WEAK_PASSWORD", problem);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await argon2.hash(data.newPassword, { type: argon2.argon2id }),
        mustChangePassword: false,
      },
    });

    // Semua sesi lama dicabut, lalu sesi baru dibuat untuk perangkat ini.
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await createSession(user.id, res, {
      ipAddress: getClientIp(req),
      userAgent: getClientUserAgent(req),
    });

    await recordAudit({
      actorId: user.id,
      action: "auth.password-changed",
      entityType: "user",
      entityId: user.id,
      metadata: {
        ip: getClientIp(req),
        userAgent: getClientUserAgent(req),
      },
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        mustChangePassword: false,
      },
    });
  }),
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[SESSION_COOKIE];
    if (typeof token === "string" && token) {
      const session = await prisma.session.findUnique({
        where: { tokenHash: hashToken(token) },
        select: { userId: true, createdAt: true },
      });

      if (session) {
        await recordAudit({
          actorId: session.userId,
          action: "auth.logout",
          entityType: "session",
          metadata: {
            ip: getClientIp(req),
            userAgent: getClientUserAgent(req),
            durasiMenit: Math.max(0, Math.round((Date.now() - session.createdAt.getTime()) / 60_000)),
          },
        });
      }

      await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
    }
    clearSessionCookie(res);
    res.status(204).end();
  }),
);

// Tambahan di luar tabel PRD: dipakai frontend untuk tahu siapa yang sedang login
router.get("/me", requireAuthRaw, (req, res) => {
  res.json({ user: req.user });
});

export default router;
