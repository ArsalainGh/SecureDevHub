// ============================================================
// SecureDevHub — MEDIUM severity modules (13, 14, 15)
// ============================================================
import type { SecurityModule } from "./types";

export const MEDIUM_MODULES: SecurityModule[] = [
  /* ---------------- 13 · RATE LIMITING & DDOS ---------------- */
  {
    id: "rate-limiting",
    number: 13,
    title: "Rate Limiting & DDoS Protection",
    icon: "gauge",
    severity: "medium",
    categories: ["backend", "devops"],
    time: "9 min",
    difficulty: "Intermediate",
    updated: "Nov 2025",
    owaspLabel: "OWASP API4 — Unrestricted Resource Consumption",
    owaspUrl: "https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/",
    tagline:
      "No limit means one script kiddie becomes a million requests. Throttle by user, IP and endpoint before your bill — or your database — melts.",
    what: {
      text: "Rate limiting caps how many requests a client may make in a time window; DDoS protection absorbs or filters attack traffic before it reaches you. Without them, brute-force logins, credential stuffing, scraping and resource exhaustion are all free for attackers.",
      analogy: "A bank that lets you guess PINs forever vs one that eats the card after three wrong attempts.",
      terms: [
        { term: "Token bucket", def: "Algorithm: tokens refill at X/sec; each request spends one. Smooth, burstable — the default choice." },
        { term: "429 & Retry-After", def: "The status code and header telling clients they've been throttled and when to retry." },
        { term: "Edge protection", def: "Cloudflare/Fastly/AWS Shield absorbing L3-L7 floods before they hit your origin." },
      ],
    },
    why: {
      text: "Credential stuffing works specifically because login endpoints accept unlimited guesses; Meta, GitHub and Cloudflare have all absorbed record-breaking DDoS attacks exceeding hundreds of millions of requests per second.",
      breaches: [
        {
          company: "GitHub",
          year: "2018",
          impact: "1.35 Tbps memcached reflection attack",
          details: "Survived via edge mitigation (Akamai) — traffic that would erase most origins never reached the application.",
        },
        {
          company: "Dozens of fintech APIs",
          year: "2020–2023",
          impact: "OTP/MFA brute force",
          details: "Unlimited /verify-code attempts turned 4–6 digit codes into minutes of cracking — rate limits, not longer codes, are the fix.",
        },
      ],
      stats: [
        { value: "201M rps", label: "largest recorded HTTP DDoS attack mitigated (2023)" },
        { value: "5 tries", label: "sensible login limit per 10 min per account" },
      ],
    },
    how: {
      steps: [
        "Attacker picks an expensive or security-sensitive endpoint: login, password reset, search, report generation.",
        "Without limits, scripts run thousands of attempts per second — or craft requests that trigger heavy DB queries (application-layer DoS).",
        "Distributed botnets multiply this by thousands of IPs — volumetric DDoS saturates bandwidth.",
        "Proper limits slow brute force to uselessness and shed load early; edge networks absorb the volume your origin can't.",
      ],
      types: [
        { name: "Application-layer", desc: "Expensive queries and repeated auth attempts exhausting CPU/DB." },
        { name: "Volumetric", desc: "Floods of traffic saturating network capacity — only edge/CDN can help." },
        { name: "Brute force & stuffing", desc: "Login/OTP/reset endpoints as guessing machines." },
      ],
    },
    vulnerable: [
      {
        lang: "javascript",
        label: "Express — no limits",
        mark: [2, 7, 8],
        code: `// VULNERABLE — unlimited everything
app.post('/login', loginHandler);            // infinite guesses
app.post('/password-reset', resetHandler);   // spam anyone's inbox
app.get('/search', (req, res) => {
  const q = req.query.q || '';
  // attacker: /search?q=%25%25%25... (LIKE '%%%%%') — full table scans
  db.query("SELECT * FROM items WHERE name LIKE ?", ['%' + q + '%']);
});`,
      },
    ],
    secure: [
      {
        lang: "javascript",
        label: "Express — layered limits",
        mark: [5, 6, 7, 11, 12, 16, 17, 18, 19],
        code: `// SECURE — per-endpoint, per-identity limits + sane responses
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, max: 5,
  standardHeaders: true, legacyHeaders: false,     // RateLimit-* headers
  message: 'Too many attempts — try again later',
  // key by username+IP so a botnet against one account still fails:
  keyGenerator: (req) => (req.body?.email || '') + '|' + req.ip,
});
const apiLimiter = rateLimit({ windowMs: 60000, max: 100 });

app.use('/api/', apiLimiter);
app.post('/login', loginLimiter, loginHandler);

app.get('/search', async (req, res) => {
  const q = String(req.query.q || '').slice(0, 100).replace(/[%_]/g, '');
  db.query('SELECT id, name FROM items WHERE name LIKE ? LIMIT 50',
    ['%' + q + '%']);                      // bounded query, sanitized wildcards
});

// Behind a proxy: app.set('trust proxy', 1) — else every request
// appears from the load balancer's IP and limits are global.
// Volumetric floods: put Cloudflare/Fastly/AWS Shield in front.`,
      },
    ],
    fixes: [
      "Login-style endpoints get tight limits keyed by account + IP.",
      "All APIs inherit a baseline per-key limit with standard RateLimit headers and 429 responses.",
      "Expensive queries are bounded (LIMIT, input sanitization) to blunt application-layer DoS.",
      "trust proxy is configured so per-IP limits key off the real client.",
    ],
    rules: [
      "Rate-limit auth, OTP, reset and signup endpoints aggressively and per-account.",
      "Apply global per-API-key limits; return 429 + Retry-After + RateLimit headers.",
      "Bound expensive operations (pagination caps, query timeouts, input sanitization).",
      "Configure trust proxy correctly so IP-based limiting works behind load balancers.",
      "Use edge/CDN protection (Cloudflare, Fastly, AWS Shield) for volumetric attacks.",
      "Lower limits for anonymous users; budget higher tiers by plan.",
    ],
    quiz: [
      {
        q: "Brute-forcing a 6-digit SMS code is prevented best by…",
        options: [
          "8-digit codes",
          "5 attempts max per code + short code expiry + per-account limits",
          "Encrypting the SMS",
          "CAPTCHA on the app's home page",
        ],
        correct: 1,
        why: "With ~5 tries per 10 minutes, a million-key space is unreachable; expiry shrinks the window further. Longer codes alone don't stop unlimited guessing.",
      },
      {
        q: "Why must you set trust proxy correctly before rate limiting by IP?",
        options: [
          "HTTPS requires it",
          "Otherwise all clients appear as the proxy's IP — limits throttle everyone or key wrong",
          "Cookies depend on it",
          "Logging needs it",
        ],
        correct: 1,
        why: "req.ip otherwise equals the load balancer. Either no limits work (one fake IP bypasses all buckets) — the classic misconfiguration.",
      },
      {
        q: "Volumetric DDoS (TBps floods) is best mitigated at…",
        options: [
          "Express middleware",
          "The edge — CDN/anycast providers with absorption capacity, with sane origin rules as backup",
          "The database",
          "Nginx worker counts",
        ],
        correct: 1,
        why: "No single origin can absorb a 1Tbps+ flood; scrubbing networks drop it upstream. App-layer limits matter below that scale.",
      },
    ],
    mistakes: [
      {
        mistake: "Global limits keyed only by IP",
        explanation: "NATs and offices share IPs (legit users blocked); botnets rotate IPs (limits evaded).",
        fix: "Key sensitive endpoints by account + IP, and global limits by API key where possible.",
      },
      {
        mistake: "Returning 200 with an error string on throttle",
        explanation: "Bots and monitors rely on status codes; 200 hides abuse and confuses clients.",
        fix: "HTTP 429 + Retry-After, always.",
      },
      {
        mistake: "Forgetting expensive endpoints",
        explanation: "/export-all?format=csv with no cap is a one-request DoS.",
        fix: "Cover compute-heavy routes with stricter budgets and async job queues.",
      },
    ],
    tools: [
      { name: "rate-limiter-flexible", desc: "Node rate limiting across Redis/Memory/etc.", url: "https://github.com/animir/node-rate-limiter-flexible", price: "Free" },
      { name: "Cloudflare", desc: "Edge DDoS absorption + WAF + bot rules.", url: "https://www.cloudflare.com", price: "Freemium" },
      { name: "OWASP API4:2023", desc: "Unrestricted Resource Consumption guidance.", url: "https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/", price: "Free" },
    ],
    reading: [
      { title: "Denial of Service Cheat Sheet", source: "OWASP", type: "Docs", url: "https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html" },
      { title: "Rate Limiting patterns for APIs", source: "Cloudflare Learning Center", type: "Article", url: "https://www.cloudflare.com/learning/bots/what-is-rate-limiting/" },
    ],
  },

  /* ---------------- 14 · CORS CONFIGURATION ---------------- */
  {
    id: "cors",
    number: 14,
    title: "CORS Configuration",
    icon: "globe",
    severity: "medium",
    categories: ["frontend", "backend"],
    time: "8 min",
    difficulty: "Intermediate",
    updated: "Oct 2025",
    owaspLabel: "OWASP A05 — Security Misconfiguration",
    owaspUrl: "https://owasp.org/Top10/A05_2021-Security_Misconfiguration/",
    tagline:
      "CORS is the browser asking your server: 'may this other origin read the response?' Answer wrong, and any website can read your users' data.",
    what: {
      text: "Cross-Origin Resource Sharing loosens the same-origin policy selectively: a server may declare which origins, methods and headers are allowed. Misconfigurations — Access-Control-Allow-Origin: * combined with credentials, or blindly reflecting the request's Origin — turn any malicious page into a reader of your API.",
      analogy: "A members-only club with a guest list. '*' means no list at all; 'reflect any origin' means the bouncer reads the guest's own handwriting as the list.",
      terms: [
        { term: "Same-Origin Policy", def: "The browser rule that site A can't read responses from site B. CORS is a controlled, server-approved exception." },
        { term: "Preflight", def: "The OPTIONS request browsers send before 'non-simple' requests (JSON bodies, custom headers) to check permissions." },
        { term: "Allow-Credentials", def: "When true, cookies travel with cross-origin requests. Browsers refuse this combined with *, which is the only reason '*' public APIs stay safe." },
      ],
    },
    why: {
      text: "Reflected-origin CORS bugs have leaked user data from major platforms via bug bounties — the misconfiguration is one line long and invisible until tested.",
      breaches: [
        {
          company: "Bitcoin exchanges (bounty reports)",
          year: "2016–2021",
          impact: "Account data readable cross-origin",
          details: "api.example.com reflected any Origin with credentials allowed — any page could read balances as the logged-in victim.",
        },
        {
          company: "Internal/admin APIs (recurring)",
          year: "Ongoing",
          impact: "SSRF-like data exposure via misconfigured CORS",
          details: "Trusting subdomain wildcards (including https://*.example.com where one subdomain has XSS) transitively exposes the API.",
        },
      ],
      stats: [
        { value: "1 line", label: "res.setHeader('Access-Control-Allow-Origin', req.headers.origin) creates the hole" },
        { value: "SOP ≠ CSRF", label: "CORS controls READING — forged WRITE requests still need CSRF defenses" },
      ],
    },
    how: {
      steps: [
        "Your API decides who may read responses. '*' is fine for public data — but never with credentials.",
        "Dev gets 'blocked by CORS policy' and fixes it by reflecting req.headers.origin — 'works now!' — allowing every origin on earth.",
        "Attacker builds evil.com whose JavaScript fetches victim-logged-in api.example.com/me with credentials: 'include'.",
        "Browsers send cookies; the reflecting server allows origin 'https://evil.com'; data flows to the attacker.",
      ],
      types: [
        { name: "Wildcard with credentials", desc: "Browsers block '*' + credentials — but devs 'fix' it by reflecting origin, reopening the hole." },
        { name: "Origin reflection", desc: "Echoing any Origin header back into Allow-Origin = universal read access." },
        { name: "Bad null/subdomain trust", desc: "Allowing 'null' (sandboxed iframes!) or trusting all subdomains — one XSS'd subdomain reads everything." },
      ],
    },
    vulnerable: [
      {
        lang: "javascript",
        label: "Express — permissive CORS",
        mark: [3, 8, 9],
        code: `// VULNERABLE — reflect whatever origin asks, with cookies allowed
import cors from 'cors';
app.use(cors({ origin: true, credentials: true }));
// origin:true echoes req.headers.origin → evil.com allowed!

// VULNERABLE — hand-rolled reflection (same bug, custom)
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.set('Access-Control-Allow-Credentials', 'true');
  next();
});`,
      },
    ],
    secure: [
      {
        lang: "javascript",
        label: "Express — strict allowlist",
        mark: [3, 4, 5, 6, 7, 11, 12],
        code: `// SECURE — explicit allowlist; public data may use '*'
const ALLOWED = new Set([
  'https://app.securedevhub.dev',
  'https://staging.securedevhub.dev',
]);
app.use(cors({
  origin: (origin, cb) => {
    // same-origin tools send no Origin header — allow those
    if (!origin || ALLOWED.has(origin)) return cb(null, true);
    return cb(new Error('Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  maxAge: 600,                       // cache preflights
}));

// SECURE — truly public data: wildcard WITHOUT credentials
app.use('/api/public', cors());      // no cookies can piggyback`,
      },
    ],
    fixes: [
      "Origins are checked against an explicit allowlist — reflection is gone.",
      "Credentials are only enabled for allowlisted origins.",
      "Public data endpoints use '*' without credentials, which browsers enforce safely.",
      "Preflight caching (maxAge) reduces OPTIONS overhead.",
    ],
    rules: [
      "Never combine Allow-Origin: * with Allow-Credentials: true.",
      "Allowlist exact origins; never reflect the Origin header blindly.",
      "Don't allow 'null' origins or wildcard subdomains you don't fully control.",
      "Keep allowed methods/headers minimal; set a preflight maxAge.",
      "Remember CORS governs reads — pair it with CSRF tokens for writes.",
      "Test CORS by curling with foreign Origin headers in CI.",
    ],
    quiz: [
      {
        q: "Why won't browsers allow '*' with credentials?",
        options: [
          "Performance reasons",
          "It would let any website read authenticated responses from any site — the SOP's core threat",
          "It's a syntax error",
          "Cookies don't support wildcards",
        ],
        correct: 1,
        why: "It's the browser's last safeguard. Devs who 'fix' the resulting error by reflecting origins recreate the vulnerability manually.",
      },
      {
        q: "CORS mainly restricts…",
        options: [
          "Sending requests",
          "Reading responses cross-origin (sending forms/img requests was always possible)",
          "Executing JavaScript",
          "Loading images",
        ],
        correct: 1,
        why: "Pre-CORS browsers could always SEND cross-site GETs/POSTs (that's why CSRF exists); CORS governs READ access to the response.",
      },
      {
        q: "When is a preflight (OPTIONS) sent?",
        options: [
          "On every request",
          "Before non-simple requests — e.g. JSON bodies or custom headers like Authorization",
          "Only for POST",
          "Only in Safari",
        ],
        correct: 1,
        why: "Simple requests (form-style) go directly; anything beyond requires the server to approve methods+headers first.",
      },
    ],
    mistakes: [
      {
        mistake: "origin: true to 'fix' CORS errors",
        explanation: "Reflects every origin — effectively universal authenticated read access.",
        fix: "Explicit allowlist; log rejected origins.",
      },
      {
        mistake: "Wildcard subdomains",
        explanation: "Any XSS on any forgotten subdomain (blog.old.example.com) reads your main API.",
        fix: "Allowlist exact hosts, not patterns.",
      },
      {
        mistake: "Treating CORS as a CSRF defense",
        explanation: "Simple POSTs complete regardless; the attacker just can't read the response.",
        fix: "Tokens + SameSite still required for writes.",
      },
    ],
    tools: [
      { name: "cors (npm)", desc: "Config-driven CORS middleware for Express.", url: "https://github.com/expressjs/cors", price: "Free" },
      { name: "MDN CORS Guide", desc: "The clear reference on semantics.", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS", price: "Free" },
      { name: "CORS Playground", desc: "Test misconfigurations interactively.", url: "https://corsplayground.pages.dev", price: "Free" },
    ],
    reading: [
      { title: "Cross-Origin Resource Sharing (CORS)", source: "MDN", type: "Docs", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS" },
      { title: "Exploiting CORS misconfigurations", source: "PortSwigger", type: "Course", url: "https://portswigger.net/web-security/cors" },
    ],
  },

  /* ---------------- 15 · SECURITY LOGGING & MONITORING ---------------- */
  {
    id: "logging",
    number: 15,
    title: "Security Logging & Monitoring",
    icon: "activity",
    severity: "medium",
    categories: ["devops", "backend"],
    time: "9 min",
    difficulty: "Intermediate",
    updated: "Oct 2025",
    owaspLabel: "OWASP A09 — Security Logging & Monitoring Failures",
    owaspUrl: "https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/",
    tagline:
      "Breaches average months of silent dwell time. Logs are your security camera footage — most teams only check them after the robbery.",
    what: {
      text: "Security logging records the events that matter (auth attempts, privilege changes, failures, suspicious inputs); monitoring turns those logs into alerts; response plans turn alerts into action. Without them, attacks proceed invisibly for weeks — the industry-measured median dwell time is still measured in weeks, not minutes.",
      analogy: "A shop with no cameras and no alarm: the thief doesn't need to be clever — just patient.",
      terms: [
        { term: "Dwell time", def: "How long an attacker sits inside undetected. Verizon/IBM data shows weeks to months is typical without monitoring." },
        { term: "SIEM", def: "Security Information & Event Management — central log aggregation with correlation and alerting (Splunk, Wazuh, Elastic)." },
        { term: "Tamper-evidence", def: "Attackers delete logs first; ship logs off-box in real time so the crime scene can't be wiped." },
      ],
    },
    why: {
      text: "Equifax's attackers exfiltrated data for 76 days unnoticed; a single expired monitoring certificate disabled their traffic-inspection tool. Most breach disclosures begin with 'a third party informed us…' — meaning the attacked org never saw it themselves.",
      breaches: [
        {
          company: "Equifax",
          year: "2017",
          impact: "76 days of undetected exfiltration",
          details: "An expired certificate killed their network-traffic monitoring; nobody noticed the blind spot or the breach for two and a half months.",
        },
        {
          company: "Marriott/Starwood",
          year: "2014–2018",
          impact: "Attackers resident for ~4 years",
          details: "Compromise began in 2014, was detected in 2018 only when an internal security tool flagged unusual database queries.",
        },
      ],
      stats: [
        { value: "~10 days", label: "median global dwell time (2024) — better, but still driven by better detection, not prevention" },
        { value: "4 yrs", label: "attackers sat inside Starwood before detection" },
      ],
    },
    how: {
      steps: [
        "Attacker probes: credential stuffing at 3am, weird payloads, access from impossible geographies.",
        "Without logging, every event is ephemeral; with logs but no alerting, events drown in noise nobody reads.",
        "Detection tools catch patterns: velocity of failures, spikes in data reads, new admin creation.",
        "An alert without a runbook still fails — define who acts, how fast, and what 'containment' means.",
      ],
      types: [
        { name: "Auth events", desc: "Logins, failures, lockouts, MFA changes, password resets." },
        { name: "Authorization & integrity", desc: "Privilege grants, data exports, config changes, failed access checks." },
        { name: "Attack signals", desc: "Injections attempts, scanner patterns, impossible travel, data egress spikes." },
      ],
    },
    vulnerable: [
      {
        lang: "javascript",
        label: "Silent by default",
        mark: [3, 8],
        code: `// VULNERABLE — nothing is recorded; attacks are invisible
app.post('/login', async (req, res) => {
  const ok = await check(req.body);
  if (!ok) return res.status(401).send('no');   // NOT logged — stuffing unseen
  res.send('ok');
});

app.use((err, req, res, next) => {
  res.status(500).send('oops');                 // error swallowed, no trace
});`,
      },
    ],
    secure: [
      {
        lang: "javascript",
        label: "Structured security logging",
        mark: [6, 7, 8, 9, 12, 13, 19, 20, 21],
        code: `// SECURE — structured, scrubbed, shipped off-box
import pino from 'pino';
const log = pino({
  redact: ['req.body.password', 'req.headers.authorization', '*.ssn'],
});                                    // never log secrets or full PII

app.post('/login', async (req, res) => {
  const ok = await check(req.body);
  log.info({
    event: 'auth.login', ok, user: hash(req.body.email),
    ip: req.ip, ua: req.get('user-agent'), ts: Date.now(),
  });                                  // SIEM correlates failures per ip/user
  if (!ok) return res.status(401).send('Invalid credentials');
  res.send('ok');
});

app.use((err, req, res, next) => {
  log.error({ event: 'app.error', path: req.path, msg: err.message });
  res.status(500).send('Something went wrong');
});

// Alert rules (Wazuh/Elastic/BetterStack):
// - >10 failed logins per account per 10 min  → page on-call
// - new admin created / MFA disabled          → immediate alert
// - egress traffic >3x baseline               → investigate now`,
      },
    ],
    fixes: [
      "Auth and error events are logged in structured JSON with correlation fields (user hash, IP, UA, timestamp).",
      "Secrets and raw PII are redacted at the logger boundary.",
      "Alert rules turn log patterns into pages — detection becomes a process, not an accident.",
    ],
    rules: [
      "Log auth events, authorization failures, privilege changes, data exports and input-validation failures.",
      "Structured logs (JSON) with correlation IDs across services.",
      "Never log passwords, tokens, full cards or raw PII — redact at the boundary.",
      "Ship logs off the host in real time; attackers delete local logs first.",
      "Alert on patterns (velocity, impossible travel, spikes) — not single errors.",
      "Write runbooks: who responds, in what time, with what containment steps.",
      "Test the pipeline: fire a canary event monthly and check it alerts.",
    ],
    quiz: [
      {
        q: "What is 'dwell time'?",
        options: [
          "How long logs are retained",
          "How long attackers sit inside your systems before detection",
          "Session timeout length",
          "Time to deploy a patch",
        ],
        correct: 1,
        why: "Marriott's attackers had ~4 years. Monitoring's entire job is crushing dwell time from months to minutes.",
      },
      {
        q: "Why ship logs off-box in real time?",
        options: [
          "Disk space",
          "After compromising a host, attackers wipe or modify local logs to erase tracks",
          "It's cheaper",
          "JSON requires it",
        ],
        correct: 1,
        why: "Centralized, append-only log stores preserve the crime scene even when the host is fully owned.",
      },
      {
        q: "What must never appear in logs?",
        options: [
          "Timestamps",
          "Passwords, session tokens, full card numbers and raw PII",
          "IP addresses",
          "HTTP methods",
        ],
        correct: 1,
        why: "Log files get wide readership and long retention — and themselves become the breach (see the Sensitive Data module). Redact at the logger.",
      },
    ],
    mistakes: [
      {
        mistake: "Logging to local files and never looking",
        explanation: "Logs without alerts are write-only memory.",
        fix: "Centralize + set alert rules for the patterns that matter.",
      },
      {
        mistake: "Alerting on everything",
        explanation: "Alert fatigue: 400 alerts/day means the real one gets muted.",
        fix: "Alert on correlated patterns; tune ruthlessly; measure false-positive rate.",
      },
      {
        mistake: "No runbook when the alert fires",
        explanation: "3am alerts handled by improvisation leak into breaches.",
        fix: "Documented triage, severity levels, and escalation paths — rehearsed.",
      },
    ],
    tools: [
      { name: "Wazuh", desc: "Free, open-source SIEM + XDR.", url: "https://wazuh.com", price: "Free" },
      { name: "BetterStack / Uptime Kuma", desc: "Log aggregation, uptime and on-call alerting.", url: "https://betterstack.com", price: "Freemium" },
      { name: "pino / winston", desc: "Structured logging for Node with redaction.", url: "https://getpino.io", price: "Free" },
    ],
    reading: [
      { title: "OWASP Top 10 — A09 Security Logging & Monitoring Failures", source: "owasp.org", type: "Docs", url: "https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/" },
      { title: "Logging Cheat Sheet", source: "OWASP", type: "Docs", url: "https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html" },
    ],
  },
];
