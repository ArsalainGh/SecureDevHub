// ============================================================
// SecureDevHub — Home page
// ============================================================
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Banknote, BookOpen, Check, CircleCheck, Crosshair, ListChecks, Mail, ShieldCheck, Target, UserX } from "lucide-react";
import { ModuleCard, ToolCard } from "../components/cards";
import { ChallengeCard } from "../components/interactive";
import { Reveal, SectionHead, ArrowCta } from "../components/ui";
import { MODULES, FEATURED_IDS } from "../data/modules";
import { TOOLS } from "../data/tools";
import { CHALLENGES } from "../data/playground";
import { useCountUp, useTitle } from "../lib/utils";

/* ----------------- animated hero terminal ----------------- */
interface TLine { prompt?: boolean; cls?: string; text: string }
const SCRIPT: TLine[] = [
  { cls: "t-comment", text: "# ── the attack: reflected XSS ──────────────" },
  { prompt: true, text: "curl -s \"https://app.example/search?q=<script>steal(document.cookie)</script>\"" },
  { text: "HTTP/2 200 OK   — payload reflected into the page" },
  { cls: "t-alert", text: "[!!] script executes · cookie → evil.tld · session hijacked" },
  { cls: "t-comment", text: "" },
  { cls: "t-comment", text: "# ── the fix: encode + CSP + HttpOnly ─────" },
  { prompt: true, text: "curl -s \"https://app.example/search?q=<script>steal(document.cookie)</script>\"" },
  { text: "HTTP/2 200 OK   — output encoded: &lt;script&gt; is inert text" },
  { cls: "t-ok", text: "[OK] CSP blocks inline scripts · HttpOnly hides cookies" },
  { cls: "t-ok", text: "[OK] attack neutralized — write code, ship secure" },
];

function HeroTerminal() {
  const total = useMemo(() => SCRIPT.reduce((a, l) => a + l.text.length + 1, 0), []);
  const [chars, setChars] = useState(0);
  const done = chars >= total;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setChars(total);
      return;
    }
    const start = setTimeout(() => {
      const iv = setInterval(() => {
        setChars((c) => {
          if (c >= total) { clearInterval(iv); return c; }
          return c + 2;
        });
      }, 16);
    }, 700);
    return () => clearTimeout(start);
  }, [total]);

  let budget = chars;
  return (
    <div className="terminal" role="img" aria-label="Animated terminal showing an XSS attack being blocked by output encoding, CSP and HttpOnly cookies">
      <div className="code-head">
        <div className="code-dots" aria-hidden="true"><span /><span /><span /></div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--text-3)" }}>
          securedevhub — live: xss → fixed
        </span>
      </div>
      <div className="terminal-body">
        {SCRIPT.map((line, i) => {
          const len = line.text.length;
          if (budget <= 0 && line.text.length > 0) return <div key={i} className="t-line" style={{ visibility: "hidden" }} aria-hidden="true">&nbsp;</div>;
          const shown = Math.min(len, Math.max(0, budget));
          budget -= len + 1;
          const isActive = shown < len;
          return (
            <div key={i} className="t-line">
              {line.prompt && <span className="t-prompt" aria-hidden="true">$</span>}
              <span className={line.cls}>
                {line.text.slice(0, shown)}
                {isActive && <span className="t-cursor" aria-hidden="true" />}
              </span>
            </div>
          );
        })}
        {done && (
          <div className="t-line">
            <span className="t-prompt" aria-hidden="true">$</span>
            <span className="t-cursor" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------- animated stat ----------------- */
function Stat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const n = useCountUp(value);
  return (
    <div className="stat-cell">
      <div className="stat-num">
        {n.toLocaleString()}
        {suffix && <span style={{ color: "var(--primary)" }}>{suffix}</span>}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/* ----------------- page ----------------- */
export default function Home() {
  useTitle("SecureDevHub — Write Code. Ship Secure.");
  const featured = MODULES.filter((m) => FEATURED_IDS.includes(m.id));
  const toolsPreview = TOOLS.filter((t) => ["zap", "securityheaders", "snyk", "dompurify", "portswigger", "ssllabs"].includes(t.id));
  const [subscribed, setSubscribed] = useState(false);

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="container-sdh position-relative">
          <div className="text-center mx-auto" style={{ maxWidth: 780 }}>
            <Reveal>
              <span className="eyebrow mb-4">Free · Open Source · For Every Web Developer</span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-3 mb-3">
                Write Code.
                <br />
                <span className="grad-text">Ship Secure.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p style={{ color: "var(--text-2)", fontSize: "clamp(1.02rem, 2vw, 1.2rem)", lineHeight: 1.75, maxWidth: 640, margin: "0 auto" }}>
                A free, open-source security guide for web developers. Learn the
                vulnerabilities that take sites down, fix them with real code,
                and never ship insecure code again.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="d-flex justify-content-center gap-3 flex-wrap mt-4 mb-5">
                <a href="#/modules" className="btn-sdh primary">
                  <BookOpen size={17} aria-hidden="true" /> Start Learning
                </a>
                <a href="#/checklists" className="btn-sdh">
                  <ListChecks size={17} aria-hidden="true" /> View Checklists
                </a>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <HeroTerminal />
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="stat-bar mt-5" role="list" aria-label="Site statistics">
              <Stat value={16} label="Learning Modules" />
              <Stat value={5} label="Security Checklists" />
              <Stat value={30} suffix="+" label="Curated Tools" />
              <Stat value={100} suffix="%" label="Free Forever" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ WHY SECURITY MATTERS ============ */}
      <section className="section" aria-labelledby="why-security">
        <div className="container-sdh">
          <SectionHead
            center
            eyebrow="Why It Matters"
            title="Security debt collects interest — in breaches"
            desc="These aren't edge cases. They're the industry baseline, and they're why the next app you ship should be hardened on day one."
          />
          <div className="row g-4">
            {[
              { icon: <Target size={24} aria-hidden="true" />, num: "43%", title: "of cyber attacks target small businesses", text: "Attackers automate everything — small sites get scanned by the same bots as banks. Size is not a defense.", tone: "danger" },
              { icon: <Banknote size={24} aria-hidden="true" />, num: "$4.45M", title: "average cost of a single data breach", text: "IBM's Cost of a Data Breach report. Prevention is measured in engineering hours; response is measured in millions.", tone: "warning" },
              { icon: <UserX size={24} aria-hidden="true" />, num: "95%", title: "of breaches involve preventable human error", text: "Not zero-days: misconfigurations, weak passwords, unpatched dependencies. Exactly what this site teaches.", tone: "success" },
            ].map((c, i) => (
              <div className="col-md-4" key={c.num}>
                <Reveal delay={i * 110} className="h-100">
                  <div className="sd-card hover p-4 h-100 text-center">
                    <div className="d-flex justify-content-center mb-3">
                      <span className={`icon-tile ${c.tone}`} style={{ width: 56, height: 56, borderRadius: 16 }}>{c.icon}</span>
                    </div>
                    <div style={{ fontSize: "2.4rem", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1 }}>{c.num}</div>
                    <div className="fw-semibold mt-2 mb-2" style={{ fontSize: "0.98rem" }}>{c.title}</div>
                    <p className="mb-0" style={{ color: "var(--text-2)", fontSize: "0.87rem", lineHeight: 1.65 }}>{c.text}</p>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURED MODULES ============ */}
      <section className="section" style={{ background: "var(--bg-2)", borderBlock: "1px solid var(--border-soft)" }} aria-labelledby="featured">
        <div className="container-sdh">
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
            <SectionHead
              eyebrow="The Curriculum"
              title="16 modules, zero jargon"
              desc="Every vulnerability explained in plain English, with vulnerable vs secure code side-by-side, a quiz, and the tools professionals use."
            />
            <div className="mb-4"><ArrowCta to="/modules">View All Modules</ArrowCta></div>
          </div>
          <div className="row g-4">
            {featured.map((m) => (
              <div className="col-md-6 col-lg-4" key={m.id}>
                <ModuleCard mod={m} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="section" aria-labelledby="how">
        <div className="container-sdh">
          <SectionHead center eyebrow="How It Works" title="Learn. Practice. Apply." desc="A tight loop designed for busy developers — no 40-hour courses, no hand-waving." />
          <div className="row g-4">
            {[
              { n: "01", icon: <BookOpen size={20} aria-hidden="true" />, title: "Learn", text: "Understand each vulnerability with plain-English explanations, real breach stories and attack-flow diagrams." },
              { n: "02", icon: <Crosshair size={20} aria-hidden="true" />, title: "Practice", text: "See vulnerable vs secure code side-by-side in JavaScript, Python and PHP — then prove it in Spot the Bug challenges." },
              { n: "03", icon: <ShieldCheck size={20} aria-hidden="true" />, title: "Apply", text: "Run your projects through interactive checklists that save your progress and export to markdown or PDF." },
            ].map((s, i) => (
              <div className="col-md-4" key={s.n}>
                <Reveal delay={i * 120} className="h-100">
                  <div className="sd-card hover p-4 h-100" style={{ position: "relative" }}>
                    <span style={{ position: "absolute", top: 20, right: 22, fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-3)" }} aria-hidden="true">{s.n}</span>
                    <span className="step-num mb-3">{s.icon}</span>
                    <h3 style={{ fontSize: "1.2rem" }}>{s.title}</h3>
                    <p className="mb-0" style={{ color: "var(--text-2)", fontSize: "0.92rem", lineHeight: 1.7 }}>{s.text}</p>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ INTERACTIVE DEMO ============ */}
      <section className="section" style={{ background: "var(--bg-2)", borderBlock: "1px solid var(--border-soft)" }} aria-labelledby="demo">
        <div className="container-sdh">
          <div className="row g-5 align-items-center">
            <div className="col-lg-5">
              <Reveal>
                <span className="eyebrow mb-3">Try It Right Now</span>
                <h2 className="mt-2 mb-3" style={{ fontSize: "clamp(1.7rem, 3vw, 2.2rem)" }}>Can you spot the bug?</h2>
                <p style={{ color: "var(--text-2)", lineHeight: 1.8 }}>
                  Learning security by reading only gets you halfway. SecureDevHub ships with ten
                  interactive challenges drawn from real audit findings. Here's the first one, live —
                  no signup, no setup.
                </p>
                <div className="d-flex flex-column gap-2 mt-3" style={{ color: "var(--text-2)", fontSize: "0.92rem" }}>
                  <span className="d-flex align-items-center gap-2"><CircleCheck size={16} style={{ color: "var(--success)" }} aria-hidden="true" /> Instant feedback with full explanations</span>
                  <span className="d-flex align-items-center gap-2"><CircleCheck size={16} style={{ color: "var(--success)" }} aria-hidden="true" /> The fix shown side-by-side</span>
                  <span className="d-flex align-items-center gap-2"><CircleCheck size={16} style={{ color: "var(--success)" }} aria-hidden="true" /> Progress saved locally in your browser</span>
                </div>
                <div className="mt-4"><ArrowCta to="/playground">Open the full playground</ArrowCta></div>
              </Reveal>
            </div>
            <div className="col-lg-7">
              <Reveal delay={140}>
                <ChallengeCard challenge={CHALLENGES[0]} index={0} total={CHALLENGES.length} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TOOLS PREVIEW ============ */}
      <section className="section" aria-labelledby="tools-preview">
        <div className="container-sdh">
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
            <SectionHead eyebrow="The Toolbox" title="The exact tools professionals use" desc="Thirty-plus curated, vetted tools — scanners, header analyzers, dependency auditors and free learning platforms." />
            <div className="mb-4"><ArrowCta to="/tools">Browse all tools</ArrowCta></div>
          </div>
          <div className="tool-scroll" role="list" aria-label="Featured tools (scroll horizontally)">
            {toolsPreview.map((t) => (
              <div role="listitem" key={t.id}><ToolCard tool={t} /></div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="section" style={{ background: "var(--bg-2)", borderBlock: "1px solid var(--border-soft)" }} aria-labelledby="quotes">
        <div className="container-sdh">
          <SectionHead center eyebrow="Words to Build By" title="The people who wrote the book" />
          <div className="row g-4">
            {[
              { quote: "Security is a process, not a product.", cite: "Bruce Schneier", role: "Cryptographer & security technologist" },
              { quote: "The only truly secure system is one that is powered off, cast in a block of concrete and sealed in a lead-lined room with armed guards.", cite: "Gene Spafford", role: "Professor of Computer Science, Purdue" },
              { quote: "Amateurs hack systems, professionals hack people.", cite: "Bruce Schneier", role: "Secrets & Lies, 2000" },
            ].map((q, i) => (
              <div className="col-md-4" key={i}>
                <Reveal delay={i * 110} className="h-100">
                  <figure className="sd-card hover p-4 h-100 d-flex flex-column m-0">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "2.2rem", lineHeight: 1, color: "var(--primary)" }} aria-hidden="true">"</span>
                    <blockquote className="flex-grow-1 mt-1 mb-3" style={{ fontSize: "1.05rem", lineHeight: 1.7, fontWeight: 500, color: "var(--text)" }}>
                      {q.quote}
                    </blockquote>
                    <figcaption style={{ fontSize: "0.86rem" }}>
                      <strong>{q.cite}</strong>
                      <span className="d-block" style={{ color: "var(--text-3)" }}>{q.role}</span>
                    </figcaption>
                  </figure>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ NEWSLETTER ============ */}
      <section className="section" aria-labelledby="newsletter">
        <div className="container-sdh">
          <Reveal>
            <div className="sd-card p-5 text-center position-relative overflow-hidden">
              <div
                aria-hidden="true"
                style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "radial-gradient(600px 260px at 50% -40%, color-mix(in srgb, var(--primary) 16%, transparent), transparent 70%)",
                }}
              />
              <div className="position-relative">
                <span className="icon-tile mx-auto mb-3" style={{ width: 52, height: 52, borderRadius: 14 }}><Mail size={22} aria-hidden="true" /></span>
                <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>Stay updated on web security</h2>
                <p className="mx-auto mt-2 mb-4" style={{ color: "var(--text-2)", maxWidth: 480 }}>
                  One short email when we publish a new module, checklist or breach autopsy.
                  No spam, no tracking pixels — unsubscribe anytime.
                </p>
                {subscribed ? (
                  <div className="d-inline-flex align-items-center gap-2" role="status" style={{ color: "var(--success)", fontWeight: 600 }}>
                    <span className="icon-tile success" style={{ width: 34, height: 34 }}><Check size={16} aria-hidden="true" /></span>
                    You're on the list — see you in the next issue.
                  </div>
                ) : (
                  <form
                    className="d-flex justify-content-center gap-2 flex-wrap"
                    onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}
                    aria-label="Newsletter signup"
                  >
                    <div className="input-wrap" style={{ maxWidth: 340, flex: "1 1 260px" }}>
                      <Mail size={16} aria-hidden="true" />
                      <input type="email" required className="input-sdh" placeholder="you@devmail.com" aria-label="Email address" />
                    </div>
                    <button type="submit" className="btn-sdh primary">
                      Subscribe <ArrowRight size={15} aria-hidden="true" />
                    </button>
                  </form>
                )}
                <p className="mt-3 mb-0" style={{ color: "var(--text-3)", fontSize: "0.78rem" }}>
                  Demo form — this static build stores nothing and phones nowhere.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
