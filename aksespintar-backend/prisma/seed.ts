import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";
import { categories, legacyCategorySlugs, materials } from "./data/materials";
import { quizzes } from "./data/quizzes";
import { adminPasswordProblem } from "../src/lib/password";

const prisma = new PrismaClient();

// Sandi bawaan yang sering dipakai. Bila hash admin cocok dengan salah satunya,
// akun ditandai wajib ganti sandi agar kredensial default tidak bisa dipakai
// terus-menerus.
const DEFAULT_PASSWORD_CANDIDATES = [
  "admin",
  "admin123",
  "admin1234",
  "admin12345",
  "administrator",
  "adminadmin",
  "password",
  "password123",
  "password1234",
  "passw0rd",
  "p@ssw0rd",
  "rahasia",
  "rahasia123",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty123",
  "aksespintar",
  "aksespintar123",
  "admin@123",
  "Admin@123",
  "Admin123!",
];

async function hasDefaultPassword(passwordHash: string): Promise<boolean> {
  for (const candidate of DEFAULT_PASSWORD_CANDIDATES) {
    if (await argon2.verify(passwordHash, candidate)) return true;
  }
  return false;
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("Isi SEED_ADMIN_EMAIL dan SEED_ADMIN_PASSWORD di file .env dulu.");
  }

  // 1. Akun admin (password di-hash dengan Argon2id)
  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  let admin;

  if (existingAdmin) {
    const weak = await hasDefaultPassword(existingAdmin.passwordHash);
    admin = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: weak ? { mustChangePassword: true } : {},
    });
    if (weak) {
      console.warn(
        `PERINGATAN: kata sandi admin "${email}" masih kata sandi bawaan. ` +
          "Akun ditandai wajib ganti sandi saat login berikutnya.",
      );
    }
  } else {
    const problem = adminPasswordProblem(password, { email });
    if (problem) {
      throw new Error(`SEED_ADMIN_PASSWORD tidak memenuhi kebijakan: ${problem}`);
    }
    admin = await prisma.user.create({
      data: {
        name: "Admin AksesPintar",
        email,
        passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
        role: "admin",
        mustChangePassword: false,
      },
    });
  }

  // 2. Kategori
  for (const k of categories) {
    await prisma.category.upsert({ where: { slug: k.slug }, update: {}, create: k });
  }

  // Kategori lama yang sudah tidak dipakai dihapus, tetapi hanya jika benar-benar kosong.
  await prisma.category.deleteMany({
    where: {
      slug: { in: legacyCategorySlugs },
      materials: { none: {} },
      quizzes: { none: {} },
    },
  });

  const categoryRows = await prisma.category.findMany({ select: { id: true, slug: true } });
  const categoryIdBySlug = new Map(categoryRows.map((row) => [row.slug, row.id]));

  // 3. Satu materi contoh (status terbit)
  const htmlCssId = categoryIdBySlug.get("html-css");
  if (!htmlCssId) {
    throw new Error("Kategori html-css tidak ditemukan.");
  }

  await prisma.learningMaterial.upsert({
    where: { slug: "pengenalan-html" },
    update: {},
    create: {
      categoryId: htmlCssId,
      authorId: admin.id,
      title: "Pengenalan HTML",
      slug: "pengenalan-html",
      summary: "Kenali HTML, bahasa dasar untuk membuat halaman website.",
      content:
        "HTML (HyperText Markup Language) adalah bahasa untuk menyusun struktur halaman web. " +
        "Setiap bagian halaman, seperti judul, paragraf, gambar, dan tautan, ditandai dengan tag. " +
        "Contoh: tag h1 untuk judul utama, tag p untuk paragraf, dan tag a untuk tautan.",
      difficulty: "beginner",
      estimatedMinutes: 10,
      status: "published",
      publishedAt: new Date(),
    },
  });

  // 4. Katalog materi (bahasa pemrograman, matematika, dan fisika)
  for (const item of materials) {
    const categoryId = categoryIdBySlug.get(item.categorySlug);
    if (!categoryId) {
      throw new Error(`Kategori "${item.categorySlug}" tidak ditemukan untuk materi "${item.slug}".`);
    }

    await prisma.learningMaterial.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        categoryId,
        authorId: admin.id,
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        content: item.content,
        difficulty: item.difficulty,
        estimatedMinutes: item.estimatedMinutes,
        status: "published",
        publishedAt: new Date(),
      },
    });
  }

  // 5. Satu latihan contoh (3 soal), ditempel ke materi pengenalan HTML
  const htmlMaterial = await prisma.learningMaterial.findUnique({
    where: { slug: "pengenalan-html" },
    select: { id: true },
  });
  const adaQuiz = await prisma.quiz.findFirst({ where: { title: "Latihan Dasar HTML" } });
  if (!adaQuiz) {
    await prisma.quiz.create({
      data: {
        categoryId: htmlCssId,
        materialId: htmlMaterial?.id ?? null,
        title: "Latihan Dasar HTML",
        description: "Tiga soal untuk menguji pemahaman dasar HTML.",
        passingScore: 70,
        status: "published",
        questions: {
          create: [
            {
              orderIndex: 1,
              questionText: "Apa kepanjangan dari HTML?",
              explanation: "HTML adalah singkatan dari HyperText Markup Language.",
              options: {
                create: [
                  { optionText: "HyperText Markup Language", isCorrect: true },
                  { optionText: "HighText Machine Language", isCorrect: false },
                  { optionText: "HyperTool Multi Language", isCorrect: false },
                  { optionText: "Home Text Markup Language", isCorrect: false },
                ],
              },
            },
            {
              orderIndex: 2,
              questionText: "Tag manakah yang dipakai untuk judul utama halaman?",
              explanation: "Tag h1 adalah judul tingkat pertama, yang paling penting di halaman.",
              options: {
                create: [
                  { optionText: "<h1>", isCorrect: true },
                  { optionText: "<h6>", isCorrect: false },
                  { optionText: "<p>", isCorrect: false },
                  { optionText: "<br>", isCorrect: false },
                ],
              },
            },
            {
              orderIndex: 3,
              questionText: "Tag manakah yang dipakai untuk membuat tautan (link)?",
              explanation: "Tag a (anchor) dipakai bersama atribut href yang berisi alamat tujuan.",
              options: {
                create: [
                  { optionText: "<a>", isCorrect: true },
                  { optionText: "<img>", isCorrect: false },
                  { optionText: "<p>", isCorrect: false },
                  { optionText: "<ul>", isCorrect: false },
                ],
              },
            },
          ],
        },
      },
    });
  } else if (adaQuiz.materialId !== htmlMaterial?.id && htmlMaterial) {
    // Kuis lama yang belum punya materi dihubungkan ke materi pengenalan HTML.
    await prisma.quiz.update({ where: { id: adaQuiz.id }, data: { materialId: htmlMaterial.id } });
  }

  // 6. Kuis pendek untuk setiap materi
  for (const quizSeed of quizzes) {
    const material = await prisma.learningMaterial.findUnique({
      where: { slug: quizSeed.materialSlug },
      select: { id: true, categoryId: true },
    });
    if (!material) {
      console.warn(`Materi "${quizSeed.materialSlug}" tidak ditemukan, kuis dilewati.`);
      continue;
    }

    const existing = await prisma.quiz.findFirst({
      where: { materialId: material.id },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.quiz.create({
      data: {
        categoryId: material.categoryId,
        materialId: material.id,
        title: quizSeed.title,
        description: quizSeed.description,
        passingScore: quizSeed.passingScore,
        status: "published",
        questions: {
          create: quizSeed.questions.map((question, questionIndex) => ({
            orderIndex: questionIndex + 1,
            questionText: question.questionText,
            explanation: question.explanation,
            options: {
              create: question.options.map((optionText, optionIndex) => ({
                optionText,
                orderIndex: optionIndex,
                isCorrect: optionIndex === question.correctIndex,
              })),
            },
          })),
        },
      },
    });
  }

  // 7. Satu info beasiswa contoh (data uji, bukan beasiswa sungguhan)
  const adaBeasiswa = await prisma.educationOpportunity.findFirst({
    where: { title: "Contoh Beasiswa (data uji)" },
  });
  if (!adaBeasiswa) {
    await prisma.educationOpportunity.create({
      data: {
        title: "Contoh Beasiswa (data uji)",
        provider: "Penyelenggara Contoh",
        description: "Data uji coba untuk pengembangan. Bukan beasiswa sungguhan.",
        eligibility: "Contoh: siswa kelas 12 atau mahasiswa aktif.",
        deadline: new Date("2027-01-31"),
        officialUrl: "https://example.com",
        verifiedAt: new Date(),
        status: "active",
      },
    });
  }

  console.log("Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());