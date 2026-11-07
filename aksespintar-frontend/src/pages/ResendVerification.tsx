import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export function ResendVerification() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api("/auth/resend-verification", {
        method: "POST",
        body: { email },
      });
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
          Buka kotak masuk emailmu (cek juga folder spam) dan klik tautan untuk mengaktifkan akun.
        </p>

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
