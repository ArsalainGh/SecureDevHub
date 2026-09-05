// ============================================================
// SecureDevHub — shared data types (the modules.json schema)
// ============================================================

export type Severity = "critical" | "high" | "medium";
export type Category = "frontend" | "backend" | "devops" | "general";

export interface CodeTab {
  lang: "javascript" | "python" | "php" | "html" | "bash" | "http" | "sql" | "json";
  label?: string;
  code: string;
  /** 1-indexed line numbers to mark (danger in vulnerable view, fix in secure view) */
  mark?: number[];
}

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number; // index into options
  why: string;
}

export interface BreachExample {
  company: string;
  year: string;
  impact: string;
  details: string;
}

export interface StatCard {
  value: string;
  label: string;
}

export interface ModuleTool {
  name: string;
  desc: string;
  url: string;
  price: "Free" | "Freemium" | "Paid";
}

export interface FurtherReading {
  title: string;
  source: string;
  type: "Article" | "Video" | "Docs" | "Tool" | "Course";
  url: string;
}

export interface Mistake {
  mistake: string;
  explanation: string;
  fix: string;
}

export interface SecurityModule {
  id: string;
  number: number;
  title: string;
  icon: string; // key into MODULE_ICONS in components/ui.tsx
  severity: Severity;
  categories: Category[];
  time: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  updated: string;
  owaspLabel: string;
  owaspUrl: string;
  tagline: string;
  what: {
    text: string;
    analogy: string;
    terms: { term: string; def: string }[];
  };
  why: {
    text: string;
    breaches: BreachExample[];
    stats: StatCard[];
  };
  how: {
    steps: string[];
    types: { name: string; desc: string }[];
  };
  vulnerable: CodeTab[];
  secure: CodeTab[];
  fixes: string[];
  rules: string[];
  quiz: QuizQuestion[];
  mistakes: Mistake[];
  tools: ModuleTool[];
  reading: FurtherReading[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  desc: string;
  severity: Severity;
  code?: { lang: CodeTab["lang"]; snippet: string };
}

export interface ChecklistGroup {
  group: string;
  items: ChecklistItem[];
}

export interface Checklist {
  id: string;
  name: string;
  short: string;
  desc: string;
  icon: string;
  groups: ChecklistGroup[];
}

export interface Tool {
  id: string;
  name: string;
  desc: string;
  category: string; // Scanning | Headers | Dependencies | Libraries | Testing | Learning
  price: "Free" | "Freemium" | "Paid";
  url: string;
  icon: string;
  tags: string[];
}

export type BlogBlock =
  | { t: "p"; text: string }
  | { t: "h2"; text: string }
  | { t: "h3"; text: string }
  | { t: "list"; items: string[] }
  | { t: "quote"; text: string; cite?: string }
  | { t: "callout"; kind: "info" | "warn" | "ok"; text: string }
  | { t: "code"; tabs: CodeTab[]; banner?: "warn" | "ok" };

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: "Case Study" | "Tutorial" | "News";
  date: string;
  time: string;
  tags: string[];
  featured?: boolean;
  blocks: BlogBlock[];
}

export interface Challenge {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  code: { lang: CodeTab["lang"]; snippet: string };
  options: string[];
  correct: number;
  why: string;
  fix: { lang: CodeTab["lang"]; snippet: string };
}
