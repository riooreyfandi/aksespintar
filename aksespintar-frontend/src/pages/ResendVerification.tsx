import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export function ResendVerification() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api<{ message: string; devVerificationUrl?: string }>("/auth/resend-verification", {
        method: "POST",
        body: { email },
      });
      if (res?.devVerificationUrl) {
        setDevVerificationUrl(res.devVerificationUrl);
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="auth-card">
        <h1>Email Terkirim</h1>
        <p className="auth-subtitle">
          Jika email tersebut terdaftar dan belum diverifikasi, tautan verifikasi baru sudah dikirim.
          Cek kotak masukmu (dan folder spam).
        </p>

        {devVerificationUrl ? (
          <div
            style={{
              marginTop: "1.25rem",
              marginBottom: "1.25rem",
              padding: "1rem",
              borderRadius: "8px",
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              border: "1px solid rgba(37, 99, 235, 0.3)",
              textAlign: "center",
            }}
          >
            <p style={{ fontWeight: 600, color: "var(--color-primary, #2563eb)", marginBottom: "0.5rem" }}>
              🛠️ Mode Pengujian (Testing Lokal)
            </p>
            <p style={{ fontSize: "0.85rem", marginBottom: "0.75rem", color: "var(--color-text, inherit)" }}>
              Karena SMTP email asli belum disetup, kamu bisa langsung verifikasi akun dengan klik tombol di bawah:
            </p>
            <a
              href={devVerificationUrl}
              className="btn btn-primary btn-block"
              style={{ display: "inline-block", textDecoration: "none" }}
            >
              ✓ Verifikasi Akun Sekarang
            </a>
          </div>
        ) : null}

        <Link to="/masuk" className="btn btn-ghost btn-block" style={{ marginTop: "1rem" }}>
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1>Kirim Ulang Verifikasi</h1>
      <p className="auth-subtitle">
        Masukkan email yang kamu daftarkan. Kami akan kirim ulang tautan verifikasi.
      </p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Mengirim..." : "Kirim ulang"}
        </button>
      </form>

      <p className="auth-switch">
        <Link to="/masuk">Kembali ke halaman masuk</Link>
      </p>
    </div>
  );
}
