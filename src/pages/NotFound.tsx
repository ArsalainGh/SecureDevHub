// ============================================================
// SecureDevHub — 404 page (security-themed)
// ============================================================
import { Home, Search, ShieldAlert } from "lucide-react";
import { useTitle } from "../lib/utils";

function AnimatedLock() {
  return (
    <svg
      className="lock-404"
      width="148"
      height="148"
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Animated padlock"
    >
      <defs>
        <linearGradient id="lockG" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="var(--primary-strong)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
      </defs>
      {/* shackle */}
      <g className="shackle">
        <path
          d="M15 21v-5a9 9 0 0 1 18 0v5"
          stroke="url(#lockG)"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
      </g>
      {/* body */}
      <rect x="9" y="21" width="30" height="22" rx="6" fill="var(--card)" stroke="url(#lockG)" strokeWidth="3" />
      {/* keyhole */}
      <circle cx="24" cy="30" r="3.2" fill="var(--primary)" />
      <rect x="22.6" y="31" width="2.8" height="7" rx="1.4" fill="var(--primary)" />
    </svg>
  );
}

export default function NotFound() {
  useTitle("404 — Page securely deleted — SecureDevHub");
  return (
    <div className="container-sdh py-5">
      <div className="text-center mx-auto" style={{ maxWidth: 560, paddingTop: 40, paddingBottom: 60 }}>
        <div className="d-flex justify-content-center mb-4"><AnimatedLock /></div>
        <div className="eyebrow mb-3" style={{ fontSize: "0.72rem" }}>Error 404 · Not Found</div>
        <h1 className="mt-3" style={{ fontSize: "clamp(1.9rem, 5vw, 3rem)", letterSpacing: "-0.03em" }}>
          This page has been <span className="grad-text">securely deleted</span>
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: "1.02rem", lineHeight: 1.75 }} className="mt-3">
          Either the URL was mistyped, or the resource was scrubbed to maintain perfect
          data hygiene. Our logs show the attacker used an outdated route — the
          oldest vulnerability on the web.
        </p>
        <div className="sd-card p-3 my-4 text-start">
          <div className="d-flex align-items-center gap-2 mb-2" style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--text-3)" }}>
            <ShieldAlert size={14} aria-hidden="true" /> incident report
          </div>
          <pre
            className="mb-0"
            style={{
              fontFamily: "var(--font-mono)", fontSize: "0.8rem", lineHeight: 1.9,
              color: "var(--text-2)", whiteSpace: "pre-wrap",
            }}
          >
            <span style={{ color: "var(--success)" }}>$</span> GET {typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "/unknown"}{"\n"}
            <span style={{ color: "var(--danger)" }}>HTTP/2 404</span> — route unmatched{"\n"}
            <span style={{ color: "var(--primary)" }}>action</span>: redirect to a safe, known-good destination
          </pre>
        </div>
        <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
          <a href="#/" className="btn-sdh primary">
            <Home size={16} aria-hidden="true" /> Back to safety
          </a>
          <button className="btn-sdh" onClick={() => window.dispatchEvent(new Event("sdh-open-search"))}>
            <Search size={16} aria-hidden="true" /> Search the site
          </button>
        </div>
        <p className="mt-4 mb-0" style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>
          Fun fact: a good 404 page reveals nothing about your stack. Ours only reveals our sense of humor.
        </p>
      </div>
    </div>
  );
}
