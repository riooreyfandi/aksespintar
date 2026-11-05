import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { env } from "../config/env";
import { AppError } from "./errors";

// Direktori penyimpanan avatar, dibuat otomatis bila belum ada.
export function getAvatarDir(): string {
  const dir = path.isAbsolute(env.AVATAR_DIR)
    ? env.AVATAR_DIR
    : path.resolve(process.cwd(), env.AVATAR_DIR);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// URL publik untuk mengakses avatar via endpoint /api/v1/avatars/:filename
export function avatarUrl(filename: string): string {
  return `/api/v1/avatars/${filename}`;
}

const ALLOWED_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Ukuran maksimum avatar setelah decode: 800 KB
const MAX_BYTES = 800_000;

/**
 * Simpan avatar dari string base64 data-URL ke file di disk.
 * Kembalikan nama file yang tersimpan (dipakai sebagai nilai kolom `avatar`).
 *
 * Bila `existingAvatar` adalah path file lama (bukan preset), file lama
 * dihapus setelah file baru berhasil disimpan.
 */
export function saveAvatarFromBase64(base64DataUrl: string, existingAvatar?: string | null): string {
  const match = base64DataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
  if (!match) {
    throw new AppError(400, "INVALID_AVATAR", "Format avatar tidak didukung.");
  }

  const [, mime, data] = match;
  const ext = ALLOWED_MIME[mime];
  if (!ext) {
    throw new AppError(400, "INVALID_AVATAR", "Tipe gambar tidak didukung. Gunakan PNG, JPEG, WebP, atau GIF.");
  }

  const buffer = Buffer.from(data, "base64");
  if (buffer.length > MAX_BYTES) {
    throw new AppError(400, "AVATAR_TOO_LARGE", "Ukuran avatar maksimal 800 KB.");
  }

  const filename = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
  const filepath = path.join(getAvatarDir(), filename);
  fs.writeFileSync(filepath, buffer);

  // Hapus avatar lama setelah file baru berhasil ditulis
  deleteAvatarFile(existingAvatar);

  return filename;
}

/**
 * Hapus file avatar lama dari disk. Gagal diam-diam (file mungkin sudah
 * tidak ada atau pakai preset).
 */
export function deleteAvatarFile(avatar?: string | null): void {
  if (!avatar || avatar.startsWith("preset:")) return;
  // avatar sudah berupa filename (bukan path lengkap)
  const filepath = path.join(getAvatarDir(), avatar);
  try {
    fs.unlinkSync(filepath);
  } catch {
    // abaikan — file mungkin sudah dihapus atau tidak ada
  }
}
