import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, isAbortError } from "../api";
import { useAuth } from "../auth";
import type { AdminActivity, AdminOverview, AdminSession, AdminUser } from "../types";

type Tab = "ringkasan" | "pengguna" | "sesi" | "aktivitas";

const TABS: { id: Tab; label: string }[] = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "pengguna", label: "Pengguna" },
  { id: "sesi", label: "Sedang Login" },
  { id: "aktivitas", label: "Riwayat Aktivitas" },
];

const ACTION_LABELS: Record<string, string> = {
  "auth.register": "Daftar akun",
  "auth.login": "Masuk",
  "auth.logout": "Keluar",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  contributor: "Kontributor",
  student: "Pelajar",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDuration(minutes: number): string {
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  if (hours < 24) return restMinutes ? `${hours} jam ${restMinutes} menit` : `${hours} jam`;
  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  return restHours ? `${days} hari ${restHours} jam` : `${days} hari`;
}

function formatBrowser(userAgent: string | null): string {
  if (!userAgent) return "-";
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("chrome/") || ua.includes("crios/")) return "Chrome";
  if (ua.includes("firefox/") || ua.includes("fxios/")) return "Firefox";
  if (ua.includes("safari/")) return "Safari";
  if (ua.includes("bot") || ua.includes("crawler")) return "Bot";
  return userAgent.slice(0, 24);
}

export function Admin() {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === "admin";

  const [tab, setTab] = useState<Tab>("ringkasan");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isAdmin) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    Promise.all([
      api<AdminOverview>("/admin/overview", { signal: controller.signal }),
      api<{ items: AdminUser[] }>("/admin/users?limit=200", { signal: controller.signal }),
      api<{ items: AdminSession[] }>("/admin/sessions?limit=200", { signal: controller.signal }),
      api<{ items: AdminActivity[] }>("/admin/activity?limit=100", { signal: controller.signal }),
    ])
      .then(([overviewData, usersData, sessionsData, activityData]) => {
        setOverview(overviewData);
        setUsers(usersData.items);
        setSessions(sessionsData.items);
        setActivity(activityData.items);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : "Gagal memuat data admin.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [isAdmin, reloadKey]);

  const filteredUsers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) || item.email.toLowerCase().includes(keyword),
    );
  }, [users, query]);

  if (authLoading) {
    return <p className="state">Memuat...</p>;
  }

  if (!user) {
    return (
      <div className="state">
        <p>Halaman ini hanya bisa dibuka setelah masuk sebagai admin.</p>
        <Link to="/masuk" className="btn btn-primary">
          Masuk
        </Link>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="state state-error">
        <p>Halaman ini khusus admin. Akunmu tidak punya akses.</p>
        <Link to="/" className="btn btn-ghost">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

  return (
    <section className="admin">
      <div className="admin-header">
        <div>
          <p className="hero-eyebrow">Panel admin</p>
          <h1>Aktivitas pengguna</h1>
          <p className="admin-subtitle">
            Pantau siapa yang sudah mendaftar, siapa yang sedang login, dan berapa lama mereka
            berada di situs.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setReloadKey((key) => key + 1)}
          disabled={loading}
        >
          {loading ? "Memuat..." : "Muat ulang"}
        </button>
      </div>

      {error ? (
        <div className="state state-error">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => setReloadKey((k) => k + 1)}>
            Coba lagi
          </button>
        </div>
      ) : null}

      <nav className="admin-tabs" aria-label="Bagian panel admin">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`chip${tab === item.id ? " chip-active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "ringkasan" ? (
        <div className="admin-stats">
          <article className="stat-card">
            <span className="stat-label">Total pengguna</span>
            <strong className="stat-value">{overview?.totalUsers ?? 0}</strong>
            <span className="stat-hint">{overview?.register24h ?? 0} daftar dalam 24 jam</span>
          </article>
          <article className="stat-card">
            <span className="stat-label">Sedang login</span>
            <strong className="stat-value">{overview?.activeSessions ?? 0}</strong>
            <span className="stat-hint">sesi aktif saat ini</span>
          </article>
          <article className="stat-card">
            <span className="stat-label">Total login</span>
            <strong className="stat-value">{overview?.totalLogins ?? 0}</strong>
            <span className="stat-hint">{overview?.login24h ?? 0} login dalam 24 jam</span>
          </article>
          <article className="stat-card">
            <span className="stat-label">Catatan aktivitas</span>
            <strong className="stat-value">{overview?.totalAudit ?? 0}</strong>
            <span className="stat-hint">tersimpan di audit log</span>
          </article>
        </div>
      ) : null}

      {tab === "pengguna" ? (
        <>
          <div className="admin-toolbar">
            <input
              type="search"
              className="admin-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama atau email"
              aria-label="Cari pengguna"
            />
            <span className="result-count">
              {filteredUsers.length} dari {users.length} pengguna
            </span>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Peran</th>
                  <th>Login</th>
                  <th>Terakhir masuk</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>
                      <span className={`role-pill role-${item.role}`}>
                        {ROLE_LABELS[item.role] ?? item.role}
                      </span>
                    </td>
                    <td>{item.loginCount}x</td>
                    <td>{formatDateTime(item.lastLoginAt)}</td>
                    <td>
                      {item.currentSession ? (
                        <span className="status-online">
                          Online &middot; {formatDuration(item.currentSession.minutesLoggedIn)}
                        </span>
                      ) : (
                        <span className="status-offline">Offline</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      Tidak ada pengguna yang cocok.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {tab === "sesi" ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Mulai login</th>
                <th>Durasi login</th>
                <th>Terakhir aktif</th>
                <th>IP</th>
                <th>Perangkat</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="cell-strong">{item.user.name}</div>
                    <div className="cell-muted">{item.user.email}</div>
                  </td>
                  <td>{formatDateTime(item.loginAt)}</td>
                  <td>{formatDuration(item.minutesLoggedIn)}</td>
                  <td>
                    {formatDuration(item.minutesIdle)} lalu
                  </td>
                  <td className="cell-mono">{item.ipAddress ?? "-"}</td>
                  <td title={item.userAgent ?? undefined}>{formatBrowser(item.userAgent)}</td>
                </tr>
              ))}
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-empty">
                    Belum ada sesi yang aktif.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "aktivitas" ? (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Aksi</th>
                <th>Pengguna</th>
                <th>IP</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((item) => (
                <tr key={item.id}>
                  <td>{formatDateTime(item.createdAt)}</td>
                  <td>
                    <span className={`action-pill action-${item.action.replace(".", "-")}`}>
                      {ACTION_LABELS[item.action] ?? item.action}
                    </span>
                  </td>
                  <td>
                    <div className="cell-strong">{item.actor.name}</div>
                    <div className="cell-muted">{item.actor.email}</div>
                  </td>
                  <td className="cell-mono">{item.metadata?.ip ?? "-"}</td>
                  <td className="cell-muted">
                    {item.metadata?.loginKe ? `Login ke-${item.metadata.loginKe}` : null}
                    {item.metadata?.durasiMenit !== undefined
                      ? `Durasi ${formatDuration(item.metadata.durasiMenit)}`
                      : null}
                    {!item.metadata?.loginKe && item.metadata?.durasiMenit === undefined
                      ? (item.metadata?.userAgent ? formatBrowser(item.metadata.userAgent) : "-")
                      : null}
                  </td>
                </tr>
              ))}
              {activity.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-empty">
                    Belum ada aktivitas tercatat.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
