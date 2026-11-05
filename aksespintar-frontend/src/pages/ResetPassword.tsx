import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="auth-card">
        <h1>Tautan Tidak Valid</h1>
        <p className="auth-subtitle">
          Tautan reset kata sandi tidak valid. Minta tautan baru dari halaman lupa kata sandi.
        </p>
        <Link to="/lupa-sandi" className="btn btn-primary btn-block" style={{ marginTop: "1rem" }}>
          Lupa kata sandi
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;

    if (newPassword !== confirm) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await api<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: { token, newPassword },
      });
      // Redirect ke login dengan pesan sukses
      navigate("/masuk", {
        state: { info: "Kata sandi berhasil direset. Silakan masuk dengan kata sandi baru." },
        replace: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mereset kata sandi. Coba minta tautan baru.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>Reset Kata Sandi</h1>
      <p className="auth-subtitle">
        Buat kata sandi baru yang kuat untuk akunmu.
      </p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Kata sandi baru
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            minLength={10}
            required
          />
          <span className="field-hint">
            Minimal 10 karakter, mengandung huruf dan angka, serta bukan kata sandi umum.
          </span>
        </label>

        <label>
          Ulangi kata sandi baru
          <input
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            autoComplete="new-password"
            minLength={10}
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Menyimpan..." : "Simpan kata sandi baru"}
        </button>
      </form>

      <p className="auth-switch">
        Tautan kedaluwarsa?{" "}
        <Link to="/lupa-sandi">Minta tautan baru</Link>
      </p>
    </div>
  );
}
