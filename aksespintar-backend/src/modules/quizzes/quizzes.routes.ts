import { Router } from "express";
import { z } from "zod";
import { AppError, asyncHandler } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middleware/auth";
import { rateLimit } from "../../lib/rate-limit";

const router = Router();

// Kuis hanya tersedia untuk pengguna yang sudah masuk.
router.use(requireAuth);

const slugParam = z.object({
  slug: z.string().trim().min(1).max(220),
});

const idParam = z.object({
  id: z.string().uuid("ID kuis tidak valid."),
});

const submitSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid("ID soal tidak valid."),
        optionId: z.string().uuid("ID jawaban tidak valid.").nullable(),
      }),
    )
    .min(1, "Jawab minimal satu soal.")
    .max(50),
});

type LeaderboardRow = {
  id: string;
  name: string;
  avatar: string | null;
  total_score: number;
  correct_answers: number;
  total_questions: number;
  quizzes_taken: number;
};

const roundScore = (value: number) => Math.round(value * 100) / 100;

// Membatasi percobaan agar kunci jawaban tidak bisa dipanen dengan mengirim
// jawaban acak berulang-ulang, sekaligus mencegah spam perhitungan skor.
const attemptLimit = rateLimit({
  scope: "quiz.attempt",
  limit: 8,
  windowMs: 60 * 60 * 1000,
  key: (req) => `${req.user?.id ?? "anonim"}:${req.params.id ?? "-"}`,
  message: "Terlalu banyak percobaan kuis. Coba lagi dalam satu jam.",
});

// Kuis yang menempel pada sebuah materi (tampil di bawah isi materi).
router.get(
  "/material/:slug",
  asyncHandler(async (req, res) => {
    const { slug } = slugParam.parse(req.params);

    const material = await prisma.learningMaterial.findFirst({
      where: { slug, status: "published" },
      select: { id: true },
    });
    if (!material) {
      throw new AppError(404, "NOT_FOUND", "Materi tidak ditemukan.");
    }

    const quiz = await prisma.quiz.findFirst({
      where: { materialId: material.id, status: "published" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        passingScore: true,
        questions: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            questionText: true,
            orderIndex: true,
            options: {
              orderBy: [{ orderIndex: "asc" }, { id: "asc" }],
              select: { id: true, optionText: true },
            },
          },
        },
      },
    });

    if (!quiz) {
      return res.json({ quiz: null });
    }

    const best = await prisma.quizAttempt.findFirst({
      where: { userId: req.user!.id, quizId: quiz.id, completedAt: { not: null } },
      orderBy: [{ score: "desc" }, { completedAt: "asc" }],
      select: {
        id: true,
        score: true,
        correctAnswers: true,
        totalQuestions: true,
        completedAt: true,
      },
    });

    res.json({
      quiz: {
        ...quiz,
        bestAttempt: best
          ? {
              id: best.id,
              score: Number(best.score ?? 0),
              correctAnswers: best.correctAnswers ?? 0,
              totalQuestions: best.totalQuestions,
              completedAt: best.completedAt,
            }
          : null,
      },
    });
  }),
);

// Kirim jawaban kuis. Skor dihitung di server agar tidak bisa dimanipulasi.
router.post(
  "/:id/attempts",
  attemptLimit,
  asyncHandler(async (req, res) => {
    const { id } = idParam.parse(req.params);
    const { answers } = submitSchema.parse(req.body);

    const quiz = await prisma.quiz.findFirst({
      where: { id, status: "published" },
      select: {
        id: true,
        questions: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            explanation: true,
            options: { select: { id: true, optionText: true, isCorrect: true } },
          },
        },
      },
    });

    if (!quiz) {
      throw new AppError(404, "NOT_FOUND", "Kuis tidak ditemukan.");
    }

    const answersByQuestion = new Map<string, string | null>();
    for (const answer of answers) {
      if (answersByQuestion.has(answer.questionId)) {
        throw new AppError(400, "DUPLICATE_ANSWER", "Ada soal yang dijawab lebih dari sekali.");
      }
      answersByQuestion.set(answer.questionId, answer.optionId);
    }

    const review = quiz.questions.map((question) => {
      const selectedOptionId = answersByQuestion.get(question.id) ?? null;
      const selected = question.options.find((option) => option.id === selectedOptionId);
      if (selectedOptionId && !selected) {
        throw new AppError(400, "INVALID_ANSWER", "Jawaban tidak sesuai dengan soal.");
      }

      const correctOption = question.options.find((option) => option.isCorrect);
      return {
        questionId: question.id,
        selectedOptionId,
        // Teks jawaban benar dikirim untuk review, tetapi ID internal opsi
        // tidak diekspos agar tidak bisa dipakai menyusun kunci jawaban.
        correctOptionText: correctOption?.optionText ?? null,
        isCorrect: selected?.isCorrect ?? false,
        explanation: question.explanation,
      };
    });

    const totalQuestions = quiz.questions.length;
    const correctAnswers = review.filter((item) => item.isCorrect).length;
    const score = totalQuestions > 0 ? roundScore((correctAnswers / totalQuestions) * 100) : 0;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: req.user!.id,
        quizId: quiz.id,
        score,
        totalQuestions,
        correctAnswers,
        completedAt: new Date(),
        answers: {
          create: review.map((item) => ({
            questionId: item.questionId,
            selectedOptionId: item.selectedOptionId,
            isCorrect: item.isCorrect,
          })),
        },
      },
      select: { id: true, completedAt: true },
    });

    res.status(201).json({
      attempt: {
        id: attempt.id,
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers: totalQuestions - correctAnswers,
        completedAt: attempt.completedAt,
      },
      review,
    });
  }),
);

// Peringkat: total skor terbaik dari setiap kuis yang pernah dikerjakan.
router.get(
  "/leaderboard",
  asyncHandler(async (req, res) => {
    const rows = await prisma.$queryRaw<LeaderboardRow[]>`
      WITH best AS (
        SELECT DISTINCT ON (user_id, quiz_id)
          user_id, quiz_id, score, correct_answers, total_questions
        FROM quiz_attempts
        WHERE completed_at IS NOT NULL AND score IS NOT NULL
        ORDER BY user_id, quiz_id, score DESC, completed_at ASC
      )
      SELECT
        u.id,
        u.name,
        u.avatar,
        COALESCE(SUM(best.score), 0)::float8 AS total_score,
        COALESCE(SUM(best.correct_answers), 0)::int AS correct_answers,
        COALESCE(SUM(best.total_questions), 0)::int AS total_questions,
        COUNT(best.quiz_id)::int AS quizzes_taken
      FROM best
      JOIN users u ON u.id = best.user_id
      GROUP BY u.id, u.name, u.avatar
      ORDER BY total_score DESC, correct_answers DESC, u.name ASC
    `;

    const ranked = rows.map((row, index) => ({
      rank: index + 1,
      id: row.id,
      name: row.name,
      avatar: row.avatar,
      totalScore: roundScore(Number(row.total_score)),
      correctAnswers: Number(row.correct_answers),
      wrongAnswers: Number(row.total_questions) - Number(row.correct_answers),
      quizzesTaken: Number(row.quizzes_taken),
    }));

    const me = ranked.find((item) => item.id === req.user!.id) ?? null;

    res.json({ items: ranked.slice(0, 50), me });
  }),
);

export default router;
