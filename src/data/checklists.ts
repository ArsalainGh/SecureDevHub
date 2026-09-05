// ============================================================
// SecureDevHub — interactive security checklists
// ============================================================
import type { Checklist } from "./types";

export const CHECKLISTS: Checklist[] = [
  {
    id: "pre-launch",
    name: "Pre-Launch Checklist",
    short: "Pre-Launch",
    desc: "The complete audit to run before any site goes live. If you only ever use one checklist, make it this one.",
    icon: "rocket",
    groups: [
      {
        group: "HTTPS & Transport",
        items: [
          { id: "tls-cert", title: "HTTPS enabled with valid TLS 1.2+ certificate", desc: "Test your full chain with SSL Labs and aim for A/A+. Certificates should auto-renew (Let's Encrypt or platform-managed).", severity: "critical" },
          { id: "http-redirect", title: "HTTP redirects to HTTPS", desc: "Every http:// URL 301s to its https:// equivalent before any content is served.", severity: "critical", code: { lang: "bash", snippet: "server { listen 80;\n  return 301 https://$host$request_uri; }" } },
          { id: "hsts", title: "HSTS header enabled", desc: "Strict-Transport-Security with max-age ≥ 1 year, includeSubDomains and preload once stable.", severity: "high", code: { lang: "http", snippet: "Strict-Transport-Security: max-age=63072000; includeSubDomains; preload" } },
        ],
      },
      {
        group: "Security Headers",
        items: [
          { id: "csp", title: "Content-Security-Policy configured", desc: "Start with default-src 'self'; script-src 'self'. Roll out in Report-Only mode first, then enforce.", severity: "critical", code: { lang: "http", snippet: "Content-Security-Policy: default-src 'self'; script-src 'self'; frame-ancestors 'none'" } },
          { id: "nosniff", title: "X-Content-Type-Options: nosniff", desc: "Stops MIME-sniffing attacks where a .txt upload renders as HTML.", severity: "high" },
          { id: "xfo", title: "X-Frame-Options: DENY or SAMEORIGIN", desc: "Clickjacking protection. Prefer CSP frame-ancestors, keep XFO for older browsers.", severity: "high" },
          { id: "referrer", title: "Referrer-Policy configured", desc: "strict-origin-when-cross-origin (or stricter) prevents path/query leakage to third parties.", severity: "medium" },
          { id: "permissions", title: "Permissions-Policy configured", desc: "Disable camera, microphone, geolocation and other powerful features unless your app needs them.", severity: "medium", code: { lang: "http", snippet: "Permissions-Policy: camera=(), microphone=(), geolocation=()" } },
          { id: "xxsp", title: "X-XSS-Protection: 0 (rely on CSP instead)", desc: "The old auditor introduced more bugs than it fixed; browsers removed it. Set to 0 and lean on CSP.", severity: "medium" },
        ],
      },
      {
        group: "Authentication",
        items: [
          { id: "pw-hash", title: "Passwords hashed with bcrypt/argon2 (NOT MD5/SHA1)", desc: "bcrypt cost ≥ 12 or argon2id. Audit the codebase so no fast hash stores passwords anywhere.", severity: "critical" },
          { id: "mfa", title: "Multi-factor authentication available", desc: "TOTP at minimum; enforce for admins and sensitive accounts.", severity: "high" },
          { id: "lockout", title: "Account lockout after failed attempts", desc: "Rate-limit logins (e.g. 5 per 10 min per account+IP) and alert on stuffing patterns.", severity: "high" },
          { id: "pw-strength", title: "Password strength requirements enforced", desc: "Minimum length 12+, block breached passwords (haveibeenpwned k-anonymity API).", severity: "medium" },
          { id: "pw-reset", title: "Secure password reset flow", desc: "Single-use tokens, ≤ 1 hour expiry, generic responses (no account enumeration), reset invalidates sessions.", severity: "high" },
        ],
      },
      {
        group: "Input & Data",
        items: [
          { id: "server-validation", title: "All user inputs validated server-side", desc: "Allowlist schemas (type, length, format, range) per field. Client-side checks are UX only.", severity: "critical" },
          { id: "parameterized", title: "SQL queries use parameterized statements", desc: "100% of queries. grep for concatenation/f-strings into SQL — find zero.", severity: "critical" },
          { id: "output-encoding", title: "Output encoding/escaping implemented", desc: "Auto-escaping templates; textContent in the DOM; DOMPurify/bleach for rich text.", severity: "critical" },
          { id: "upload-validation", title: "File uploads validated (type, size, content)", desc: "Magic-byte detection, size caps, allowlisted formats — never trust names or client MIME.", severity: "high" },
          { id: "upload-storage", title: "File uploads stored outside webroot", desc: "Object storage or a non-executable directory; serve via attachment disposition from a separate domain.", severity: "high" },
        ],
      },
      {
        group: "Session & Cookies",
        items: [
          { id: "cookie-flags", title: "Session cookies: Secure, HttpOnly, SameSite flags", desc: "Verify with devtools: every session cookie carries all three flags and a tight path/domain.", severity: "critical" },
          { id: "session-timeout", title: "Session timeout configured", desc: "Idle timeout 15–30 min for sensitive apps; absolute timeout for all.", severity: "medium" },
          { id: "session-rotation", title: "Session regeneration after login", desc: "New session ID at authentication kills session fixation.", severity: "high" },
          { id: "csrf-tokens", title: "CSRF tokens on all state-changing forms", desc: "Session-bound tokens verified server-side on POST/PUT/DELETE.", severity: "high" },
        ],
      },
      {
        group: "API",
        items: [
          { id: "api-auth", title: "API authentication required", desc: "No unauthenticated endpoints beyond intentional public data. Test with curl.", severity: "critical" },
          { id: "api-ratelimit", title: "Rate limiting configured", desc: "Per key/IP budgets, 429 + Retry-After, stricter on auth endpoints.", severity: "high" },
          { id: "api-validation", title: "Input validation on all endpoints", desc: "Strict schemas reject unknown keys (blocks mass assignment).", severity: "high" },
          { id: "api-cors", title: "CORS properly configured (not wildcard)", desc: "Explicit origin allowlist; never '*' with credentials; no origin reflection.", severity: "high" },
          { id: "api-versioning", title: "API versioning implemented", desc: "/v1/ prefixes with a deprecation policy so old insecure versions can be retired.", severity: "medium" },
        ],
      },
      {
        group: "Dependencies",
        items: [
          { id: "deps-updated", title: "All dependencies up to date", desc: "Run npm outdated / pip-audit. Unpatched dependencies are the Equifax story.", severity: "high" },
          { id: "vuln-scan", title: "Vulnerability scan passed (npm audit / etc.)", desc: "npm audit --audit-level=high clean in CI, plus Dependabot/Renovate enabled.", severity: "high" },
          { id: "lockfile", title: "Lock files committed (package-lock.json)", desc: "Reproducible, byte-identical installs everywhere. Use npm ci in automation.", severity: "medium" },
          { id: "deps-minimal", title: "No unnecessary dependencies", desc: "Every package is attack surface. Delete what you don't use; own small utilities.", severity: "medium" },
        ],
      },
      {
        group: "Secrets",
        items: [
          { id: "no-source-secrets", title: "No secrets in source code", desc: "Run gitleaks/truffleHog over the repo AND full history.", severity: "critical" },
          { id: "env-vars", title: "Environment variables for configuration", desc: "Twelve-factor style: code and config live apart; real values from a manager in prod.", severity: "high" },
          { id: "env-gitignore", title: ".env files in .gitignore", desc: "Commit .env.example with placeholders only.", severity: "high" },
          { id: "key-perms", title: "API keys have minimum required permissions", desc: "Scoped keys per service/environment; rotation schedule in place.", severity: "medium" },
        ],
      },
      {
        group: "Error Handling",
        items: [
          { id: "error-pages", title: "Custom error pages (no stack traces)", desc: "Friendly 404/500 pages; stack traces only in private logs.", severity: "high" },
          { id: "error-consistency", title: "Consistent error responses", desc: "Uniform shapes and status codes; don't leak existence (404 vs 403) where it matters.", severity: "medium" },
          { id: "error-logging", title: "Error logging configured", desc: "Structured error logs with correlation IDs, scrubbed of secrets and PII.", severity: "medium" },
        ],
      },
      {
        group: "Monitoring",
        items: [
          { id: "sec-logging", title: "Security event logging enabled", desc: "Auth attempts, privilege changes, validation failures — structured and centralized.", severity: "high" },
          { id: "login-monitoring", title: "Login attempt monitoring", desc: "Alerts on stuffing/velocity patterns and impossible travel.", severity: "medium" },
          { id: "alerting", title: "Alerting for suspicious activity", desc: "Someone gets paged. Test the canary monthly.", severity: "high" },
          { id: "backups", title: "Regular backup strategy", desc: "Automated, encrypted, off-site — and restore-tested quarterly.", severity: "high" },
        ],
      },
    ],
  },
  {
    id: "frontend",
    name: "Frontend Security Checklist",
    short: "Frontend",
    desc: "Everything client-side: DOM safety, third-party scripts, storage hygiene and browser features.",
    icon: "monitor",
    groups: [
      {
        group: "DOM & Rendering",
        items: [
          { id: "no-innerhtml", title: "No unsanitized innerHTML / document.write", desc: "Use textContent for user data. grep the codebase — every innerHTML must be justified or sanitized.", severity: "critical", code: { lang: "javascript", snippet: "el.textContent = userInput; // safe\nel.innerHTML = userInput;    // XSS" } },
          { id: "sanitize-rich", title: "Rich text sanitized with DOMPurify", desc: "Minimal tag/attr allowlist; sanitize again on render, not just on save.", severity: "critical" },
          { id: "autoescape", title: "Template autoescaping never disabled", desc: "No |safe, raw() or dangerouslySetInnerHTML without an explicit sanitization step.", severity: "critical" },
          { id: "url-schemes", title: "href/src schemes allowlisted", desc: "Block javascript: and data: URLs in user-controlled links.", severity: "high" },
        ],
      },
      {
        group: "Data Storage",
        items: [
          { id: "no-secrets-storage", title: "No tokens/secrets in localStorage", desc: "XSS reads localStorage freely. Prefer HttpOnly cookies; short-lived tokens otherwise.", severity: "high" },
          { id: "no-pii-storage", title: "No PII cached in the browser", desc: "Session/local storage syncs to disk and gets harvested by info-stealers.", severity: "medium" },
          { id: "logout-clears", title: "Logout clears all client state", desc: "Storage, caches, service-worker data — and the server session too.", severity: "medium" },
        ],
      },
      {
        group: "Third-Party Scripts",
        items: [
          { id: "sri", title: "Subresource Integrity on CDN assets", desc: "SRI hashes pin CDN scripts so a compromised CDN can't inject code (ask British Airways).", severity: "high", code: { lang: "html", snippet: '<script src="https://cdn.example/lib.js"\n  integrity="sha384-oqVu..."\n  crossorigin="anonymous"></script>' } },
          { id: "script-inventory", title: "Third-party script inventory maintained", desc: "Every <script src> is approved and reviewed quarterly — each is a Magecart vector.", severity: "high" },
          { id: "csp-v2", title: "CSP limits third-party origins", desc: "script-src and connect-src explicitly list allowed external hosts.", severity: "high" },
          { id: "tag-manager-audit", title: "Tag managers audited", desc: "GTM containers are code-injection as a service — restrict publish rights.", severity: "medium" },
        ],
      },
      {
        group: "Browser Features",
        items: [
          { id: "form-autocomplete", title: "Autocomplete attributes set correctly", desc: "current-password, new-password, cc-number — and off only where genuinely needed.", severity: "medium" },
          { id: "clickjacking", title: "Frame protections deployed", desc: "frame-ancestors 'none' on sensitive pages; test by iframing yourself.", severity: "high" },
          { id: "postmessage", title: "postMessage origins validated", desc: "Check event.origin against an allowlist and validate message shape.", severity: "high", code: { lang: "javascript", snippet: "window.addEventListener('message', (e) => {\n  if (e.origin !== 'https://trusted.example') return;\n});" } },
        ],
      },
    ],
  },
  {
    id: "backend",
    name: "Backend Security Checklist",
    short: "Backend",
    desc: "Server-side fundamentals: auth, queries, config and least privilege.",
    icon: "server",
    groups: [
      {
        group: "Data Access",
        items: [
          { id: "param-queries", title: "100% parameterized database access", desc: "Including ORM raw() escape hatches and reporting queries.", severity: "critical" },
          { id: "db-least-priv", title: "Database user has least privilege", desc: "No DROP/ALTER for the app account; separate users per service.", severity: "high" },
          { id: "db-encrypted", title: "Sensitive columns encrypted at rest", desc: "Application-level encryption for the crown jewels, keys in KMS.", severity: "high" },
        ],
      },
      {
        group: "Application",
        items: [
          { id: "authz-everywhere", title: "Authorization checked on every route", desc: "Deny by default; ownership/tenant checks per object (BOLA).", severity: "critical" },
          { id: "debug-off", title: "Debug mode OFF in production", desc: "No Django DEBUG=True, no Flask debug, no exposed /console endpoints.", severity: "critical" },
          { id: "server-timing-safe", title: "Sensitive comparisons are timing-safe", desc: "Use crypto.timingSafeEqual / hmac.compare_digest for tokens.", severity: "medium" },
          { id: "deserialization", title: "No unsafe deserialization", desc: "Never unpickle/unserialize untrusted data; JSON for interchange.", severity: "critical" },
          { id: "mass-assign", title: "Mass assignment blocked", desc: "Strict schemas; explicit field mapping for writes.", severity: "high" },
        ],
      },
      {
        group: "Infrastructure",
        items: [
          { id: "headers-v2", title: "Security headers via middleware", desc: "helmet/django-security at the app layer, verified at the proxy.", severity: "high" },
          { id: "stage-parity", title: "Staging mirrors production config", desc: "Same headers, same TLS, sanitizer data — otherwise you're not testing anything.", severity: "medium" },
          { id: "admin-hidden", title: "Admin panels not internet-exposed", desc: "IP allowlist, VPN, or SSO — /admin is bot-scan target #1.", severity: "high" },
        ],
      },
    ],
  },
  {
    id: "api",
    name: "API Security Checklist",
    short: "API",
    desc: "The OWASP API Security Top 10 as a practical release gate.",
    icon: "braces",
    groups: [
      {
        group: "AuthN / AuthZ",
        items: [
          { id: "api-authn", title: "Every endpoint authenticated (or explicitly public)", desc: "Document which routes are public; test the rest with curl.", severity: "critical" },
          { id: "api-bola", title: "Object-level authorization on every fetch", desc: "Enumerate IDs yourself in staging: /api/orders/1..100 must not leak across tenants.", severity: "critical" },
          { id: "api-jwt", title: "Tokens validated properly", desc: "Pinned algorithm, expiry, audience, issuer — alg:none rejected.", severity: "high" },
        ],
      },
      {
        group: "Data & Limits",
        items: [
          { id: "api-dto", title: "Responses use allowlisted field projections", desc: "No raw models serialized — password hashes and internals stay internal.", severity: "high" },
          { id: "api-limits", title: "Rate + size limits applied", desc: "Per-key budgets, pagination caps, payload size limits.", severity: "high" },
          { id: "api-schema", title: "Request bodies schema-validated", desc: "strict() schemas: unknown fields rejected (mass assignment dead).", severity: "high" },
          { id: "api-errors", title: "Errors uniform and uninformative", desc: "No stack traces, no SQL errors, existence hidden with 404s.", severity: "medium" },
        ],
      },
      {
        group: "Lifecycle",
        items: [
          { id: "api-openapi", title: "OpenAPI spec maintained", desc: "Docs match reality; spec drives security tests in CI.", severity: "medium" },
          { id: "api-old-versions", title: "Old versions retired or patched", desc: "v1 with 2019's bug must not be reachable.", severity: "high" },
          { id: "api-cors-v2", title: "CORS allowlist minimal", desc: "Exact origins; no reflection; public data without credentials.", severity: "high" },
        ],
      },
    ],
  },
  {
    id: "devops",
    name: "DevOps Security Checklist",
    short: "DevOps",
    desc: "CI/CD, cloud, containers and infrastructure hygiene.",
    icon: "cloud-cog",
    groups: [
      {
        group: "CI/CD",
        items: [
          { id: "ci-secrets", title: "CI secrets masked & minimal", desc: "Short-lived, least-privilege tokens; nothing printed to logs.", severity: "critical" },
          { id: "ci-scanning", title: "Pipeline runs security scans", desc: "gitleaks + dependency audit + container scan on every PR.", severity: "high" },
          { id: "ci-branch", title: "Branch protection + signed commits", desc: "Reviews required; no direct pushes to main; verify provenance where possible.", severity: "medium" },
        ],
      },
      {
        group: "Cloud & Infra",
        items: [
          { id: "cloud-iam", title: "IAM least-privilege everywhere", desc: "No wildcard '*' policies in prod; roles over long-lived keys.", severity: "critical" },
          { id: "s3-private", title: "Storage buckets private", desc: "Block public access at the account level; every public bucket is intentional and reviewed.", severity: "critical" },
          { id: "network-seg", title: "Databases not internet-reachable", desc: "Private subnets + security groups; test with an external port scan.", severity: "critical" },
          { id: "patching", title: "OS/images patched on a schedule", desc: "Base images rebuilt monthly; unattended security updates on hosts.", severity: "high" },
        ],
      },
      {
        group: "Containers & Runtime",
        items: [
          { id: "no-root", title: "Containers run as non-root", desc: "readOnlyRootFilesystem + drop capabilities where possible.", severity: "high" },
          { id: "image-scan", title: "Images scanned before deploy", desc: "Trivy/Grype in CI; no :latest tags in prod.", severity: "high" },
          { id: "metadata-svc", title: "Cloud metadata service hardened", desc: "IMDSv2 required (SSRF's favorite target).", severity: "high" },
          { id: "backup-test", title: "Restores tested quarterly", desc: "A backup that's never been restored is a hope, not a backup.", severity: "high" },
        ],
      },
    ],
  },
];

/* ---------- helpers ---------- */
import { store } from "../lib/utils";

export function checklistDone(listId: string, itemId: string): boolean {
  return store.get<boolean>(`sdh_chk_${listId}_${itemId}`, false);
}

export function checklistProgress(list: Checklist): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const g of list.groups) {
    for (const item of g.items) {
      total++;
      if (checklistDone(list.id, item.id)) done++;
    }
  }
  return { done, total };
}
