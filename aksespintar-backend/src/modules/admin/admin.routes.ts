import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/roles";

const router = Router();

// Semua endpoint di bawah ini hanya untuk admin.
router.use(requireAuth, requireRole("admin"));

const limitQuery = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

const usersQuery = limitQuery.extend({
  q: z.string().trim().max(100).optional(),
});

const minutesSince = (date: Date, now: Date) => Math.max(0, Math.round((now.getTime() - date.getTime()) / 60_000));

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const now = new Date();
    const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalUsers, activeSessions, loginSum, login24h, register24h, totalAudit] = await Promise.all([
      prisma.user.count(),
      prisma.session.count({ where: { expiresAt: { gt: now } } }),
      prisma.user.aggregate({ _sum: { loginCount: true } }),
      prisma.auditLog.count({ where: { action: "auth.login", createdAt: { gte: since24h } } }),
      prisma.user.count({ where: { createdAt: { gte: since24h } } }),
      prisma.auditLog.count(),
    ]);

    res.json({
      totalUsers,
      activeSessions,
      totalLogins: loginSum._sum.loginCount ?? 0,
      login24h,
      register24h,
      totalAudit,
    });
  }),
);

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const { q, limit } = usersQuery.parse(req.query);
    const now = new Date();

    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        loginCount: true,
        lastLoginAt: true,
        createdAt: true,
        _count: { select: { sessions: { where: { expiresAt: { gt: now } } } } },
        sessions: {
          where: { expiresAt: { gt: now } },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true, lastSeenAt: true, ipAddress: true, userAgent: true },
        },
      },
    });

    res.json({
      items: users.map(({ _count, sessions, ...user }) => {
        const session = sessions[0] ?? null;
        return {
          ...user,
          activeSessions: _count.sessions,
          currentSession: session
            ? {
                loginAt: session.createdAt,
                lastSeenAt: session.lastSeenAt,
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
                minutesLoggedIn: minutesSince(session.createdAt, now),
                minutesIdle: minutesSince(session.lastSeenAt, now),
              }
            : null,
        };
      }),
    });
  }),
);

router.get(
  "/sessions",
  asyncHandler(async (req, res) => {
    const { limit } = limitQuery.parse(req.query);
    const now = new Date();

    const sessions = await prisma.session.findMany({
      where: { expiresAt: { gt: now } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        lastSeenAt: true,
        expiresAt: true,
        ipAddress: true,
        userAgent: true,
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    res.json({
      items: sessions.map((session) => ({
        id: session.id,
        user: session.user,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        loginAt: session.createdAt,
        lastSeenAt: session.lastSeenAt,
        expiresAt: session.expiresAt,
        minutesLoggedIn: minutesSince(session.createdAt, now),
        minutesIdle: minutesSince(session.lastSeenAt, now),
      })),
    });
  }),
);

router.get(
  "/activity",
  asyncHandler(async (req, res) => {
    const { limit } = limitQuery.parse(req.query);

    const items = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        metadata: true,
        createdAt: true,
        actor: { select: { name: true, email: true, role: true } },
      },
    });

    res.json({ items });
  }),
);

export default router;
