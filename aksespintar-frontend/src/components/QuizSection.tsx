import { useEffect, useState, type FormEvent } from "react";
import { api, isAbortError } from "../api";
import type { MaterialQuiz, QuizResult } from "../types";

function formatScore(score: number): string {
  return Number.isInteger(score) ? String(score) : score.toFixed(2);
}

export function QuizSection({ slug }: { slug: string }) {
  const [quiz, setQuiz] = useState<MaterialQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setQuiz(null);
    setAnswers({});
    setResult(null);

    api<{ quiz: MaterialQuiz | null }>(`/quizzes/material/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    })
      .then((data) => setQuiz(data.quiz))
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : "Gagal memuat kuis.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [slug]);

  if (loading) {
    return <p className="state">Memuat kuis...</p>;
  }

  if (error) {
    return (
      <section className="quiz-section">
        <p className="form-error">{error}</p>
      </section>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return null;
  }

  const answeredCount = quiz.questions.filter((question) => answers[question.id]).length;
  const allAnswered = answeredCount === quiz.questions.length;
  const passed = quiz.passingScore != null && result ? result.attempt.score >= quiz.passingScore : null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!quiz || !allAnswered || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const data = await api<QuizResult>(`/quizzes/${quiz.id}/attempts`, {
        method: "POST",
        body: {
          answers: quiz.questions.map((question) => ({
            questionId: question.id,
            optionId: answers[question.id] ?? null,
          })),
        },
      });
      setResult(data);
      setQuiz((current) =>
        current && data.attempt.score > (current.bestAttempt?.score ?? -1)
          ? {
              ...current,
              bestAttempt: {
                id: data.attempt.id,
                score: data.attempt.score,
                correctAnswers: data.attempt.correctAnswers,
                totalQuestions: data.attempt.totalQuestions,
                completedAt: data.attempt.completedAt,
              },
            }
          : current,
      );
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal mengirim jawaban.");
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setResult(null);
    setAnswers({});
    setSubmitError(null);
  }

  return (
    <section className="quiz-section" aria-labelledby="quiz-title">
      <div className="quiz-head">
        <span className="quiz-eyebrow">Kuis</span>
        <h2 id="quiz-title">{quiz.title}</h2>
        {quiz.description ? <p className="quiz-description">{quiz.description}</p> : null}
        <div className="quiz-meta">
          <span>{quiz.questions.length} soal</span>
          {quiz.passingScore != null ? <span>Nilai lulus {quiz.passingScore}</span> : null}
          {quiz.bestAttempt ? (
            <span className="quiz-best">
              Skor terbaikmu: {formatScore(quiz.bestAttempt.score)} ({quiz.bestAttempt.correctAnswers}/
              {quiz.bestAttempt.totalQuestions} benar)
            </span>
          ) : (
            <span>Belum pernah dikerjakan</span>
          )}
        </div>
      </div>

      {result ? (
        <div className="quiz-result" aria-live="polite">
          <div className="quiz-score">
            <span className="quiz-score-value">{formatScore(result.attempt.score)}</span>
            <span className="quiz-score-label">dari 100</span>
          </div>
          <div className="quiz-result-stats">
            <div className="quiz-stat quiz-stat-correct">
              <strong>{result.attempt.correctAnswers}</strong>
              <span>Benar</span>
            </div>
            <div className="quiz-stat quiz-stat-wrong">
              <strong>{result.attempt.wrongAnswers}</strong>
              <span>Salah</span>
            </div>
          </div>
          <p className={`quiz-verdict${passed === false ? " quiz-verdict-fail" : ""}`}>
            {passed == null
              ? "Jawabanmu sudah tersimpan."
              : passed
                ? "Selamat, kamu lulus kuis ini."
                : `Belum lulus. Nilai minimal ${quiz.passingScore}. Coba lagi, ya.`}
          </p>
          <button type="button" className="btn btn-primary" onClick={retry}>
            Kerjakan ulang
          </button>

          <ol className="quiz-review">
            {quiz.questions.map((question, index) => {
              const item = result.review.find((entry) => entry.questionId === question.id);
              if (!item) return null;

              const selected = question.options.find((option) => option.id === item.selectedOptionId);

              return (
                <li key={question.id} className="quiz-review-item">
                  <div className="quiz-review-head">
                    <span className="quiz-number">{index + 1}</span>
                    <span className={`quiz-pill ${item.isCorrect ? "quiz-pill-correct" : "quiz-pill-wrong"}`}>
                      {item.isCorrect ? "Benar" : "Salah"}
                    </span>
                  </div>
                  <p className="quiz-review-question">{question.questionText}</p>
                  <p className="quiz-review-answer">
                    Jawabanmu: <strong>{selected?.optionText ?? "Tidak dijawab"}</strong>
                  </p>
                  {!item.isCorrect ? (
                    <p className="quiz-review-answer">
                      Jawaban benar: <strong>{item.correctOptionText ?? "-"}</strong>
                    </p>
                  ) : null}
                  {item.explanation ? <p className="quiz-review-note">{item.explanation}</p> : null}
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <form className="quiz-form" onSubmit={handleSubmit}>
          {quiz.questions.map((question, index) => (
            <fieldset key={question.id} className="quiz-question">
              <legend>
                <span className="quiz-number">{index + 1}</span>
                {question.questionText}
              </legend>
              <div className="quiz-options">
                {question.options.map((option) => {
                  const checked = answers[question.id] === option.id;
                  return (
                    <label
                      key={option.id}
                      className={`quiz-option${checked ? " quiz-option-selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option.id}
                        checked={checked}
                        onChange={() =>
                          setAnswers((current) => ({ ...current, [question.id]: option.id }))
                        }
                      />
                      <span>{option.optionText}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {submitError ? <p className="form-error">{submitError}</p> : null}

          <div className="quiz-actions">
            <span className="quiz-progress">
              {answeredCount} dari {quiz.questions.length} soal dijawab
            </span>
            <button type="submit" className="btn btn-primary" disabled={!allAnswered || submitting}>
              {submitting ? "Mengirim..." : "Kirim jawaban"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
