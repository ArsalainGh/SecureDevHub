// ============================================================
// SecureDevHub — curated tools & resources directory
// ============================================================
import type { Tool } from "./types";

export const TOOL_CATEGORIES = [
  "All",
  "Scanning",
  "Headers",
  "Dependencies",
  "Libraries",
  "Testing",
  "Learning",
] as const;

export const TOOLS: Tool[] = [
  /* --- Scanning & Testing --- */
  { id: "zap", name: "OWASP ZAP", desc: "Free, open-source web app security scanner with active/passive modes and an intercepting proxy.", category: "Scanning", price: "Free", url: "https://www.zaproxy.org", icon: "radar", tags: ["scanner", "proxy", "owasp"] },
  { id: "burp", name: "Burp Suite Community", desc: "The industry-standard web vulnerability scanner and testing proxy.", category: "Scanning", price: "Freemium", url: "https://portswigger.net/burp/communitydownload", icon: "crosshair", tags: ["proxy", "scanner", "manual"] },
  { id: "nikto", name: "Nikto", desc: "Open-source web server scanner — finds outdated software, misconfigurations and dangerous files.", category: "Scanning", price: "Free", url: "https://github.com/sullo/nikto", icon: "scan-line", tags: ["server", "cli"] },
  { id: "sqlmap", name: "SQLMap", desc: "Automatic SQL injection detection and exploitation — point it at your own staging apps.", category: "Scanning", price: "Free", url: "https://sqlmap.org", icon: "database-zap", tags: ["sqli", "cli", "automation"] },
  { id: "nmap", name: "Nmap", desc: "Network discovery and security auditing — the classic port scanner.", category: "Scanning", price: "Free", url: "https://nmap.org", icon: "network", tags: ["network", "cli"] },
  { id: "wpscan", name: "WPScan", desc: "WordPress vulnerability scanner covering core, plugins and themes.", category: "Scanning", price: "Freemium", url: "https://wpscan.com", icon: "wordpress", tags: ["wordpress", "cli"] },

  /* --- Header & SSL --- */
  { id: "securityheaders", name: "SecurityHeaders.com", desc: "Instant letter-grade analysis of your HTTP response headers, by Scott Helme.", category: "Headers", price: "Free", url: "https://securityheaders.com", icon: "panel-top", tags: ["headers", "scan"] },
  { id: "observatory", name: "Mozilla Observatory", desc: "Free website security assessment: TLS, headers, cookies, CSP and more.", category: "Headers", price: "Free", url: "https://observatory.mozilla.org", icon: "telescope", tags: ["headers", "tls", "scan"] },
  { id: "ssllabs", name: "SSL Labs", desc: "Deep SSL/TLS configuration analysis with grading — the HTTPS gold standard test.", category: "Headers", price: "Free", url: "https://www.ssllabs.com/ssltest/", icon: "shield-check", tags: ["tls", "ssl", "grade"] },
  { id: "cspeval", name: "CSP Evaluator", desc: "Google's tool verifying whether your Content-Security-Policy would actually stop XSS.", category: "Headers", price: "Free", url: "https://csp-evaluator.withgoogle.com", icon: "list-checks", tags: ["csp", "headers"] },
  { id: "reporturi", name: "Report URI", desc: "Hosted CSP and security header violation reporting — deploy real CSPs safely.", category: "Headers", price: "Freemium", url: "https://report-uri.com", icon: "flag", tags: ["csp", "reporting"] },

  /* --- Dependency scanning --- */
  { id: "snyk", name: "Snyk", desc: "Find and automatically fix vulnerabilities in dependencies, containers and IaC.", category: "Dependencies", price: "Freemium", url: "https://snyk.io", icon: "package-search", tags: ["deps", "fix", "ci"] },
  { id: "npmaudit", name: "npm audit", desc: "Built-in Node.js dependency auditing — zero setup, run it in CI today.", category: "Dependencies", price: "Free", url: "https://docs.npmjs.com/cli/v10/commands/npm-audit", icon: "terminal", tags: ["node", "deps", "built-in"] },
  { id: "dependabot", name: "Dependabot", desc: "Automated dependency-update pull requests, native to GitHub.", category: "Dependencies", price: "Free", url: "https://github.com/dependabot", icon: "git-pull-request", tags: ["github", "automation"] },
  { id: "depcheck", name: "OWASP Dependency-Check", desc: "Software composition analysis identifying known-vulnerable components.", category: "Dependencies", price: "Free", url: "https://owasp.org/www-project-dependency-check/", icon: "boxes", tags: ["sca", "java", "multi"] },
  { id: "socket", name: "Socket.dev", desc: "Supply-chain security for npm — catches malicious packages, not just CVEs.", category: "Dependencies", price: "Freemium", url: "https://socket.dev", icon: "shield-alert", tags: ["supply-chain", "npm"] },

  /* --- Browser extensions (Testing) --- */
  { id: "wappalyzer", name: "Wappalyzer", desc: "Technology profiler — see what any site is built with for recon practice.", category: "Testing", price: "Freemium", url: "https://www.wappalyzer.com", icon: "scan-search", tags: ["extension", "recon"] },
  { id: "cookieeditor", name: "Cookie-Editor", desc: "Inspect, create and modify cookies — essential for session testing.", category: "Testing", price: "Free", url: "https://cookie-editor.com", icon: "cookie", tags: ["extension", "cookies"] },
  { id: "corsunblock", name: "CORS Everywhere (test only)", desc: "Toggle CORS restrictions while debugging — never ship to production with it on.", category: "Testing", price: "Free", url: "https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/", icon: "globe", tags: ["extension", "cors", "debugging"] },
  { id: "hackbar", name: "HackBar", desc: "Security-testing toolbar for crafting and replaying requests from the browser.", category: "Testing", price: "Freemium", url: "https://addons.mozilla.org/en-US/firefox/addon/hackbar-free/", icon: "wrench", tags: ["extension", "requests"] },

  /* --- Libraries --- */
  { id: "helmet", name: "Helmet.js", desc: "Set all critical Express security headers with one middleware.", category: "Libraries", price: "Free", url: "https://helmetjs.github.io", icon: "hard-hat", tags: ["express", "headers", "node"] },
  { id: "dompurify", name: "DOMPurify", desc: "The XSS sanitizer for HTML/SVG — heavily audited, fast, framework-agnostic.", category: "Libraries", price: "Free", url: "https://github.com/cure53/DOMPurify", icon: "sparkles", tags: ["xss", "sanitize", "js"] },
  { id: "bcryptjs", name: "bcrypt.js", desc: "Password hashing done right for Node and the browser edge cases.", category: "Libraries", price: "Free", url: "https://github.com/dcodeIO/bcrypt.js", icon: "hash", tags: ["auth", "passwords", "node"] },
  { id: "csurf", name: "csrf-csrf", desc: "Modern double-submit CSRF protection for Express.", category: "Libraries", price: "Free", url: "https://github.com/Psifi-Solutions/csrf-csrf", icon: "shuffle", tags: ["csrf", "express"] },
  { id: "ratelimit", name: "rate-limiter-flexible", desc: "Counts and limits actions by key across Node, Redis, memory and more.", category: "Libraries", price: "Free", url: "https://github.com/animir/node-rate-limiter-flexible", icon: "gauge", tags: ["rate-limit", "node"] },
  { id: "expressvalidator", name: "express-validator", desc: "Declarative validation and sanitization chains for Express routes.", category: "Libraries", price: "Free", url: "https://express-validator.github.io", icon: "badge-check", tags: ["validation", "express"] },
  { id: "djangosecurity", name: "django-security / django-csp", desc: "Security middleware and CSP support for Django projects.", category: "Libraries", price: "Free", url: "https://github.com/sdelements/django-security", icon: "shield", tags: ["python", "django"] },
  { id: "bleach", name: "bleach (Python)", desc: "Allowlist-based HTML sanitizing library for Python.", category: "Libraries", price: "Free", url: "https://bleach.readthedocs.io", icon: "flask-conical", tags: ["python", "xss", "sanitize"] },

  /* --- Learning platforms --- */
  { id: "portswigger", name: "PortSwigger Web Security Academy", desc: "Free, hands-on labs from the makers of Burp Suite — the best place to practice.", category: "Learning", price: "Free", url: "https://portswigger.net/web-security", icon: "graduation-cap", tags: ["labs", "free", "course"] },
  { id: "owasptop10", name: "OWASP Top 10", desc: "The industry-standard awareness document for web application risks.", category: "Learning", price: "Free", url: "https://owasp.org/Top10/", icon: "trophy", tags: ["owasp", "reference"] },
  { id: "hackthebox", name: "HackTheBox", desc: "Penetration-testing practice on real machines — from beginner to insane.", category: "Learning", price: "Freemium", url: "https://www.hackthebox.com", icon: "box", tags: ["labs", "pentest"] },
  { id: "tryhackme", name: "TryHackMe", desc: "Beginner-friendly guided security learning paths and rooms.", category: "Learning", price: "Freemium", url: "https://tryhackme.com", icon: "map", tags: ["labs", "beginner"] },
  { id: "cheatsheets", name: "OWASP Cheat Sheet Series", desc: "Condensed, actionable guidance for every security topic we cover.", category: "Learning", price: "Free", url: "https://cheatsheetseries.owasp.org", icon: "file-text", tags: ["reference", "owasp"] },
  { id: "webdev", name: "web.dev Security (Google)", desc: "Google's web security guides: HTTPS, CSP, cookies and more.", category: "Learning", price: "Free", url: "https://web.dev/explore/secure", icon: "chrome", tags: ["google", "guides"] },
  { id: "stanford", name: "Stanford CS253 Web Security", desc: "Full free university course on web security — lectures and materials online.", category: "Learning", price: "Free", url: "https://cs253.stanford.edu", icon: "school", tags: ["course", "university"] },
];
