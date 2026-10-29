import { useEffect, useState } from "react";
import { api, isAbortError } from "../api";
import { useAuth } from "../auth";
import type { LeaderboardEntry } from "../types";

type LeaderboardResponse = {
  items: LeaderboardEntry[];
  me: LeaderboardEntry | null;
};

function formatScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(2);
}

export function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    api<LeaderboardResponse>("/quizzes/leaderboard", { signal: controller.signal })
      .then((result) => setData(result))
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : "Gagal memuat peringkat.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const me = data?.me ?? null;
  const meInList = me ? data?.items.some((item) => item.id === me.id) ?? false : false;

  return (
    <section className="board">
      <header className="board-header">
        <p className="hero-eyebrow">Peringkat</p>
        <h1>Papan peringkat AksesPintar</h1>
        <p className="board-subtitle">
          Peringkat dihitung dari total skor terbaik setiap kuis yang pernah dikerjakan. Semakin banyak
          kuis yang kamu selesaikan dengan nilai tinggi, semakin tinggi posisimu.
        </p>
      </header>

      {loading ? (
        <p className="state">Memuat peringkat...</p>
      ) : error ? (
        <div className="state state-error">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {me ? (
            <div className={`board-me${me.rank <= 3 ? " board-me-top" : ""}`}>
              <div>
                <span className="board-me-label">Posisimu sekarang</span>
                <strong className="board-me-rank">#{me.rank}</strong>
              </div>
              <div className="board-me-stats">
                <span>
                  <strong>{formatScore(me.totalScore)}</strong> total skor
                </span>
                <span>
                  <strong>{me.quizzesTaken}</strong> kuis
                </span>
                <span>
                  <strong>{me.correctAnswers}</strong> benar
                </span>
                <span>
                  <strong>{me.wrongAnswers}</strong> salah
                </span>
              </div>
            </div>
          ) : (
            <div className="board-me board-me-empty">
              <span className="board-me-label">Kamu belum punya peringkat</span>
              <p>Kerjakan kuis di akhir materi untuk mulai mengumpulkan skor.</p>
            </div>
          )}

          <div className="table-wrap">
            <table className="data-table leaderboard-table">
              <thead>
                <tr>
                  <th>Peringkat</th>
                  <th>Nama</th>
                  <th>Total skor</th>
                  <th>Kuis</th>
                  <th>Benar</th>
                  <th>Salah</th>
                </tr>
              </thead>
              <tbody>
                {!data || data.items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      Belum ada peserta kuis. Jadilah yang pertama!
                    </td>
                  </tr>
                ) : (
                  data.items.map((item) => {
                    const isMe = user ? item.id === user.id : false;
                    return (
                      <tr key={item.id} className={isMe ? "leaderboard-row-me" : undefined}>
                        <td>
                          <span className={`rank-badge${item.rank <= 3 ? ` rank-${item.rank}` : ""}`}>
                            {item.rank}
                          </span>
                        </td>
                        <td className="cell-strong">
                          {item.name}
                          {isMe ? <span className="rank-you">kamu</span> : null}
                        </td>
                        <td className="cell-strong">{formatScore(item.totalScore)}</td>
                        <td>{item.quizzesTaken}</td>
                        <td>{item.correctAnswers}</td>
                        <td>{item.wrongAnswers}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {me && !meInList ? (
            <p className="board-note">
              Kamu berada di peringkat #{me.rank} dengan total skor {formatScore(me.totalScore)}.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
