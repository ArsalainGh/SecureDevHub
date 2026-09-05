// ============================================================
// SecureDevHub — Playground: Spot the Bug
// ============================================================
import { useState } from "react";
import { Bug, Check, Gamepad2, RotateCcw, Trophy } from "lucide-react";
import { ChallengeCard } from "../components/interactive";
import { Icon, PageHead, Reveal } from "../components/ui";
import { useProgressTick } from "../components/cards";
import { CHALLENGES, resetChallenges, solvedChallenges } from "../data/playground";
import { store, toast, useTitle } from "../lib/utils";

export default function Playground() {
  useTitle("Spot the Bug — SecureDevHub Playground");
  const [tick, setTick] = useState(0);
  useProgressTick();
  const solved = solvedChallenges();
  const pct = Math.round((solved.length / CHALLENGES.length) * 100);

  return (
    <>
      <PageHead
        eyebrow="Practice Arena"
        title="Spot the Bug"
        desc="Can you find the security vulnerability in these code snippets? Every challenge is based on a real audit finding. Solve them all — your progress saves locally."
      >
        <div className="badge-sdh badge-success" style={{ fontSize: "0.78rem" }}>
          <Gamepad2 size={13} aria-hidden="true" /> No signup · instant feedback
        </div>
      </PageHead>

      <div className="container-sdh py-5" key={tick}>
        {/* score card */}
        <Reveal>
          <div className="sd-card p-4 mb-5">
            <div className="d-flex flex-wrap align-items-center gap-3">
              <span className="icon-tile" style={{ width: 52, height: 52, borderRadius: 14 }}>
                {solved.length === CHALLENGES.length ? <Trophy size={24} aria-hidden="true" style={{ color: "var(--warning)" }} /> : <Bug size={24} aria-hidden="true" />}
              </span>
              <div className="flex-grow-1" style={{ minWidth: 200 }}>
                <div className="fw-bold" style={{ fontSize: "1.05rem" }}>
                  {solved.length === CHALLENGES.length
                    ? "Perfect sweep — all challenges solved."
                    : `You've solved ${solved.length}/${CHALLENGES.length} challenges`}
                </div>
                <div style={{ color: "var(--text-2)", fontSize: "0.86rem" }}>
                  {solved.length === CHALLENGES.length
                    ? "Your instincts are production-grade. Send this to a teammate and watch them sweat."
                    : "Pick the right option on the first try to solve. Explanations unlock either way."}
                </div>
              </div>
              <div style={{ minWidth: 200, flex: "0 1 240px" }}>
                <div className="d-flex justify-content-between mb-1" style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>
                  <span>Score</span>
                  <span style={{ fontFamily: "var(--font-mono)" }} className="fw-bold">{solved.length}/{CHALLENGES.length}</span>
                </div>
                <div className="meter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Challenges solved">
                  <div style={{ width: `${Math.max(pct, solved.length ? 4 : 0)}%` }} />
                </div>
              </div>
              <button
                className="btn-sdh sm danger-ghost"
                onClick={() => {
                  resetChallenges();
                  store.del("sdh_pg_picks");
                  setTick((t) => t + 1);
                  toast("Playground progress reset");
                }}
              >
                <RotateCcw size={14} aria-hidden="true" /> Reset Progress
              </button>
            </div>
          </div>
        </Reveal>

        {/* legend */}
        <div className="d-flex flex-wrap gap-3 mb-4" style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>
          <span className="d-inline-flex align-items-center gap-2"><Bug size={14} aria-hidden="true" /> Difficulty:</span>
          <span className="badge-sdh badge-success">Easy — warmup</span>
          <span className="badge-sdh badge-medium">Medium — audit level</span>
          <span className="badge-sdh badge-critical">Hard — bounty level</span>
          <span className="ms-auto d-none d-md-flex align-items-center gap-2"><Check size={14} aria-hidden="true" style={{ color: "var(--success)" }} /> solved state persists in this browser</span>
        </div>

        {/* challenges */}
        <div className="row g-4">
          {CHALLENGES.map((c, i) => (
            <div className="col-lg-6" key={c.id}>
              <ChallengeCard challenge={c} index={i} total={CHALLENGES.length} />
            </div>
          ))}
        </div>

        {/* footer CTA */}
        <div className="sd-card p-4 mt-5 d-flex flex-wrap align-items-center gap-3">
          <span className="icon-tile"><Icon name="graduation-cap" size={20} /></span>
          <p className="mb-0 flex-grow-1" style={{ color: "var(--text-2)", minWidth: 240, fontSize: "0.92rem", lineHeight: 1.65 }}>
            <strong style={{ color: "var(--text)" }}>Want the theory behind each bug?</strong> Every challenge maps to a module —
            the SQLi and XSS modules cover these exact patterns in depth.
          </p>
          <a href="#/modules" className="btn-sdh primary sm">Open the modules</a>
        </div>
      </div>
    </>
  );
}
