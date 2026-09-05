// ============================================================
// SecureDevHub — About page
// ============================================================
import { BookOpen, Code2, Coffee, FileText, HeartHandshake, Lightbulb, Rocket, ShieldCheck as ShieldIcon } from "lucide-react";
import { Badge, PageHead, Reveal, SectionHead, Icon } from "../components/ui";
import { Logo, GithubIcon } from "../components/Chrome";
import { MODULES } from "../data/modules";
import { CHECKLISTS } from "../data/checklists";
import { TOOLS } from "../data/tools";
import { useTitle } from "../lib/utils";

export default function About() {
  useTitle("About — SecureDevHub");
  return (
    <>
      <PageHead
        eyebrow="The Project"
        title="Security education that doesn't require a security budget"
        desc="SecureDevHub is a free, open-source project with one goal: make 'I didn't know' an unacceptable excuse for shipping vulnerable code."
      />

      <div className="container-sdh py-5">
        {/* mission */}
        <div className="row g-4 align-items-stretch mb-5">
          <div className="col-lg-7">
            <Reveal className="h-100">
              <div className="sd-card p-4 p-lg-5 h-100">
                <span className="icon-tile mb-3" style={{ width: 52, height: 52, borderRadius: 14 }}><ShieldIcon size={24} aria-hidden="true" /></span>
                <h2 style={{ fontSize: "1.5rem" }}>The mission</h2>
                <p style={{ color: "var(--text-2)", lineHeight: 1.85, fontSize: "1rem" }}>
                  Most breaches aren't masterminded by geniuses — they're the same
                  twenty well-documented mistakes, made by good developers who were
                  never shown how attacks actually work. Security courses are priced
                  for enterprises, university classes move slowly, and OWASP docs —
                  excellent as they are — assume you already speak the language.
                </p>
                <p className="mb-0" style={{ color: "var(--text-2)", lineHeight: 1.85, fontSize: "1rem" }}>
                  SecureDevHub translates the OWASP Top 10 and real breach post-mortems
                  into plain English, real code in the languages you actually write, and
                  checklists you can run the same afternoon. Everything is static, free,
                  and works offline — because security knowledge should be as accessible
                  as the vulnerabilities are.
                </p>
              </div>
            </Reveal>
          </div>
          <div className="col-lg-5">
            <div className="row g-4 h-100">
              {[
                { n: "16", l: "deep-dive modules", icon: "book-open" },
                { n: "5", l: "launch checklists", icon: "list-checks" },
                { n: `${TOOLS.length}+`, l: "curated tools", icon: "wrench" },
                { n: "10", l: "spot-the-bug challenges", icon: "bug" },
              ].map((s, i) => (
                <div className="col-6" key={s.l}>
                  <Reveal delay={i * 90} className="h-100">
                    <div className="sd-card hover p-4 h-100 text-center">
                      <span className="icon-tile mx-auto mb-2"><Icon name={s.icon} size={18} /></span>
                      <div style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.04em" }}>{s.n}</div>
                      <div style={{ color: "var(--text-2)", fontSize: "0.82rem" }}>{s.l}</div>
                    </div>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* principles */}
        <SectionHead eyebrow="Principles" title="How we build it" />
        <div className="row g-4 mb-5">
          {[
            { icon: <Lightbulb size={20} aria-hidden="true" />, title: "Plain English first", text: "Every concept is explained with an analogy before a single acronym appears. Jargon is defined, never assumed." },
            { icon: <Code2 size={20} aria-hidden="true" />, title: "Real code only", text: "Every example is accurate, tested-shaped code in JavaScript, Python and PHP — vulnerable and fixed versions, side by side." },
            { icon: <Rocket size={20} aria-hidden="true" />, title: "Actionable by Friday", text: "Each module ends with copy-able rules, a quiz and a checklist. You should be able to apply it this week." },
            { icon: <HeartHandshake size={20} aria-hidden="true" />, title: "Free forever", text: "No accounts, no paywalls, no tracking. Static files you can fork, translate and self-host under the MIT license." },
          ].map((p, i) => (
            <div className="col-md-6" key={p.title}>
              <Reveal delay={i * 90} className="h-100">
                <div className="sd-card hover p-4 h-100 d-flex gap-3">
                  <span className="icon-tile">{p.icon}</span>
                  <div>
                    <h3 style={{ fontSize: "1.05rem" }}>{p.title}</h3>
                    <p className="mb-0" style={{ color: "var(--text-2)", fontSize: "0.9rem", lineHeight: 1.7 }}>{p.text}</p>
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>

        {/* contribute + tech stack */}
        <div className="row g-4 mb-5">
          <div className="col-lg-6">
            <Reveal className="h-100">
              <div className="sd-card p-4 h-100">
                <h2 className="d-flex align-items-center gap-2" style={{ fontSize: "1.25rem" }}>
                  <GithubIcon size={22} /> Contribute
                </h2>
                <p style={{ color: "var(--text-2)", lineHeight: 1.75, fontSize: "0.95rem" }}>
                  The whole site is one open repository. Ways to help:
                </p>
                <ul className="prose-sdh" style={{ paddingLeft: 20 }}>
                  <li>Fix a typo, clarify an explanation, add a code example in another language</li>
                  <li>Write a module or case study (check the style of an existing one)</li>
                  <li>Suggest tools, report outdated advice, add translations</li>
                  <li>Review the vulnerable examples — yes, they should stay vulnerable</li>
                </ul>
                <div className="d-flex gap-2 flex-wrap mt-3">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-sdh primary sm">
                    <GithubIcon size={14} /> Open the repo
                  </a>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-sdh sm">
                    Good first issues
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
          <div className="col-lg-6">
            <Reveal delay={100} className="h-100">
              <div className="sd-card p-4 h-100">
                <h2 className="d-flex align-items-center gap-2" style={{ fontSize: "1.25rem" }}>
                  <Coffee size={20} aria-hidden="true" style={{ color: "var(--primary)" }} /> Built with
                </h2>
                <div className="d-flex flex-wrap gap-2 my-3">
                  {["Bootstrap 5", "HTML5 + CSS custom props", "Vanilla JS concepts", "localStorage persistence", "Prism-style highlighting", "GitHub-docs aesthetic", "Dark-first theming", "100% static"].map((t) => (
                    <span key={t} className="tag-chip">{t}</span>
                  ))}
                </div>
                <p style={{ color: "var(--text-2)", lineHeight: 1.75, fontSize: "0.92rem" }}>
                  The design follows the GitHub documentation aesthetic: calm surfaces, one accent color,
                  code-first typography (Inter + JetBrains Mono) and motion with a purpose. Dark mode is
                  the default; everything respects <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>prefers-reduced-motion</code>.
                </p>
                <h3 className="d-flex align-items-center gap-2" style={{ fontSize: "1rem" }}>
                  <FileText size={17} aria-hidden="true" style={{ color: "var(--success)" }} /> License
                </h3>
                <p className="mb-0" style={{ color: "var(--text-2)", fontSize: "0.92rem", lineHeight: 1.75 }}>
                  MIT — use it, fork it, teach with it, ship it internally. Attribution appreciated, not required.
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        {/* credits */}
        <Reveal>
          <div className="sd-card p-4 p-lg-5 text-center">
            <Badge kind="info">Acknowledgments</Badge>
            <h2 className="mt-2" style={{ fontSize: "1.4rem" }}>Standing on the shoulders of the open web</h2>
            <p className="mx-auto mb-4" style={{ color: "var(--text-2)", maxWidth: 620, lineHeight: 1.8 }}>
              SecureDevHub synthesizes guidance from OWASP, MDN Web Docs, PortSwigger's Web Security Academy,
              and the researchers who publish breach post-mortems so the rest of us can learn. Breach figures
              come from public ICO filings, court documents and vendor disclosures — go read the originals,
              they're better than the headlines.
            </p>
            <div className="d-flex justify-content-center flex-wrap gap-2">
              <a href="https://owasp.org" target="_blank" rel="noopener noreferrer" className="btn-sdh sm">OWASP</a>
              <a href="https://cheatsheetseries.owasp.org" target="_blank" rel="noopener noreferrer" className="btn-sdh sm">Cheat Sheet Series</a>
              <a href="https://portswigger.net/web-security" target="_blank" rel="noopener noreferrer" className="btn-sdh sm">PortSwigger Academy</a>
              <a href="https://developer.mozilla.org" target="_blank" rel="noopener noreferrer" className="btn-sdh sm">MDN Web Docs</a>
            </div>
            <div className="mt-4 d-flex justify-content-center"><Logo /></div>
            <p className="mt-3 mb-0 d-flex justify-content-center align-items-center gap-2" style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>
              <BookOpen size={14} aria-hidden="true" /> {MODULES.length} modules · {CHECKLISTS.length} checklists · {TOOLS.length} tools — and counting.
            </p>
          </div>
        </Reveal>
      </div>
    </>
  );
}
