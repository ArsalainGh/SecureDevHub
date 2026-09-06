# SecureDevHub

![SecureDevHub Screenshot](./public/assets/Screenshot%202026-09-06%20094626.png)

**Write Code. Ship Secure.**

A free, open-source security guide for web developers. Learn the vulnerabilities that
take real sites down, fix them with real code in JavaScript, Python and PHP, and never
ship insecure code again — no accounts, no paywalls, no tracking, 100% static.

- **16 learning modules** — XSS, SQL injection, authentication, headers, secrets and more
- **5 interactive checklists** — pre-launch, frontend, backend, API and DevOps audits
- **33 curated tools** — scanners, header analyzers, dependency auditors, free learning platforms
- **10 "Spot the Bug" challenges** — real audit findings, instant feedback
- **Breach case studies** — British Airways, Equifax, TalkTalk and friends

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Routes](#routes)
- [Design system](#design-system)
- [Data model](#data-model)
- [Client-side persistence](#client-side-persistence)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [SEO](#seo)
- [Content sources & disclaimer](#content-sources--disclaimer)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Home (`/`)
- Animated terminal narrating a reflected-XSS attack being neutralized
  (output encoding + CSP + HttpOnly), with type-on effect and reduced-motion support
- Count-up stats bar — 16 modules · 5 checklists · 30+ tools · 100% free
- "Why security matters" stat cards (43% of attacks hit small businesses,
  $4.45M average breach cost, 95% of breaches involve human error)
- Featured module grid, Learn → Practice → Apply steps
- A live, fully functional Spot-the-Bug demo challenge
- Tools rail, security quotes (Schneier, Spafford), newsletter UI (demo only)

### Learning modules (`/modules`, `/module/:id`)
- All 16 modules listed with severity category badges (Critical / High / Medium),
  category tags (Frontend / Backend / DevOps / General), reading-time estimates,
  and localStorage-backed completion checkmarks
- Filters by severity and category, keyword filtering, overall progress meter
- Each module page contains **14 sections**:
  1. Header — breadcrumb, severity badge, difficulty, OWASP reference link
  2. **What is it?** — plain-English explanation, analogy, hover-tooltipped key terms
  3. **Why should you care?** — real breach cards with dates, impact and statistics
  4. **How the attack works** — animated step-by-step flow + attack-type cards
  5. **Vulnerable code** — tabbed JS / Python / PHP with red-marked dangerous lines
  6. **Secure code** — same tabs, green-marked fixes, line-by-line annotations
  7. **Before vs after** — side-by-side comparison
  8. **Quick rules** — 5–7 numbered rules, copyable as plain text
  9. **Test yourself** — quiz with instant feedback, explanations, best score stored
  10. **Common mistakes** — accordion with explanations and fixes
  11. **Tools for this topic** — free/freemium badges, external links
  12. **Further reading** — OWASP, MDN, PortSwigger, RFCs…
  13. **Mark as complete** — persists to localStorage
  14. Pagination — previous / next module
- **XSS, SQL Injection and Authentication & Authorization carry full long-form
  content** (5 quiz questions, 4–5 mistakes, three languages); the remaining 13
  modules ship compact-but-complete versions of the same structure.

### Checklists (`/checklists`)
- 5 interactive audits: **Pre-Launch** (43 items), **Frontend**, **Backend**, **API**, **DevOps**
- Every item: checkbox, severity badge, expandable "why it matters" detail,
  optional config snippet
- Checkbox state persists in localStorage; per-list progress meters
- **Copy as Markdown** (checkboxes included), **Download as PDF** (print-optimized
  stylesheet that expands all details), **Reset** with confirmation modal

### Tools (`/tools`)
- 33 curated tools in 6 categories (Scanning, Headers, Dependencies, Libraries,
  Testing, Learning) with Free / Freemium / Paid badges, tags and outbound links
- Category tab filters + keyword search

### Blog (`/blog`, `/blog/:id`)
- Featured case-study hero + article grid
- Full posts: *British Airways Magecart autopsy*, *Equifax breach timeline*,
  *10 Security Headers Every Website Should Have*, plus JWT pitfalls, TalkTalk SQLi
  and modern-CSRF posts
- Structured article body (headings, lists, quotes, call-outs, tabbed code) and
  JSON-LD `Article` metadata per post

### Playground (`/playground`)
- 10 "Spot the Bug" challenges (SQLi, XSS, auth, CSRF, headers, session, secrets,
  uploads, CORS, JWT) with difficulty badges
- Instant correct/wrong feedback, explanations, and the secure rewrite shown side-by-side
- Score tracking + reset, all persisted locally

### Cross-cutting
- **Ctrl/Cmd + K search** — modal searching modules, rules, checklist items, tools,
  posts and challenges, with grouped results, match highlighting and full keyboard
  navigation (arrows / Enter / Esc)
- **Dark (default) and light themes** — toggle in the navbar, persisted, respects
  `prefers-color-scheme`, zero flash-of-wrong-theme via an inline boot script
- Toast notifications, back-to-top, scroll-reveal animations, skip-to-content link,
  custom security-themed **404 page**

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript, bundled by Vite |
| UI toolkit | **Bootstrap 5.3.8 via CDN (SRI-verified)** with custom CSS overrides |
| Styling | Single design-system stylesheet using CSS custom properties (`data-theme`) |
| Fonts | Inter (UI) + JetBrains Mono (code), Google Fonts |
| Icons | Lucide (+ inline SVG brand marks) |
| Routing | Hash router (`#/…`) so every page works from static hosting / file servers |
| Data | All content hardcoded as typed data modules (the "JSON file" of the spec, in TS) |
| Persistence | localStorage only — no backend, no API calls, no database |
| Output | `vite-plugin-singlefile` inlines everything into one deployable `index.html` |

No jQuery. No tracking scripts. No server required.

---

## Project structure

```
SecureDevHub/
├── index.html                  # shell: meta/SEO/OG tags, fonts, Bootstrap CDN,
│                               #   theme boot script, JSON-LD
├── public/
│   └── og-image.png            # social share image
├── src/
│   ├── main.tsx                # entry
│   ├── App.tsx                 # route table + site chrome (navbar/footer/search)
│   ├── index.css               # design system: tokens, Bootstrap variable bridge,
│   │                           #   components, print stylesheet, animations
│   ├── lib/
│   │   ├── utils.ts            # hash router, localStorage wrapper, hooks, clipboard, toasts
│   │   └── highlight.ts        # lightweight Prism-style syntax highlighter
│   ├── data/
│   │   ├── types.ts            # the modules.json schema (as TypeScript types)
│   │   ├── modules.ts          # all 16 modules assembled + progress helpers
│   │   ├── modules-critical.ts #   01 auth (full) · 02 input validation
│   │   ├── modules-critical-xss-sqli.ts  #   03 XSS (full) · 04 SQLi (full)
│   │   ├── modules-critical-rest.ts      #   07 HTTPS · 08 data exposure · 16 secrets
│   │   ├── modules-high.ts     #   05 CSRF · 06 headers · 09 API · 10 deps ·
│   │   │                       #   11 uploads · 12 sessions
│   │   ├── modules-medium.ts   #   13 rate limiting · 14 CORS · 15 logging
│   │   ├── checklists.ts       # 5 checklists, grouped items
│   │   ├── tools.ts            # 33 tools
│   │   ├── blog.ts             # 6 posts (structured block content)
│   │   ├── playground.ts       # 10 challenges
│   │   └── search.ts           # client-side search index (500+ entries)
│   ├── components/
│   │   ├── Chrome.tsx          # navbar, footer, Ctrl+K search modal, toast, back-to-top
│   │   ├── CodeBlock.tsx       # tabbed code viewer: highlight, danger/fix lines, copy
│   │   ├── interactive.tsx     # Quiz + Spot-the-Bug challenge cards
│   │   ├── cards.tsx           # module / tool / blog cards
│   │   └── ui.tsx              # icon registry, badges, reveal-on-scroll, headers
│   └── pages/                  # Home, Modules, ModuleDetail, Checklists, Tools,
│                               #   Blog, BlogPost, Playground, About, NotFound
└── README.md
```

---

## Getting started

Requires Node.js 18+.

```bash
# install dependencies
npm install

# start the dev server
npm run dev

# production build → dist/index.html (fully self-contained)
npm run build

# preview the production build
npm run preview
```

The production build is a **single static HTML file** with all JS/CSS inlined —
host it anywhere (GitHub Pages, Netlify, S3, nginx) or open it directly. It works
offline after the first load; no environment variables or backend are needed.

---

## Routes

The classic multi-page structure is reproduced with hash routing, so nothing
requires server rewrites:

| Route | Equivalent file | Purpose |
|---|---|---|
| `#/` | `index.html` | Home |
| `#/modules` | `modules.html` | All 16 learning modules |
| `#/module/:id` | `module-detail.html?id=…` | Individual module (e.g. `#/module/xss`) |
| `#/checklists` | `checklists.html` | Interactive checklists (`?list=frontend` deep-links) |
| `#/tools` | `tools.html` | Curated tools directory |
| `#/blog` | `blog.html` | Case studies & tutorials |
| `#/blog/:id` | `blog-post.html` | Individual article |
| `#/playground` | `playground.html` | Spot the Bug challenges |
| `#/about` | `about.html` | Mission, contributing, credits |
| anything else | `404.html` | Security-themed 404 |

---

## Design system

GitHub-docs-inspired, dark-first:

| Token | Dark | Light |
|---|---|---|
| Background | `#0d1117` | `#ffffff` |
| Card | `#161b22` | `#f6f8fa` |
| Borders | `#30363d` | `#d0d7de` |
| Primary text | `#e6edf3` | `#1f2328` |
| Secondary text | `#8b949e` | `#656d76` |
| Accent | `#58a6ff` | `#0969da` |
| Success / Danger / Warning | `#3fb950` / `#f85149` / `#d29922` | same family |

- CSS custom properties on `:root` + `[data-theme]`, bridged into Bootstrap's
  `--bs-*` variables so native components inherit the theme
- 8–10px border radius, 0.25s easing, hover-lift cards, focus-visible rings
- `prefers-reduced-motion` disables animation and the typing effect
- Print stylesheet for checklist → PDF export

---

## Data model

All content is typed data (spec: `data/modules.json`). Key shapes:

```ts
SecurityModule {
  id, number, title, icon, severity, categories[], time, difficulty,
  owaspLabel/Url, tagline,
  what  { text, analogy, terms[] },
  why   { text, breaches[], stats[] },
  how   { steps[], types[] },
  vulnerable[] / secure[]   // CodeTab { lang, code, mark[] }
  fixes[], rules[], quiz[], mistakes[], tools[], reading[]
}

Checklist { id, name, groups[{ group, items[{ id, title, desc, severity, code? }] }] }
BlogPost  { id, title, category, date, blocks[ p | h2 | list | quote | callout | code ] }
Challenge { id, title, difficulty, category, code, options[4], correct, why, fix }
```

Adding a module/checklist/tool/post is a data-only change — the pages render from these arrays.

---

## Client-side persistence

Everything lives in `localStorage` under the `sdh_` prefix — no account, no sync,
nothing leaves the browser.

| Key | Contents |
|---|---|
| `sdh_theme` | `dark` \| `light` |
| `sdh_module_{id}_completed` | module completion flag |
| `sdh_quiz_{id}_best` | best quiz score per module |
| `sdh_chk_{listId}_{itemId}` | checklist item state |
| `sdh_pg_solved` | solved challenge ids |
| `sdh_pg_picks` | chosen answers per challenge |

---

## Accessibility

- Semantic landmarks (`header`/`nav`/`main`/`article`/`footer`), skip-to-content control
- Full keyboard support: Ctrl+K search (arrows/Enter/Esc), focus-visible rings,
  labelled controls, aria-pressed/states on toggles and tabs
- Color is never the only signal — severity, state and correctness always pair
  color with icons/text
- WCAG-AA-oriented contrast in both themes; `prefers-reduced-motion` honored
- Code examples expose line numbers as `aria-hidden` and keep real text selectable

## Performance

- Bootstrapped from CDN with SRI; app ships as one inlined HTML (~180 KB gz)
- IntersectionObserver-driven reveal animations (no scroll handlers), minimal layout
  work, lazy none-of-your-business JavaScript
- Zero runtime network requests after fonts/CSS — fully offline-capable

## SEO

- Per-page `<title>`, description, canonical, Open Graph + Twitter cards, `og:image`
- JSON-LD `WebSite` globally and `Article` per blog post
- Descriptive anchors, heading hierarchy, hash-route table that mirrors a sitemap

---

## Content sources & disclaimer

Guidance follows the OWASP Top 10 (2021), OWASP API Security Top 10 (2023), the
OWASP Cheat Sheet Series, MDN Web Docs and RFC 8725. Breach facts come from public
sources: ICO enforcement notices (British Airways, TalkTalk), the U.S. House
Oversight report and FTC settlement (Equifax), and vendor disclosures — restated in
good faith for education.

> The intentionally vulnerable code samples in this repository exist to teach
> defense. Do not deploy them anywhere, and only ever test security tools against
> systems you own or are authorized to assess.

---

## Contributing

Contributions welcome — this is a teaching project, so clarity beats cleverness.

1. Fork and create a branch (`content/ecc-note`, `fix/quiz-typo`…)
2. For content: follow an existing entry's shape in `src/data/*` and run `npm run build`
3. Open a PR describing *what readers will learn*

Good first tasks: translations, new language tabs for code examples, new
"Spot the Bug" challenges, more curated tools, typo and clarity fixes.

---

## License

MIT — use it, fork it, teach with it, ship it internally. Attribution appreciated,
never required.

---

Made with care for the developer community. This site practices what it preaches —
check our headers.
