// ============================================================
// SecureDevHub — shared UI primitives
// ============================================================
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Activity, ArrowRight, Braces, Bug, CheckSquare, CloudCog, CodeXml,
  Cookie, Database, EyeOff, FileUp, Fingerprint, Gauge, Globe, HardHat, KeySquare,
  ListChecks, Lock, Monitor, Newspaper, Package, PanelTop, Rocket, Server, Shield,
  ShieldCheck, Shuffle, SquareCheckBig, Webhook, Radar, Crosshair, ScanLine,
  DatabaseZap, Network, ScanSearch, Wrench, Sparkles, Hash, BadgeCheck,
  FlaskConical, GraduationCap, Trophy, Box, Map, FileText, School,
  GitPullRequest, PackageSearch, ShieldAlert, Terminal, Telescope,
  Flag, Clock,
  type LucideIcon,
} from "lucide-react";
import { cx } from "../lib/utils";
import { SEVERITY_META } from "../data/modules";
import type { Severity } from "../data/types";

/* ---------- icon registry ---------- */
const ICONS: Record<string, LucideIcon> = {
  activity: Activity, braces: Braces, bug: Bug, "check-square": CheckSquare,
  "cloud-cog": CloudCog, "code-xml": CodeXml, cookie: Cookie, database: Database,
  "eye-off": EyeOff, "file-up": FileUp, fingerprint: Fingerprint, gauge: Gauge,
  globe: Globe, "hard-hat": HardHat, "key-square": KeySquare, "list-checks": ListChecks,
  lock: Lock, monitor: Monitor, newspaper: Newspaper, package: Package,
  "panel-top": PanelTop, rocket: Rocket, server: Server, shield: Shield,
  "shield-check": ShieldCheck, shuffle: Shuffle, "square-check-big": SquareCheckBig,
  webhook: Webhook, radar: Radar, crosshair: Crosshair, "scan-line": ScanLine,
  "database-zap": DatabaseZap, network: Network, "scan-search": ScanSearch,
  wrench: Wrench, sparkles: Sparkles, hash: Hash, "badge-check": BadgeCheck,
  "flask-conical": FlaskConical, "graduation-cap": GraduationCap, trophy: Trophy,
  box: Box, map: Map, "file-text": FileText, chrome: Globe, school: School,
  "git-pull-request": GitPullRequest, "git-pull-request-arrow": GitPullRequest,
  "package-search": PackageSearch, "shield-alert": ShieldAlert, terminal: Terminal,
  telescope: Telescope, flag: Flag, wordpress: Shield, clock: Clock,
};

export function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  const Cmp = ICONS[name] || Shield;
  return <Cmp size={size} className={className} aria-hidden="true" />;
}

/* ---------- scroll reveal wrapper ---------- */
export function Reveal({
  children, delay = 0, className,
}: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setInView(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold: 0.06, rootMargin: "0px 0px -30px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cx("reveal-io", inView && "in", className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

/* ---------- badges ---------- */
export function SeverityBadge({ sev, showDot = true }: { sev: Severity; showDot?: boolean }) {
  const meta = SEVERITY_META[sev];
  return (
    <span className={cx("badge-sdh", meta.css)}>
      {showDot && <span className="dot" aria-hidden="true" />}
      {meta.label}
    </span>
  );
}

export function Badge({ children, kind = "neutral" }: { children: ReactNode; kind?: "critical" | "high" | "medium" | "info" | "success" | "neutral" }) {
  return <span className={cx("badge-sdh", `badge-${kind}`)}>{children}</span>;
}

/* ---------- section headers ---------- */
export function SectionHead({
  eyebrow, title, desc, center,
}: { eyebrow?: string; title: string; desc?: string; center?: boolean }) {
  return (
    <Reveal className={cx("section-head", center && "center")}>
      {eyebrow && <span className="eyebrow mb-3">{eyebrow}</span>}
      <h2 className="mt-2">{title}</h2>
      {desc && <p>{desc}</p>}
    </Reveal>
  );
}

export function PageHead({
  eyebrow, title, desc, children,
}: { eyebrow?: string; title: string; desc?: string; children?: ReactNode }) {
  return (
    <header className="page-head">
      <div className="container-sdh">
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-4">
          <div>
            {eyebrow && <span className="eyebrow mb-3">{eyebrow}</span>}
            <h1 className="mt-2 mb-0">{title}</h1>
            {desc && <p className="lede mb-0">{desc}</p>}
          </div>
          {children && <div className="pt-2">{children}</div>}
        </div>
      </div>
    </header>
  );
}

/* ---------- meta row ---------- */
export function MetaDot() {
  return <span style={{ color: "var(--text-3)" }} aria-hidden="true">·</span>;
}

export function ArrowCta({ to, children }: { to: string; children: ReactNode }) {
  return (
    <a href={`#${to}`} className="d-inline-flex align-items-center gap-2 fw-semibold" style={{ color: "var(--primary)", fontSize: "0.95rem" }}>
      {children} <ArrowRight size={16} aria-hidden="true" />
    </a>
  );
}
