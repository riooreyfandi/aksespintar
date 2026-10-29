import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth";
import { applyTheme, getInitialTheme, type Theme } from "../theme";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export function Layout() {
  const { user, loading, logout } = useAuth();
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const nextTheme = theme === "dark" ? "terang" : "gelap";

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">AP</span>
            AksesPintar
          </Link>

          <nav className="nav-links">
            {loading ? null : user ? (
              <>
                <NavLink to="/" end>
                  Materi
                </NavLink>
                <NavLink to="/peringkat">Peringkat</NavLink>
                <NavLink to="/diskusi">Diskusi</NavLink>
                {user.role === "admin" ? <NavLink to="/admin">Admin</NavLink> : null}
                <span className="nav-user">Halo, {user.name.split(" ")[0]}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => void logout()}>
                  Keluar
                </button>
              </>
            ) : (
              <>
                <NavLink to="/masuk">Masuk</NavLink>
                <NavLink to="/daftar" className="btn btn-primary btn-sm">
                  Daftar
                </NavLink>
              </>
            )}
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
              aria-label={`Aktifkan mode ${nextTheme}`}
              title={`Mode ${nextTheme}`}
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </nav>
        </div>
      </header>

      <main className="container main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">AksesPintar &middot; Belajar lebih mudah, tanpa batas.</div>
      </footer>
    </div>
  );
}
