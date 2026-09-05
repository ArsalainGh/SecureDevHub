// ============================================================
// SecureDevHub — critical modules: HTTPS/TLS (07),
// Sensitive Data (08), Secrets Management (16)
// ============================================================
import type { SecurityModule } from "./types";

export const CRITICAL_REST_MODULES: SecurityModule[] = [
  /* ---------------- 07 · HTTPS & TLS ---------------- */
  {
    id: "https-tls",
    number: 7,
    title: "HTTPS & TLS",
    icon: "lock",
    severity: "critical",
    categories: ["devops", "general"],
    time: "10 min",
    difficulty: "Beginner",
    updated: "Nov 2025",
    owaspLabel: "OWASP A02 — Cryptographic Failures",
    owaspUrl: "https://owasp.org/Top10/A02_2021-Cryptographic_Failures/",
    tagline:
      "Without HTTPS, everything your users send — passwords, sessions, credit cards — crosses the internet in plain postcards anyone can read and rewrite.",
    what: {
      text: "HTTPS wraps HTTP in TLS: the connection is encrypted (no eavesdropping), authenticated (you're really talking to your bank) and integrity-checked (nobody tampered mid-transit). Serving any authenticated or sensitive page over plain HTTP hands sessions and credentials to anyone on the path — coffee-shop Wi-Fi, ISP, compromised router.",
      analogy:
        "HTTP is postcard mail: every sorting office reads it. TLS is a sealed, tamper-evident envelope delivered after both sides verify identity.",
      terms: [
        { term: "TLS 1.3", def: "The current transport-security protocol. Faster handshake and removes the legacy algorithms of TLS 1.0/1.1. Minimum acceptable today: TLS 1.2." },
        { term: "Certificate", def: "A public key + domain binding signed by a trusted Certificate Authority (CA). Free from Let's Encrypt." },
        { term: "HSTS", def: "HTTP Strict Transport Security — a header that forces browsers to use HTTPS for your domain, defeating downgrade attacks." },
        { term: "Mixed content", def: "An HTTPS page loading http:// scripts/images — browsers block active mixed content because it breaks the whole connection's guarantees." },
      ],
    },
    why: {
      text: "Session hijacking over open Wi-Fi is not theoretical: tools like Firesheep made it a one-click attack back in 2010, and ISPs have been caught injecting ads — and worse — into plain HTTP traffic.",
      breaches: [
        {
          company: "British Airways / TalkTalk-era hotspots",
          year: "2010–2016",
          impact: "Mass session hijacking demonstrations",
          details:
            "Firesheep showed any Firefox user could hijack Facebook/Twitter sessions on shared Wi-Fi — the push that forced the web to HTTPS-everywhere.",
        },
        {
          company: "Comcast & ISPs",
          year: "2013",
          impact: "Ads and tracking injected into customer traffic",
          details: "ISPs modified plain-HTTP pages in transit to insert advertising and supercookies — impossible once TLS authenticates the content.",
        },
      ],
      stats: [
        { value: "95%+", label: "of Chrome browsing time is now on HTTPS pages — plain HTTP is the suspicious exception" },
        { value: "Free", label: "TLS certificates from Let's Encrypt — cost is no longer an excuse" },
      ],
    },
    how: {
      steps: [
        "Victim joins a shared or hostile network ( café Wi-Fi, compromised router ) — or the attacker is simply 'on-path' at an ISP.",
        "Victim visits your site over HTTP; every request and response is readable plaintext.",
        "The attacker sniffs session cookies and credentials, or rewrites the response — stripping redirects, injecting credential-harvesters.",
        "Even 'HTTP only for the homepage' breaks everything: one plain request exposes the session cookie sent with it.",
      ],
      types: [
        { name: "Passive sniffing", desc: "Reading traffic without modifying it — credentials, cookies, personal data." },
        { name: "Active MITM", desc: "Modifying pages in transit: injecting scripts, swapping downloads, stripping security headers (sslstrip)." },
        { name: "Downgrade attack", desc: "Forcing the victim back to HTTP or an older TLS version with weaker crypto — defeated by HSTS." },
      ],
    },
    vulnerable: [
      {
        lang: "bash",
        label: "Server config (nginx)",
        mark: [2, 3],
        code: `# VULNERABLE — serving content directly over :80
server {
    listen 80;
    root /var/www/app;          # no TLS, no redirect
    # cookies travel plaintext; no HSTS to save you
}`,
      },
    ],
    secure: [
      {
        lang: "bash",
        label: "Server config (nginx)",
        mark: [2, 3, 4, 8, 9, 11],
        code: `# SECURE — redirect everything, modern TLS only, HSTS
server {
    listen 80;
    return 301 https://$host$request_uri;   # force HTTPS first
}
server {
    listen 443 ssl;
    ssl_protocols TLSv1.2 TLSv1.3;          # kill TLS 1.0/1.1
    ssl_certificate     /etc/letsencrypt/live/app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app/privkey.pem;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    # HSTS preload → browsers refuse HTTP for this domain entirely
}`,
      },
      {
        lang: "javascript",
        label: "Express",
        mark: [2, 3, 4, 5, 6, 7],
        code: `// SECURE — helmet's HSTS + redirect + secure cookies behind a proxy
app.set('trust proxy', 1);
app.use((req, res, next) => {
  if (!req.secure) return res.redirect(301, 'https://' + req.headers.host + req.url);
  next();
});
app.use(helmet.hsts({ maxAge: 63072000, includeSubDomains: true, preload: true }));`,
      },
    ],
    fixes: [
      "ALL HTTP traffic 301-redirects to HTTPS before any content is served.",
      "Only TLS 1.2 and 1.3 are enabled; certificates come from a real CA and auto-renew.",
      "HSTS with preload ensures browsers never attempt HTTP again, blocking downgrade attacks.",
      "Cookies carry the Secure flag so they're never sent over a plaintext connection.",
    ],
    rules: [
      "Serve everything over HTTPS — every domain, subdomain and environment.",
      "Redirect HTTP → HTTPS with 301, and enable HSTS (includeSubDomains + preload) once stable.",
      "Support TLS 1.2+ only; disable TLS 1.0/1.1 and weak cipher suites.",
      "Automate certificate issuance and renewal (Let's Encrypt, cert-manager).",
      "Mark every cookie Secure; fix mixed content so pages never load http:// assets.",
      "Test your config with SSL Labs and aim for A or A+.",
    ],
    quiz: [
      {
        q: "What does HSTS protect against that a plain redirect doesn't?",
        options: [
          "Phishing emails",
          "Downgrade attacks that strip the HTTPS redirect before it happens",
          "Expired certificates",
          "DDoS attacks",
        ],
        correct: 1,
        why: "A redirect only happens if the first HTTP request succeeds — an on-path attacker answers it instead. HSTS/preload makes the browser refuse HTTP from the start.",
      },
      {
        q: "What is mixed content?",
        options: [
          "Two CDNs serving one image",
          "An HTTPS page loading http:// resources — letting an attacker tamper with active content",
          "HTTP/2 and HTTP/3 on one page",
          "Serving both www and apex domains",
        ],
        correct: 1,
        why: "One http:// script on an HTTPS page re-opens the MITM hole for the whole page. Browsers block active mixed content by default; fix the URLs.",
      },
      {
        q: "The minimum TLS version you should accept today is…",
        options: ["SSL 3.0", "TLS 1.0", "TLS 1.1", "TLS 1.2"],
        correct: 3,
        why: "TLS 1.0/1.1 are formally deprecated (RFC 8996) with known weaknesses; PCI-DSS requires 1.1+ be gone. TLS 1.2 is the floor, 1.3 preferred.",
      },
    ],
    mistakes: [
      {
        mistake: "HTTPS on the login page only",
        explanation: "Session cookies travel on every request — one plain-HTTP image request leaks the whole session.",
        fix: "HTTPS everywhere + Secure cookie flag + HSTS.",
      },
      {
        mistake: "Self-signed certificates in production",
        explanation: "Users click through warnings; attackers exploit the same warnings with their own certs — you've trained users to be unsafe.",
        fix: "Free, automated CA certificates from Let's Encrypt or your platform's managed TLS.",
      },
      {
        mistake: "Hardcoding http:// asset URLs",
        explanation: "Mixed-content blockers break your page and tempt you to weaken TLS instead.",
        fix: "Use protocol-relative or relative URLs; upgrade-insecure-requests via CSP.",
      },
    ],
    tools: [
      { name: "SSL Labs Server Test", desc: "Deep, free TLS configuration audit with letter grades.", url: "https://www.ssllabs.com/ssltest/", price: "Free" },
      { name: "Let's Encrypt / Certbot", desc: "Free, automated certificates.", url: "https://certbot.eff.org", price: "Free" },
      { name: "Mozilla Observatory", desc: "One-shot scan covering TLS, headers and cookies.", url: "https://observatory.mozilla.org", price: "Free" },
    ],
    reading: [
      { title: "Transport Layer Security Cheat Sheet", source: "OWASP", type: "Docs", url: "https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html" },
      { title: "Why HTTPS Matters", source: "web.dev (Google)", type: "Article", url: "https://web.dev/articles/why-https-matters" },
      { title: "SSL/TLS Deployment Best Practices", source: "SSL Labs / Qualys", type: "Docs", url: "https://github.com/ssllabs/research/wiki" },
    ],
  },

  /* ---------------- 08 · SENSITIVE DATA EXPOSURE ---------------- */
  {
    id: "sensitive-data",
    number: 8,
    title: "Sensitive Data Exposure",
    icon: "eye-off",
    severity: "critical",
    categories: ["backend", "frontend"],
    time: "11 min",
    difficulty: "Beginner",
    updated: "Dec 2025",
    owaspLabel: "OWASP A02 — Cryptographic Failures",
    owaspUrl: "https://owasp.org/Top10/A02_2021-Cryptographic_Failures/",
    tagline:
      "Data you don't protect becomes data you lose: in logs, URLs, error pages, backups, and APIs that return one field too many.",
    what: {
      text: "Sensitive data exposure means personal, financial or secret data is stored, transmitted or logged without adequate protection — plaintext databases, full card numbers in logs, PII in URLs and analytics, verbose stack traces in production, APIs that serialize the entire user object. Most 'leaks' aren't clever hacks; they're data left in places it never belonged.",
      analogy:
        "Photocopying your passport to check into a hotel is fine; the problem is the stack of passport copies left at the front desk, in the trash, and taped to the lobby window.",
      terms: [
        { term: "Data at rest / in transit", def: "At rest = databases, files, backups — encrypt with AES-256 and manage keys properly. In transit = network — protect with TLS." },
        { term: "PII", def: "Personally Identifiable Information — anything that identifies a person: names, emails, IDs, location, biometrics. Regulated by GDPR, CCPA, HIPAA." },
        { term: "Tokenization", def: "Replacing sensitive values (cards) with non-sensitive tokens so your systems never store the real number — the core trick behind PCI-DSS compliance." },
      ],
    },
    why: {
      text: "Regulators fine exposure itself — not just breaches. GDPR penalties reach 4% of global revenue, and the reputational math is simple: users forgive a lot, but not their data in a pastebin.",
      breaches: [
        {
          company: "First American Financial",
          year: "2019",
          impact: "885 million documents exposed",
          details: "Real-estate documents with SSNs and bank details were available to anyone who incremented a URL parameter — no authentication, no authorization, no encryption awareness.",
        },
        {
          company: "Marriott",
          year: "2018",
          impact: "383 million guest records, £18.4M fine",
          details:
            "Passport numbers and encrypted card data sat exposed for four years; some encryption keys lived alongside the data they protected.",
        },
      ],
      stats: [
        { value: "$4.45M", label: "average cost of a data breach (IBM, 2023)" },
        { value: "4% / €20M", label: "maximum GDPR fine: whichever is higher" },
      ],
    },
    how: {
      steps: [
        "Map where sensitive data lives: database, logs, caches, analytics, error trackers, email, backups, browser storage.",
        "Attacker finds the overexposed copy: debug endpoints, verbose errors, S3 buckets, /api/users returning password_hash fields.",
        "Weak storage turns the leak into a disaster: plaintext passwords, reversible encryption with keys in the same repo, ancient algorithms.",
        "Data in URLs, logs and screenshots is exfiltrated by anyone with access — including third-party SaaS you forgot you enabled.",
      ],
      types: [
        { name: "Over-sharing APIs", desc: "Serializing whole models: res.json(user) returning passwordHash, ssn, internal flags." },
        { name: "Leaky logs & errors", desc: "Stack traces, SQL errors, and request bodies (with passwords!) written to logs and shipped to third parties." },
        { name: "Weak storage", desc: "Unencrypted backups, plaintext fields, home-grown crypto, keys committed to git." },
      ],
    },
    vulnerable: [
      {
        lang: "javascript",
        label: "Node.js",
        mark: [2, 6, 10],
        code: `// VULNERABLE — serialization leaks EVERYTHING
app.get('/api/me', auth, async (req, res) => {
  const user = await db.users.findById(req.user.id);
  res.json(user); // → id, email, passwordHash, ssn, resetToken...
});

// VULNERABLE — credentials in URLs and logs
fetch('/api/payment?card=4111111111111111');   // ends up in access logs
console.log('login attempt', req.body);        // passwords into log files
app.get('*', (e, req, res) => res.status(500).send(e.stack)); // stack traces!`,
      },
    ],
    secure: [
      {
        lang: "javascript",
        label: "Node.js",
        mark: [3, 4, 5, 9, 14, 15],
        code: `// SECURE — explicit DTO: return only what the client needs
app.get('/api/me', auth, async (req, res) => {
  const u = await db.users.findById(req.user.id);
  res.json({ id: u.id, name: u.name, email: u.email, plan: u.plan });
});

// SECURE — scrub before logging; errors are generic outside production
logger.info('login attempt', { email: mask(req.body.email) });
// never log: passwords, tokens, card numbers, full PII

app.use((err, req, res, next) => {
  logger.error(err);                       // full detail → private logs
  res.status(err.status || 500).json({
    error: err.expose ? err.message : 'Something went wrong',
  });                                      // customers see safe text only
});

// SECURE — encrypt sensitive columns, and delete what you don't need
user.ssn = vault.encrypt(plainSsn);        // AES-256-GCM via KMS — keys outside git`,
      },
    ],
    fixes: [
      "API responses are explicit DTOs — allowlisted fields only, never whole ORM models.",
      "Logging passes through a scrubber that drops passwords, tokens, cards and full PII before writing.",
      "Production errors return generic messages; stack traces go to private logs only.",
      "Sensitive fields are encrypted at rest with managed keys (KMS/Vault), and data you don't need is deleted, not archived forever.",
    ],
    rules: [
      "Classify your data first: you can't protect what you haven't inventoried.",
      "Serialize allowlisted fields from APIs — never raw models.",
      "Encrypt sensitive data at rest (AES-256) and in transit (TLS 1.2+). Keys live in a KMS/Vault, never in git.",
      "Scrub passwords, tokens and PII from logs, analytics, error trackers and URLs.",
      "Show generic errors in production; keep verbose traces internal.",
      "Collect the minimum data you need, and delete it on schedule — stored data is a liability.",
    ],
    quiz: [
      {
        q: "Your /api/me endpoint returns the whole user model. What's the risk?",
        options: [
          "Slower responses",
          "passwordHash, reset tokens and internal flags ship to every client — visible in devtools",
          "Nothing; JSON is binary",
          "CORS will block it",
        ],
        correct: 1,
        why: "Anyone who can call the endpoint — including scripts and low-privilege users — reads every serialized field. Use explicit DTO projections.",
      },
      {
        q: "Which of these is the worst place for a password to appear?",
        options: [
          "bcrypt-hashed in the DB",
          "In plaintext in a request body that your logging middleware dumps to a file shipped to a third-party analytics SaaS",
          "In the user's password manager",
          "In a POST body over TLS",
        ],
        correct: 1,
        why: "Logs get read by developers, indexed by SaaS and retained for years — the classic accidental exposure channel. Scrub sensitive fields at the logger boundary.",
      },
      {
        q: "The best way to handle credit cards is…",
        options: [
          "Store them AES-encrypted with the key in .env",
          "Don't store them — tokenize with a PCI-compliant provider (Stripe, Adyen)",
          "Store only the last 4 digits and the CVV",
          "Base64 them",
        ],
        correct: 1,
        why: "Tokenization moves the real card data (and PCI-DSS scope) to the provider. Never store CVVs at all — even encrypted, it's prohibited.",
      },
    ],
    mistakes: [
      {
        mistake: "Returning ORM models directly from APIs",
        explanation: "The model always grows new sensitive columns — and your endpoint leaks them automatically.",
        fix: "Project explicit fields (DTO / serializer allowlist) per endpoint.",
      },
      {
        mistake: "Assuming 'encrypted at rest' by the provider is enough",
        explanation: "Disk-level encryption only stops stolen hard drives. Anyone with query access — or an SQLi — reads plaintext.",
        fix: "Application-level encryption for the truly sensitive columns, with keys in a KMS.",
      },
      {
        mistake: "Keeping production data in dev/staging",
        explanation: "Weaker environments plus real PII equals breach. Staging leaks are real leaks.",
        fix: "Use synthetic or anonymized data sets outside production.",
      },
    ],
    tools: [
      { name: "HashiCorp Vault", desc: "Centralized secrets + encryption-as-a-service with key rotation.", url: "https://www.vaultproject.io", price: "Free" },
      { name: "truffleHog", desc: "Find leaked credentials and keys across git history.", url: "https://github.com/trufflesecurity/trufflehog", price: "Free" },
      { name: "AWS/GCP/Azure KMS", desc: "Managed key storage with audit trails.", url: "https://aws.amazon.com/kms/", price: "Freemium" },
    ],
    reading: [
      { title: "OWASP Top 10 — A02 Cryptographic Failures", source: "owasp.org", type: "Docs", url: "https://owasp.org/Top10/A02_2021-Cryptographic_Failures/" },
      { title: "Logging Cheat Sheet (data to exclude)", source: "OWASP", type: "Docs", url: "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html" },
      { title: "GDPR Data Minimization Principle", source: "gdpr.eu", type: "Article", url: "https://gdpr.eu/eu/gdpr-principles/" },
    ],
  },

  /* ---------------- 16 · SECRETS MANAGEMENT ---------------- */
  {
    id: "secrets",
    number: 16,
    title: "Secrets Management",
    icon: "key-square",
    severity: "critical",
    categories: ["backend", "devops"],
    time: "9 min",
    difficulty: "Beginner",
    updated: "Jan 2026",
    owaspLabel: "OWASP A05 — Security Misconfiguration",
    owaspUrl: "https://owasp.org/Top10/A05_2021-Security_Misconfiguration/",
    tagline:
      "API keys in source code get scraped by bots within minutes of pushing. Secrets belong in environment variables and vaults — never in git.",
    what: {
      text: "Secrets — API keys, database passwords, private keys, tokens — are the keys to everything you own. Secrets management means generating them properly, storing them outside source code, scoping them minimally, rotating them regularly and revoking them instantly on suspicion.",
      analogy:
        "You don't tape your house key to the front door with a note. But every hardcoded credential in a public repo is exactly that — and bots photograph front doors all day.",
      terms: [
        { term: "Environment variables", def: "Config injected at runtime (env vars, .env files excluded from git). The minimum bar — code and secrets live apart." },
        { term: "Secret vault", def: "Dedicated stores (HashiCorp Vault, AWS Secrets Manager, Doppler) adding audit logs, dynamic secrets and automatic rotation." },
        { term: "Rotation", def: "Replacing secrets on a schedule and immediately on suspicion — limits the lifetime of any leak." },
      ],
    },
    why: {
      text: "GitHub and cloud providers scan pushes for known key formats and attackers do the same: leaked AWS keys are typically exploited within minutes — not days.",
      breaches: [
        {
          company: "Uber",
          year: "2016",
          impact: "57 million riders & drivers",
          details: "Engineers committed AWS credentials to a private GitHub repo; attackers found them and downloaded the entire datastore. Two executives were criminally charged over the cover-up.",
        },
        {
          company: "Codecov",
          year: "2021",
          impact: "Hundreds of customer environments exposed",
          details: "A modified Bash uploader exfiltrated CI environment variables for months — proving CI secrets are first-class targets.",
        },
      ],
      stats: [
        { value: "< 10 min", label: "median time to first malicious use of a leaked cloud key (industry honeypot studies)" },
        { value: "10M+", label: "secrets detected in public GitHub commits in a single year (GitGuardian 2023)" },
      ],
    },
    how: {
      steps: [
        "Developer hardcodes STRIPE_SECRET = 'sk_live_...' or a DB password 'temporarily'.",
        "The commit is pushed — public repo, or private repo later made public, or leaked via a compromised developer account.",
        "Scanning bots (GitHub events, paste sites, Wayback Machine) find key patterns within minutes.",
        "Attackers use the key: crypto-mining on your cloud bill, data theft, spam from your SendGrid — until the key is revoked.",
        "Even after deletion, git history preserves the secret forever: only rotation removes the danger.",
      ],
      types: [
        { name: "Hardcoded in source", desc: "Credentials in .js/.py files that ship to repos and client-side bundles." },
        { name: "Committed .env files", desc: "Missing .gitignore entries; .env.example accidentally containing real values." },
        { name: "Client-side exposure", desc: "Secret keys in REACT_APP_*/NEXT_PUBLIC_* variables, mobile apps, or frontend code — anything shipped to users is public." },
      ],
    },
    vulnerable: [
      {
        lang: "javascript",
        label: "JavaScript",
        mark: [2, 7],
        code: `// VULNERABLE — secrets in source and in the client bundle
const STRIPE_SECRET = 'sk_live_4eC39HqLyjWDarjtT1zdp7dc';   // in git forever
const DB_PASSWORD = 'hunter2';

// VULNERABLE — "hidden" in the front-end: shipped to every browser
// .env → REACT_APP_FIREBASE_SECRET=...  becomes visible in the JS bundle
fetch('https://api.stripe.com/v1/charges', {
  headers: { Authorization: 'Bearer ' + STRIPE_SECRET },       // in devtools for all users
});`,
      },
    ],
    secure: [
      {
        lang: "javascript",
        label: "JavaScript",
        mark: [2, 8, 9, 14],
        code: `// SECURE — secrets arrive at runtime, never in the repo
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// .env has real values locally; .env.example documents names only
// .gitignore contains: .env  .env.*  !.env.example

// SECURE — secret keys stay server-side; the client gets stripes
// Publishable key (safe) or short-lived scoped tokens:
app.post('/api/pay', auth, async (req, res) => {
  const intent = await stripe.paymentIntents.create({
    amount: req.body.amount, currency: 'usd',       // server holds sk_live
  });
  res.json({ clientSecret: intent.client_secret }); // scoped, single-purpose
});

// SECURE — production: pull from a manager, fail fast if missing
const secret = process.env.STRIPE_SECRET_KEY;
if (!secret) throw new Error('STRIPE_SECRET_KEY is not set');`,
      },
      {
        lang: "bash",
        label: ".gitignore + scanning",
        mark: [2, 6],
        code: `# .gitignore — never let a real secret reach git
.env
.env.*
!.env.example

# scan every push for accidental secrets
gitleaks detect --source . --redact
trufflehog git file://. --only-verified`,
      },
    ],
    fixes: [
      "All secrets load from environment variables or a secrets manager — source code contains names, never values.",
      ".env is git-ignored; .env.example documents the required keys with placeholder values only.",
      "Secret keys never touch client-side code — public keys are publishable by design, secret operations run on your server.",
      "gitleaks/truffleHog run in CI to catch accidents, and any leaked key is rotated immediately (deleting the commit is NOT enough).",
    ],
    rules: [
      "No secrets in source code, tickets, docs, screenshots or chat messages.",
      "Use environment variables locally and a secrets manager (Vault, AWS SM, Doppler) in production.",
      "Ignore .env via .gitignore; ship .env.example with placeholders.",
      "Give every key the minimum permissions and scope it to one service.",
      "Rotate secrets on a schedule and instantly on leak suspicion — history never saves you.",
      "Add gitleaks/truffleHog to CI and pre-commit hooks.",
      "Client-side code is public: anything in a browser bundle must be safe to publish.",
    ],
    quiz: [
      {
        q: "You committed an AWS key and pushed it. The correct response is…",
        options: [
          "git rm the file and push again",
          "Rewrite history with git filter-branch",
          "Rotate/revoke the key immediately, then clean history",
          "Nothing — the repo is private",
        ],
        correct: 2,
        why: "Scrapers act within minutes and forks/clones preserve the key. Only rotation kills the value; history cleaning is hygiene, not remediation.",
      },
      {
        q: "REACT_APP_* env variables are…",
        options: [
          "Safely hidden in the build",
          "Inlined into the client JavaScript bundle — public to every visitor",
          "Stored in the server only",
          "Encrypted by webpack",
        ],
        correct: 1,
        why: "Anything consumed by the browser is shipped to the browser. Secret operations (charging cards, signing URLs) must run server-side.",
      },
      {
        q: "What does a secrets manager add over plain env vars?",
        options: [
          "Stronger encryption algorithms",
          "Central audit logs, dynamic short-lived secrets, and automatic rotation",
          "Faster app startup",
          "Free TLS certificates",
        ],
        correct: 1,
        why: "Vault-style tools answer 'who read this secret, when?' and can revoke/rotate without redeploys — env vars alone can't.",
      },
    ],
    mistakes: [
      {
        mistake: "Deleting the file instead of rotating the key",
        explanation: "Git history, forks, CI caches and the Wayback Machine keep the secret alive forever.",
        fix: "Revoke/rotate first, then scrub history as cleanup.",
      },
      {
        mistake: "One master key for every environment",
        explanation: "A laptop leak of a dev key then opens production — blast radius: total.",
        fix: "Distinct, minimally-scoped keys per service and environment.",
      },
      {
        mistake: "Secrets in CI job logs",
        explanation: "echo $API_KEY or debug output leaks credentials to anyone with log access.",
        fix: "Use CI secret masking, never print secrets, and restrict log visibility.",
      },
    ],
    tools: [
      { name: "gitleaks", desc: "Scan repos (and git history) for secrets in CI or pre-commit.", url: "https://github.com/gitleaks/gitleaks", price: "Free" },
      { name: "truffleHog", desc: "Verified credential discovery across 800+ detector types.", url: "https://github.com/trufflesecurity/trufflehog", price: "Free" },
      { name: "Doppler", desc: "Developer-friendly secrets sync across environments.", url: "https://www.doppler.com", price: "Freemium" },
      { name: "HashiCorp Vault", desc: "Full dynamic secrets, rotation and audit trails.", url: "https://www.vaultproject.io", price: "Free" },
    ],
    reading: [
      { title: "Secrets Management Cheat Sheet", source: "OWASP", type: "Docs", url: "https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html" },
      { title: "Removing sensitive data from a repository", source: "GitHub Docs", type: "Docs", url: "https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository" },
      { title: "State of Secrets Sprawl Report", source: "GitGuardian", type: "Article", url: "https://www.gitguardian.com/state-of-secrets-sprawl-report" },
    ],
  },
];
