import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { recordAudit } from "../../lib/audit";
import { getClientIp, getClientUserAgent } from "../../lib/request-meta";
import { requireAuth } from "../../middleware/auth";
import { rateLimit } from "../../lib/rate-limit";
import { saveAvatarFromBase64, deleteAvatarFile } from "../../lib/avatar";

const router = Router();

// Hanya data yang benar-benar dipakai halaman profil.
const profileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  createdAt: true,
} as const;

// Avatar dikirim dari client sebagai data-URL base64 atau string preset.
// Ukuran maksimum setelah decode ~800 KB (encode base64 menambah ~33%).
const MAX_BASE64_LENGTH = 1_100_000; // ~800 KB decoded

const updateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter.")
      .max(100, "Nama maksimal 100 karakter.")
      .optional(),
    // Terima base64 data-URL atau string preset; validasi lanjutan di handler
    avatar: z
      .string()
      .trim()
      .max(MAX_BASE64_LENGTH, "Ukuran foto avatar terlalu besar.")
      .nullable()
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.avatar !== undefined, {
    message: "Tidak ada perubahan yang dikirim.",
  });

// Profil hanya bisa dibuka dan diubah oleh pemilik akun yang sedang masuk.
router.use(requireAuth);

const updateLimit = rateLimit({
  scope: "profile.update",
  limit: 40,
  windowMs: 60 * 60 * 1000,
  key: (req) => req.user?.id ?? "anonim",
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: profileSelect,
    });
    res.json({ user });
  }),
);

router.patch(
  "/",
  updateLimit,
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);

    let avatarValue: string | null | undefined = undefined;

    if (data.avatar !== undefined) {
      if (data.avatar === null) {
        // Hapus avatar — ambil nilai lama dulu baru hapus file
        const current = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { avatar: true },
        });
        deleteAvatarFile(current?.avatar);
        avatarValue = null;
      } else if (data.avatar.startsWith("preset:")) {
        // Validasi nama preset
        if (!/^preset:[a-z0-9-]{1,40}$/.test(data.avatar)) {
          return res.status(400).json({
            error: { code: "INVALID_AVATAR", message: "Nama preset avatar tidak valid." },
          });
        }
        // Hapus file lama kalau ada
        const current = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { avatar: true },
        });
        deleteAvatarFile(current?.avatar);
        avatarValue = data.avatar;
      } else if (data.avatar.startsWith("data:image/")) {
        // Simpan file baru, hapus file lama
        const current = await prisma.user.findUnique({
          where: { id: req.user!.id },
          select: { avatar: true },
        });
        // saveAvatarFromBase64 melempar AppError jika validasi gagal
        const filename = saveAvatarFromBase64(data.avatar, current?.avatar);
        avatarValue = filename;
      } else {
        return res.status(400).json({
          error: { code: "INVALID_AVATAR", message: "Format avatar tidak didukung." },
        });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(avatarValue !== undefined ? { avatar: avatarValue } : {}),
      },
      select: profileSelect,
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
