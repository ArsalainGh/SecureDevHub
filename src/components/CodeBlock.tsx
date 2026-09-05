// ============================================================
// SecureDevHub — tabbed, syntax-highlighted code block
// with danger/fix line markers + copy button + banners
// ============================================================
import { useMemo, useState } from "react";
import { Check, Copy, ShieldAlert, ShieldCheck } from "lucide-react";
import { tokenize } from "../lib/highlight";
import { copyText, cx } from "../lib/utils";
import type { CodeTab } from "../data/types";

const LANG_LABELS: Record<string, string> = {
  javascript: "JavaScript",
  python: "Python",
  php: "PHP",
  html: "HTML",
  bash: "Shell",
  http: "HTTP",
  sql: "SQL",
  json: "JSON",
};

export function CodeBlock({
  tabs,
  banner,
  title,
}: {
  tabs: CodeTab[];
  banner?: "warn" | "ok";
  title?: string;
}) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const tab = tabs[Math.min(active, tabs.length - 1)];

  const lines = useMemo(() => tab.code.split("\n"), [tab.code]);
  const highlighted = useMemo(
    () => lines.map((l) => tokenize(l, tab.lang)),
    [lines, tab.lang]
  );
  const marked = useMemo(() => new Set(tab.mark || []), [tab.mark]);
  const markKind = banner === "warn" ? "marked-danger" : "marked-fix";

  const doCopy = async () => {
    const ok = await copyText(tab.code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="code-block">
      <div className="code-head">
        <div className="code-dots" aria-hidden="true">
          <span /><span /><span />
        </div>
        <div className="code-tabs" role="tablist" aria-label={title || "Code examples by language"}>
          {tabs.map((t, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === active}
              className={cx("code-tab", i === active && "active")}
              onClick={() => setActive(i)}
            >
              {t.label || LANG_LABELS[t.lang] || t.lang}
            </button>
          ))}
        </div>
        <button className={cx("copy-btn", copied && "copied")} onClick={doCopy} aria-label="Copy code to clipboard">
          {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="code-scroll" role="tabpanel">
        <pre aria-label={`${tab.lang} code example`} style={{ margin: 0 }}>
          {lines.map((_line, i) => (
            <div key={i} className={cx("code-line", marked.has(i + 1) && markKind)}>
              <span className="ln" aria-hidden="true">{i + 1}</span>
              <span className="lc">
                {highlighted[i].length === 0
                  ? " "
                  : highlighted[i].map((tok, j) =>
                      tok.cls ? (
                        <span key={j} className={tok.cls}>{tok.text}</span>
                      ) : (
                        <span key={j}>{tok.text}</span>
                      )
                    )}
              </span>
            </div>
          ))}
        </pre>
      </div>
      {banner === "warn" && (
        <div className="code-banner warn" role="note">
          <ShieldAlert size={15} aria-hidden="true" />
          This code is intentionally vulnerable — red lines mark the dangerous patterns.
        </div>
      )}
      {banner === "ok" && (
        <div className="code-banner ok" role="note">
          <ShieldCheck size={15} aria-hidden="true" />
          This code follows security best practices — green lines mark the fixes.
        </div>
      )}
    </div>
  );
}

/** Small inline code chip */
export function InlineCode({ children }: { children: string }) {
  return (
    <code
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.85em",
        background: "var(--code-bg)",
        border: "1px solid var(--border-soft)",
        borderRadius: 6,
        padding: "1px 7px",
        color: "var(--text)",
      }}
    >
      {children}
    </code>
  );
}
