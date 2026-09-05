// ============================================================
// SecureDevHub — curated tools & resources directory
// ============================================================
import { useMemo, useState } from "react";
import { Search, Wrench } from "lucide-react";
import { ToolCard } from "../components/cards";
import { PageHead } from "../components/ui";
import { TOOL_CATEGORIES, TOOLS } from "../data/tools";
import { cx, useTitle } from "../lib/utils";

export default function Tools() {
  useTitle("Tools & Resources — SecureDevHub");
  const [cat, setCat] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      if (cat !== "All" && t.category !== cat) return false;
      if (q && !`${t.name} ${t.desc} ${t.tags.join(" ")}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [cat, query]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of TOOLS) map[t.category] = (map[t.category] || 0) + 1;
    return map;
  }, []);

  return (
    <>
      <PageHead
        eyebrow="The Toolbox"
        title="Tools & Resources"
        desc="Thirty-plus hand-picked tools the pros actually use — scanners, header analyzers, dependency auditors, hardened libraries and free learning platforms. No affiliate links, ever."
      >
        <div className="badge-sdh badge-info" style={{ fontSize: "0.78rem" }}>
          <Wrench size={13} aria-hidden="true" /> {TOOLS.length} tools · curated
        </div>
      </PageHead>

      <div className="container-sdh py-5">
        <div className="sd-card p-3 p-md-4 mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-lg-4">
              <div className="input-wrap">
                <Search size={16} aria-hidden="true" />
                <input
                  className="input-sdh"
                  placeholder="Search tools… (e.g. zap, csp, password)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search tools"
                />
              </div>
            </div>
            <div className="col-lg-8" role="tablist" aria-label="Filter by category">
              <div className="d-flex flex-wrap gap-2">
                {TOOL_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={cat === c}
                    className={cx("filter-chip", cat === c && "active")}
                    onClick={() => setCat(c)}
                  >
                    {c}
                    <span className="kbd" style={{ fontSize: "0.62rem" }}>{c === "All" ? TOOLS.length : counts[c] || 0}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3" aria-live="polite" style={{ color: "var(--text-3)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
          {filtered.length} tool{filtered.length === 1 ? "" : "s"} {cat !== "All" ? `in ${cat}` : ""}
        </div>

        {filtered.length === 0 ? (
          <div className="sd-card p-5 text-center" role="status">
            <p className="fw-semibold mb-1">No tools match.</p>
            <p style={{ color: "var(--text-2)" }}>Try “scanner”, “headers”, “xss” or clear the category filter.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filtered.map((t) => (
              <div className="col-md-6 col-lg-4" key={t.id}>
                <ToolCard tool={t} />
              </div>
            ))}
          </div>
        )}

        {/* honorable mention */}
        <div className="sd-card p-4 mt-5 d-flex flex-wrap align-items-center gap-3">
          <span className="icon-tile success"><Wrench size={18} aria-hidden="true" /></span>
          <p className="mb-0 flex-grow-1" style={{ color: "var(--text-2)", fontSize: "0.9rem", lineHeight: 1.65, minWidth: 240 }}>
            <strong style={{ color: "var(--text)" }}>Missing your favorite?</strong> This directory is intentionally opinionated.
            Suggest additions via a GitHub issue — the bar is: actively maintained, genuinely useful, honest pricing.
          </p>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-sdh sm">
            Suggest a tool
          </a>
        </div>
      </div>
    </>
  );
}
