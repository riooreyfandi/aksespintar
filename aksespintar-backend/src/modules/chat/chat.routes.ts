import { Router } from "express";
import { z } from "zod";
import { AppError, asyncHandler } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middleware/auth";

const router = Router();

// Papan chat hanya untuk anggota yang sudah daftar dan masuk.
router.use(requireAuth);

const listQuery = z.object({
  after: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const messageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Pesan tidak boleh kosong.")
    .max(1000, "Pesan maksimal 1000 karakter."),
});

const messageSelect = {
  id: true,
  body: true,
  createdAt: true,
  user: { select: { id: true, name: true, role: true } },
} as const;

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { after, limit } = listQuery.parse(req.query);

    const items = await prisma.chatMessage.findMany({
      where: after ? { createdAt: { gt: new Date(after) } } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: messageSelect,
    });

    // Ambil pesan terbaru, tetapi tampilkan dari yang paling lama.
    res.json({ items: after ? items : items.reverse() });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { body } = messageSchema.parse(req.body);

    const message = await prisma.chatMessage.create({
      data: { userId: req.user!.id, body },
      select: messageSelect,
    });

    res.status(201).json({ message });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(req.params);

    const message = await prisma.chatMessage.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!message) {
      throw new AppError(404, "NOT_FOUND", "Pesan tidak ditemukan.");
    }
    if (message.userId !== req.user!.id && req.user!.role !== "admin") {
      throw new AppError(403, "FORBIDDEN", "Kamu tidak boleh menghapus pesan ini.");
    }

    await prisma.chatMessage.delete({ where: { id } });
    res.status(204).end();
  }),
);

export default router;
