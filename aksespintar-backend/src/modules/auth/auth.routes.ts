import crypto from "node:crypto";
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
import { sendVerificationEmail, sendPasswordResetEmail } from "../../lib/mailer";

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

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token wajib diisi.").max(128),
  newPassword: z.string().min(1, "Kata sandi baru wajib diisi.").max(128),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token wajib diisi.").max(128),
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
  emailVerified: true,
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

const forgotPasswordLimit = rateLimit({
  scope: "auth.forgot-password",
  limit: 5,
  windowMs: 60 * 60 * 1000,
  message: "Terlalu banyak permintaan reset. Coba lagi nanti.",
});

const resendVerificationLimit = rateLimit({
  scope: "auth.resend-verification",
  limit: 3,
  windowMs: 60 * 60 * 1000,
  message: "Terlalu banyak permintaan kirim ulang. Coba lagi nanti.",
});

// ── Helper ─────────────────────────────────────────────────────────────────

async function createAndSendVerification(userId: string, email: string, name: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

  // Hapus token lama yang belum terpakai untuk akun ini
  await prisma.emailVerification.deleteMany({ where: { userId, usedAt: null } });

  await prisma.emailVerification.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });

  // Kirim email di latar belakang — jangan blokir respons register
  void sendVerificationEmail(email, name, token).catch((err: unknown) =>
    console.error("[mailer] Gagal kirim verifikasi:", err),
  );
}

// ── Register ───────────────────────────────────────────────────────────────

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
        select: { id: true, name: true, email: true },
      });

      await recordAudit({
        actorId: user.id,
        action: "auth.register",
        entityType: "user",
        entityId: user.id,
        metadata: { ip: getClientIp(req), userAgent: getClientUserAgent(req) },
      });

      // Kirim email verifikasi (async, tidak blokir response)
      await createAndSendVerification(user.id, user.email, user.name);

      res.status(201).json({
        message: "Pendaftaran berhasil. Cek emailmu untuk verifikasi akun.",
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new AppError(409, "EMAIL_TAKEN", "Email sudah terdaftar.");
      }
      throw err;
    }
  }),
);

// ── Verifikasi Email ───────────────────────────────────────────────────────

router.post(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const { token } = verifyEmailSchema.parse(req.body);
    const tokenHash = hashToken(token);

    const record = await prisma.emailVerification.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, emailVerified: true } } },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new AppError(400, "INVALID_TOKEN", "Token verifikasi tidak valid atau sudah kedaluwarsa.");
    }

    if (record.user.emailVerified) {
      // Sudah terverifikasi sebelumnya — tandai token sebagai terpakai dan
      // kembalikan sukses supaya flow redirect di frontend tidak error.
      await prisma.emailVerification.update({
        where: { tokenHash },
        data: { usedAt: new Date() },
      });
      return res.json({ message: "Email sudah terverifikasi." });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerification.update({
        where: { tokenHash },
        data: { usedAt: new Date() },
      }),
    ]);

    await recordAudit({
      actorId: record.userId,
      action: "auth.email-verified",
      entityType: "user",
      entityId: record.userId,
    });

    res.json({ message: "Email berhasil diverifikasi. Kamu sekarang bisa masuk." });
  }),
);

// ── Kirim Ulang Verifikasi ─────────────────────────────────────────────────

router.post(
  "/resend-verification",
  resendVerificationLimit,
  asyncHandler(async (req, res) => {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, emailVerified: true },
    });

    // Selalu balas sukses untuk mencegah enumerasi email
    if (!user || user.emailVerified) {
      return res.json({ message: "Jika email terdaftar dan belum diverifikasi, email verifikasi sudah dikirim." });
    }

    await createAndSendVerification(user.id, user.email, user.name);
    res.json({ message: "Email verifikasi sudah dikirim ulang. Cek kotak masukmu." });
  }),
);

// ── Login ──────────────────────────────────────────────────────────────────

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

    // Blokir login jika email belum diverifikasi
    if (!user.emailVerified) {
      throw new AppError(
        403,
        "EMAIL_NOT_VERIFIED",
        "Email kamu belum diverifikasi. Cek kotak masukmu atau minta kirim ulang.",
      );
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
      metadata: { ip, userAgent, loginKe: updated.loginCount },
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
        emailVerified: user.emailVerified,
      },
    });
  }),
);

// ── Ganti Password (autentikasi aktif) ─────────────────────────────────────

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
      metadata: { ip: getClientIp(req), userAgent: getClientUserAgent(req) },
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        mustChangePassword: false,
        emailVerified: true,
      },
    });
  }),
);

// ── Lupa Password ──────────────────────────────────────────────────────────

router.post(
  "/forgot-password",
  forgotPasswordLimit,
  asyncHandler(async (req, res) => {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, emailVerified: true },
    });

    // Selalu balas sukses untuk mencegah enumerasi email
    if (!user || !user.emailVerified) {
      return res.json({
        message: "Jika email terdaftar, tautan reset kata sandi sudah dikirim.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    // Hapus token lama yang belum terpakai
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt },
    });

    void sendPasswordResetEmail(user.email, user.name, token).catch((err: unknown) =>
      console.error("[mailer] Gagal kirim reset sandi:", err),
    );

    await recordAudit({
      actorId: user.id,
      action: "auth.forgot-password",
      entityType: "user",
      entityId: user.id,
      metadata: { ip: getClientIp(req), userAgent: getClientUserAgent(req) },
    });

    res.json({ message: "Jika email terdaftar, tautan reset kata sandi sudah dikirim." });
  }),
);

// ── Reset Password via Token ───────────────────────────────────────────────

router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const tokenHash = hashToken(token);

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new AppError(400, "INVALID_TOKEN", "Token reset tidak valid atau sudah kedaluwarsa.");
    }

    const problem = passwordProblem(newPassword, {
      email: record.user.email,
      name: record.user.name,
    });
    if (problem) {
      throw new AppError(400, "WEAK_PASSWORD", problem);
    }

    const passwordHash = await argon2.hash(newPassword, { type: argon2.argon2id });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash, mustChangePassword: false },
      }),
      prisma.passwordResetToken.update({
        where: { tokenHash },
        data: { usedAt: new Date() },
      }),
      // Cabut semua sesi aktif untuk keamanan
      prisma.session.deleteMany({ where: { userId: record.userId } }),
    ]);

    await recordAudit({
      actorId: record.userId,
      action: "auth.password-reset",
      entityType: "user",
      entityId: record.userId,
      metadata: { ip: getClientIp(req), userAgent: getClientUserAgent(req) },
    });

    res.json({ message: "Kata sandi berhasil direset. Silakan masuk dengan kata sandi baru." });
  }),
);

// ── Logout ─────────────────────────────────────────────────────────────────

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

// ── Me ─────────────────────────────────────────────────────────────────────

router.get("/me", requireAuthRaw, (req, res) => {
  res.json({ user: req.user });
});

export default router;
