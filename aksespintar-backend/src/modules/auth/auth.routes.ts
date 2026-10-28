import { Router } from "express";
import argon2 from "argon2";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { AppError, asyncHandler } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middleware/auth";
import { clearSessionCookie, createSession, hashToken, SESSION_COOKIE } from "../../lib/session";

const router = Router();

const emailSchema = z.string().trim().toLowerCase().email("Format email tidak valid.").max(255);

const passwordSchema = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter.")
  .max(128, "Kata sandi maksimal 128 karakter.")
  .regex(/[A-Za-z]/, "Kata sandi harus mengandung huruf.")
  .regex(/[0-9]/, "Kata sandi harus mengandung angka.");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(100),
  email: emailSchema,
  password: passwordSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Kata sandi wajib diisi.").max(128),
});

// Hash palsu: dipakai agar waktu respons sama, baik email ada maupun tidak
let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= argon2.hash("kata-sandi-palsu", { type: argon2.argon2id }));

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const passwordHash = await argon2.hash(data.password, { type: argon2.argon2id });

    try {
      const user = await prisma.user.create({
        data: { name: data.name, email: data.email, passwordHash },
        select: { id: true, name: true, email: true, role: true },
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
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    const hash = user ? user.passwordHash : await getDummyHash();
    const valid = await argon2.verify(hash, data.password);

    // Pesan sengaja sama untuk "email tidak ada" dan "password salah"
    if (!user || !valid) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Email atau kata sandi salah.");
    }

    await createSession(user.id, res);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }),
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[SESSION_COOKIE];
    if (typeof token === "string" && token) {
      await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
    }
    clearSessionCookie(res);
    res.status(204).end();
  }),
);

// Tambahan di luar tabel PRD: dipakai frontend untuk tahu siapa yang sedang login
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;