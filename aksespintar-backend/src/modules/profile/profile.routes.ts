import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { recordAudit } from "../../lib/audit";
import { getClientIp, getClientUserAgent } from "../../lib/request-meta";
import { requireAuth } from "../../middleware/auth";

const router = Router();

const MAX_AVATAR_LENGTH = 600_000; // cukup untuk foto yang sudah dikompres di browser

const profileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  createdAt: true,
} as const;

const updateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter.")
      .max(100, "Nama maksimal 100 karakter.")
      .optional(),
    avatar: z
      .string()
      .trim()
      .max(MAX_AVATAR_LENGTH, "Ukuran foto avatar terlalu besar.")
      .regex(
        /^(preset:[a-z0-9-]{1,40}|data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+)$/,
        "Format avatar tidak didukung.",
      )
      .nullable()
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.avatar !== undefined, {
    message: "Tidak ada perubahan yang dikirim.",
  });

// Profil hanya bisa dibuka dan diubah oleh pemilik akun yang sedang masuk.
router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { ...profileSelect, loginCount: true, lastLoginAt: true },
    });
    res.json({ user });
  }),
);

router.patch(
  "/",
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
      },
      select: { ...profileSelect, loginCount: true, lastLoginAt: true },
    });

    await recordAudit({
      actorId: user.id,
      action: "profile.update",
      entityType: "user",
      entityId: user.id,
      metadata: {
        ip: getClientIp(req),
        userAgent: getClientUserAgent(req),
        nameChanged: data.name !== undefined,
        avatarChanged: data.avatar !== undefined,
      },
    });

    res.json({ user });
  }),
);

export default router;
