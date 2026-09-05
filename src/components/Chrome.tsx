// ============================================================
// SecureDevHub — site chrome: navbar, footer, search modal,
// theme toggle, toast host, back-to-top
// ============================================================
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUp, ArrowUpRight, Check, ExternalLink, Heart, Lock, Menu,
  Moon, Search, Sun, X,
} from "lucide-react";
import { cx, go, store } from "../lib/utils";
import { SEARCH_INDEX, search, type SearchEntry } from "../data/search";
import { Icon } from "./ui";

/* Brand marks (lucide dropped brand icons) */
export function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
export function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* ------------------- Logo ------------------- */
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <span className="d-inline-flex align-items-center gap-2" aria-label="SecureDevHub home">
      <span className="logo-mark" style={{ width: size, height: size }}>
        <Lock size={size * 0.5} strokeWidth={2.4} aria-hidden="true" />
      </span>
      <span className="fw-bold" style={{ fontSize: "1.06rem", letterSpacing: "-0.02em", color: "var(--text)" }}>
        Secure<span style={{ color: "var(--primary)" }}>DevHub</span>
      </span>
    </span>
  );
}

/* ------------------- Theme toggle ------------------- */
function useTheme(): ["dark" | "light", () => void] {
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    (document.documentElement.getAttribute("data-theme") as "dark" | "light") || "dark"
  );
  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      document.documentElement.setAttribute("data-bs-theme", next);
      store.set("sdh_theme", next);
      return next;
    });
  }, []);
  return [theme, toggle];
}

/* ------------------- Navbar ------------------- */
const NAV_LINKS = [
  { path: "/", label: "Home" },
  { path: "/modules", label: "Modules" },
  { path: "/checklists", label: "Checklists" },
  { path: "/tools", label: "Tools" },
  { path: "/playground", label: "Playground" },
  { path: "/blog", label: "Blog" },
  { path: "/about", label: "About" },
];

export function Navbar({ route }: { route: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [route]);

  const isActive = (p: string) => (p === "/" ? route === "/" : route.startsWith(p));

  return (
    <nav className={cx("navbar-sdh", scrolled && "scrolled")} aria-label="Primary navigation">
      <div className="container-sdh">
        <div className="d-flex align-items-center gap-2 py-3">
          <a href="#/" aria-label="SecureDevHub — home">
            <Logo />
          </a>

          <div className="d-none d-lg-flex align-items-center gap-1 ms-4">
            {NAV_LINKS.map((l) => (
              <a key={l.path} href={`#${l.path}`} className={cx("nav-link-sdh", isActive(l.path) && "active")} aria-current={isActive(l.path) ? "page" : undefined}>
                {l.label}
              </a>
            ))}
          </div>

          <div className="ms-auto d-flex align-items-center gap-2">
            <button
              className="icon-btn"
              style={{ width: "auto", padding: "0 11px", gap: 8, display: "inline-flex" }}
              onClick={() => window.dispatchEvent(new Event("sdh-open-search"))}
              aria-label="Search (Ctrl+K)"
              title="Search — Ctrl+K"
            >
              <Search size={17} aria-hidden="true" />
              <span className="kbd d-none d-md-inline">Ctrl K</span>
            </button>
            <button className="icon-btn" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} title="Toggle theme">
              {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
            <a
              className="btn-sdh ghost sm d-none d-md-inline-flex"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Star SecureDevHub on GitHub (opens in a new tab)"
            >
              <GithubIcon size={15} /> Star on GitHub
            </a>
            <button
              className="icon-btn d-lg-none"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            >
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* mobile menu */}
        <div className={cx("navbar-collapse-sdh d-lg-none", !open && "d-none")}>
          <div className="d-grid gap-1 pb-3">
            {NAV_LINKS.map((l) => (
              <a key={l.path} href={`#${l.path}`} className={cx("nav-link-sdh", isActive(l.path) && "active")}>
                {l.label}
              </a>
            ))}
            <a className="btn-sdh sm mt-2" href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ justifyContent: "center" }}>
              <GithubIcon size={15} /> Star on GitHub
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

/* ------------------- Footer ------------------- */
const FOOT_COLS: Array<{ title: string; links: Array<{ label: string; href: string; external?: boolean }> }> = [
  {
    title: "Learn",
    links: [
      { label: "All 16 Modules", href: "#/modules" },
      { label: "XSS Module", href: "#/module/xss" },
      { label: "SQL Injection Module", href: "#/module/sql-injection" },
      { label: "Spot the Bug", href: "#/playground" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Security Checklists", href: "#/checklists" },
      { label: "Curated Tools", href: "#/tools" },
      { label: "Blog & Case Studies", href: "#/blog" },
      { label: "OWASP Top 10", href: "https://owasp.org/Top10/", external: true },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "About", href: "#/about" },
      { label: "Contribute on GitHub", href: "https://github.com", external: true },
      { label: "Report an Issue", href: "https://github.com", external: true },
      { label: "MIT License", href: "#/about" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="footer-sdh" role="contentinfo">
      <div className="container-sdh py-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <a href="#/" className="d-inline-block mb-3"><Logo /></a>
            <p style={{ color: "var(--text-2)", fontSize: "0.92rem", lineHeight: 1.7, maxWidth: 320 }}>
              A free, open-source security guide for web developers. Learn vulnerabilities, fix them with real code, and never ship insecure code again.
            </p>
            <div className="d-flex gap-2 mt-3">
              <a className="icon-btn bordered" href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="SecureDevHub on GitHub (opens in a new tab)">
                <GithubIcon size={18} />
              </a>
              <a className="icon-btn bordered" href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="SecureDevHub on X (opens in a new tab)">
                <XIcon size={16} />
              </a>
              <a className="icon-btn bordered" href="https://owasp.org" target="_blank" rel="noopener noreferrer" aria-label="OWASP (opens in a new tab)" title="OWASP">
                <Icon name="shield" size={18} />
              </a>
            </div>
          </div>
          {FOOT_COLS.map((col) => (
            <div className="col-6 col-lg-2" key={col.title}>
              <div className="footer-link-title">{col.title}</div>
              <ul className="list-unstyled d-grid gap-2 m-0">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      {l.label}
                      {l.external && <ArrowUpRight size={12} aria-hidden="true" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-lg-2">
            <div className="footer-link-title">Status</div>
            <ul className="list-unstyled d-grid gap-2 m-0" style={{ fontSize: "0.88rem" }}>
              <li className="d-flex align-items-center gap-2" style={{ color: "var(--text-2)" }}>
                <span style={{ width: 8, height: 8, borderRadius: 8, background: "var(--success)", display: "inline-block" }} aria-hidden="true" />
                100% static & free
              </li>
              <li style={{ color: "var(--text-2)" }}>No accounts, no tracking</li>
              <li style={{ color: "var(--text-2)" }}>Works offline after load</li>
            </ul>
          </div>
        </div>

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mt-5 pt-4" style={{ borderTop: "1px solid var(--border-soft)" }}>
          <span className="d-inline-flex align-items-center gap-1" style={{ color: "var(--text-2)", fontSize: "0.86rem" }}>
            Made with <Heart size={14} style={{ color: "var(--danger)" }} fill="var(--danger)" aria-label="love" /> for the developer community
          </span>
          <span style={{ color: "var(--text-3)", fontSize: "0.82rem", fontFamily: "var(--font-mono)" }}>
            This site practices what it preaches — check our headers!
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ------------------- Search modal (Ctrl+K) ------------------- */
const GROUP_ORDER: SearchEntry["group"][] = ["Modules", "Checklists", "Tools", "Blog", "Playground"];

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.split(/\s+/)[0].toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + q.split(/\s+/)[0].length)}</mark>
      {text.slice(idx + q.split(/\s+/)[0].length)}
    </>
  );
}

export function SearchHost() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = search(query);
  const flat = results; // already grouped-agnostic sorted list

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onCustom = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("sdh-open-search", onCustom);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("sdh-open-search", onCustom);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && flat[active]) {
      go(flat[active].path);
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className="search-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }} role="presentation">
      <div className="search-panel" role="dialog" aria-modal="true" aria-label="Site search">
        <div className="d-flex align-items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid var(--border-soft)" }}>
          <Search size={18} style={{ color: "var(--text-3)", flexShrink: 0 }} aria-hidden="true" />
          <input
            ref={inputRef}
            className="input-sdh"
            style={{ border: "none", background: "transparent", paddingLeft: 6, boxShadow: "none" }}
            placeholder="Search modules, checklists, tools, posts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Search SecureDevHub"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-activedescendant={flat[active] ? `sr-${active}` : undefined}
          />
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close search">
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="search-results" id="search-results" role="listbox" aria-label="Search results">
          {query.trim().length < 2 && (
            <div className="p-4">
              <div style={{ color: "var(--text-2)", fontSize: "0.9rem", fontWeight: 600, marginBottom: 12 }}>Popular right now</div>
              <div className="d-flex flex-wrap gap-2">
                {["XSS", "SQL injection", "CSP headers", "pre-launch checklist", "JWT", "bcrypt", "CORS", "Equifax"].map((q) => (
                  <button key={q} className="filter-chip" onClick={() => setQuery(q)}>{q}</button>
                ))}
              </div>
              <div className="mt-4" style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>
                {SEARCH_INDEX.length.toLocaleString()}+ indexed entries across {GROUP_ORDER.length} categories.
              </div>
            </div>
          )}

          {query.trim().length >= 2 && flat.length === 0 && (
            <div className="p-4 text-center" style={{ color: "var(--text-2)", fontSize: "0.9rem" }}>
              No results for “{query}”. Try “xss”, “headers”, “passwords”, “checklist”…
            </div>
          )}

          {GROUP_ORDER.map((group) => {
            const items = flat.map((e, i) => ({ e, i })).filter((x) => x.e.group === group);
            if (!items.length) return null;
            return (
              <div key={group}>
                <div className="search-group-label">{group}</div>
                {items.map(({ e, i }) => (
                  <div
                    key={`${e.title}-${i}`}
                    id={`sr-${i}`}
                    role="option"
                    aria-selected={i === active}
                    className={cx("search-item", i === active && "active")}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => { go(e.path); setOpen(false); }}
                  >
                    <span className="icon-tile" style={{ width: 34, height: 34, borderRadius: 9 }}>
                      <Icon name={e.icon} size={16} />
                    </span>
                    <span className="flex-grow-1" style={{ minWidth: 0 }}>
                      <span className="st d-block"><Highlight text={e.title} query={query} /></span>
                      <span className="sx d-block">{e.excerpt}</span>
                    </span>
                    {e.badge && <span className="tag-chip" style={{ fontSize: "0.65rem" }}>{e.badge}</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="d-flex align-items-center gap-3 px-3 py-2" style={{ borderTop: "1px solid var(--border-soft)", color: "var(--text-3)", fontSize: "0.74rem" }}>
          <span className="d-flex align-items-center gap-1"><span className="kbd">↑↓</span> navigate</span>
          <span className="d-flex align-items-center gap-1"><span className="kbd">↵</span> open</span>
          <span className="d-flex align-items-center gap-1"><span className="kbd">esc</span> close</span>
          <span className="ms-auto">{flat.length > 0 ? `${flat.length} results` : ""}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------- Toast host + BackToTop ------------------- */
export function ToastHost() {
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail);
      setShow(true);
      clearTimeout(t);
      t = setTimeout(() => setShow(false), 2200);
    };
    window.addEventListener("sdh-toast", on);
    return () => { window.removeEventListener("sdh-toast", on); clearTimeout(t); };
  }, []);
  return (
    <div className={cx("toast-sdh", show && "show")} role="status" aria-live="polite">
      <Check size={16} style={{ color: "var(--success)" }} aria-hidden="true" />
      {msg}
    </div>
  );
}

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <button
      className={cx("back-top", show && "show")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
}

/** External link helper */
export function ExtLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children} <ExternalLink size={12} style={{ opacity: 0.6 }} aria-hidden="true" />
    </a>
  );
}
