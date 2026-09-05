// ============================================================
// SecureDevHub — Quiz + Spot-the-Bug challenge components
// ============================================================
import { useMemo, useState } from "react";
import { Award, Check, CircleHelp, RefreshCw, SearchCode, X } from "lucide-react";
import { copyText, cx, store, toast, useLocalStorage } from "../lib/utils";
import type { Challenge, QuizQuestion } from "../data/types";
import { CodeBlock } from "./CodeBlock";
import { markSolved } from "../data/playground";
import { Badge } from "./ui";

/* ============================ QUIZ ============================ */
export function Quiz({ id, questions }: { id: string; questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const [submitted, setSubmitted] = useState(false);
  const [best, setBest] = useLocalStorage<number | null>(`sdh_quiz_${id}_best`, null);

  const score = useMemo(
    () => questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0),
    [answers, questions]
  );
  const allAnswered = answers.every((a) => a >= 0);

  const submit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    if (best === null || score > best) setBest(score);
    window.scrollTo({ top: window.scrollY - 40, behavior: "smooth" });
  };

  const retry = () => {
    setAnswers(questions.map(() => -1));
    setSubmitted(false);
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <div className="d-flex align-items-center gap-2" style={{ color: "var(--text-2)", fontSize: "0.88rem" }}>
          <CircleHelp size={16} aria-hidden="true" />
          {questions.length} questions · instant feedback
        </div>
        {best !== null && (
          <Badge kind="info">
            <Award size={11} aria-hidden="true" /> Best score: {best}/{questions.length}
          </Badge>
        )}
      </div>

      {submitted && (
        <div
          className={cx("sd-card p-4 mb-4 d-flex align-items-center gap-3 flex-wrap")}
          role="status"
          style={{ borderColor: score === questions.length ? "var(--success)" : "var(--border)" }}
        >
          <div
            className="icon-tile"
            style={score === questions.length ? { color: "var(--success)", background: "var(--success-soft)", borderColor: "transparent" } : {}}
          >
            <Award size={20} aria-hidden="true" />
          </div>
          <div className="flex-grow-1">
            <div className="fw-bold" style={{ fontSize: "1.05rem" }}>
              You scored {score}/{questions.length}
              {score === questions.length ? " — perfect!" : score >= questions.length / 2 ? " — solid." : " — review the module and retry."}
            </div>
            <div style={{ color: "var(--text-2)", fontSize: "0.86rem" }}>
              Stored locally so you can track improvement. Explanations are unlocked below.
            </div>
          </div>
          <button className="btn-sdh sm" onClick={retry}>
            <RefreshCw size={14} aria-hidden="true" /> Try Again
          </button>
        </div>
      )}

      <ol className="list-unstyled m-0">
        {questions.map((q, qi) => {
          const picked = answers[qi];
          const isCorrect = picked === q.correct;
          return (
            <li key={qi} className="quiz-q sd-card" aria-label={`Question ${qi + 1}`}>
              <div className="d-flex gap-3 mb-3">
                <span
                  className="num-badge"
                  style={{
                    width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center",
                    background: "var(--card-2)", border: "1px solid var(--border)", flexShrink: 0, fontSize: "0.8rem",
                  }}
                  aria-hidden="true"
                >
                  {qi + 1}
                </span>
                <strong style={{ fontSize: "0.98rem", lineHeight: 1.5 }}>{q.q}</strong>
              </div>
              <div className="d-grid gap-2">
                {q.options.map((opt, oi) => {
                  const letter = String.fromCharCode(65 + oi);
                  let cls = "";
                  if (submitted) {
                    if (oi === q.correct) cls = "correct";
                    else if (oi === picked) cls = "wrong";
                  } else if (oi === picked) cls = "selected";
                  return (
                    <button
                      key={oi}
                      className={cx("quiz-opt", cls)}
                      disabled={submitted}
                      aria-pressed={oi === picked}
                      onClick={() =>
                        setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))
                      }
                    >
                      <span className="letter" aria-hidden="true">{letter}</span>
                      <span className="flex-grow-1">{opt}</span>
                      {submitted && oi === q.correct && <Check size={16} style={{ color: "var(--success)" }} aria-hidden="true" />}
                      {submitted && oi === picked && oi !== q.correct && <X size={16} style={{ color: "var(--danger)" }} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className="quiz-why">
                  <strong style={{ color: isCorrect ? "var(--success)" : "var(--danger)" }}>
                    {isCorrect ? "Correct. " : "Not quite. "}
                  </strong>
                  {q.why}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {!submitted && (
        <div className="d-flex align-items-center gap-3 mt-3 flex-wrap">
          <button className="btn-sdh primary" onClick={submit} disabled={!allAnswered}>
            <Check size={16} aria-hidden="true" /> Check Answers
          </button>
          {!allAnswered && (
            <span style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>
              Answer all {questions.length} questions to submit ({answers.filter((a) => a >= 0).length} done)
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ===================== SPOT THE BUG CHALLENGE ===================== */
export function ChallengeCard({
  challenge,
  index,
  total,
  onSolvedChange,
}: {
  challenge: Challenge;
  index?: number;
  total?: number;
  onSolvedChange?: () => void;
}) {
  const [picked, setPicked] = useState<number>(() => {
    const saved = store.get<Record<string, number>>("sdh_pg_picks", {});
    return saved[challenge.id] ?? -1;
  });
  const revealed = picked >= 0;
  const isCorrect = picked === challenge.correct;

  const choose = (i: number) => {
    if (revealed) return;
    setPicked(i);
    const saved = store.get<Record<string, number>>("sdh_pg_picks", {});
    store.set("sdh_pg_picks", { ...saved, [challenge.id]: i });
    if (i === challenge.correct) {
      markSolved(challenge.id);
      toast("Correct — challenge solved!");
      onSolvedChange?.();
    }
  };

  const diffKind = challenge.difficulty === "Easy" ? "success" : challenge.difficulty === "Medium" ? "medium" : "critical";

  return (
    <article className="sd-card hover p-4 h-100 d-flex flex-column" aria-label={`Challenge: ${challenge.title}`}>
      <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
        {typeof index === "number" && (
          <span className="num-badge" style={{ fontSize: "0.78rem" }}>
            #{String(index + 1).padStart(2, "0")}{total ? `/${String(total).padStart(2, "0")}` : ""}
          </span>
        )}
        <Badge kind={diffKind as never}>{challenge.difficulty}</Badge>
        <span className="tag-chip">{challenge.category}</span>
        {revealed && isCorrect && (
          <Badge kind="success"><Check size={11} aria-hidden="true" /> Solved</Badge>
        )}
      </div>

      <h3 style={{ fontSize: "1.05rem" }}>{challenge.title}</h3>

      <div className="mt-2 mb-3">
        <CodeBlock tabs={[{ lang: challenge.code.lang, label: challenge.code.lang === "javascript" ? "JavaScript" : challenge.code.lang.toUpperCase(), code: challenge.code.snippet }]} />
      </div>

      <p className="fw-semibold mb-2 d-flex align-items-center gap-2" style={{ fontSize: "0.92rem" }}>
        <SearchCode size={16} style={{ color: "var(--primary)" }} aria-hidden="true" />
        What's the vulnerability?
      </p>

      <div className="d-grid gap-2 mb-3">
        {challenge.options.map((opt, i) => {
          const letter = String.fromCharCode(65 + i);
          let cls = "";
          if (revealed) {
            if (i === challenge.correct) cls = "correct";
            else if (i === picked) cls = "wrong";
          }
          return (
            <button key={i} className={cx("quiz-opt", cls)} disabled={revealed} onClick={() => choose(i)}>
              <span className="letter" aria-hidden="true">{letter}</span>
              <span className="flex-grow-1">{opt}</span>
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mt-auto">
          <div className="quiz-why" style={{ borderLeftColor: isCorrect ? "var(--success)" : "var(--danger)" }}>
            <strong style={{ color: isCorrect ? "var(--success)" : "var(--danger)" }}>
              {isCorrect ? "Correct! " : "Not quite — "}
            </strong>
            {challenge.why}
          </div>
          <div className="mt-3">
            <div className="fw-semibold mb-2 d-flex align-items-center gap-2" style={{ fontSize: "0.88rem", color: "var(--success)" }}>
              <Check size={15} aria-hidden="true" /> The fix
            </div>
            <CodeBlock tabs={[{ lang: challenge.fix.lang, code: challenge.fix.snippet }]} banner="ok" />
          </div>
        </div>
      )}
    </article>
  );
}

/* Copy-as-text helper button used in Quick Rules */
export function CopyRulesButton({ rules }: { rules: string[] }) {
  const [copied, setCopied] = useState(false);
  const doCopy = async () => {
    const text = rules.map((r, i) => `${i + 1}. ${r}`).join("\n");
    if (await copyText(text)) {
      setCopied(true);
      toast("Rules copied to clipboard");
      setTimeout(() => setCopied(false), 1600);
    }
  };
  return (
    <button className={cx("copy-btn", copied && "copied")} onClick={doCopy}>
      {copied ? <Check size={13} aria-hidden="true" /> : null}
      {copied ? "Copied!" : "Copy as text"}
    </button>
  );
}
