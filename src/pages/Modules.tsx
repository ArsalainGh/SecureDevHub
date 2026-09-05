// ============================================================
// SecureDevHub — Modules listing page (filter + search + progress)
// ============================================================
import { useMemo, useState } from "react";
import { CheckCircle2, GraduationCap, Search, SlidersHorizontal } from "lucide-react";
import { ModuleCard, useProgressTick } from "../components/cards";
import { PageHead } from "../components/ui";
import { CATEGORY_LABELS, MODULES, completedCount } from "../data/modules";
import type { Category, Severity } from "../data/types";
import { cx, useTitle } from "../lib/utils";

const SEV_FILTERS: Array<{ id: Severity | "all"; label: string }> = [
  { id: "all", label: "All severities" },
  { id: "critical", label: "Critical" },
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
];
const CAT_FILTERS: Array<{ id: Category | "all"; label: string }> = [
  { id: "all", label: "All categories" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "devops", label: "DevOps" },
  { id: "general", label: "General" },
];

export default function Modules() {
  useTitle("Learning Modules — SecureDevHub");
  useProgressTick();
  const [sev, setSev] = useState<Severity | "all">("all");
  const [cat, setCat] = useState<Category | "all">("all");
  const [query, setQuery] = useState("");

  const done = completedCount();
  const pct = Math.round((done / MODULES.length) * 100);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MODULES.filter((m) => {
      if (sev !== "all" && m.severity !== sev) return false;
      if (cat !== "all" && !m.categories.includes(cat)) return false;
      if (q && !`${m.title} ${m.tagline} ${m.owaspLabel}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [sev, cat, query]);

  return (
    <>
      <PageHead
        eyebrow="The Curriculum"
        title="Learning Modules"
        desc="Sixteen plain-English modules covering the vulnerabilities that actually get sites breached — from XSS to secrets management. Track your progress as you go."
      >
        <div className="d-flex align-items-center gap-2 badge-sdh badge-info" style={{ fontSize: "0.78rem" }}>
          <GraduationCap size={13} aria-hidden="true" /> Free forever · No signup
        </div>
      </PageHead>

      <div className="container-sdh py-5">
        {/* overall progress */}
        <div className="sd-card p-4 mb-4 d-flex flex-wrap align-items-center gap-3" role="region" aria-label="Your learning progress">
          <span className="icon-tile"><CheckCircle2 size={20} aria-hidden="true" /></span>
          <div className="flex-grow-1" style={{ minWidth: 220 }}>
            <div className="d-flex justify-content-between flex-wrap gap-1 mb-2">
              <strong style={{ fontSize: "0.95rem" }}>
                {done === MODULES.length ? "Curriculum complete — you're dangerous now." : `Your progress: ${done} of ${MODULES.length} modules`}
              </strong>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--text-2)" }}>{pct}%</span>
            </div>
            <div className="meter" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Module completion">
              <div style={{ width: `${Math.max(pct, done ? 4 : 0)}%` }} />
            </div>
          </div>
        </div>

        {/* filters */}
        <div className="sd-card p-3 p-md-4 mb-4" role="region" aria-label="Module filters">
          <div className="row g-3 align-items-center">
            <div className="col-lg-4">
              <div className="input-wrap">
                <Search size={16} aria-hidden="true" />
                <input
                  className="input-sdh"
                  placeholder="Filter modules… (e.g. xss, jwt, headers)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Filter modules by keyword"
                />
              </div>
            </div>
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <SlidersHorizontal size={15} style={{ color: "var(--text-3)" }} aria-hidden="true" />
                {SEV_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    className={cx("filter-chip", sev === f.id && "active", f.id !== "all" && `sev-${f.id}`)}
                    onClick={() => setSev(f.id)}
                    aria-pressed={sev === f.id}
                  >
                    {f.id !== "all" && <span className="dot" style={{ width: 6, height: 6, borderRadius: 6, background: "currentColor" }} aria-hidden="true" />}
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap mt-2" aria-label="Category filters">
                {CAT_FILTERS.map((f) => (
                  <button key={f.id} className={cx("filter-chip", cat === f.id && "active")} onClick={() => setCat(f.id)} aria-pressed={cat === f.id} style={{ fontSize: "0.78rem" }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* grid */}
        <div className="d-flex justify-content-between align-items-center mb-3" aria-live="polite">
          <span style={{ color: "var(--text-3)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
            {filtered.length} module{filtered.length === 1 ? "" : "s"}
          </span>
          {(sev !== "all" || cat !== "all" || query) && (
            <button className="copy-btn" onClick={() => { setSev("all"); setCat("all"); setQuery(""); }}>
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="sd-card p-5 text-center" role="status">
            <p className="mb-1 fw-semibold">No modules match those filters.</p>
            <p style={{ color: "var(--text-2)" }}>Try clearing a filter or searching for something like “xss”, “headers” or “jwt”.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filtered.map((m) => (
              <div className="col-md-6 col-lg-4" key={m.id}>
                <ModuleCard mod={m} />
              </div>
            ))}
          </div>
        )}

        {/* category legend */}
        <div className="mt-5 d-flex flex-wrap gap-3 justify-content-center" style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <span key={k} className="d-inline-flex align-items-center gap-1">
              <span className="tag-chip">{v}</span>
            </span>
          ))}
          <span>· badges mark exploitability: red = critical, orange = high, yellow = medium</span>
        </div>
      </div>
    </>
  );
}
