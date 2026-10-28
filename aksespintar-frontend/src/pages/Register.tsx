import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { ApiError } from "../api";

export function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await register(name, email, password);
      navigate(from, { replace: true });
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
            minLength={8}
            required
          />
          <span className="field-hint">Minimal 8 karakter, mengandung huruf dan angka.</span>
        </label>

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
