import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { api, isAbortError } from "../api";
import { useAuth } from "../auth";
import type { ChatMessage } from "../types";

const POLL_MS = 5000;

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (silent: boolean) => {
    try {
      const data = await api<{ items: ChatMessage[] }>("/chat?limit=100");
      setMessages(data.items);
      setError(null);
    } catch (err) {
      if (isAbortError(err)) return;
      if (!silent) setError(err instanceof Error ? err.message : "Gagal memuat pesan.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
    const timer = window.setInterval(() => void load(true), POLL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const body = text.trim();
    if (!body || sending) return;

    setSending(true);
    setSendError(null);
    try {
      const data = await api<{ message: ChatMessage }>("/chat", {
        method: "POST",
        body: { body },
      });
      setMessages((current) => [...current, data.message]);
      setText("");
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Gagal mengirim pesan.");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  async function handleDelete(message: ChatMessage) {
    if (!window.confirm("Hapus pesan ini?")) return;
    try {
      await api(`/chat/${message.id}`, { method: "DELETE" });
      setMessages((current) => current.filter((item) => item.id !== message.id));
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Gagal menghapus pesan.");
    }
  }

  return (
    <section className="chat">
      <header className="board-header">
        <p className="hero-eyebrow">Papan chat</p>
        <h1>Ruang diskusi AksesPintar</h1>
        <p className="board-subtitle">
          Bagikan materi, ajukan pertanyaan, atau diskusikan mata pelajaran bersama anggota lain yang
          sudah masuk. Bersikap sopan dan saling membantu, ya.
        </p>
      </header>

      <div className="chat-panel">
        <div className="chat-log" aria-live="polite">
          {loading ? (
            <p className="state">Memuat pesan...</p>
          ) : error ? (
            <div className="state state-error">
              <p>{error}</p>
              <button type="button" className="btn btn-primary" onClick={() => void load(false)}>
                Coba lagi
              </button>
            </div>
          ) : messages.length === 0 ? (
            <p className="chat-empty">Belum ada pesan. Mulai diskusi pertama!</p>
          ) : (
            messages.map((message) => {
              const mine = user ? message.user.id === user.id : false;
              return (
                <article key={message.id} className={`chat-message${mine ? " chat-message-mine" : ""}`}>
                  <div className="chat-message-head">
                    <span className="chat-author">
                      {message.user.name}
                      {message.user.role === "admin" ? <span className="chat-role">admin</span> : null}
                    </span>
                    <time className="chat-time" dateTime={message.createdAt}>
                      {formatTime(message.createdAt)}
                    </time>
                  </div>
                  <p className="chat-body">{message.body}</p>
                  {mine || user?.role === "admin" ? (
                    <button
                      type="button"
                      className="chat-delete"
                      onClick={() => void handleDelete(message)}
                    >
                      Hapus
                    </button>
                  ) : null}
                </article>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <textarea
            className="chat-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pesan tentang mata pelajaran..."
            aria-label="Tulis pesan"
            maxLength={1000}
            rows={3}
          />
          <div className="chat-form-footer">
            <span className="chat-hint">Enter untuk kirim, Shift+Enter untuk baris baru.</span>
            <button type="submit" className="btn btn-primary" disabled={!text.trim() || sending}>
              {sending ? "Mengirim..." : "Kirim"}
            </button>
          </div>
          {sendError ? <p className="form-error">{sendError}</p> : null}
        </form>
      </div>
    </section>
  );
}
