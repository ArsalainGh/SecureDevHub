// ============================================================
// SecureDevHub — individual blog post (block renderer + JSON-LD)
// ============================================================
import { useEffect } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Info, ShieldAlert, ShieldCheck } from "lucide-react";
import { BlogCard } from "../components/cards";
import { CodeBlock } from "../components/CodeBlock";
import { Badge, Reveal } from "../components/ui";
import { BLOG_POSTS, getPost } from "../data/blog";
import type { BlogBlock } from "../data/types";
import { go, useTitle } from "../lib/utils";

function Block({ block }: { block: BlogBlock }) {
  switch (block.t) {
    case "h2":
      return <h3 style={{ fontSize: "1.35rem", marginTop: 34, marginBottom: 6 }}>{block.text}</h3>;
    case "h3":
      return <h4 style={{ fontSize: "1.12rem", marginTop: 26, marginBottom: 6 }}>{block.text}</h4>;
    case "p":
      return <p>{block.text}</p>;
    case "list":
      return (
        <ul>
          {block.items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
      );
    case "quote":
      return (
        <blockquote>
          <p className="mb-1" style={{ fontStyle: "italic", color: "var(--text)", fontSize: "1.02rem" }}>“{block.text}”</p>
          {block.cite && <cite style={{ color: "var(--text-3)", fontSize: "0.85rem", fontStyle: "normal" }}>— {block.cite}</cite>}
        </blockquote>
      );
    case "callout": {
      const icon = block.kind === "warn" ? <ShieldAlert size={18} aria-hidden="true" /> : block.kind === "ok" ? <ShieldCheck size={18} aria-hidden="true" /> : <Info size={18} aria-hidden="true" />;
      const color = block.kind === "warn" ? "var(--warning)" : block.kind === "ok" ? "var(--success)" : "var(--primary)";
      return (
        <div className="callout" style={{ borderLeftColor: color }}>
          <span className="d-flex gap-2 align-items-start">
            <span style={{ color, flexShrink: 0, marginTop: 1 }}>{icon}</span>
            <span>{block.text}</span>
          </span>
        </div>
      );
    }
    case "code":
      return (
        <div className="my-4">
          <CodeBlock tabs={block.tabs} banner={block.banner} />
        </div>
      );
    default:
      return null;
  }
}

export default function BlogPost({ id }: { id: string }) {
  const post = getPost(id);
  useTitle(post ? `${post.title} — SecureDevHub` : "Post not found — SecureDevHub");

  /* inject article JSON-LD */
  useEffect(() => {
    if (!post) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      author: { "@type": "Organization", name: "SecureDevHub" },
      publisher: { "@type": "Organization", name: "SecureDevHub" },
      keywords: post.tags.join(", "),
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [post]);

  if (!post) {
    return (
      <div className="container-sdh py-5 text-center">
        <h1 className="mt-5">Post not found</h1>
        <p style={{ color: "var(--text-2)" }}>That article doesn't exist. Browse the archive instead.</p>
        <button className="btn-sdh primary" onClick={() => go("/blog")}>All posts</button>
      </div>
    );
  }

  const idx = BLOG_POSTS.findIndex((p) => p.id === post.id);
  const next = BLOG_POSTS[(idx + 1) % BLOG_POSTS.length];
  const kind = post.category === "Case Study" ? "critical" : post.category === "Tutorial" ? "info" : "medium";

  return (
    <div className="container-sdh py-4 py-lg-5">
      <div className="mx-auto" style={{ maxWidth: 780 }}>
        <Reveal>
          <a href="#/blog" className="breadcrumb-sdh mb-4 d-inline-flex align-items-center gap-2">
            <ArrowLeft size={15} aria-hidden="true" /> All posts
          </a>
          <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
            <Badge kind={kind as never}>{post.category}</Badge>
            {post.tags.map((t) => <span key={t} className="tag-chip">{t}</span>)}
          </div>
          <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.15 }}>{post.title}</h1>
          <div className="d-flex align-items-center flex-wrap gap-3 mt-3 pb-4 mb-2" style={{ color: "var(--text-2)", fontSize: "0.88rem", borderBottom: "1px solid var(--border-soft)" }}>
            <span className="d-inline-flex align-items-center gap-1"><CalendarDays size={15} aria-hidden="true" /> {post.date}</span>
            <span className="d-inline-flex align-items-center gap-1"><Clock size={15} aria-hidden="true" /> {post.time}</span>
            <span className="d-inline-flex align-items-center gap-1 ms-auto">
              <span className="logo-mark" style={{ width: 22, height: 22, fontSize: 10 }} aria-hidden="true">
                <ShieldCheck size={12} />
              </span>
              SecureDevHub Editorial
            </span>
          </div>
        </Reveal>

        <div className="prose-sdh">
          {post.blocks.map((b, i) => <Block key={i} block={b} />)}
        </div>

        {/* next up */}
        <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--border-soft)" }}>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Read next</h2>
            <a href="#/blog" className="btn-sdh sm ghost">All posts <ArrowRight size={14} aria-hidden="true" /></a>
          </div>
          <BlogCard post={next} />
        </div>
      </div>
    </div>
  );
}
