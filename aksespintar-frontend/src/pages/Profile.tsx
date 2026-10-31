import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, isAbortError } from "../api";
import { useAuth } from "../auth";
import { PRESET_AVATARS } from "../avatars";
import { Avatar } from "../components/Avatar";
import { fileToAvatarDataUrl } from "../image";
import { formatDate } from "../labels";
import type { LeaderboardEntry, Profile as ProfileData } from "../types";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  contributor: "Kontributor",
  student: "Pelajar",
};

function formatScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(2);
}

export function Profile() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [me, setMe] = useState<LeaderboardEntry | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;

    api<{ user: ProfileData }>("/profile")
      .then((data) => {
        if (!active) return;
        setProfile(data.user);
        setName(data.user.name);
        setAvatar(data.user.avatar);
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (active) setLoadError(err instanceof Error ? err.message : "Gagal memuat profil.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const controller = new AbortController();
    api<{ me: LeaderboardEntry | null }>("/quizzes/leaderboard", { signal: controller.signal })
      .then((data) => {
        if (active) setMe(data.me);
      })
      .catch((err: unknown) => {
        if (!isAbortError(err)) console.error(err);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const trimmedName = name.trim();
  const dirty = profile !== null && (trimmedName !== profile.name || avatar !== profile.avatar);
  const previewUser = { name: trimmedName || profile?.name || user?.name || "", avatar };

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    if (!profile || !dirty || saving) return;

    const payload: { name?: string; avatar?: string | null } = {};
    if (trimmedName !== profile.name) payload.name = trimmedName;
    if (avatar !== profile.avatar) payload.avatar = avatar;

    setSaving(true);
    setSaveError(null);
    setNotice(null);
    try {
      const data = await api<{ user: ProfileData }>("/profile", { method: "PATCH", body: payload });
      setProfile(data.user);
      setName(data.user.name);
      setAvatar(data.user.avatar);
      updateUser(data.user);
      setNotice("Perubahan profil berhasil disimpan.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan profil.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setNotice(null);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setAvatar(dataUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Gagal memproses gambar.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <p className="state">Memuat profil...</p>;
  }

  if (loadError || !profile) {
    return (
      <div className="state state-error">
        <p>{loadError ?? "Profil tidak ditemukan."}</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
          Coba lagi
        </button>
      </div>
    );
  }

  return (
    <section className="profile">
      <header className="profile-hero">
        <Avatar user={previewUser} size="xl" className="profile-avatar" />
        <div className="profile-hero-info">
          <p className="hero-eyebrow">Profil</p>
          <h1>{trimmedName || profile.name}</h1>
          <p className="profile-email">{profile.email}</p>
          <div className="profile-badges">
            <span className={`role-pill role-${profile.role}`}>
              {ROLE_LABELS[profile.role] ?? profile.role}
            </span>
            <span className="profile-since">Anggota sejak {formatDate(profile.createdAt)}</span>
          </div>
        </div>
      </header>

      <div className="profile-grid">
        <section className="profile-card">
          <h2>Avatar</h2>
          <p className="profile-card-hint">
            Pilih salah satu avatar bawaan, atau unggah foto dari perangkatmu. Foto otomatis dipotong
            persegi dan diperkecil agar tetap ringan.
          </p>

          <div className="avatar-grid" role="group" aria-label="Pilih avatar bawaan">
            {PRESET_AVATARS.map((preset) => {
              const value = `preset:${preset.id}`;
              const selected = avatar === value;
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`avatar-option${selected ? " avatar-option-selected" : ""}`}
                  onClick={() => {
                    setAvatar(value);
                    setNotice(null);
                  }}
                  aria-pressed={selected}
                  title={preset.label}
                >
                  <Avatar user={{ name: previewUser.name, avatar: value }} size="lg" />
                  <span className="avatar-option-label">{preset.label}</span>
                </button>
              );
            })}
          </div>

          <div className="avatar-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Memproses gambar..." : "Unggah dari perangkat"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setAvatar(null)}>
              Hapus avatar
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="visually-hidden"
              onChange={(event) => void handleFile(event)}
            />
          </div>

          {uploadError ? <p className="form-error">{uploadError}</p> : null}
          {avatar?.startsWith("data:image/") ? (
            <p className="profile-card-hint">Foto dari perangkat siap dipakai. Jangan lupa simpan.</p>
          ) : null}
        </section>

        <section className="profile-card">
          <h2>Data profil</h2>
          <form className="form" onSubmit={handleSave}>
            <label>
              Nama tampilan
              <input
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setNotice(null);
                }}
                maxLength={100}
                required
              />
            </label>

            <label>
              Email
              <input type="email" value={profile.email} disabled readOnly />
            </label>
            <p className="field-hint">Email dipakai untuk masuk dan tidak bisa diubah dari halaman ini.</p>

            {saveError ? <p className="form-error">{saveError}</p> : null}
            {notice ? <p className="form-success">{notice}</p> : null}

            <div className="profile-save">
              {dirty ? <span className="profile-dirty">Perubahan belum disimpan</span> : null}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!dirty || saving || uploading}
              >
                {saving ? "Menyimpan..." : "Simpan perubahan"}
              </button>
            </div>
          </form>
        </section>

        <section className="profile-card profile-stats-card">
          <h2>Statistik belajar</h2>
          {me ? (
            <div className="profile-stats">
              <div className="stat-card">
                <span className="stat-label">Peringkat</span>
                <span className="stat-value">#{me.rank}</span>
                <span className="stat-hint">dari seluruh peserta kuis</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total skor</span>
                <span className="stat-value">{formatScore(me.totalScore)}</span>
                <span className="stat-hint">skor terbaik tiap kuis</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Kuis selesai</span>
                <span className="stat-value">{me.quizzesTaken}</span>
                <span className="stat-hint">kuis dikerjakan</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Jawaban</span>
                <span className="stat-value">
                  {me.correctAnswers}/{me.correctAnswers + me.wrongAnswers}
                </span>
                <span className="stat-hint">benar dari total jawaban</span>
              </div>
            </div>
          ) : (
            <p className="profile-card-hint">
              Kamu belum mengerjakan kuis. Selesaikan kuis di akhir materi untuk melihat statistik dan
              peringkatmu di sini.
            </p>
          )}
          <p className="profile-card-hint">
            Keamanan akun: <Link to="/ganti-sandi">ganti kata sandi</Link>
          </p>
        </section>
      </div>
    </section>
  );
}
