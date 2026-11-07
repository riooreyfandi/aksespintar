import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "../config/env";

const FROM_ADDRESS = `"AksesPintar" <${env.SMTP_FROM || "noreply@aksespintar.id"}>`;
const APP_URL =
  process.env.APP_URL ||
  (process.env.URL && !process.env.URL.includes("localhost") ? process.env.URL : null) ||
  env.APP_URL ||
  "http://localhost:5173";

// ── Lazy transporter ────────────────────────────────────────────────────────
// Transporter dibuat on-demand (bukan saat module load) agar bisa async:
// di development tanpa konfigurasi SMTP, kita buat akun Ethereal otomatis
// lewat nodemailer.createTestAccount() yang perlu await.

let _transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  if (_transporter) return _transporter;

  // Production: wajib pakai SMTP nyata dari env.
  if (env.NODE_ENV === "production") {
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
      throw new Error(
        "[mailer] SMTP belum dikonfigurasi. Tambahkan SMTP_HOST, SMTP_USER, dan SMTP_PASS ke environment.",
      );
    }
    _transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    return _transporter;
  }

  // Development: jika SMTP_HOST dan SMTP_USER dikonfigurasi, pakai itu.
  if (env.SMTP_HOST && env.SMTP_USER) {
    _transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    console.log(`[mailer] Dev: pakai SMTP ${env.SMTP_HOST}:${env.SMTP_PORT}`);
    return _transporter;
  }

  // Development fallback: buat akun Ethereal otomatis.
  // Email tidak benar-benar dikirim — preview tersedia di URL yang dicetak ke console.
  const testAccount = await nodemailer.createTestAccount();
  _transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log(`[mailer] Dev: Ethereal account siap → ${testAccount.user}`);
  return _transporter;
}

// ── Email Verifikasi ────────────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `${APP_URL}/verifikasi-email?token=${token}`;
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: FROM_ADDRESS,
    to,
    subject: "Verifikasi email kamu — AksesPintar",
    text: [
      `Halo ${name},`,
      "",
      "Terima kasih sudah mendaftar di AksesPintar!",
      "Klik tautan berikut untuk mengaktifkan akunmu (berlaku 24 jam):",
      "",
      url,
      "",
      "Jika kamu tidak mendaftar, abaikan email ini.",
    ].join("\n"),
    html: `
      <p>Halo <strong>${escapeHtml(name)}</strong>,</p>
      <p>Terima kasih sudah mendaftar di <strong>AksesPintar</strong>!</p>
      <p>Klik tombol di bawah untuk mengaktifkan akunmu (tautan berlaku <strong>24 jam</strong>):</p>
      <p style="margin:24px 0">
        <a href="${url}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
          Verifikasi Email
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px">
        Atau salin tautan ini ke browser: <br/>
        <a href="${url}">${url}</a>
      </p>
      <p style="color:#6b7280;font-size:13px">Jika kamu tidak mendaftar, abaikan email ini.</p>
    `,
  });

  // Di development, cetak URL preview Ethereal ke console server
  if (env.NODE_ENV !== "production") {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\n[mailer] ✉️  Preview verifikasi untuk ${to}:`);
      console.log(`[mailer] 🔗 ${previewUrl}\n`);
    }
  }
}

// ── Email Reset Password ────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const url = `${APP_URL}/reset-sandi?token=${token}`;
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: FROM_ADDRESS,
    to,
    subject: "Reset kata sandi — AksesPintar",
    text: [
      `Halo ${name},`,
      "",
      "Kami menerima permintaan reset kata sandi untuk akunmu.",
      "Klik tautan berikut untuk mengatur ulang kata sandimu (berlaku 1 jam):",
      "",
      url,
      "",
      "Jika kamu tidak meminta reset kata sandi, abaikan email ini.",
      "Kata sandimu tidak akan berubah.",
    ].join("\n"),
    html: `
      <p>Halo <strong>${escapeHtml(name)}</strong>,</p>
      <p>Kami menerima permintaan reset kata sandi untuk akunmu di <strong>AksesPintar</strong>.</p>
      <p>Klik tombol di bawah untuk mengatur ulang kata sandimu (tautan berlaku <strong>1 jam</strong>):</p>
      <p style="margin:24px 0">
        <a href="${url}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
          Reset Kata Sandi
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px">
        Atau salin tautan ini ke browser: <br/>
        <a href="${url}">${url}</a>
      </p>
      <p style="color:#6b7280;font-size:13px">
        Jika kamu tidak meminta reset kata sandi, abaikan email ini. Kata sandimu tidak akan berubah.
      </p>
    `,
  });

  if (env.NODE_ENV !== "production") {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\n[mailer] ✉️  Preview reset sandi untuk ${to}:`);
      console.log(`[mailer] 🔗 ${previewUrl}\n`);
    }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
