import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { AppError, asyncHandler } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middleware/auth";

const router = Router();

// Materi hanya untuk pengguna yang sudah masuk (PRD: konten di balik login).
router.use(requireAuth);

const listQuery = z.object({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().max(120).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

const slugParam = z.object({
  slug: z.string().trim().min(1).max(220),
});

// Daftar + pencarian + filter + pagination (FR-008, 009, 010, 012)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { q, category, difficulty, page, limit } = listQuery.parse(req.query);

    const where: Prisma.LearningMaterialWhereInput = {
      status: "published", // draft/arsip tidak pernah tampil di publik
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { summary: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(difficulty ? { difficulty } : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.learningMaterial.count({ where }),
      prisma.learningMaterial.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          difficulty: true,
          estimatedMinutes: true,
          publishedAt: true,
          category: { select: { name: true, slug: true } },
        },
      }),
    ]);

    res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
  }),
);

// Detail materi (FR-011)
router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const { slug } = slugParam.parse(req.params);

    const material = await prisma.learningMaterial.findFirst({
      where: { slug, status: "published" },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        content: true,
        difficulty: true,
        estimatedMinutes: true,
        publishedAt: true,
        updatedAt: true,
        category: { select: { name: true, slug: true } },
        author: { select: { name: true } },
      },
    });

    if (!material) {
      throw new AppError(404, "NOT_FOUND", "Materi tidak ditemukan.");
    }
    res.json({ material });
  }),
);

export default router;