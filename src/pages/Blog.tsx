// ============================================================
// SecureDevHub — Blog & case studies listing
// ============================================================
import { ArrowRight, Clock, Flame } from "lucide-react";
import { BlogCard } from "../components/cards";
import { PageHead, Reveal, Badge } from "../components/ui";
import { BLOG_POSTS } from "../data/blog";
import { useTitle } from "../lib/utils";

export default function Blog() {
  useTitle("Security Insights & Case Studies — SecureDevHub");
  const featured = BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
  const rest = BLOG_POSTS.filter((p) => p.id !== featured.id);

  return (
    <>
      <PageHead
        eyebrow="From the Field"
        title="Security Insights & Case Studies"
        desc="Real breach autopsies and practical guides. Every case study ends with the exact defenses that would have stopped it."
      />

      <div className="container-sdh py-5">
        {/* featured */}
        <Reveal>
          <a
            href={`#/blog/${featured.id}`}
            className="sd-card hover glow d-block mb-5"
            style={{ textDecoration: "none", overflow: "hidden" }}
            aria-label={`Featured post: ${featured.title}`}
          >
            <div className="blog-card-cover" aria-hidden="true" />
            <div className="p-4 p-lg-5">
              <div className="row g-4 align-items-center">
                <div className="col-lg-8">
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                    <Badge kind="critical">
                      <Flame size={11} aria-hidden="true" /> Featured Case Study
                    </Badge>
                    <span className="num-badge">{featured.date}</span>
                    <span className="d-inline-flex align-items-center gap-1" style={{ color: "var(--text-3)", fontSize: "0.8rem" }}>
                      <Clock size={13} aria-hidden="true" /> {featured.time}
                    </span>
                  </div>
                  <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", letterSpacing: "-0.02em", lineHeight: 1.25 }}>
                    {featured.title}
                  </h2>
                  <p className="mt-3 mb-0" style={{ color: "var(--text-2)", fontSize: "1rem", lineHeight: 1.75, maxWidth: 640 }}>
                    {featured.excerpt}
                  </p>
                </div>
                <div className="col-lg-4 text-lg-end">
                  <div className="d-inline-flex flex-column gap-2">
                    {featured.tags.map((t) => (
                      <span key={t} className="tag-chip" style={{ textAlign: "center" }}>{t}</span>
                    ))}
                    <span className="btn-sdh primary sm mt-2" style={{ justifyContent: "center" }}>
                      Read the autopsy <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </a>
        </Reveal>

        {/* grid */}
        <div className="row g-4">
          {rest.map((p) => (
            <div className="col-md-6" key={p.id}>
              <BlogCard post={p} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
