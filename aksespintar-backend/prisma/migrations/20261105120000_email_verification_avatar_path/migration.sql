-- AlterTable: tambah kolom email_verified ke users
-- Default false untuk user baru. Akun yang sudah ada sebelum migrasi ini
-- dianggap emailnya valid (dibuat sebelum fitur verifikasi ada).
ALTER TABLE "users" ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false;

-- Set semua akun yang sudah ada menjadi verified agar tidak terkunci
UPDATE "users" SET "email_verified" = true WHERE "email_verified" = false;

-- AlterTable: ubah tipe avatar dari Text ke VarChar(300)
-- Avatar lama yang base64 (panjang > 300) dipotong menjadi null dulu,
-- kemudian user diminta upload ulang. Preset string (< 50 char) aman.
ALTER TABLE "users"
  ALTER COLUMN "avatar" TYPE VARCHAR(300)
  USING CASE WHEN length("avatar") <= 300 THEN "avatar" ELSE NULL END;

-- CreateTable: tabel token verifikasi email
CREATE TABLE "email_verifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_verifications_token_hash_key" ON "email_verifications"("token_hash");
CREATE INDEX "email_verifications_user_id_idx" ON "email_verifications"("user_id");

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
