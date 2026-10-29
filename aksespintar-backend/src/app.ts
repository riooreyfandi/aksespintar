import fs from "node:fs";
import path from "node:path";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ZodError } from "zod";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { AppError } from "./lib/errors";
import authRoutes from "./modules/auth/auth.routes";
import categoryRoutes from "./modules/categories/categories.routes";
import materialsRoutes from "./modules/materials/materials.routes";
import quizzesRoutes from "./modules/quizzes/quizzes.routes";
import chatRoutes from "./modules/chat/chat.routes";
import adminRoutes from "./modules/admin/admin.routes";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Netlify Functions (serverless-http) sudah mengisi req.body dengan Buffer mentah.
// Normalisasi di sini agar perilakunya sama dengan server Node biasa, dan body
// yang rusak tetap menghasilkan INVALID_JSON.
app.use((req, _res, next) => {
  if (!Buffer.isBuffer(req.body)) {
    return next();
  }
  const raw = req.body.toString("utf8");
  const target = req as Request & { _body?: boolean };
  if (raw.trim() === "") {
    target.body = {};
    target._body = true;
    return next();
  }
  try {
    target.body = JSON.parse(raw);
    target._body = true;
    return next();
  } catch {
    const err = new SyntaxError("Format JSON tidak valid.") as SyntaxError & { status?: number };
    err.status = 400;
    return next(err);
  }
});

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/api/v1/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "error" });
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/materials", materialsRoutes);
app.use("/api/v1/quizzes", quizzesRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/admin", adminRoutes);

// Sajikan hasil build frontend bila tersedia, supaya website dan API satu alamat.
const frontendDist = [process.env.FRONTEND_DIST, path.resolve(__dirname, "../../aksespintar-frontend/dist")]
  .filter((dir): dir is string => Boolean(dir))
  .find((dir) => fs.existsSync(path.join(dir, "index.html")));

if (frontendDist) {
  app.use(express.static(frontendDist));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.use((_req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Endpoint tidak ditemukan." },
  });
});

app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  // Input tidak lolos validasi
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Data yang dikirim tidak valid.",
        details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      },
    });
  }

  // Error yang kita lempar sendiri
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message } });
  }

  // JSON rusak dari klien
  if (err instanceof SyntaxError && (err as { status?: number }).status === 400) {
    return res.status(400).json({
      error: { code: "INVALID_JSON", message: "Format JSON tidak valid." },
    });
  }

  // Error dari body-parser yang punya status 4xx sendiri
  const httpStatus = (err as { status?: unknown }).status;
  if (typeof httpStatus === "number" && httpStatus >= 400 && httpStatus < 500) {
    const clientErrors: Record<number, { code: string; message: string }> = {
      400: { code: "INVALID_REQUEST", message: "Permintaan tidak valid." },
      413: { code: "PAYLOAD_TOO_LARGE", message: "Ukuran data yang dikirim terlalu besar." },
      415: { code: "UNSUPPORTED_MEDIA_TYPE", message: "Tipe konten tidak didukung." },
    };
    const clientError = clientErrors[httpStatus];
    if (clientError) {
      return res.status(httpStatus).json({ error: clientError });
    }
  }

  // Error tak terduga: jangan bocorkan detail ke pengguna (PRD 10.2)
  console.error(err);
  res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan pada server." },
  });
});