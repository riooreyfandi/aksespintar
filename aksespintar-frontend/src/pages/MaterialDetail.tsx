import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, isAbortError } from "../api";
import { DIFFICULTY_LABELS, formatDate } from "../labels";
import type { Material } from "../types";

type Block = { type: "text"; text: string } | { type: "code"; text: string };

// Konten disimpan sebagai teks biasa: paragraf dipisahkan baris kosong,
// sedangkan blok kode ditulis di antara ``` agar tampil sebagai monospace.
function parseContent(content: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let codeLines: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "text", text: paragraph.join("\n") });
      paragraph = [];
    }
  };

  for (const line of content.split("\n")) {
    if (line.trim().startsWith("```")) {
      if (codeLines) {
        blocks.push({ type: "code", text: codeLines.join("\n") });
        codeLines = null;
      } else {
        flushParagraph();
        codeLines = [];
      }
      continue;
    }

    if (codeLines) {
      codeLines.push(line);
    } else if (line.trim() === "") {
      flushParagraph();
    } else {
      paragraph.push(line.trimEnd());
    }
  }

  if (codeLines) {
    blocks.push({ type: "code", text: codeLines.join("\n") });
  }
  flushParagraph();

  return blocks;
}

export function MaterialDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setMaterial(null);

    api<{ material: Material }>(`/materials/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    })
      .then((data) => setMaterial(data.material))
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : "Gagal memuat materi.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return <p className="state">Memuat materi...</p>;
  }

  if (error || !material) {
    return (
      <div className="state state-error">
        <p>{error ?? "Materi tidak ditemukan."}</p>
        <Link to="/" className="btn btn-primary">
          Kembali ke daftar materi
        </Link>
      </div>
    );
  }

  const blocks = parseContent(material.content);

  return (
    <article className="detail">
      <Link to="/" className="back-link">
        &larr; Semua materi
      </Link>

      <div className="detail-header">
        <span className="tag">{material.category.name}</span>
        <h1>{material.title}</h1>
        <p className="detail-summary">{material.summary}</p>
        <div className="detail-meta">
          <span className={`badge badge-${material.difficulty}`}>
            {DIFFICULTY_LABELS[material.difficulty]}
          </span>
          <span>{material.estimatedMinutes} menit baca</span>
          <span>Oleh {material.author.name}</span>
          <span>{formatDate(material.publishedAt)}</span>
        </div>
      </div>

      <div className="detail-body">
        {blocks.map((block, index) =>
          block.type === "code" ? (
            <pre key={index} className="code-block">
              <code>{block.text}</code>
            </pre>
          ) : (
            <p key={index}>{block.text}</p>
          ),
        )}
      </div>
    </article>
  );
}
