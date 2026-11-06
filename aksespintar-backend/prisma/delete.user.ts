import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [email] = process.argv.slice(2);

  if (!email) {
    console.error('Cara pakai: npm run delete-user -- "email@contoh.com"');
    process.exit(1);
  }

  const normalized = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    console.log(`Pengguna dengan email "${normalized}" tidak ditemukan di database.`);
    return;
  }

  // Hapus data terkait sebelum menghapus user jika ada relasi yang tidak cascade
  await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
  await prisma.quizAttemptAnswer.deleteMany({ where: { attempt: { userId: user.id } } });
  await prisma.quizAttempt.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });

  console.log(`✓ Pengguna "${user.name}" (${user.email}) berhasil dihapus dari database.`);
  console.log("Sekarang email tersebut bisa didaftarkan ulang dari awal!");
}

main()
  .catch((err) => {
    console.error("Gagal menghapus pengguna:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
