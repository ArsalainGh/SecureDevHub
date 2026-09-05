// ============================================================
// SecureDevHub — Module detail page (sections A → N)
// ============================================================
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Award, BookOpen, Check, CheckCircle2, ChevronDown,
  Clock, ExternalLink, Layers, ListChecks, Wrench,
} from "lucide-react";
import { CodeBlock } from "../components/CodeBlock";
import { CopyRulesButton, Quiz } from "../components/interactive";
import { ExtLink } from "../components/Chrome";
import { Icon, SeverityBadge } from "../components/ui";
import { useProgressTick } from "../components/cards";
import { adjacentModules, getModule, isModuleDone, MODULES, setModuleDone } from "../data/modules";
import type { SecurityModule } from "../data/types";
import { cx, go, toast, useTitle } from "../lib/utils";

/* scroll helper that accounts for the sticky navbar */
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

const SECTIONS = [
  ["sec-what", "What is it?"],
  ["sec-why", "Why care?"],
  ["sec-how", "Attack flow"],
  ["sec-vuln", "Vulnerable code"],
  ["sec-secure", "Secure code"],
  ["sec-compare", "Before vs after"],
  ["sec-rules", "Quick rules"],
  ["sec-quiz", "Quiz"],
  ["sec-mistakes", "Mistakes"],
  ["sec-tools", "Tools"],
  ["sec-reading", "Reading"],
] as const;

function SectionTitle({ n, title }: { n: string; title: string }) {
  return (
    <h2>
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-mono)", fontSize: "0.85rem", fontWeight: 700,
          color: "var(--primary)", background: "var(--primary-soft)",
          border: "1px solid color-mix(in srgb, var(--primary) 25%, transparent)",
          borderRadius: 8, width: 34, height: 34, display: "inline-grid", placeItems: "center", flexShrink: 0,
        }}
      >
        {n}
      </span>
      {title}
    </h2>
  );
}

export default function ModuleDetail({ id }: { id: string }) {
  const mod = getModule(id);
  useTitle(mod ? `${mod.title} — SecureDevHub` : "Module not found — SecureDevHub");
  useProgressTick();
  const [done, setDone] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (mod) setDone(isModuleDone(mod.id));
  }, [id, mod]);

  // handle "#rules"-style deep links from search
  useEffect(() => {
    const h = window.location.hash;
    const m = h.match(/#\/module\/[\w-]+#([\w-]+)/);
    if (m) setTimeout(() => scrollToId(`sec-${m[1].replace("sec-", "")}`), 150);
  }, [id]);

  const { prev, next } = useMemo(() => adjacentModules(id), [id]);
  const completed = useMemo(() => MODULES.filter((m) => isModuleDone(m.id)).length, [mod, done]);

  if (!mod) {
    return (
      <div className="container-sdh py-5 text-center">
        <h1 className="mt-5">Module not found</h1>
        <p style={{ color: "var(--text-2)" }}>That module doesn't exist (yet). Pick one from the curriculum.</p>
        <button className="btn-sdh primary" onClick={() => go("/modules")}>
          <Layers size={16} aria-hidden="true" /> All modules
        </button>
      </div>
    );
  }

  const firstVuln = mod.vulnerable[0];
  const firstSecure = mod.secure[0];

  return (
    <div className="container-sdh">
      <div className="row g-4 g-lg-5 py-4 py-lg-5">
        {/* ================= LEFT: sticky sidebar ================= */}
        <aside className="col-lg-3">
          <div className="d-lg-none mb-3">
            <button className="btn-sdh w-100" onClick={() => setNavOpen((o) => !o)} aria-expanded={navOpen}>
              <Layers size={16} aria-hidden="true" /> Module index
              <ChevronDown size={16} style={{ marginLeft: "auto", transform: navOpen ? "rotate(180deg)" : "none", transition: "transform .25s" }} aria-hidden="true" />
            </button>
          </div>
          <div className={cx("sidebar-nav", !navOpen && "d-none d-lg-block")} aria-label="Module navigation">
            <a href="#/modules" className="side-link mb-2">
              <ArrowLeft size={15} aria-hidden="true" /> All modules
            </a>
            <div className="px-2 py-2 mb-1">
              <div className="d-flex justify-content-between mb-2" style={{ fontSize: "0.78rem", color: "var(--text-2)" }}>
                <span className="fw-semibold">Your progress</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{completed}/16</span>
              </div>
              <div className="meter"><div style={{ width: `${(completed / 16) * 100}%` }} /></div>
            </div>
            {MODULES.map((m) => (
              <a
                key={m.id}
                href={`#/module/${m.id}`}
                className={cx("side-link", m.id === mod.id && "active")}
                aria-current={m.id === mod.id ? "page" : undefined}
              >
                <span className="n" aria-hidden="true">{String(m.number).padStart(2, "0")}</span>
                <span className="flex-grow-1 text-truncate">{m.title}</span>
                {isModuleDone(m.id) && <Check size={14} style={{ color: "var(--success)", flexShrink: 0 }} aria-label="Completed" />}
              </a>
            ))}
          </div>
        </aside>

        {/* ================= RIGHT: content ================= */}
        <article className="col-lg-9" style={{ minWidth: 0 }}>
          {/* --- SECTION A: header --- */}
          <nav className="breadcrumb-sdh mb-3" aria-label="Breadcrumb">
            <a href="#/modules" style={{ color: "var(--text-2)" }}>Modules</a>
            <span aria-hidden="true" style={{ color: "var(--text-3)" }}>/</span>
            <span style={{ color: "var(--text)" }} aria-current="page">{mod.title}</span>
          </nav>

          <div className="d-flex align-items-start gap-3 flex-wrap">
            <span className="icon-tile" style={{ width: 56, height: 56, borderRadius: 15 }}><Icon name={mod.icon} size={26} /></span>
            <div className="flex-grow-1" style={{ minWidth: 240 }}>
              <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                <SeverityBadge sev={mod.severity} />
                <span className="badge-sdh badge-neutral">{mod.difficulty}</span>
                {done && <span className="badge-sdh badge-success"><Check size={11} aria-hidden="true" /> Completed</span>}
              </div>
              <h1 style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.3rem)", letterSpacing: "-0.03em" }}>
                {mod.title}
              </h1>
              <div className="d-flex align-items-center flex-wrap gap-3 mt-2" style={{ color: "var(--text-2)", fontSize: "0.85rem" }}>
                <span className="d-inline-flex align-items-center gap-1"><Clock size={14} aria-hidden="true" /> {mod.time} read</span>
                <span>Updated {mod.updated}</span>
                <ExtLink href={mod.owaspUrl} className="d-inline-flex align-items-center gap-1">
                  <BookOpen size={13} aria-hidden="true" /> {mod.owaspLabel}
                </ExtLink>
              </div>
            </div>
          </div>
          <p className="mt-3 mb-4" style={{ color: "var(--text-2)", fontSize: "1.04rem", lineHeight: 1.75, maxWidth: 720 }}>{mod.tagline}</p>

          {/* quick section links */}
          <div className="d-flex flex-wrap gap-2 mb-5" role="navigation" aria-label="Jump to section">
            {SECTIONS.map(([sid, label]) => (
              <button key={sid} className="filter-chip" style={{ fontSize: "0.72rem", padding: "4px 11px" }} onClick={() => scrollToId(sid)}>
                {label}
              </button>
            ))}
          </div>

          {/* --- SECTION B: what is it --- */}
          <section id="sec-what" className="section-block mb-5" aria-labelledby="h-what">
            <div id="h-what"><SectionTitle n="B" title="What is it?" /></div>
            <div className="prose-sdh"><p>{mod.what.text}</p></div>
            <div className="sd-card p-4 my-3" style={{ borderLeft: "3px solid var(--primary)" }}>
              <div className="fw-semibold mb-1 d-flex align-items-center gap-2" style={{ fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--primary)" }}>
                Think of it like this
              </div>
              <p className="mb-0" style={{ color: "var(--text-2)", fontStyle: "italic", lineHeight: 1.7 }}>{mod.what.analogy}</p>
            </div>
            <div className="d-flex flex-wrap gap-2 mt-3" aria-label="Key terms (hover or focus for definitions)">
              {mod.what.terms.map((t) => (
                <span key={t.term} className="term" tabIndex={0} aria-label={`${t.term}: ${t.def}`}>
                  {t.term}
                  <span className="tip" role="tooltip">{t.def}</span>
                </span>
              ))}
            </div>
          </section>

          {/* --- SECTION C: why should you care --- */}
          <section id="sec-why" className="section-block mb-5" aria-labelledby="h-why">
            <div id="h-why"><SectionTitle n="C" title="Why should you care?" /></div>
            <div className="prose-sdh"><p>{mod.why.text}</p></div>
            <div className="row g-3 my-3">
              {mod.why.breaches.map((b) => (
                <div className="col-md-6" key={b.company}>
                  <div className="sd-card breach-card h-100">
                    <div className="company">
                      {b.company}
                      <span className="num-badge ms-auto">{b.year}</span>
                    </div>
                    <div className="impact mt-1">{b.impact}</div>
                    <p className="details mb-0">{b.details}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="row g-3">
              {mod.why.stats.map((s) => (
                <div className="col-md-4" key={s.value}>
                  <div className="sd-card p-3 text-center h-100">
                    <div style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--primary)" }}>{s.value}</div>
                    <div style={{ color: "var(--text-2)", fontSize: "0.8rem", lineHeight: 1.5, marginTop: 4 }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* --- SECTION D: how the attack works --- */}
          <section id="sec-how" className="section-block mb-5" aria-labelledby="h-how">
            <div id="h-how"><SectionTitle n="D" title="How the attack works" /></div>
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="attack-flow" aria-label="Attack steps">
                  {mod.how.steps.map((s, i) => (
                    <div className="flow-step" key={i}>
                      <span className="flow-num" aria-hidden="true">{i + 1}</span>
                      <p className="flow-body mb-0">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-6">
                <div className="d-grid gap-3">
                  {mod.how.types.map((t) => (
                    <div className="sd-card p-3 d-flex gap-3" key={t.name}>
                      <span className="icon-tile danger" style={{ width: 38, height: 38, borderRadius: 10 }}><Icon name="bug" size={17} /></span>
                      <div>
                        <div className="fw-bold" style={{ fontSize: "0.93rem" }}>{t.name}</div>
                        <div style={{ color: "var(--text-2)", fontSize: "0.85rem", lineHeight: 1.6, marginTop: 2 }}>{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* --- SECTION E: vulnerable code --- */}
          <section id="sec-vuln" className="section-block mb-5" aria-labelledby="h-vuln">
            <div id="h-vuln"><SectionTitle n="E" title="Vulnerable code" /></div>
            <p style={{ color: "var(--text-2)", fontSize: "0.92rem", marginTop: -8, marginBottom: 14 }}>
              Study the red lines — each is an exploit waiting for a payload.
            </p>
            <CodeBlock tabs={mod.vulnerable} banner="warn" title="Vulnerable code examples" />
          </section>

          {/* --- SECTION F: secure code --- */}
          <section id="sec-secure" className="section-block mb-5" aria-labelledby="h-secure">
            <div id="h-secure"><SectionTitle n="F" title="Secure code" /></div>
            <p style={{ color: "var(--text-2)", fontSize: "0.92rem", marginTop: -8, marginBottom: 14 }}>
              The same functionality, hardened. Green lines mark the defenses.
            </p>
            <CodeBlock tabs={mod.secure} banner="ok" title="Secure code examples" />
            <div className="mt-3">
              <div className="fw-semibold mb-2 d-flex align-items-center gap-2" style={{ fontSize: "0.9rem" }}>
                <CheckCircle2 size={16} style={{ color: "var(--success)" }} aria-hidden="true" /> What changed, line by line
              </div>
              <ul className="prose-sdh m-0" style={{ paddingLeft: 22 }}>
                {mod.fixes.map((f, i) => (<li key={i} style={{ fontSize: "0.9rem" }}>{f}</li>))}
              </ul>
            </div>
          </section>

          {/* --- SECTION G: before vs after --- */}
          <section id="sec-compare" className="section-block mb-5" aria-labelledby="h-compare">
            <div id="h-compare"><SectionTitle n="G" title="Before vs after" /></div>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="badge-sdh badge-critical mb-2">Before — exploitable</div>
                <CodeBlock tabs={[{ ...firstVuln, label: firstVuln.label || "Vulnerable" }]} title="Vulnerable version" />
              </div>
              <div className="col-md-6">
                <div className="badge-sdh badge-success mb-2">After — hardened</div>
                <CodeBlock tabs={[{ ...firstSecure, label: firstSecure.label || "Secure" }]} title="Secure version" />
              </div>
            </div>
          </section>

          {/* --- SECTION H: quick rules --- */}
          <section id="sec-rules" className="section-block mb-5" aria-labelledby="h-rules">
            <div id="h-rules"><SectionTitle n="H" title="Quick rules to follow" /></div>
            <div className="d-flex justify-content-end mb-3"><CopyRulesButton rules={mod.rules} /></div>
            <div className="d-grid gap-2">
              {mod.rules.map((r, i) => (
                <div className="sd-card rule-card" key={i}>
                  <span className="rn" aria-hidden="true">{i + 1}</span>
                  <span style={{ fontSize: "0.93rem", lineHeight: 1.6, color: "var(--text)" }}>{r}</span>
                </div>
              ))}
            </div>
          </section>

          {/* --- SECTION I: quiz --- */}
          <section id="sec-quiz" className="section-block mb-5" aria-labelledby="h-quiz">
            <div id="h-quiz"><SectionTitle n="I" title="Test yourself" /></div>
            <Quiz id={mod.id} questions={mod.quiz} />
          </section>

          {/* --- SECTION J: common mistakes --- */}
          <section id="sec-mistakes" className="section-block mb-5" aria-labelledby="h-mistakes">
            <div id="h-mistakes"><SectionTitle n="J" title="Common mistakes" /></div>
            <MistakesAccordion mod={mod} />
          </section>

          {/* --- SECTION K: tools --- */}
          <section id="sec-tools" className="section-block mb-5" aria-labelledby="h-tools">
            <div id="h-tools"><SectionTitle n="K" title="Tools for this topic" /></div>
            <div className="row g-3">
              {mod.tools.map((t) => (
                <div className="col-md-6" key={t.name}>
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sd-card hover glow p-3 d-flex gap-3 h-100"
                    style={{ textDecoration: "none" }}
                    aria-label={`${t.name} — ${t.desc} (opens in a new tab)`}
                  >
                    <span className="icon-tile"><Wrench size={17} aria-hidden="true" /></span>
                    <span className="flex-grow-1">
                      <span className="d-flex align-items-center gap-2 flex-wrap">
                        <strong style={{ fontSize: "0.95rem", color: "var(--text)" }}>{t.name}</strong>
                        <span className={cx("badge-sdh", t.price === "Free" ? "badge-success" : t.price === "Freemium" ? "badge-info" : "badge-medium")}>{t.price}</span>
                      </span>
                      <span className="d-block mt-1" style={{ color: "var(--text-2)", fontSize: "0.85rem", lineHeight: 1.55 }}>{t.desc}</span>
                    </span>
                    <ExternalLink size={15} style={{ color: "var(--text-3)", flexShrink: 0, marginTop: 4 }} aria-hidden="true" />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* --- SECTION L: further reading --- */}
          <section id="sec-reading" className="section-block mb-5" aria-labelledby="h-reading">
            <div id="h-reading"><SectionTitle n="L" title="Further reading" /></div>
            <div className="d-grid gap-2">
              {mod.reading.map((r) => (
                <a
                  key={r.title}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sd-card hover p-3 d-flex align-items-center gap-3"
                  style={{ textDecoration: "none" }}
                >
                  <span className="icon-tile" style={{ width: 36, height: 36, borderRadius: 9 }}><BookOpen size={15} aria-hidden="true" /></span>
                  <span className="flex-grow-1" style={{ minWidth: 0 }}>
                    <span className="d-block fw-semibold text-truncate" style={{ fontSize: "0.92rem", color: "var(--text)" }}>{r.title}</span>
                    <span style={{ color: "var(--text-3)", fontSize: "0.78rem" }}>{r.source}</span>
                  </span>
                  <span className="badge-sdh badge-neutral">{r.type}</span>
                  <ExternalLink size={14} style={{ color: "var(--text-3)" }} aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>

          {/* --- SECTION M: mark complete --- */}
          <section className="mb-5" aria-label="Completion">
            <div className="sd-card p-4 d-flex flex-wrap align-items-center gap-3" style={done ? { borderColor: "var(--success)" } : {}}>
              <span className={cx("icon-tile", done && "success")} style={{ width: 48, height: 48, borderRadius: 13 }}>
                <Award size={22} aria-hidden="true" />
              </span>
              <div className="flex-grow-1" style={{ minWidth: 200 }}>
                <div className="fw-bold">{done ? "Module completed — nicely done." : "Finished this module?"}</div>
                <div style={{ color: "var(--text-2)", fontSize: "0.86rem" }}>
                  {done ? "It's checked off on your modules page." : "Mark it complete to track your progress across all 16 modules."}
                </div>
              </div>
              <button
                className={cx("btn-sdh", done ? "success" : "primary")}
                onClick={() => {
                  const next2 = !done;
                  setDone(next2);
                  setModuleDone(mod.id, next2);
                  toast(next2 ? "Module marked complete" : "Module marked incomplete");
                }}
                aria-pressed={done}
              >
                <Check size={16} aria-hidden="true" />
                {done ? "Completed" : "Mark as Complete"}
              </button>
            </div>
          </section>

          {/* --- SECTION N: pagination --- */}
          <nav className="d-flex flex-wrap gap-3 justify-content-between mb-5" aria-label="Module pagination">
            {prev ? (
              <a href={`#/module/${prev.id}`} className="btn-sdh">
                <ArrowLeft size={16} aria-hidden="true" />
                <span className="d-none d-sm-inline">Previous:</span> {prev.title.length > 24 ? prev.title.slice(0, 24) + "…" : prev.title}
              </a>
            ) : <span />}
            {next ? (
              <a href={`#/module/${next.id}`} className="btn-sdh primary">
                <span className="d-none d-sm-inline">Next:</span> {next.title.length > 24 ? next.title.slice(0, 24) + "…" : next.title}
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            ) : (
              <a href="#/checklists" className="btn-sdh primary">
                Finish line — run the checklists <ListChecks size={16} aria-hidden="true" />
              </a>
            )}
          </nav>
        </article>
      </div>
    </div>
  );
}

/* ----- mistakes accordion ----- */
function MistakesAccordion({ mod }: { mod: SecurityModule }) {
  const [open, setOpen] = useState(0);
  return (
    <div>
      {mod.mistakes.map((m, i) => {
        const isOpen = open === i;
        return (
          <div className={cx("acc-item", isOpen && "open")} key={i}>
            <button
              className="acc-head"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              aria-controls={`mistake-${mod.id}-${i}`}
            >
              <span className="icon-tile danger" style={{ width: 30, height: 30, borderRadius: 8 }}>
                <Icon name="bug" size={14} />
              </span>
              {m.mistake}
              <ChevronDown size={17} className="chev" aria-hidden="true" />
            </button>
            {isOpen && (
              <div className="acc-body" id={`mistake-${mod.id}-${i}`}>
                {m.explanation}
                <div className="acc-fix">
                  <Check size={15} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                  <span><strong>The fix:</strong> {m.fix}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
