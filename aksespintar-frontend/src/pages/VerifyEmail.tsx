import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api";

type Status = "loading" | "success" | "error";

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak ditemukan.");
      return;
    }

    let active = true;

    api<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: { token },
    })
      .then((data) => {
        if (active) {
          setStatus("success");
          setMessage(data.message);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setStatus("error");
          setMessage(err instanceof Error ? err.message : "Verifikasi gagal. Coba minta link baru.");
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="auth-card">
      <h1>Verifikasi Email</h1>

      {status === "loading" && <p className="state">Memverifikasi email...</p>}

      {status === "success" && (
        <>
          <p className="auth-subtitle" style={{ color: "var(--color-success, #16a34a)" }}>
            ✓ {message}
          </p>
          <Link to="/masuk" className="btn btn-primary btn-block" style={{ marginTop: "1rem" }}>
            Masuk sekarang
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <p className="form-error">{message}</p>
          <p className="auth-subtitle">
            Tautan verifikasi berlaku 24 jam. Jika sudah kedaluwarsa, minta kirim ulang di bawah.
          </p>
          <Link to="/kirim-ulang-verifikasi" className="btn btn-ghost btn-block" style={{ marginTop: "1rem" }}>
            Kirim ulang email verifikasi
          </Link>
        </>
      )}
    </div>
  );
}
