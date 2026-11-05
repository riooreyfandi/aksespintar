import nodemailer from "nodemailer";
import { env } from "../config/env";

// Buat transporter sekali, reuse koneksi SMTP antar-request.
function createTransporter() {
  // Dev: gunakan Ethereal (email palsu, bisa dibuka di https://ethereal.email)
  // Production: gunakan SMTP_HOST/PORT/USER/PASS dari env
  if (env.NODE_ENV !== "production") {
    return nodemailer.createTransport({
      host: env.SMTP_HOST || "smtp.ethereal.email",
      port: env.SMTP_PORT || 587,
      auth: env.SMTP_USER
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
    });
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

const transporter = createTransporter();

const FROM_ADDRESS = `"AksesPintar" <${env.SMTP_FROM || "noreply@aksespintar.id"}>`;
const APP_URL = env.APP_URL || "http://localhost:5173";

// ── Email Verifikasi ────────────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `${APP_URL}/verifikasi-email?token=${token}`;

  const info = await transporter.sendMail({
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

  // Di development, cetak URL preview Ethereal
  if (env.NODE_ENV !== "production") {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`[mailer] Preview verifikasi: ${previewUrl}`);
  }
}

// ── Email Reset Password ────────────────────────────────────────────────────

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const url = `${APP_URL}/reset-sandi?token=${token}`;

  const info = await transporter.sendMail({
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
    if (previewUrl) console.log(`[mailer] Preview reset sandi: ${previewUrl}`);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
