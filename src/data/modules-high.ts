// ============================================================
// SecureDevHub — HIGH severity modules (5, 6, 9, 10, 11, 12)
// ============================================================
import type { SecurityModule } from "./types";

export const HIGH_MODULES: SecurityModule[] = [
  /* ---------------- 05 · CSRF ---------------- */
  {
    id: "csrf",
    number: 5,
    title: "Cross-Site Request Forgery (CSRF)",
    icon: "shuffle",
    severity: "high",
    categories: ["frontend", "backend"],
    time: "12 min",
    difficulty: "Intermediate",
    updated: "Nov 2025",
    owaspLabel: "OWASP CSRF Cheat Sheet",
    owaspUrl: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html",
    tagline:
      "Another website makes your users' browsers send authenticated requests to your app — and you can't tell them apart from real ones.",
    what: {
      text: "CSRF tricks a logged-in user's browser into sending requests they never intended: changing an email, transferring money, deleting an account. Browsers attach cookies automatically, so any site on the internet can make your users request your endpoints — unless you require proof the request was intentional.",
      analogy:
        "Someone mails a pre-signed letter from your desk while you're out. The letterhead and signature are real — the browser (your assistant) attaches them automatically to anything it sends.",
      terms: [
        { term: "CSRF token", def: "A random, per-session value embedded in forms and required by the server. Attackers can't read it cross-origin (same-origin policy), so they can't forge it." },
        { term: "SameSite cookie", def: "Cookie attribute controlling cross-site sending: Strict = never, Lax = top-level GET only, None = always (requires Secure)." },
        { term: "State-changing request", def: "Any request that mutates data: POST/PUT/DELETE. GET requests must never change state." },
      ],
    },
    why: {
      text: "CSRF has enabled silent email changes, router DNS hijacks and unauthorized transactions for two decades. Modern SameSite=Lax-by-default cookies help enormously, but legacy flows, GET-based actions and misconfigured JWT setups still open the door.",
      breaches: [
        {
          company: "Netflix (researcher disclosure)",
          year: "2008",
          impact: "Account settings modifiable via CSRF",
          details: "Researchers demonstrated changing Netflix account settings and shipping addresses by getting logged-in users to load a crafted page — the classic CSRF playbook.",
        },
        {
          company: "ING Direct (research)",
          year: "2008",
          impact: "Unauthorized transfers possible",
          details: "A CSRF flaw studied by Princeton/UCSD researchers allowed initiating money transfers from logged-in customers' accounts via a malicious page.",
        },
      ],
      stats: [
        { value: "1 click", label: "all it takes — the victim only needs to load a page" },
        { value: "Lax by default", label: "Chrome's SameSite default since 2020 killed most casual CSRF" },
      ],
    },
    how: {
      steps: [
        "Victim logs into bank.example; their browser stores the session cookie.",
        "Attacker lures them to evil.example with a hidden auto-submitting form pointing at bank.example/transfer.",
        "The browser sends the request WITH the victim's cookies — SameSite absent or None means it rides along.",
        "The server sees a perfectly authenticated request and executes the transfer.",
        "With SameSite=Lax (or a required CSRF token), the cross-site POST carries no cookie/token and fails.",
      ],
      types: [
        { name: "Form CSRF", desc: "Auto-submitted hidden forms POSTing to your state-changing endpoints." },
        { name: "GET-based actions", desc: "Endpoints that mutate on GET — exploited by a simple <img src>. Never mutate on GET." },
        { name: "Login CSRF", desc: "Forcing a victim to log in as the attacker to capture their subsequent actions." },
      ],
    },
    vulnerable: [
      {
        lang: "javascript",
        label: "Node.js + Express",
        mark: [6, 10],
        code: `// VULNERABLE — cookie session, no CSRF token, SameSite=none
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: { sameSite: 'none', secure: false },
}));
app.post('/transfer', (req, res) => {
  // Any website can POST here with the victim's cookies attached
  const { to, amount } = req.body;
  bank.transfer(req.session.user, to, amount);
  res.send('done');
});`,
      },
      {
        lang: "html",
        label: "The attacker's page",
        mark: [3, 4, 5],
        code: `<!-- evil.example — the victim only has to open this page -->
<body onload="document.forms[0].submit()">
  <form action="https://bank.example/transfer" method="POST">
    <input type="hidden" name="to" value="attacker">
    <input type="hidden" name="amount" value="10000">
  </form>
</body>`,
      },
    ],
    secure: [
      {
        lang: "javascript",
        label: "Node.js + Express",
        mark: [4, 8, 9, 10, 15],
        code: `// SECURE — SameSite + per-request token verified server-side
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: { sameSite: 'lax', secure: true, httpOnly: true },
}));

app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const token = req.get('X-CSRF-Token') || req.body._csrf;
    if (!token || token !== req.session.csrfToken)
      return res.status(403).send('Invalid CSRF token');
  }
  next();
});

app.get('/transfer-form', (req, res) => {
  res.render('transfer', { csrfToken: req.session.csrfToken });
  // form carries: <input type="hidden" name="_csrf" value="{{csrfToken}}">
});

// SECURE — SPA pattern: read the cookie token and echo it as a header
// Server: set XSRF-TOKEN cookie (not HttpOnly), require X-XSRF-TOKEN
// header matching it. Cross-origin sites can't set custom headers
// without a CORS preflight — which you reject.`,
      },
    ],
    fixes: [
      "Session cookies use SameSite=Lax + Secure + HttpOnly, so cross-site POSTs arrive unauthenticated.",
      "Every state-changing request requires a session-bound CSRF token; missing or mismatching tokens get a 403.",
      "GET requests never mutate state, eliminating <img>-tag attacks entirely.",
      "SPAs use the cookie-to-header (double-submit) pattern, safe because cross-origin pages can't set custom headers.",
    ],
    rules: [
      "Require an unpredictable CSRF token on every state-changing request.",
      "Set SameSite=Lax (or Strict for high-value apps) + Secure + HttpOnly on session cookies.",
      "Never mutate anything on GET requests.",
      "Origin/Referer checks are a valid second layer for sensitive actions.",
      "If you must use SameSite=None cookies, tokens become mandatory — CORS headers alone do NOT stop CSRF.",
      "Re-authenticate (password/MFA prompt) for the most dangerous operations.",
    ],
    quiz: [
      {
        q: "Why does SameSite=Lax stop classic CSRF?",
        options: [
          "It encrypts cookies",
          "Browsers won't attach the cookie to cross-site POSTs, so forged requests arrive unauthenticated",
          "It adds a token to every form automatically",
          "It blocks iframes",
        ],
        correct: 1,
        why: "Lax only sends cookies on top-level GET navigations. The attacker's cross-site POST arrives cookieless — harmless.",
      },
      {
        q: "CORS headers (Access-Control-Allow-Origin) protect you from CSRF. True or false?",
        options: [
          "True — CORS blocks forged requests",
          "False — CORS governs reading responses; simple form POSTs still execute. Tokens + SameSite are the defense",
          "True, if you set * carefully",
          "False — you need X-Frame-Options",
        ],
        correct: 1,
        why: "CORS restricts what a page can READ, not what it can SEND. The transfer completes even when the attacker can't see the response.",
      },
      {
        q: "What makes the double-submit cookie pattern work for SPAs?",
        options: [
          "Cookies are encrypted",
          "Cross-origin pages cannot set custom request headers, so echoing the cookie value as a header proves origin",
          "The browser signs requests",
          "JWTs can't be forged",
        ],
        correct: 1,
        why: "A forged request would trigger a CORS preflight for the custom header — which your server rejects for that origin.",
      },
    ],
    mistakes: [
      {
        mistake: "Accepting JSON-only Content-Type as 'proof'",
        explanation: "fetch with text/plain or form-encoded data can carry JSON-ish payloads; content-type sniffing is not a CSRF defense.",
        fix: "Require a real token echoed in a custom header.",
      },
      {
        mistake: "Mutating state on GET ('just for the logout link')",
        explanation: "<img src='https://yourapp/logout'> works from any page, email client or XSS comment.",
        fix: "Buttons that POST (with tokens). GET is read-only, always.",
      },
      {
        mistake: "Validating the token's format but not its binding",
        explanation: "Any well-formed token passes — including the attacker's own token from their own session.",
        fix: "Compare the token against the victim's session value (or sign it with the session id).",
      },
    ],
    tools: [
      { name: "csurf / csrf-csrf", desc: "Token middleware for Express.", url: "https://github.com/Psifi-Solutions/csrf-csrf", price: "Free" },
      { name: "OWASP CSRF Cheat Sheet", desc: "Definitive prevention patterns.", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html", price: "Free" },
    ],
    reading: [
      { title: "Cross-Site Request Forgery Prevention Cheat Sheet", source: "OWASP", type: "Docs", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html" },
      { title: "SameSite cookies explained", source: "web.dev", type: "Article", url: "https://web.dev/articles/samesite-cookies-explained" },
      { title: "Web Security Academy — CSRF", source: "PortSwigger", type: "Course", url: "https://portswigger.net/web-security/csrf" },
    ],
  },

  /* ---------------- 06 · SECURITY HEADERS ---------------- */
  {
    id: "security-headers",
    number: 6,
    title: "Security Headers",
    icon: "panel-top",
    severity: "high",
    categories: ["backend", "devops"],
    time: "13 min",
    difficulty: "Beginner",
    updated: "Jan 2026",
    owaspLabel: "OWASP Secure Headers Project",
    owaspUrl: "https://owasp.org/www-project-secure-headers/",
    tagline:
      "Ten lines of HTTP headers instruct browsers to shut down entire attack classes — the highest ROI in all of web security.",
    what: {
      text: "Security headers are response headers that tell the browser how to treat your content: which scripts may run (CSP), whether it can be framed (frame-ancestors), whether MIME types may be guessed (nosniff), how long to force HTTPS (HSTS) and more. They're configuration, not code — and each one disables a well-understood attack technique.",
      analogy:
        "The building rules posted at the entrance of a high-security facility: no tailgating, badges visible, deliveries only to the loading dock. Browsers enforce your rules for every visitor automatically.",
      terms: [
        { term: "Content-Security-Policy", def: "The most powerful header: allowlists script/style/image/connect sources, blocking injected scripts, trackers and data exfiltration channels." },
        { term: "X-Content-Type-Options: nosniff", def: "Stops browsers from 'sniffing' a .txt upload as HTML — killing stored-XSS-via-file-upload." },
        { term: "frame-ancestors / X-Frame-Options", def: "Controls who may iframe your site; 'none' defeats clickjacking." },
        { term: "Referrer-Policy / Permissions-Policy", def: "Limit URL leakage in the Referer header and gate powerful browser features (camera, mic, geolocation)." },
      ],
    },
    why: {
      text: "Missing headers repeatedly appear in real incidents: clickjacking for account actions, MIME-sniffing to execute uploaded files, referrer leakage of reset tokens into third-party analytics.",
      breaches: [
        {
          company: "British Airways",
          year: "2018",
          impact: "A CSP could have contained the Magecart skimmer",
          details: "With connect-src allowlisting, the skimming script couldn't have sent card data to baways.com — even though it executed.",
        },
        {
          company: "Multiple banks",
          year: "2008–2015",
          impact: "Clickjacking vulnerabilities responsibly disclosed",
          details: "Internet-banking pages embeddable in invisible iframes let attackers trick users into confirming actions — fixed with frame-ancestors/X-Frame-Options.",
        },
      ],
      stats: [
        { value: "<10%", label: "of the Alexa top sites deployed a strong CSP historically — still rare, still valuable" },
        { value: "1 line", label: "of config (helmet()) covers the baseline set" },
      ],
    },
    how: {
      steps: [
        "Attacker finds XSS (payload executes) or uploads a file, or iframes your sensitive page on a look-alike domain.",
        "Without CSP, the injected script runs and can fetch() anywhere — exfiltrating data to attacker domains.",
        "Without nosniff, a 'text/plain' upload containing HTML executes as a page.",
        "Without frame-ancestors, your checkout loads inside an invisible iframe that records clicks (clickjacking).",
        "With proper headers, each of these is blocked by the browser itself — regardless of your code's bug.",
      ],
      types: [
        { name: "CSP", desc: "Allowlist sources per content type; report-only mode lets you deploy safely." },
        { name: "Framing protections", desc: "frame-ancestors / X-Frame-Options stop clickjacking." },
        { name: "Transport & content", desc: "HSTS forces HTTPS; nosniff blocks MIME confusion; referrer/permissions limit leakage and capabilities." },
      ],
    },
    vulnerable: [
      {
        lang: "javascript",
        label: "Express — bare defaults",
        mark: [2, 3],
        code: `// VULNERABLE — zero security headers
app.use(express.static('public'));
app.get('*', (req, res) => res.render('page'));
// → script can be injected and phone home anywhere
// → site embeddable in any iframe (clickjacking)
// → uploaded .txt files render as HTML`,
      },
      {
        lang: "http",
        label: "Response BEFORE",
        mark: [1, 2, 3],
        code: `HTTP/2 200 OK
Content-Type: text/html
Server: nginx/1.18.0
...
(no security headers — browser does whatever the payload wants)`,
      },
    ],
    secure: [
      {
        lang: "javascript",
        label: "Express — with helmet",
        mark: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        code: `// SECURE — sensible defaults via helmet, tuned CSP
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://api.myapp.com'],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));
// also sets: X-Content-Type-Options: nosniff
//            X-Frame-Options: SAMEORIGIN
//            Strict-Transport-Security, Cross-Origin-* headers`,
      },
      {
        lang: "http",
        label: "Response AFTER",
        mark: [3, 4, 5, 6, 7, 8],
        code: `HTTP/2 200 OK
Content-Type: text/html; charset=utf-8
Content-Security-Policy: default-src 'self'; script-src 'self'; frame-ancestors 'none'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()`,
      },
    ],
    fixes: [
      "helmet() applies the baseline set in one middleware; the CSP is tuned to allowlist only your own origins.",
      "frame-ancestors 'none' + X-Frame-Options remove clickjacking.",
      "nosniff kills MIME-confusion execution of uploads.",
      "HSTS with preload forces HTTPS permanently; Referrer-Policy and Permissions-Policy minimize leakage and capabilities.",
    ],
    rules: [
      "Start with helmet (Express) or your framework's secure-headers middleware; verify each header it sets.",
      "Deploy CSP in Report-Only first, fix violations, then enforce.",
      "frame-ancestors 'none' (and X-Frame-Options as fallback) unless you genuinely embed elsewhere.",
      "Always set X-Content-Type-Options: nosniff.",
      "HSTS max-age ≥ 1 year with includeSubDomains; add preload when confident.",
      "Referrer-Policy: strict-origin-when-cross-origin (or stricter) to stop URL/token leakage.",
      "Lock down Permissions-Policy: only enable camera/mic/geo on pages that need them.",
    ],
    quiz: [
      {
        q: "Which header would have limited data exfiltration in the BA Magecart attack?",
        options: ["X-Frame-Options", "Content-Security-Policy (connect-src)", "Referrer-Policy", "X-Powered-By"],
        correct: 1,
        why: "The script executed, but with connect-src allowlisting your own domain, fetch() calls to baways.com would be blocked at the browser.",
      },
      {
        q: "What does X-Content-Type-Options: nosniff prevent?",
        options: [
          "Directory listing",
          "Browsers interpreting a declared text/plain file as HTML/JS — a classic stored-XSS via upload",
          "Parameter pollution",
          "TLS downgrade",
        ],
        correct: 1,
        why: "Without nosniff, an uploaded .txt full of <script> can be sniffed as text/html and executed in your origin.",
      },
      {
        q: "The safe rollout strategy for a strong CSP is…",
        options: [
          "Ship default-src 'none' immediately",
          "Content-Security-Policy-Report-Only first, watch violation reports, then enforce",
          "Copy stackoverflow snippets",
          "Allow unsafe-inline everywhere",
        ],
        correct: 1,
        why: "CSP breaks things when sources weren't inventoried. Report-only mode finds every legit script/style without breaking users.",
      },
    ],
    mistakes: [
      {
        mistake: "CSP with 'unsafe-inline' everywhere",
        explanation: "Allows any injected inline script — the exact thing CSP exists to block.",
        fix: "Use nonces/hashes for the few inline scripts you truly need.",
      },
      {
        mistake: "Removing X-Powered-By but leaving a verbose Server header",
        explanation: "Version banners hand attackers a CVE shopping list for fingerprinting.",
        fix: "helmet hides X-Powered-By; drop or genericize Server at the proxy.",
      },
      {
        mistake: "Framing protections on the homepage only",
        explanation: "Clickjackers iframe your checkout or settings page — not your landing page.",
        fix: "Apply headers app-wide at the framework middleware level.",
      },
    ],
    tools: [
      { name: "securityheaders.com", desc: "Instant letter-grade scan of your response headers.", url: "https://securityheaders.com", price: "Free" },
      { name: "Mozilla Observatory", desc: "Comprehensive scan: headers, TLS, cookies, CSP analysis.", url: "https://observatory.mozilla.org", price: "Free" },
      { name: "CSP Evaluator", desc: "Google's strict CSP correctness checker.", url: "https://csp-evaluator.withgoogle.com", price: "Free" },
      { name: "helmet", desc: "Express middleware that sets the baseline in one line.", url: "https://helmetjs.github.io", price: "Free" },
    ],
    reading: [
      { title: "OWASP Secure Headers Project", source: "OWASP", type: "Docs", url: "https://owasp.org/www-project-secure-headers/" },
      { title: "Content Security Policy Reference", source: "content-security-policy.com", type: "Docs", url: "https://content-security-policy.com" },
      { title: "Our blog: 10 Security Headers Every Website Should Have", source: "SecureDevHub", type: "Article", url: "#/blog/security-headers-guide" },
    ],
  },

  /* ---------------- 09 · API SECURITY ---------------- */
  {
    id: "api-security",
    number: 9,
    title: "API Security",
    icon: "webhook",
    severity: "high",
    categories: ["backend"],
    time: "14 min",
    difficulty: "Intermediate",
    updated: "Dec 2025",
    owaspLabel: "OWASP API Security Top 10",
    owaspUrl: "https://owasp.org/API-Security/editions/2023/en/0x11-t10/",
    tagline:
      "APIs expose your data model directly to the internet. Auth, rate limits and object-level checks on every endpoint — or someone's scripting your database.",
    what: {
      text: "API security is the discipline of the OWASP API Top 10: broken object-level authorization (BOLA/IDOR), broken authentication, excessive data exposure, missing rate limits and mass assignment. Unlike web pages, APIs return raw data — every over-sharing or under-checking mistake is machine-readable and scriptable.",
      analogy:
        "A restaurant where the waiter (UI) used to filter what you could ask for — and now customers can walk straight into the kitchen and take anything from the shelves.",
      terms: [
        { term: "BOLA / IDOR", def: "Broken Object Level Authorization — /api/orders/1001 → /api/orders/1002 returns a stranger's order. API Top 10 #1." },
        { term: "Mass assignment", def: "Binding request JSON straight to models: clients add {role:'admin'} and your ORM saves it." },
        { term: "Rate limiting", def: "Throttling requests per key/IP so brute force, scraping and abuse become economically pointless." },
      ],
    },
    why: {
      text: "API incidents now dominate breach reports: Optus (2022) lost 9.8M records via an unauthenticated enumeration endpoint; T-Mobile, Peloton and Parler all leaked through BOLA or missing auth on APIs.",
      breaches: [
        {
          company: "Optus",
          year: "2022",
          impact: "9.8M customer records",
          details: "A public API endpoint served customer records without authentication; enumerating sequential IDs scraped the lot.",
        },
        {
          company: "Peloton",
          year: "2021",
          impact: "Private profile data of millions",
          details: "An unauthenticated API returned full user profiles — even for accounts set to private — classic BOLA + excessive data exposure.",
        },
      ],
      stats: [
        { value: "#1", label: "BOLA tops the OWASP API Security Top 10" },
        { value: "80%+", label: "of web traffic is now API calls, not page loads" },
      ],
    },
    how: {
      steps: [
        "Attacker signs up legitimately and inspects network calls: /api/v1/users/5821, /api/orders?status=shipped.",
        "They probe authorization by swapping IDs, roles and verbs (PUT on read-only resources).",
        "Missing object-level checks return other tenants' data; extra fields (ssn, passwordHash) arrive in responses.",
        "Unauthenticated or weakly-authenticated endpoints plus no rate limit = scripted full-database extraction.",
      ],
      types: [
        { name: "BOLA / IDOR", desc: "Object-level authorization missing — IDs enumerate the world." },
        { name: "Broken auth & excessive data", desc: "Endpoints without auth, or returning fields the UI never displays." },
        { name: "No consumption limits", desc: "No rate limiting, pagination caps or payload size limits — scraping and brute force at will." },
      ],
    },
    vulnerable: [
      {
        lang: "javascript",
        label: "Node.js + Express",
        mark: [2, 8, 9, 14],
        code: `// VULNERABLE — no auth, no ownership, over-sharing, no limits
app.get('/api/users/:id', async (req, res) => {
  res.json(await db.users.findById(req.params.id));   // BOLA + full model
});

app.post('/api/users', async (req, res) => {
  const user = await db.users.create(req.body);       // mass assignment:
  // { name: 'x', role: 'admin', balance: 1000000 } — all accepted
  res.json(user);
});

app.post('/api/verify-code', async (req, res) => {
  // 4-digit code, no rate limiting → 10,000 tries ≈ seconds
  res.json({ ok: req.body.code === user.mfaCode });
});`,
      },
    ],
    secure: [
      {
        lang: "javascript",
        label: "Node.js + Express",
        mark: [3, 4, 5, 6, 10, 15, 16, 17, 22],
        code: `// SECURE — auth middleware, ownership check, DTO, strict schema, limits
app.get('/api/users/:id', requireAuth, async (req, res) => {
  const target = await db.users.findById(req.params.id);
  if (!target || (target.id !== req.user.id && req.user.role !== 'admin'))
    return res.status(404).json({ error: 'Not found' });        // BOLA check
  res.json({ id: target.id, name: target.name, plan: target.plan }); // DTO
});

app.post('/api/users', requireAuth, async (req, res) => {
  const parsed = createUserSchema.strict().safeParse(req.body); // zod:
  if (!parsed.success) return res.status(400).json(parsed.error);
  const user = await db.users.create({ ...parsed.data, role: 'user' });
  // unknown keys rejected; role/balance never client-controlled
  res.status(201).json({ id: user.id });
});

const codeLimiter = rateLimit({ windowMs: 60000, max: 5 });
app.post('/api/verify-code', codeLimiter, requireAuth, async (req, res) => {
  const ok = safeCompare(req.body.code, user.mfaCode);
  res.json({ ok });                                             // throttled brute force
});`,
      },
    ],
    fixes: [
      "Every endpoint requires authentication; every object access checks ownership/tenant (returns 404, not 403, to avoid enumeration).",
      "Responses use DTO projections — allowlisted fields only.",
      "Write endpoints validate strict schemas (zod .strict()) preventing mass assignment.",
      "Sensitive operations are rate-limited; brute forcing a 4-digit code is no longer viable.",
    ],
    rules: [
      "Authenticate every endpoint; authorize every object access (BOLA is API bug #1).",
      "Return only fields the client needs — never raw models.",
      "Validate request bodies with strict schemas; reject unknown keys.",
      "Rate-limit per API key and per IP; add pagination caps and payload size limits.",
      "Version your API and retire old versions; document with OpenAPI and test authz in CI.",
      "Return 404 (not 403) for resources the caller shouldn't know exist.",
    ],
    quiz: [
      {
        q: "What is BOLA/IDOR?",
        options: [
          "A type of SQL injection",
          "Accessing another user's object by changing an identifier because no ownership check ran",
          "Breaking TLS between services",
          "Flooding an endpoint with requests",
        ],
        correct: 1,
        why: "Authentication proves who you are; BOLA is the missing per-object 'are you allowed?' check — top of the OWASP API list.",
      },
      {
        q: "Mass assignment is prevented by…",
        options: [
          "Encrypting the JSON body",
          "Strict schemas that reject unknown keys, plus explicit field mapping to the model",
          "CORS restrictions",
          "Longer field names",
        ],
        correct: 1,
        why: "If {role:'admin'} can't survive parsing and you never spread req.body into the ORM, clients can't self-promote.",
      },
      {
        q: "Why return 404 instead of 403 for unauthorized object access?",
        options: [
          "404 pages are prettier",
          "403 confirms the resource exists, enabling enumeration; 404 reveals nothing",
          "403 is deprecated",
          "Browsers handle 404 faster",
        ],
        correct: 1,
        why: "Existence itself is information. Attackers harvest valid IDs from 403-vs-404 differences; uniform 404s deny them the signal.",
      },
    ],
    mistakes: [
      {
        mistake: "Trusting the front-end to hide admin buttons",
        explanation: "APIs are called directly with curl/Postman — hiding UI elements restricts nothing.",
        fix: "Authorize server-side on every request.",
      },
      {
        mistake: "Unbounded page sizes",
        explanation: "?limit=10000000 returns your entire table in one response and melts your DB.",
        fix: "Cap limits (e.g. max 100) and use cursor pagination.",
      },
      {
        mistake: "API keys in URLs",
        explanation: "Query strings end up in logs, history and referrer headers — instant key leakage.",
        fix: "Authorization: Bearer header; short-lived tokens.",
      },
    ],
    tools: [
      { name: "OWASP API Security Top 10", desc: "The canonical API risk list with mitigations.", url: "https://owasp.org/API-Security/editions/2023/en/0x11-t10/", price: "Free" },
      { name: "Postman", desc: "Explore and security-test your own endpoints.", url: "https://www.postman.com", price: "Freemium" },
      { name: "crAPI", desc: "OWASP's deliberately vulnerable API for practice.", url: "https://github.com/OWASP/crAPI", price: "Free" },
    ],
    reading: [
      { title: "OWASP API Security Top 10 (2023)", source: "OWASP", type: "Docs", url: "https://owasp.org/API-Security/editions/2023/en/0x11-t10/" },
      { title: "REST Security Cheat Sheet", source: "OWASP", type: "Docs", url: "https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html" },
      { title: "Web Security Academy — API testing", source: "PortSwigger", type: "Course", url: "https://portswigger.net/web-security/api-testing" },
    ],
  },

  /* ---------------- 10 · DEPENDENCY & SUPPLY CHAIN SECURITY ---------------- */
  {
    id: "dependencies",
    number: 10,
    title: "Dependency & Supply Chain Security",
    icon: "package",
    severity: "high",
    categories: ["devops"],
    time: "11 min",
    difficulty: "Intermediate",
    updated: "Jan 2026",
    owaspLabel: "OWASP A06 — Vulnerable & Outdated Components",
    owaspUrl: "https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/",
    tagline:
      "You ship 3 lines of code and 3,000 of someone else's. Every dependency is a stranger's code with production privileges.",
    what: {
      text: "Modern apps are mostly dependencies: an average npm install pulls hundreds of transitive packages you never chose. Supply-chain security means knowing what you depend on (inventory/SBOM), tracking CVEs against it (scanning), updating continuously, and defending against deliberately poisoned packages (typosquatting, hijacked maintainers).",
      analogy: "Cooking with 200 ingredients from 200 unknown suppliers — and never checking whether any was recalled or tampered with.",
      terms: [
        { term: "CVE", def: "Common Vulnerabilities and Exposures — the public catalog of known flaws with severity scores (CVSS)." },
        { term: "Lockfile", def: "package-lock.json / yarn.lock / poetry.lock pins exact versions + integrity hashes so every install is byte-identical." },
        { term: "Typosquatting", def: "Publishing 'lodahs' or 'crossenv' — malicious packages named one typo away from popular ones." },
        { term: "SBOM", def: "Software Bill of Materials — the ingredient list of everything inside your artifact." },
      ],
    },
    why: {
      text: "The biggest breaches in history came through dependencies: Equifax's unpatched Struts exposed 147M people, and the Log4Shell flaw in a ubiquitous Java library forced a global patching emergency.",
      breaches: [
        {
          company: "Equifax",
          year: "2017",
          impact: "147M people, $700M+ settlement",
          details: "The Apache Struts CVE-2017-5638 patch was available two months before the attackers walked in. Nobody applied it. Read the full case study in our blog.",
        },
        {
          company: "Log4Shell (industry-wide)",
          year: "2021",
          impact: "Hundreds of millions of systems vulnerable",
          details: "A single logging library's RCE affected virtually every Java shop on earth — most didn't know log4j was even inside.",
        },
        {
          company: "event-stream (npm)",
          year: "2018",
          impact: "Bitcoin-stealing code in a package with 2M weekly downloads",
          details: "A malicious maintainer took over a popular package and shipped a backdoor targeting a crypto wallet — the canonical hijacked-maintainer case.",
        },
      ],
      stats: [
        { value: "77%", label: "of code in a typical app is open-source dependencies (not your code)" },
        { value: "60 days", label: "Equifax had the Struts patch available before the breach began" },
        { value: "245k", label: "malicious packages detected in open-source registries in 2023 alone (Sonatype)" },
      ],
    },
    how: {
      steps: [
        "You install a small package; it installs fifty of its own — the tree explodes invisibly.",
        "A CVE is published for a transitive dependency, or a maintainer account is phished and pushes malware.",
        "Your CI installs the poisoned/vulnerable version automatically (no lockfile, floating ^ ranges).",
        "Attackers exploit the CVE remotely (Struts, Log4Shell) or the package itself exfiltrates env vars in install scripts.",
        "Without an inventory, you don't even know you're affected — that's the Equifax story.",
      ],
      types: [
        { name: "Known vulnerabilities (CVEs)", desc: "Vulnerable versions you simply haven't updated." },
        { name: "Poisoned packages", desc: "Typosquats, hijacked maintainers, protestware and dependency confusion." },
        { name: "Abandoned code", desc: "Unmaintained packages whose known flaws will never be fixed." },
      ],
    },
    vulnerable: [
      {
        lang: "json",
        label: "package.json",
        mark: [3, 4, 5],
        code: `{
  "dependencies": {
    "express": "*",
    "lodash": "^3.10.1",
    "left-pad": "^1.0.0"
  }
  /* *  → whatever's newest tomorrow (unreviewed, un-pinned)
     no lockfile committed → every install is a dice roll
     no audit step in CI       */
}`,
      },
    ],
    secure: [
      {
        lang: "json",
        label: "package.json",
        mark: [3, 4, 7, 8],
        code: `{
  "dependencies": {
    "express": "4.21.2",
    "lodash": "4.17.21"
  },
  "scripts": {
    "audit:ci": "npm audit --audit-level=high"
  }
  /* exact pins + committed lockfile = reproducible installs
     Dependabot/Renovate open PRs for every new CVE          */
}`,
      },
      {
        lang: "bash",
        label: "CI pipeline",
        mark: [2, 3, 6, 7],
        code: `# SECURE — every PR scanned, installs pinned, artifacts inventoried
npm ci                        # installs exactly from lockfile (not npm install)
npm audit --audit-level=high  # fail the build on high/critical CVEs

# generate an SBOM for every release
npx @cyclonedx/cdxgen -o sbom.json
# watch for new CVEs against your SBOM; enable Dependabot/Renovate`,
      },
    ],
    fixes: [
      "Versions pinned exactly; lockfile committed; CI installs with npm ci for byte-identical dependency trees.",
      "npm audit (or Snyk/OSV) gates every pull request on high+ severities.",
      "A generated SBOM makes 'are we affected?' a query, not an archaeology project.",
      "Dependency-elimination becomes a habit: fewer, well-maintained packages beat dozens of abandoned ones.",
    ],
    rules: [
      "Commit lockfiles and install with --ci variants for reproducibility.",
      "Run vulnerability scans (npm audit, Snyk, OSV-Scanner) on every build.",
      "Automate updates with Dependabot/Renovate — small, continuous, reviewed patches.",
      "Audit new dependencies before adding: age, downloads, maintenance, transitive size.",
      "Pin to exact versions in production; beware ^ ranges without lockfiles.",
      "Produce an SBOM per release and monitor CVEs against it.",
      "Treat install scripts as code execution: --ignore-scripts for untrusted trees.",
    ],
    quiz: [
      {
        q: "What was the root cause of the Equifax breach?",
        options: [
          "Zero-day with no patch",
          "A Struts vulnerability whose patch existed for two months but wasn't applied",
          "A phishing email",
          "Weak TLS",
        ],
        correct: 1,
        why: "CVE-2017-5638 was announced with a patch in March 2017; the breach ran May–July. Patching discipline — not exotic hacking — failed.",
      },
      {
        q: "Why commit the lockfile?",
        options: [
          "It makes installs faster only",
          "It pins exact versions + integrity hashes so CI and prod install identical, reviewed code",
          "It encrypts dependencies",
          "npm requires it",
        ],
        correct: 1,
        why: "Without it, ^ranges float and every build can silently ship new, unreviewed code. Lockfiles make 'what changed' visible in review.",
      },
      {
        q: "Typosquatting works by…",
        options: [
          "Registering domains similar to yours",
          "Publishing packages named almost like popular ones and waiting for mistyped installs",
          "Guessing passwords",
          "Cloning git repos",
        ],
        correct: 1,
        why: "One fat-fingered 'npm i crossenv' executed credential-stealing code. Verify names, prefer scoped packages, pin versions.",
      },
    ],
    mistakes: [
      {
        mistake: "Disabling npm audit because it's noisy",
        explanation: "Noise is better than blindness; Equifax is what silent dependency risk looks like.",
        fix: "Gate on high/critical only, triage the rest on a schedule.",
      },
      {
        mistake: "Using npm install in CI",
        explanation: "It updates the lockfile silently — your builds are no longer reproducible.",
        fix: "npm ci in all automation.",
      },
      {
        mistake: "Trusting install scripts blindly",
        explanation: "postinstall runs arbitrary code with your shell's privileges (and CI secrets).",
        fix: "Use --ignore-scripts where possible and review packages that need them.",
      },
    ],
    tools: [
      { name: "npm audit", desc: "Built-in dependency vulnerability reporting.", url: "https://docs.npmjs.com/cli/v10/commands/npm-audit", price: "Free" },
      { name: "Snyk", desc: "Find & auto-fix vulnerabilities across ecosystems.", url: "https://snyk.io", price: "Freemium" },
      { name: "Dependabot", desc: "GitHub's automated update PRs.", url: "https://github.com/dependabot", price: "Free" },
      { name: "OSV-Scanner", desc: "Google's scanner across 16 ecosystems.", url: "https://google.github.io/osv-scanner/", price: "Free" },
    ],
    reading: [
      { title: "OWASP Top 10 — A06 Vulnerable and Outdated Components", source: "owasp.org", type: "Docs", url: "https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/" },
      { title: "Our case study: The Equifax Breach", source: "SecureDevHub", type: "Article", url: "#/blog/equifax-breach" },
      { title: "npm best practices for supply chain security", source: "GitHub Security Lab", type: "Article", url: "https://securitylab.github.com" },
    ],
  },

  /* ---------------- 11 · FILE UPLOAD SECURITY ---------------- */
  {
    id: "file-upload",
    number: 11,
    title: "File Upload Security",
    icon: "file-up",
    severity: "high",
    categories: ["backend"],
    time: "10 min",
    difficulty: "Intermediate",
    updated: "Nov 2025",
    owaspLabel: "OWASP File Upload Cheat Sheet",
    owaspUrl: "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html",
    tagline:
      "An upload field is a stranger handing you an envelope and asking you to open it — on your server, inside your network.",
    what: {
      text: "File upload vulnerabilities let attackers upload server-executable files (web shells), oversized files (DoS), polyglot files that render as HTML (stored XSS), or paths that escape the intended directory (traversal). The extension check you wrote in the front-end stops none of it.",
      analogy: "Airport security that checks only the label on the suitcase — never opens it, never swabs it, never weighs it.",
      terms: [
        { term: "Web shell", def: "An uploaded .php/.jsp script the attacker then executes via HTTP — full remote code execution." },
        { term: "Magic bytes", def: "The file's real type signature (FF D8 FF for JPEG). Checking content, not names, is how you verify type." },
        { term: "Polyglot file", def: "A file valid in two formats at once — a JPEG that's also valid HTML — used to smuggle scripts past filters." },
      ],
    },
    why: {
      text: "Upload-to-RCE chains appear in ransomware playbooks and bug-bounty writeups constantly; even 'just XSS' via uploaded SVG has taken over admin panels at scale.",
      breaches: [
        {
          company: "Equifax-adjacent: Apache Struts upload bugs",
          year: "2017",
          impact: "RCE via malicious multipart requests",
          details: "Several Struts CVEs abused file-upload parsing paths to execute code — upload endpoints are high-value RCE targets.",
        },
        {
          company: "Various vBulletin forums",
          year: "2019",
          impact: "Mass defacement & shells",
          details: "An RCE in the forum's upload handler let attackers drop shells on thousands of sites within days of disclosure.",
        },
      ],
      stats: [
        { value: "CWE-434", label: "Unrestricted Upload of File with Dangerous Type — a MITRE Top-25 weakness" },
        { value: "3 checks", label: "extension, MIME and content — you need all of them plus size limits" },
      ],
    },
    how: {
      steps: [
        "Attacker finds an upload: avatar, attachment, import feed, KYC document.",
        "They bypass superficial checks: rename shell.php.jpg, forge Content-Type, craft polyglots, or use double extensions (.php5, .pHTML).",
        "The file lands somewhere reachable: inside webroot, served without Content-Disposition, or parsed by the app server.",
        "Visiting the URL executes the shell → RCE; or an SVG with <script> runs as an admin views it → account theft.",
      ],
      types: [
        { name: "Executable uploads", desc: ".php/.jsp/.aspx served by the web server = instant web shell." },
        { name: "XSS via uploads", desc: "SVG/HTML/polyglot files rendering as active content in your origin." },
        { name: "Traversal & DoS", desc: "../../ in filenames overwriting files; zip bombs and giant uploads exhausting disk." },
      ],
    },
    vulnerable: [
      {
        lang: "javascript",
        label: "Node.js + Express",
        mark: [6, 7, 8],
        code: `// VULNERABLE — extension string check only, stored in webroot
import multer from 'multer';
const upload = multer({ dest: 'public/uploads/' });

app.post('/avatar', upload.single('file'), (req, res) => {
  const ok = req.file.originalname.endsWith('.jpg');   // shell.php.jpg ✓ passes
  if (!ok) return res.status(400).send('jpg only');
  // file is now public at /uploads/<name> — executed or rendered
  res.json({ url: '/uploads/' + req.file.filename });
});`,
      },
    ],
    secure: [
      {
        lang: "javascript",
        label: "Node.js + Express",
        mark: [6, 7, 8, 9, 10, 11, 12, 17, 18, 19, 20],
        code: `// SECURE — type by content, size limits, random names, safe storage
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import crypto from 'crypto';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },       // hard caps
});

app.post('/avatar', requireAuth, upload.single('file'), async (req, res) => {
  const buf = req.file.buffer;
  const type = await fileTypeFromBuffer(buf);            // magic bytes, not name
  if (!type || !['image/jpeg', 'image/png'].includes(type.mime))
    return res.status(400).send('Only real JPEG/PNG images');

  const name = crypto.randomUUID() + '.' + (type.mime === 'image/png' ? 'png' : 'jpg');
  const processed = await sharp(buf).rotate().resize(512, 512).toBuffer();
  // re-encoding strips embedded payloads EXIF tricks and polyglots

  await s3.putObject({ Bucket: AVATAR_BUCKET, Key: name, Body: processed,
    ContentType: type.mime, ContentDisposition: 'attachment' });
  // stored OUTSIDE webroot, served from a separate static domain/CDN
  res.json({ url: 'https://static-cdn.example.com/' + name });
});`,
      },
    ],
    fixes: [
      "Real type is detected from magic bytes (file-type), not from the filename or client-supplied MIME.",
      "Hard size and count limits stop zip bombs and disk-fill DoS.",
      "Randomized filenames prevent path traversal and overwrite attacks.",
      "Re-encoding images strips embedded payloads; files are served from outside the webroot (or object storage/CDN) with Content-Disposition: attachment and nosniff.",
    ],
    rules: [
      "Never trust the filename or client-provided Content-Type.",
      "Detect type from magic bytes, and allowlist a minimal set of formats.",
      "Enforce size limits at the proxy and the app layer.",
      "Generate random filenames; never use the user's name or original path.",
      "Store uploads outside the webroot (object storage or a non-executable directory).",
      "Re-encode images/documents server-side to strip payloads and polyglots.",
      "Serve uploads from a separate domain with Content-Disposition and X-Content-Type-Options: nosniff.",
    ],
    quiz: [
      {
        q: "Why is endsWith('.jpg') an insufficient upload check?",
        options: [
          "It doesn't handle uppercase",
          "It's a string check on an attacker-controlled name — shell.php.jpg passes and the content is never inspected",
          "It's case sensitive",
          "JPEG files don't support it",
        ],
        correct: 1,
        why: "Names lie. Verify the content (magic bytes + re-encoding) and control where and how the file is stored and served.",
      },
      {
        q: "Why should uploads live outside the webroot (or on object storage)?",
        options: [
          "Faster downloads",
          "Even a successfully uploaded executable can't be reached and executed by the web server",
          "Cheaper bandwidth",
          "SEO",
        ],
        correct: 1,
        why: "Web shells only work when the server will execute the uploaded file under a URL. Separate storage removes that entire class.",
      },
      {
        q: "An SVG file is dangerous as an avatar because…",
        options: [
          "It's too large",
          "SVG is XML that can contain <script> and executes in your origin when opened directly",
          "Browsers block SVG",
          "It lacks magic bytes",
        ],
        correct: 1,
        why: "Allow SVG only if sanitized (DOMPurify) — otherwise convert to PNG server-side or serve from a sandboxed domain with attachment disposition.",
      },
    ],
    mistakes: [
      {
        mistake: "Checking MIME from the request header",
        explanation: "The client sets Content-Type — the attacker simply lies.",
        fix: "Detect content server-side (file-type, libmagic).",
      },
      {
        mistake: "Serving user files with inline rendering",
        explanation: "HTML/SVG uploads run scripts in your origin the moment someone views them.",
        fix: "Content-Disposition: attachment + nosniff + a separate static domain.",
      },
      {
        mistake: "No size limits anywhere",
        explanation: "One 10GB upload (or a zip bomb) fills disks and kills the service.",
        fix: "Limits at proxy (client_max_body_size) and app (multer limits).",
      },
    ],
    tools: [
      { name: "OWASP File Upload Cheat Sheet", desc: "The complete allow/deny matrix per file type.", url: "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html", price: "Free" },
      { name: "file-type (npm)", desc: "Magic-byte file type detection for Node.", url: "https://github.com/sindresorhus/file-type", price: "Free" },
      { name: "ClamAV", desc: "Open-source antivirus engine for scanning uploads.", url: "https://www.clamav.net", price: "Free" },
    ],
    reading: [
      { title: "File Upload Cheat Sheet", source: "OWASP", type: "Docs", url: "https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html" },
      { title: "Unrestricted File Upload", source: "PortSwigger", type: "Course", url: "https://portswigger.net/web-security/file-upload" },
    ],
  },

  /* ---------------- 12 · SESSION MANAGEMENT ---------------- */
  {
    id: "session-management",
    number: 12,
    title: "Session Management",
    icon: "cookie",
    severity: "high",
    categories: ["backend"],
    time: "11 min",
    difficulty: "Intermediate",
    updated: "Dec 2025",
    owaspLabel: "OWASP Session Management Cheat Sheet",
    owaspUrl: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html",
    tagline:
      "A session ID is a bearer token: whoever holds it IS the user. Protect its creation, storage, transport and death.",
    what: {
      text: "HTTP is stateless, so after login the server issues a session identifier — usually a cookie — that stands in for the password on every request. Session management is everything about that token's lifecycle: unpredictable generation, safe transport (Secure/HttpOnly/SameSite), rotation on login, timeouts and server-side invalidation on logout.",
      analogy: "A wristband at a festival. If anyone can grab your wrist (sniff it), guess the band number (predictable IDs), or keep using it forever (no expiry), the gate checks are meaningless.",
      terms: [
        { term: "Session fixation", def: "Attacker sets victim's session ID before login; after the victim authenticates, the attacker shares the session. Fixed by regenerating the ID at login." },
        { term: "Idle vs absolute timeout", def: "Idle: expire after N minutes inactive. Absolute: expire no matter what after M hours. Sensitive apps need both." },
        { term: "Cookie flags", def: "Secure (HTTPS only), HttpOnly (no JS), SameSite (cross-site control), and a tight Domain/Path scope." },
      ],
    },
    why: {
      text: "Session theft is the quietest of all account takeovers — no password needed, no lockout triggered, no MFA prompt. XSS payloads, open Wi-Fi and malware logs are full of live session cookies.",
      breaches: [
        {
          company: "Linus Tech Tips (YouTube)",
          year: "2023",
          impact: "Channels hijacked live",
          details: "Malware stole browser session cookies; attackers replayed them — fully bypassing password and MFA — to take over channels with 15M subscribers in minutes.",
        },
        {
          company: "CircleCI",
          year: "2023",
          impact: "Customer env vars & tokens exposed",
          details: "Malware on an engineer's laptop stole an active session cookie; that single session provided SSO access to production systems.",
        },
      ],
      stats: [
        { value: "$3B+", label: "in crypto stolen via cookie/session theft malware families by 2023-2024 (industry tallies)" },
        { value: "128 bits", label: "minimum entropy a session ID must have (OWASP)" },
      ],
    },
    how: {
      steps: [
        "Attacker obtains a session ID: XSS reading a non-HttpOnly cookie, sniffing a non-Secure cookie on HTTP, info-stealer malware, or guessing a weak ID.",
        "They replay it from their own machine: Cookie: SESSIONID=stolen — the server can't tell them from the victim.",
        "No idle timeout means days-old stolen sessions still work; no rotation means IDs issued pre-login remain valid after it.",
        "Logout that only clears the client (not the server store) leaves the token alive forever for whoever saved it.",
      ],
      types: [
        { name: "Theft & replay", desc: "XSS, malware and network sniffing yield live bearer tokens." },
        { name: "Fixation & prediction", desc: "Server accepts attacker-chosen IDs, or IDs have low entropy and get guessed." },
        { name: "Improper lifecycle", desc: "No timeouts, no server-side logout, no rotation after privilege change." },
      ],
    },
    vulnerable: [
      {
        lang: "javascript",
        label: "Node.js + Express",
        mark: [4, 5, 6, 10],
        code: `// VULNERABLE — predictable IDs, weak cookie, no timeout,
// no rotation, logout clears client only
let nextId = 1000;
app.post('/login', (req, res) => {
  const sid = 'sess-' + (++nextId);          // guessable!
  sessions[sid] = req.body.user;
  res.cookie('sid', sid);                    // no Secure/HttpOnly/SameSite
});
app.post('/logout', (req, res) => {
  res.clearCookie('sid');                    // server session still valid!
});`,
      },
    ],
    secure: [
      {
        lang: "javascript",
        label: "Node.js + Express",
        mark: [5, 6, 7, 8, 9, 14, 15, 21, 22],
        code: `// SECURE — vetted store, hardened cookie, rotation + timeouts
import session from 'express-session';
import RedisStore from 'connect-redis';

app.use(session({
  store: new RedisStore({ client: redis }),  // server-side, revocable
  secret: process.env.SESSION_SECRET,
  name: '__Host-sid',                        // prefix rules applied by browser
  genid: () => crypto.randomUUID(),          // 128+ bits entropy
  rolling: true,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true, secure: true, sameSite: 'lax',
    maxAge: 15 * 60 * 1000,                  // 15-min idle timeout
  },
}));

app.post('/login', async (req, res) => {
  // ...verify credentials...
  req.session.regenerate(() => {             // NEW id — kills fixation
    req.session.userId = user.id;
    res.send('ok');
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.clearCookie('__Host-sid').send('bye'));
  // session removed server-side — replaying the old id now fails
});`,
      },
    ],
    fixes: [
      "Session IDs come from the CSPRNG with ≥128 bits of entropy — never incrementing numbers.",
      "Cookies are __Host-prefixed with Secure, HttpOnly and SameSite, scoped tightly.",
      "Login regenerates the session ID, defeating fixation.",
      "Sessions live in a server-side store with idle timeouts; logout destroys server-side state.",
    ],
    rules: [
      "Use the framework's session system; never hand-roll IDs or storage.",
      "Require ≥128-bit random IDs from crypto APIs (not Math.random).",
      "Always set Secure + HttpOnly + SameSite; consider __Host- naming.",
      "Regenerate the session ID on login and privilege changes.",
      "Enforce idle timeouts (15–30 min sensitive) and absolute timeouts.",
      "Destroy sessions server-side on logout, and offer 'log out all devices'.",
      "Bind signals when risk warrants it (UA/IP heuristics, re-auth for sensitive actions).",
    ],
    quiz: [
      {
        q: "What does regenerating the session ID at login prevent?",
        options: ["CSRF", "Session fixation", "XSS", "Brute force"],
        correct: 1,
        why: "Any ID the attacker knew pre-login becomes invalid; the post-login ID is freshly generated and only the victim has it.",
      },
      {
        q: "Why is HttpOnly critical for session cookies?",
        options: [
          "It encrypts the cookie",
          "XSS payloads can't read the cookie via document.cookie, blunting session theft from script injection",
          "It prevents CSRF",
          "It adds HSTS",
        ],
        correct: 1,
        why: "Sessions are the #1 XSS target. HttpOnly removes cookie access from JavaScript entirely.",
      },
      {
        q: "Client-side 'logout' that only clears the cookie is wrong because…",
        options: [
          "Cookies regenerate",
          "The server-side session stays valid — anyone holding the old ID can keep using it",
          "It logs out other users",
          "It's slower",
        ],
        correct: 1,
        why: "Bearer tokens remain accepted until the server store is cleaned. Always destroy the server session and invalidate refresh tokens.",
      },
    ],
    mistakes: [
      {
        mistake: "Math.random()-based session IDs",
        explanation: "Predictable PRNG output has repeatedly enabled session prediction in the wild.",
        fix: "crypto.randomUUID / secrets.token_urlsafe(32) only.",
      },
      {
        mistake: "Storing sessions only in signed cookies with no expiry",
        explanation: "Stateless tokens can't be revoked — a stolen token works until it expires (days).",
        fix: "Server-side store or short expiries plus a revocation list/rotation.",
      },
      {
        mistake: "Accepting session IDs from URLs",
        explanation: "?sid= URLs leak into logs, referrers and screenshots — and enable fixation.",
        fix: "Cookies only; reject transport via query/body.",
      },
    ],
    tools: [
      { name: "OWASP Session Management Cheat Sheet", desc: "Lifecycle rules for modern apps.", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html", price: "Free" },
      { name: "express-session + connect-redis", desc: "Vetted server-side sessions for Node.", url: "https://github.com/expressjs/session", price: "Free" },
      { name: "JWT Best Practices (RFC 8725)", desc: "Pitfalls when sessions become tokens.", url: "https://datatracker.ietf.org/doc/html/rfc8725", price: "Free" },
    ],
    reading: [
      { title: "Session Management Cheat Sheet", source: "OWASP", type: "Docs", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html" },
      { title: "Cookies: HTTP State Management Mechanism (RFC 6265bis)", source: "IETF", type: "Docs", url: "https://datatracker.ietf.org/doc/draft-ietf-httpbis-rfc6265bis/" },
    ],
  },
];
