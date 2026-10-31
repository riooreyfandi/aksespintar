import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 10;
export const MIN_ADMIN_PASSWORD_LENGTH = 12;

// Daftar sandi yang paling sering dipakai pada serangan credential stuffing.
// Semua dibandingkan dalam bentuk huruf kecil tanpa karakter non-alfanumerik,
// sehingga "Pass-word!", "PASSWORD", dan "password" sama-sama tertolak.
const COMMON_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "passw0rd",
  "p@ssw0rd",
  "passwd",
  "rahasia",
  "rahasia123",
  "sandi123",
  "kataSandi123",
  "admin",
  "admin123",
  "admin1234",
  "administrator",
  "adminadmin",
  "root",
  "toor",
  "guest",
  "user",
  "user123",
  "test1234",
  "testing123",
  "qwerty",
  "qwerty123",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
  "iloveyou",
  "letmein",
  "welcome",
  "welcome123",
  "monkey",
  "dragon",
  "football",
  "baseball",
  "superman",
  "batman",
  "sunshine",
  "princess",
  "abc12345",
  "abcd1234",
  "123456789",
  "1234567890",
  "12345678",
  "12345678910",
  "87654321",
  "11111111",
  "00000000",
  "12341234",
  "qwe12345",
  "q1w2e3r4",
  "1q2w3e4r",
  "password1234",
  "bismillah",
  "bismillah123",
  "indonesia",
  "indonesia123",
  "jakarta123",
  "bandung123",
  "sekolah123",
  "siswa123",
  "guru123",
  "belajar123",
  "aksespintar",
  "aksespintar123",
]);

// Domain email sekali pakai yang umum dipakai untuk membuat akun massal.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "sharklasers.com",
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "temp-mail.org",
  "throwawaymail.com",
  "yopmail.com",
  "yopmail.net",
  "trashmail.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "fakeinbox.com",
  "mailnesia.com",
  "spamgourmet.com",
  "mohmal.com",
  "emailondeck.com",
]);

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase()) || COMMON_PASSWORDS.has(normalize(password));
}

type PasswordContext = {
  email?: string;
  name?: string;
};

function identityParts(context: PasswordContext): string[] {
  const parts: string[] = [];
  if (context.email) {
    const local = context.email.split("@")[0]?.toLowerCase() ?? "";
    if (local.length >= 4) parts.push(local);
  }
  if (context.name) {
    for (const token of context.name.toLowerCase().split(/\s+/)) {
      if (token.length >= 4) parts.push(token);
    }
  }
  return parts;
}

// Mengembalikan pesan kesalahan bila sandi tidak memenuhi kebijakan, atau null
// bila sandi sudah kuat. Dipakai bersama oleh registrasi, ubah sandi, dan seed.
export function passwordProblem(password: string, context: PasswordContext = {}): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`;
  }
  if (password.length > 128) {
    return "Kata sandi maksimal 128 karakter.";
  }
  if (!/[A-Za-z]/.test(password)) {
    return "Kata sandi harus mengandung huruf.";
  }
  if (!/[0-9]/.test(password)) {
    return "Kata sandi harus mengandung angka.";
  }
  if (isCommonPassword(password)) {
    return "Kata sandi terlalu umum. Gunakan kombinasi yang lebih unik.";
  }

  const normalized = normalize(password);
  for (const part of identityParts(context)) {
    if (normalized.includes(normalize(part))) {
      return "Kata sandi tidak boleh mengandung nama atau bagian emailmu.";
    }
  }

  if (/^(.)\1+$/.test(password)) {
    return "Kata sandi tidak boleh berisi satu karakter berulang.";
  }
  if (/^(0123456789|1234567890|abcdefghij|qwertyuiop|asdfghjkl)/i.test(normalized)) {
    return "Kata sandi tidak boleh berupa urutan karakter yang mudah ditebak.";
  }

  return null;
}

export function passwordSchema(context: PasswordContext = {}) {
  return z
    .string()
    .min(1, "Kata sandi wajib diisi.")
    .max(128, "Kata sandi maksimal 128 karakter.")
    .superRefine((value, ctx) => {
      const problem = passwordProblem(value, context);
      if (problem) {
        ctx.addIssue({ code: "custom", message: problem });
      }
    });
}

// Kebijakan lebih ketat untuk akun admin: wajib campuran huruf besar-kecil,
// angka, dan simbol, serta tidak boleh memuat kata "admin".
export function adminPasswordProblem(password: string, context: PasswordContext = {}): string | null {
  const base = passwordProblem(password, { ...context, name: undefined });
  if (base) return base;

  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return `Kata sandi admin minimal ${MIN_ADMIN_PASSWORD_LENGTH} karakter.`;
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
    return "Kata sandi admin harus mengandung huruf besar dan huruf kecil.";
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Kata sandi admin harus mengandung simbol (contoh: !@#$%).";
  }
  if (/admin/i.test(normalize(password))) {
    return 'Kata sandi admin tidak boleh mengandung kata "admin".';
  }
  return null;
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  return domain ? DISPOSABLE_EMAIL_DOMAINS.has(domain) : false;
}
