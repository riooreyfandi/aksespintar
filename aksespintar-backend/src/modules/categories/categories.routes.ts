import { Router } from "express";
import { asyncHandler } from "../../lib/errors";
import { prisma } from "../../lib/prisma";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, description: true },
    });
    res.json({ items });
  }),
);

export default router;