// ============================================================
// SecureDevHub — all 16 modules, ordered 01 → 16
// ============================================================
import type { SecurityModule } from "./types";
import { CRITICAL_MODULES } from "./modules-critical";
import { XSS_SQLI_MODULES } from "./modules-critical-xss-sqli";
import { CRITICAL_REST_MODULES } from "./modules-critical-rest";
import { HIGH_MODULES } from "./modules-high";
import { MEDIUM_MODULES } from "./modules-medium";

const ALL: SecurityModule[] = [
  ...CRITICAL_MODULES,
  ...XSS_SQLI_MODULES,
  ...HIGH_MODULES,
  ...CRITICAL_REST_MODULES,
  ...MEDIUM_MODULES,
];

export const MODULES: SecurityModule[] = ALL.sort((a, b) => a.number - b.number);

export function getModule(id: string): SecurityModule | undefined {
  return MODULES.find((m) => m.id === id);
}

export function adjacentModules(id: string): {
  prev?: SecurityModule;
  next?: SecurityModule;
} {
  const i = MODULES.findIndex((m) => m.id === id);
  return {
    prev: i > 0 ? MODULES[i - 1] : undefined,
    next: i >= 0 && i < MODULES.length - 1 ? MODULES[i + 1] : undefined,
  };
}

export const FEATURED_IDS = ["xss", "sql-injection", "authentication", "security-headers", "secrets", "csrf"];

export const SEVERITY_META: Record<string, { label: string; css: string }> = {
  critical: { label: "Critical", css: "badge-critical" },
  high: { label: "High", css: "badge-high" },
  medium: { label: "Medium", css: "badge-medium" },
};

export const CATEGORY_LABELS: Record<string, string> = {
  frontend: "Frontend",
  backend: "Backend",
  devops: "DevOps",
  general: "General",
};

/* ---------- progress helpers (localStorage) ---------- */
import { store } from "../lib/utils";

export function isModuleDone(id: string): boolean {
  return store.get<boolean>(`sdh_module_${id}_completed`, false);
}

export function setModuleDone(id: string, done: boolean): void {
  store.set(`sdh_module_${id}_completed`, done);
  window.dispatchEvent(new Event("sdh-progress"));
}

export function completedCount(): number {
  return MODULES.filter((m) => isModuleDone(m.id)).length;
}
