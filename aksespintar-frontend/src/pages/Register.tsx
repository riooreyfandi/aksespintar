import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth";
import { api, ApiError } from "../api";

export function Register() {
  const { user } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api<{ message: string; devVerificationUrl?: string }>("/auth/register", {
        method: "POST",
        body: { name, email, password, website },
      });
      if (res?.devVerificationUrl) {
        setDevVerificationUrl(res.devVerificationUrl);
      }
      setRegistered(true);
    } catch (err) {
      const details = err instanceof ApiError ? err.details : undefined;
      setError(
        details?.map((d) => d.message).join(" ") ??
          (err instanceof Error ? err.message : "Gagal mendaftar."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  if (registered) {
    return (
      <div className="auth-card">
        <h1>Cek Email Kamu! 📬</h1>
        <p className="auth-subtitle">
          Pendaftaran berhasil! Kami sudah mengirim tautan verifikasi ke{" "}
          <strong>{email}</strong>.
        </p>
        <p className="auth-subtitle">
          Klik tautan di email tersebut untuk mengaktifkan akunmu, kemudian kamu bisa masuk.
          Tautan berlaku selama <strong>24 jam</strong>.
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

        <p style={{ fontSize: "0.875rem", color: "var(--color-muted, #6b7280)", marginTop: "0.75rem" }}>
          Tidak menerima email?{" "}
          <Link to="/kirim-ulang-verifikasi">Kirim ulang</Link>
        </p>
        <Link to="/masuk" className="btn btn-ghost btn-block" style={{ marginTop: "1rem" }}>
          Ke halaman masuk
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h1>Daftar</h1>
      <p className="auth-subtitle">Buat akun gratis dan mulai belajar.</p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Nama
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            minLength={2}
            required
          />
        </label>

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

        <label>
          Kata sandi
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            minLength={10}
            required
          />
          <span className="field-hint">
            Minimal 10 karakter, mengandung huruf dan angka, dan bukan kata sandi umum.
          </span>
        </label>

        <div className="hp-field" aria-hidden="true">
          <label>
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </label>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Memproses..." : "Daftar"}
        </button>
      </form>

      <p className="auth-switch">
        Sudah punya akun?{" "}
        <Link to="/masuk" state={{ from }}>
          Masuk
        </Link>
      </p>
    </div>
  );
}
