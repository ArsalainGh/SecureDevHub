// ============================================================
// SecureDevHub — client-side search index (Ctrl+K modal)
// ============================================================
import { MODULES } from "./modules";
import { CHECKLISTS } from "./checklists";
import { TOOLS } from "./tools";
import { BLOG_POSTS } from "./blog";
import { CHALLENGES } from "./playground";
import { SEVERITY_META } from "./modules";

export interface SearchEntry {
  group: "Modules" | "Checklists" | "Tools" | "Blog" | "Playground";
  title: string;
  excerpt: string;
  path: string;
  icon: string;
  keywords: string;
  badge?: string;
}

function buildIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const m of MODULES) {
    entries.push({
      group: "Modules",
      title: m.title,
      excerpt: m.tagline,
      path: `/module/${m.id}`,
      icon: m.icon,
      keywords: `${m.title} ${m.severity} ${m.categories.join(" ")} ${m.owaspLabel} security`,
      badge: SEVERITY_META[m.severity].label,
    });
    for (const r of m.rules) {
      entries.push({
        group: "Modules",
        title: r,
        excerpt: `Rule — ${m.title}`,
        path: `/module/${m.id}#rules`,
        icon: "check-square",
        keywords: `${r} ${m.title} rule best practice`,
      });
    }
  }

  for (const c of CHECKLISTS) {
    entries.push({
      group: "Checklists",
      title: c.name,
      excerpt: c.desc,
      path: `/checklists?list=${c.id}`,
      icon: c.icon,
      keywords: `${c.name} checklist audit launch security`,
    });
    for (const g of c.groups) {
      for (const item of g.items) {
        entries.push({
          group: "Checklists",
          title: item.title,
          excerpt: `${c.short} — ${g.group}`,
          path: `/checklists?list=${c.id}`,
          icon: "square-check-big",
          keywords: `${item.title} ${g.group} ${c.name} checklist`,
        });
      }
    }
  }

  for (const t of TOOLS) {
    entries.push({
      group: "Tools",
      title: t.name,
      excerpt: t.desc,
      path: `/tools`,
      icon: t.icon,
      keywords: `${t.name} ${t.category} ${t.tags.join(" ")} tool`,
      badge: t.price,
    });
  }

  for (const p of BLOG_POSTS) {
    entries.push({
      group: "Blog",
      title: p.title,
      excerpt: p.excerpt,
      path: `/blog/${p.id}`,
      icon: "newspaper",
      keywords: `${p.title} ${p.tags.join(" ")} ${p.category} blog case study`,
      badge: p.category,
    });
  }

  for (const ch of CHALLENGES) {
    entries.push({
      group: "Playground",
      title: ch.title,
      excerpt: `${ch.difficulty} · ${ch.category} — spot the vulnerability`,
      path: `/playground`,
      icon: "bug",
      keywords: `${ch.title} ${ch.category} ${ch.difficulty} challenge spot the bug`,
      badge: ch.difficulty,
    });
  }

  return entries;
}

export const SEARCH_INDEX = buildIndex();

export function search(query: string, limit = 24): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const words = q.split(/\s+/);
  const scored: Array<{ e: SearchEntry; s: number }> = [];
  for (const e of SEARCH_INDEX) {
    const hay = `${e.title} ${e.excerpt} ${e.keywords}`.toLowerCase();
    let score = 0;
    let all = true;
    for (const w of words) {
      if (e.title.toLowerCase().includes(w)) score += 10;
      else if (hay.includes(w)) score += 3;
      else { all = false; break; }
    }
    if (all) {
      if (e.title.toLowerCase().startsWith(q)) score += 15;
      scored.push({ e, s: score });
    }
  }
  return scored
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.e);
}
