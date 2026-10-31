import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import type { User } from "../types";

export function ChangePassword() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const forced = Boolean(user?.mustChangePassword);

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
      const data = await api<{ user: User }>("/auth/change-password", {
        method: "POST",
        body: { currentPassword, newPassword },
      });
      updateUser(data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengganti kata sandi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>Ganti kata sandi</h1>
      <p className="auth-subtitle">
        {forced
          ? "Akunmu memakai kata sandi yang lemah atau bawaan. Demi keamanan, ganti dulu sebelum melanjutkan."
          : "Gunakan kata sandi yang kuat dan tidak dipakai di layanan lain."}
      </p>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Kata sandi saat ini
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

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

      <p className="auth-switch">Semua sesi di perangkat lain akan keluar setelah kata sandi diganti.</p>
    </div>
  );
}
