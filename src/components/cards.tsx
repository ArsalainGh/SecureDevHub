// ============================================================
// SecureDevHub — shared cards (module / tool / blog)
// ============================================================
import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import type { BlogPost, SecurityModule, Tool } from "../data/types";
import { CATEGORY_LABELS, isModuleDone } from "../data/modules";
import { Icon, SeverityBadge, Badge } from "./ui";

/* Re-render helper: reacts to localStorage progress changes */
export function useProgressTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener("sdh-progress", bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener("sdh-progress", bump);
      window.removeEventListener("storage", bump);
    };
  }, []);
  return tick;
}

export function ModuleCard({ mod }: { mod: SecurityModule }) {
  useProgressTick();
  const done = isModuleDone(mod.id);
  return (
    <a href={`#/module/${mod.id}`} className="sd-card hover glow module-card reveal" aria-label={`Module ${mod.number}: ${mod.title}`}>
      <span className="arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="num-badge">{String(mod.number).padStart(2, "0")}</span>
        <SeverityBadge sev={mod.severity} />
        {done && (
          <span className="badge-sdh badge-success" title="Completed">
            <CheckCircle2 size={11} aria-hidden="true" /> Done
          </span>
        )}
      </div>
      <div className="d-flex align-items-center gap-3 mb-2">
        <span className="icon-tile"><Icon name={mod.icon} size={20} /></span>
        <h3 className="mb-0">{mod.title}</h3>
      </div>
      <p className="desc mb-3">{mod.tagline}</p>
      <div className="d-flex align-items-center flex-wrap gap-2">
        {mod.categories.slice(0, 3).map((c) => (
          <span key={c} className="tag-chip">{CATEGORY_LABELS[c]}</span>
        ))}
        <span className="ms-auto d-inline-flex align-items-center gap-1" style={{ color: "var(--text-3)", fontSize: "0.78rem" }}>
          <Clock size={13} aria-hidden="true" /> {mod.time}
        </span>
      </div>
    </a>
  );
}

export function ToolCard({ tool }: { tool: Tool }) {
  const priceKind = tool.price === "Free" ? "success" : tool.price === "Freemium" ? "info" : "medium";
  return (
    <div className="sd-card hover tool-card reveal">
      <div className="d-flex align-items-start justify-content-between mb-2">
        <span className="icon-tile"><Icon name={tool.icon} size={20} /></span>
        <Badge kind={priceKind as never}>{tool.price}</Badge>
      </div>
      <h3 style={{ fontSize: "1rem", marginTop: 10 }}>{tool.name}</h3>
      <p className="desc">{tool.desc}</p>
      <div className="d-flex align-items-center flex-wrap gap-2 mt-3">
        <span className="tag-chip">{tool.category}</span>
        {tool.tags.slice(0, 2).map((t) => (
          <span key={t} className="tag-chip" style={{ fontSize: "0.66rem" }}>{t}</span>
        ))}
      </div>
      <a
        className="btn-sdh sm mt-3"
        href={tool.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ justifyContent: "center" }}
        aria-label={`Visit ${tool.name} (opens in a new tab)`}
      >
        Visit Tool <ExternalLink size={13} aria-hidden="true" />
      </a>
    </div>
  );
}

export function BlogCard({ post }: { post: BlogPost }) {
  const kind = post.category === "Case Study" ? "critical" : post.category === "Tutorial" ? "info" : "medium";
  return (
    <a href={`#/blog/${post.id}`} className="sd-card hover module-card reveal" aria-label={`Read: ${post.title}`} style={{ paddingTop: 0, overflow: "hidden" }}>
      <div className="blog-card-cover" style={{ margin: "0 -22px 18px", borderRadius: "10px 10px 0 0" }} aria-hidden="true" />
      <div className="d-flex align-items-center gap-2 mb-3">
        <Badge kind={kind as never}>{post.category}</Badge>
        <span className="num-badge">{post.date}</span>
      </div>
      <h3 style={{ fontSize: "1.12rem", lineHeight: 1.35 }}>{post.title}</h3>
      <p className="desc" style={{ marginTop: 6 }}>{post.excerpt}</p>
      <div className="d-flex align-items-center gap-2 mt-3">
        <span className="d-inline-flex align-items-center gap-1" style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>
          <Clock size={13} aria-hidden="true" /> {post.time}
        </span>
        {post.tags.slice(0, 3).map((t) => (
          <span key={t} className="tag-chip" style={{ fontSize: "0.68rem" }}>{t}</span>
        ))}
      </div>
    </a>
  );
}
