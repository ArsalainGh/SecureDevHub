// ============================================================
// SecureDevHub — Interactive security checklists
// localStorage persistence · print → PDF · markdown export
// ============================================================
import { useEffect, useMemo, useState } from "react";
import {
  Check, Copy, Download, RotateCcw, ShieldAlert, TriangleAlert,
} from "lucide-react";
import { PageHead, Reveal, Icon } from "../components/ui";
import { CHECKLISTS } from "../data/checklists";
import type { Checklist, ChecklistItem } from "../data/types";
import { copyText, cx, store, toast, useTitle } from "../lib/utils";

function parseListFromHash(): string | null {
  const m = window.location.hash.match(/[?&]list=([\w-]+)/);
  return m ? m[1] : null;
}

function useChecklistState(list: Checklist): [Record<string, boolean>, (id: string, v: boolean) => void, () => void, number] {
  const read = () => {
    const out: Record<string, boolean> = {};
    for (const g of list.groups) for (const it of g.items) out[it.id] = store.get<boolean>(`sdh_chk_${list.id}_${it.id}`, false);
    return out;
  };
  const [state, setState] = useState<Record<string, boolean>>(read);
  const [tick, setTick] = useState(0);

  useEffect(() => { setState(read()); }, [list.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (id: string, v: boolean) => {
    store.set(`sdh_chk_${list.id}_${id}`, v);
    setState((s) => ({ ...s, [id]: v }));
    setTick((t) => t + 1);
  };
  const reset = () => {
    for (const g of list.groups) for (const it of g.items) store.del(`sdh_chk_${list.id}_${it.id}`);
    setState(read());
    setTick((t) => t + 1);
  };
  return [state, set, reset, tick];
}

function toMarkdown(list: Checklist, state: Record<string, boolean>): string {
  const lines: string[] = [`# ${list.name}`, "", `> ${list.desc}`, ""];
  for (const g of list.groups) {
    lines.push(`## ${g.group}`, "");
    for (const it of g.items) {
      lines.push(`- [${state[it.id] ? "x" : " "}] **${it.title}** — ${it.desc}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export default function Checklists() {
  useTitle("Security Checklists — SecureDevHub");
  const [activeId, setActiveId] = useState<string>(() => parseListFromHash() || CHECKLISTS[0].id);
  const list = CHECKLISTS.find((c) => c.id === activeId) || CHECKLISTS[0];
  const [state, set, reset] = useChecklistState(list);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const onHash = () => {
      const q = parseListFromHash();
      if (q && CHECKLISTS.some((c) => c.id === q)) setActiveId(q);
    };
    // expand all <details> so the printed/PDF version is complete
    const beforePrint = () =>
      document.querySelectorAll("details").forEach((d) => d.setAttribute("open", "true"));
    window.addEventListener("hashchange", onHash);
    window.addEventListener("beforeprint", beforePrint);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("beforeprint", beforePrint);
    };
  }, []);

  const { doneCount, total, pct } = useMemo(() => {
    let d = 0; let t = 0;
    for (const g of list.groups) for (const it of g.items) { t++; if (state[it.id]) d++; }
    return { doneCount: d, total: t, pct: t ? Math.round((d / t) * 100) : 0 };
  }, [list, state]);

  const switchList = (id: string) => {
    setActiveId(id);
    window.history.replaceState(null, "", `#/checklists?list=${id}`);
  };

  const copyMarkdown = async () => {
    if (await copyText(toMarkdown(list, state))) toast("Checklist copied as Markdown");
  };

  return (
    <>
      <PageHead
        eyebrow="Ship With Confidence"
        title="Security Checklists"
        desc="Interactive, persistent audit checklists for every launch stage. Your progress saves automatically in this browser — export to Markdown or print to PDF anytime."
      />

      <div className="container-sdh py-5">
        {/* tab bar */}
        <div className="tab-bar mb-4 no-print" role="tablist" aria-label="Choose a checklist">
          {CHECKLISTS.map((c) => {
            const cTotal = c.groups.reduce((a, g) => a + g.items.length, 0);
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={c.id === list.id}
                className={cx("tab-sdh", c.id === list.id && "active")}
                onClick={() => switchList(c.id)}
              >
                <Icon name={c.icon} size={15} />
                {c.short}
                <span className="kbd" style={{ fontSize: "0.65rem" }} aria-label={`${cTotal} items`}>{cTotal}</span>
              </button>
            );
          })}
        </div>

        <Reveal>
        {/* checklist header */}
        <div className="sd-card p-4 mb-4">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <span className="icon-tile" style={{ width: 52, height: 52, borderRadius: 14 }}><Icon name={list.icon} size={24} /></span>
            <div className="flex-grow-1" style={{ minWidth: 220 }}>
              <h2 className="mb-1" style={{ fontSize: "1.35rem" }}>{list.name}</h2>
              <p className="mb-0" style={{ color: "var(--text-2)", fontSize: "0.9rem" }}>{list.desc}</p>
            </div>
            <div style={{ minWidth: 210, flex: "0 1 230px" }}>
              <div className="d-flex justify-content-between mb-1" style={{ fontSize: "0.8rem" }}>
                <span style={{ color: "var(--text-2)" }}>{doneCount} of {total} completed</span>
                <span className="fw-bold" style={{ fontFamily: "var(--font-mono)", color: pct === 100 ? "var(--success)" : "var(--primary)" }}>{pct}%</span>
              </div>
              <div className={cx("meter", pct === 100 && "success")} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${list.name} progress`}>
                <div style={{ width: `${Math.max(pct, doneCount ? 4 : 0)}%` }} />
              </div>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 mt-3 no-print">
            <button className="btn-sdh sm" onClick={() => window.print()}>
              <Download size={14} aria-hidden="true" /> Download as PDF
            </button>
            <button className="btn-sdh sm" onClick={copyMarkdown}>
              <Copy size={14} aria-hidden="true" /> Copy as Markdown
            </button>
            <button className="btn-sdh sm danger-ghost ms-auto" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={14} aria-hidden="true" /> Reset Checklist
            </button>
          </div>
          {pct === 100 && (
            <div className="d-flex align-items-center gap-2 mt-3 p-3 rounded-3" role="status" style={{ background: "var(--success-soft)", color: "var(--success)", fontWeight: 600, fontSize: "0.92rem" }}>
              <Check size={18} aria-hidden="true" /> Audit complete — every item on this checklist checks out. Ship it.
            </div>
          )}
        </div>
        </Reveal>

        {/* groups */}
        {list.groups.map((g) => (
          <section key={g.group} aria-label={g.group} className="mb-2">
            <h3 className="chk-group-title">
              <span style={{ width: 26, height: 2, background: "var(--primary)", borderRadius: 2, display: "inline-block" }} aria-hidden="true" />
              {g.group}
            </h3>
            <div className="sd-card print-area">
              {g.items.map((it) => (
                <ChecklistRow
                  key={it.id}
                  item={it}
                  checked={!!state[it.id]}
                  onToggle={(v) => set(it.id, v)}
                />
              ))}
            </div>
          </section>
        ))}

        <p className="mt-4 mb-0 no-print" style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>
          Progress is stored only in your browser's localStorage — no account, no sync, nothing leaves your machine.
        </p>
      </div>

      {/* confirm reset modal */}
      {confirmReset && (
        <div className="modal-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setConfirmReset(false); }}>
          <div className="sd-card p-4" role="dialog" aria-modal="true" aria-labelledby="reset-title" style={{ maxWidth: 420, width: "100%", boxShadow: "var(--shadow)" }}>
            <div className="d-flex align-items-center gap-3 mb-2">
              <span className="icon-tile danger"><TriangleAlert size={20} aria-hidden="true" /></span>
              <h2 id="reset-title" style={{ fontSize: "1.15rem", margin: 0 }}>Reset this checklist?</h2>
            </div>
            <p style={{ color: "var(--text-2)", fontSize: "0.9rem", lineHeight: 1.65 }}>
              This will uncheck all <strong>{total} items</strong> in “{list.name}”. This action only affects this browser, and it can't be undone.
            </p>
            <div className="d-flex gap-2 justify-content-end mt-3">
              <button className="btn-sdh sm" onClick={() => setConfirmReset(false)} autoFocus>Cancel</button>
              <button
                className="btn-sdh sm danger-ghost"
                style={{ borderColor: "var(--danger)", background: "var(--danger-soft)" }}
                onClick={() => { reset(); setConfirmReset(false); toast("Checklist reset"); }}
              >
                <ShieldAlert size={14} aria-hidden="true" /> Reset it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- one checklist row ---------- */
function ChecklistRow({ item, checked, onToggle }: { item: ChecklistItem; checked: boolean; onToggle: (v: boolean) => void }) {
  const sevClass = item.severity === "critical" ? "badge-critical" : item.severity === "high" ? "badge-high" : "badge-medium";
  return (
    <div className={cx("chk-item", checked && "done")}>
      <input
        type="checkbox"
        className="chk-box"
        checked={checked}
        onChange={(e) => onToggle(e.target.checked)}
        aria-label={item.title}
      />
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <div className="d-flex align-items-start justify-content-between gap-2 flex-wrap">
          <label className="chk-title" style={{ cursor: "pointer" }} onClick={() => onToggle(!checked)}>
            {item.title}
          </label>
          <span className={cx("badge-sdh", sevClass)} style={{ fontSize: "0.62rem" }}>{item.severity}</span>
        </div>
        <details>
          <summary style={{ color: "var(--text-2)", fontSize: "0.82rem", cursor: "pointer", marginTop: 3 }}>
            Details & why it matters
          </summary>
          <p className="chk-desc mb-0 mt-2">{item.desc}</p>
          {item.code && (
            <pre
              className="mt-2 mb-0 p-2"
              style={{
                background: "var(--code-bg)", border: "1px solid var(--border-soft)", borderRadius: 8,
                fontSize: "0.76rem", lineHeight: 1.6, overflowX: "auto", color: "var(--text-2)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {item.code.snippet}
            </pre>
          )}
        </details>
      </div>
      <div className="no-print">
        <span className={cx("badge-sdh", checked ? "badge-success" : "badge-neutral")} style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem" }} aria-hidden="true">
          {checked ? "Done" : "To do"}
        </span>
      </div>
    </div>
  );
}
