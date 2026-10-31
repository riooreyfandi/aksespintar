import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";
import { adminPasswordProblem, passwordProblem } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const [email, newPassword] = process.argv.slice(2);

  if (!email || !newPassword) {
    throw new Error('Cara pakai: npx tsx prisma/reset.password.ts "email" "passwordBaru"');
  }
  if (newPassword.length < 10) {
    throw new Error("Password minimal 10 karakter.");
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    console.log("Email tidak ditemukan di database.");
    return;
  }

  const problem =
    user.role === "admin"
      ? adminPasswordProblem(newPassword, { email: user.email })
      : passwordProblem(newPassword, { email: user.email });
  if (problem) {
    throw new Error(`Kata sandi baru ditolak: ${problem}`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await argon2.hash(newPassword, { type: argon2.argon2id }),
      mustChangePassword: false,
    },
  });

  // Sesi lama dicabut agar perangkat yang mungkin dikuasai orang lain keluar.
  await prisma.session.deleteMany({ where: { userId: user.id } });

  console.log("Password berhasil diperbarui dan semua sesi lama telah dikeluarkan.");
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
