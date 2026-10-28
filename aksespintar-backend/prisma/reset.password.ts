import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [email, newPassword] = process.argv.slice(2);

  if (!email || !newPassword) {
    throw new Error('Cara pakai: npx tsx prisma/reset-password.ts "email" "passwordBaru"');
  }
  if (newPassword.length < 8) {
    throw new Error("Password minimal 8 karakter.");
  }

  const result = await prisma.user.updateMany({
    where: { email: email.trim().toLowerCase() },
    data: { passwordHash: await argon2.hash(newPassword, { type: argon2.argon2id }) },
  });

  console.log(result.count ? "Password berhasil diperbarui." : "Email tidak ditemukan di database.");
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());