import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await api("/auth/forgot-password", {
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
        <h1>Cek Email Kamu</h1>
        <p className="auth-subtitle">
          Jika email tersebut terdaftar, tautan reset kata sandi sudah dikirim.
          Tautan berlaku selama <strong>1 jam</strong>.
        </p>
        <p className="auth-subtitle">Cek kotak masuk dan folder spam.</p>
        <Link to="/masuk" className="btn btn-ghost btn-block" style={{ marginTop: "1rem" }}>
          Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1>Lupa Kata Sandi?</h1>
      <p className="auth-subtitle">
        Masukkan email akunmu. Kami akan kirim tautan untuk mengatur ulang kata sandimu.
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
          {submitting ? "Mengirim..." : "Kirim tautan reset"}
        </button>
      </form>

      <p className="auth-switch">
        Ingat kata sandimu?{" "}
        <Link to="/masuk">Masuk</Link>
      </p>
    </div>
  );
}
