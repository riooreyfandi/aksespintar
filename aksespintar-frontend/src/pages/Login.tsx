import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { ApiError } from "../api";

export function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const infoMessage = (location.state as { info?: string } | null)?.info ?? null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(true);
      }
      const details = err instanceof ApiError ? err.details : undefined;
      setError(details?.map((d) => d.message).join(" ") ?? (err instanceof Error ? err.message : "Gagal masuk."));
    } finally {
      setSubmitting(false);
    }
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="auth-card">
      <h1>Masuk</h1>
      <p className="auth-subtitle">Materi hanya bisa dibuka setelah kamu masuk. Belum punya akun? Daftar dulu, gratis.</p>

      {infoMessage ? (
        <p className="form-info" style={{ color: "var(--color-success, #16a34a)", marginBottom: "1rem" }}>
          ✓ {infoMessage}
        </p>
      ) : null}

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

        <label>
          Kata sandi
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <p className="auth-switch" style={{ marginTop: 0 }}>
          <Link to="/lupa-sandi">Lupa kata sandi?</Link>
        </p>

        {error ? (
          <div>
            <p className="form-error">{error}</p>
            {needsVerification ? (
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                <Link to="/kirim-ulang-verifikasi">Kirim ulang email verifikasi →</Link>
              </p>
            ) : null}
          </div>
        ) : null}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="auth-switch">
        Belum punya akun?{" "}
        <Link to="/daftar" state={{ from }}>
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
