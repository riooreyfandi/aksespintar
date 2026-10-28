import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, isAbortError } from "../api";
import { DIFFICULTY_LABELS, formatDate } from "../labels";
import type { Category, Difficulty, MaterialListItem, Paged } from "../types";

const PAGE_SIZE = 12;
const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  const [search, setSearch] = useState(q);
  const [categories, setCategories] = useState<Category[]>([]);
  const [result, setResult] = useState<Paged<MaterialListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setSearch(q);
  }, [q]);

  useEffect(() => {
    let active = true;

    api<{ items: Category[] }>("/categories")
      .then((data) => {
        if (active) setCategories(data.items);
      })
      .catch((err: unknown) => console.error(err));

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (difficulty) params.set("difficulty", difficulty);

    setLoading(true);
    setError(null);

    api<Paged<MaterialListItem>>(`/materials?${params.toString()}`, { signal: controller.signal })
      .then((data) => setResult(data))
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : "Gagal memuat materi.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [q, category, difficulty, page, reloadKey]);

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    setSearchParams(params);
  }

  function goToPage(next: number) {
    const params = new URLSearchParams(searchParams);
    if (next > 1) params.set("page", String(next));
    else params.delete("page");
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <section className="hero">
        <p className="hero-eyebrow">Platform belajar gratis</p>
        <h1>Belajar keterampilan digital, satu materi setiap hari.</h1>
        <p className="hero-text">
          Materi ringkas dan terstruktur untuk pemrograman, desain web, dan matematika.
          Mulai dari mana pun kamu siap.
        </p>

        <form
          className="search-bar"
          onSubmit={(event) => {
            event.preventDefault();
            setFilter("q", search.trim());
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari materi"
            aria-label="Cari materi"
          />
          <button type="submit" className="btn btn-primary">
            Cari
          </button>
        </form>
      </section>

      <section className="filters" aria-label="Filter materi">
        <div className="chips">
          <button
            type="button"
            className={`chip${category ? "" : " chip-active"}`}
            onClick={() => setFilter("category", "")}
          >
            Semua
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`chip${category === item.slug ? " chip-active" : ""}`}
              onClick={() => setFilter("category", item.slug)}
              title={item.description}
            >
              {item.name}
            </button>
          ))}
        </div>

        <select
          className="select"
          value={difficulty}
          onChange={(event) => setFilter("difficulty", event.target.value)}
          aria-label="Tingkat kesulitan"
        >
          <option value="">Semua tingkat</option>
          {DIFFICULTIES.map((level) => (
            <option key={level} value={level}>
              {DIFFICULTY_LABELS[level]}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <p className="state">Memuat materi...</p>
      ) : error ? (
        <div className="state state-error">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => setReloadKey((k) => k + 1)}>
            Coba lagi
          </button>
        </div>
      ) : !result || result.items.length === 0 ? (
        <div className="state">
          <p>Tidak ada materi yang cocok dengan pencarianmu.</p>
          <Link to="/" className="btn btn-ghost">
            Reset filter
          </Link>
        </div>
      ) : (
        <>
          <p className="result-count">
            {result.total} materi ditemukan
          </p>
          <div className="material-grid">
            {result.items.map((item) => (
              <Link key={item.id} to={`/materi/${item.slug}`} className="material-card">
                <div className="material-card-top">
                  <span className="tag">{item.category.name}</span>
                  <span className={`badge badge-${item.difficulty}`}>
                    {DIFFICULTY_LABELS[item.difficulty]}
                  </span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <div className="material-meta">
                  <span>{item.estimatedMinutes} menit baca</span>
                  <span>{formatDate(item.publishedAt)}</span>
                </div>
              </Link>
            ))}
          </div>

          {result.totalPages > 1 ? (
            <nav className="pagination" aria-label="Navigasi halaman">
              <button
                type="button"
                className="btn btn-ghost"
                disabled={result.page <= 1}
                onClick={() => goToPage(result.page - 1)}
              >
                Sebelumnya
              </button>
              <span>
                Halaman {result.page} dari {result.totalPages}
              </span>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={result.page >= result.totalPages}
                onClick={() => goToPage(result.page + 1)}
              >
                Berikutnya
              </button>
            </nav>
          ) : null}
        </>
      )}
    </>
  );
}
