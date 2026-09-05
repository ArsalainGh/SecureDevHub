// ============================================================
// SecureDevHub — CRITICAL severity modules (1, 2, 3, 4, 7, 8, 16)
// XSS, SQL Injection and Authentication carry the full long-form
// content; the rest are compact but complete.
// ============================================================
import type { SecurityModule } from "./types";

export const CRITICAL_MODULES: SecurityModule[] = [
  /* ---------------- 01 · AUTHENTICATION & AUTHORIZATION (FULL) ---------------- */
  {
    id: "authentication",
    number: 1,
    title: "Authentication & Authorization",
    icon: "fingerprint",
    severity: "critical",
    categories: ["backend"],
    time: "20 min",
    difficulty: "Intermediate",
    updated: "Jan 2026",
    owaspLabel: "OWASP A07 — Identification & Authentication Failures",
    owaspUrl: "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/",
    tagline:
      "Prove users are who they say they are — and only let them do what they're allowed to. Get this wrong and nothing else matters.",
    what: {
      text: "Authentication is verifying identity (who are you?), authorization is verifying permissions (what may you do?). Failures here — weak password storage, predictable sessions, missing access checks — let attackers log in as other users, including admins. It is the single most exploited class of server-side bugs because the payoff is total account takeover.",
      analogy:
        "A hotel that hands out master keys to anyone who says a guest's name. The lock on each room is irrelevant if the front desk trusts everyone who asks.",
      terms: [
        { term: "Hashing", def: "A one-way function that turns a password into a fixed-length string. Cannot be reversed — unlike encryption." },
        { term: "Salt", def: "A random value added to each password before hashing so identical passwords produce different hashes." },
        { term: "bcrypt / argon2", def: "Password-hashing algorithms deliberately made slow and memory-hungry to resist brute force. Never use MD5/SHA-1 for passwords." },
        { term: "JWT", def: "JSON Web Token — a signed token holding claims (user id, roles). Signature proves integrity, not secrecy." },
        { term: "MFA", def: "Multi-factor authentication: password + something you have (device) or are (biometric)." },
        { term: "IDOR", def: "Insecure Direct Object Reference — changing /user/42 to /user/43 and seeing someone else's data because no authorization check ran." },
      ],
    },
    why: {
      text: "Broken authentication is behind most mass account-takeover incidents. Stolen password databases are cracked offline at billions of guesses per second when hashing is weak, and credential-stuffing bots replay leaked passwords across every site you use.",
      breaches: [
        {
          company: "RockYou",
          year: "2009",
          impact: "32 million plaintext passwords leaked",
          details:
            "Passwords were stored in plaintext. The entire dataset leaked via SQL injection and became the most-used wordlist in password cracking — the famous rockyou.txt.",
        },
        {
          company: "LinkedIn",
          year: "2012",
          impact: "117 million unsalted SHA-1 hashes cracked",
          details:
            "Passwords were hashed with unsalted SHA-1. Over 90% were cracked within days. Attackers then replayed them against other services for years.",
        },
        {
          company: "Optus",
          year: "2022",
          impact: "9.8 million customer records exposed",
          details:
            "An unauthenticated API endpoint let anyone enumerate customer records. No token, no rate limit — pure broken access control.",
        },
      ],
      stats: [
        { value: "81%", label: "of hacking-related breaches involve stolen or weak passwords (Verizon DBIR)" },
        { value: "111 B/s", label: "candidate passwords a modern GPU can test against a single MD5 hash" },
        { value: "24 B", label: "credentials circulating on criminal marketplaces (2024 estimates)" },
      ],
    },
    how: {
      steps: [
        "Attacker obtains the password database (SQL injection, leaked backup, insider) or a credential list from an earlier breach.",
        "If passwords are hashed with fast algorithms (MD5/SHA-1) — or worse, encrypted reversibly or in plaintext — GPUs crack most of them offline within hours.",
        "Cracked or reused passwords are stuffed into login forms at scale, often bypassing naive rate limits by rotating IPs.",
        "Missing MFA, no lockout and verbose error messages ('user not found' vs 'wrong password') make enumeration and takeover easy.",
        "Once inside, missing authorization checks (IDOR) let the attacker pivot to any account simply by changing an ID in the URL or request body.",
      ],
      types: [
        { name: "Credential Stuffing", desc: "Bots replay username/password pairs leaked from other breaches, exploiting password reuse." },
        { name: "Session Hijacking", desc: "Stealing a session cookie via XSS, network sniffing or predictable session IDs makes the attacker 'logged in' instantly." },
        { name: "JWT Tampering", desc: "Forging tokens when the server accepts alg:none, weak HMAC secrets, or never validates expiry/signature." },
        { name: "IDOR / Broken Access Control", desc: "Server checks that you're logged in but never that you own the resource you requested." },
      ],
    },
    vulnerable: [
      {
        lang: "javascript",
        label: "Node.js + Express",
        mark: [3, 4, 10, 11, 17],
        code: `// VULNERABLE login route — do NOT copy
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.getUser(email);
  if (!user) return res.status(401).send('No such user');      // user enumeration
  if (user.password === password) {                            // plaintext compare!
    const token = jwt.sign(
      { id: user.id, role: user.role, ssn: user.ssn },         // PII in token payload
      'secret123',                                             // hardcoded weak secret
      { algorithm: 'none' }                                    // unsigned token!
    );
    res.cookie('session', token);                              // no Secure/HttpOnly/SameSite
    return res.send('ok');
  }
  res.status(401).send('Wrong password for ' + email);         // enumeration again
});

// No lockout, no rate limit, no MFA anywhere in sight.
app.get('/api/invoices/:id', (req, res) => {
  db.getInvoice(req.params.id).then(res.json.bind(res));       // IDOR: no ownership check
});`,
      },
      {
        lang: "python",
        label: "Python + Flask",
        mark: [3, 6, 11],
        code: `# VULNERABLE — do NOT copy
@app.route('/login', methods=['POST'])
def login():
    email = request.form['email']
    user = db.get_user(email)
    pw_hash = hashlib.md5(request.form['password'].encode()).hexdigest()  # fast, broken
    if user is None:
        return 'unknown user', 401            # enumeration
    if user['pw'] == pw_hash:
        session['uid'] = user['id']           # session never regenerated, no timeout
        return 'ok'
    return 'bad password', 401

@app.route('/api/docs/<int:doc_id>')
def get_doc(doc_id):
    return jsonify(db.get_doc(doc_id))        # IDOR: no ownership check`,
      },
    ],
    secure: [
      {
        lang: "javascript",
        label: "Node.js + Express",
        mark: [4, 9, 13, 14, 15, 16, 21, 22, 23, 30, 37],
        code: `// SECURE login with hashing, lockout, JWT hygiene and ownership checks
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5,
  message: 'Too many attempts — try again later' });           // throttle brute force

app.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const user = await db.getUser(email);
  // Generic message + fake compare to keep timing constant:
  const hash = user?.passwordHash ?? '$2b$12$invalidinvalidinvalidinv11111111111111111111111111';
  const ok = await bcrypt.compare(password, hash);             // constant-time compare
  if (!user || !ok) return res.status(401).send('Invalid credentials'); // no enumeration

  const token = jwt.sign(
    { sub: user.id },                                          // only the id — never PII
    process.env.JWT_SECRET,                                    // strong secret from env
    { algorithm: 'HS256', expiresIn: '15m', issuer: 'securedevhub' }
  );
  res.cookie('session', token, {
    httpOnly: true,                                            // unreadable by JS (XSS-safe)
    secure: true,                                              // HTTPS only
    sameSite: 'lax',                                           // CSRF protection
    maxAge: 15 * 60 * 1000,
  });
  res.send('ok');                                              // regenerate session on login
});

app.get('/api/invoices/:id', requireAuth, async (req, res) => {
  const inv = await db.getInvoice(req.params.id);
  if (!inv || inv.ownerId !== req.user.id)
    return res.status(404).send('Not found');                  // ownership check — no IDOR
  res.json(inv);
});

// Registration: store ONLY a slow hash — 12+ bcrypt rounds or argon2id
const passwordHash = await bcrypt.hash(password, 12);`,
      },
      {
        lang: "python",
        label: "Python + Flask",
        mark: [6, 7, 11, 12, 17],
        code: `# SECURE — argon2 hashing, generic errors, hardened sessions
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
ph = PasswordHasher(time_cost=3, memory_cost=65536)   # argon2id, memory-hard

@app.route('/login', methods=['POST'])
@limiter.limit('5 per 10 minutes')                    # throttle brute force
def login():
    user = db.get_user(request.form['email'])
    try:
        # Always verify — even when the user does not exist (constant timing)
        ph.verify(user['pw'] if user else DUMMY_HASH, request.form['password'])
        ok = user is not None
    except VerifyMismatchError:
        ok = False
    if not ok:
        return 'Invalid credentials', 401             # generic — no enumeration
    session.clear()                                   # regenerate session
    session['uid'] = user['id']
    session.permanent = True                          # respect app.permanent_session_lifetime
    return 'ok'

app.config.update(
    SESSION_COOKIE_SECURE=True,                       # HTTPS only
    SESSION_COOKIE_HTTPONLY=True,                     # not readable from JS
    SESSION_COOKIE_SAMESITE='Lax',                    # CSRF protection
    PERMANENT_SESSION_LIFETIME=900,                   # 15-minute timeout
)`,
      },
    ],
    fixes: [
      "Passwords are hashed with bcrypt (cost 12) or argon2id — slow, salted, memory-hard.",
      "The login error message is identical for unknown user and wrong password, and a dummy hash keeps response timing constant — attackers can no longer enumerate accounts.",
      "Login is rate-limited to 5 attempts per 10 minutes; add MFA on top for sensitive accounts.",
      "JWTs carry only the user id, are signed with a real HS256 secret from an environment variable, and expire in 15 minutes.",
      "Session cookies are HttpOnly + Secure + SameSite=Lax, so XSS and CSRF can't steal or ride them.",
      "Every object access verifies ownership — fixing the IDOR.",
    ],
    rules: [
      "Hash passwords with bcrypt (cost ≥ 12) or argon2id. Never MD5, SHA-1, or reversible encryption.",
      "Salts are automatic with bcrypt/argon2 — never invent your own scheme.",
      "Return one generic 'Invalid credentials' message for all login failures, with matching response timing.",
      "Rate-limit and lock out login attempts; offer (and for admins, require) MFA.",
      "Use well-vetted libraries (bcrypt, argon2, passport, NextAuth) — never hand-roll crypto or session logic.",
      "Sign JWTs with strong secrets, pin the algorithm, set short expiries, and store no sensitive data in the payload.",
      "Check authorization on every request: being logged in is not the same as being allowed.",
    ],
    quiz: [
      {
        q: "Why is bcrypt preferred over SHA-256 for password storage?",
        options: [
          "It produces longer hashes",
          "It is deliberately slow and salted, resisting brute-force",
          "It is reversible if you keep the key",
          "SHA-256 hashes collide too often",
        ],
        correct: 1,
        why: "Attackers try billions of guesses per second offline. bcrypt's tunable cost and automatic per-password salt make each guess expensive and precomputed rainbow tables useless.",
      },
      {
        q: "A JWT payload is…",
        options: [
          "Encrypted end-to-end",
          "Only Base64URL-encoded — anyone can read it",
          "Safe for storing passwords",
          "Guaranteed secret by the signature",
        ],
        correct: 1,
        why: "The signature proves the token was not tampered with, but the payload is plain readable text. Never put secrets, SSNs or roles the user shouldn't see inside.",
      },
      {
        q: "What does setting a cookie's HttpOnly flag achieve?",
        options: [
          "Encrypts the cookie value",
          "Sends it only over HTTPS",
          "Prevents JavaScript (and XSS payloads) from reading it",
          "Deletes it when the tab closes",
        ],
        correct: 2,
        why: "HttpOnly blocks document.cookie access. Secure handles HTTPS, SameSite handles CSRF — the three flags do different jobs and you usually want all of them.",
      },
      {
        q: "Your login returns 'user not found' vs 'wrong password'. Why is that dangerous?",
        options: [
          "It wastes bandwidth",
          "It lets attackers enumerate which emails are registered",
          "It breaks password managers",
          "It isn't dangerous",
        ],
        correct: 1,
        why: "Distinct messages (or timings) let attackers build a list of valid accounts to target with credential stuffing and spear phishing. Use one generic message.",
      },
      {
        q: "What defeats credential stuffing most effectively?",
        options: [
          "Longer passwords",
          "MFA + login throttling + breach-password screening",
          "Changing the login URL",
          "Base64-encoding the form data",
        ],
        correct: 1,
        why: "Stuffed credentials are valid passwords by definition. A second factor makes them useless, while throttling and screening against known-breached lists shrink the attack surface.",
      },
    ],
    mistakes: [
      {
        mistake: "Encrypting passwords instead of hashing them",
        explanation:
          "Encryption is reversible — whoever steals the key (often stored next to the data) recovers every password, as in the Adobe 2013 breach.",
        fix: "Use one-way adaptive hashing: bcrypt, scrypt or argon2id.",
      },
      {
        mistake: "Using MD5 or SHA-1 because 'it's just a demo'",
        explanation:
          "Fast hashes let GPUs try billions of candidates per second. Demo code has a habit of shipping to production.",
        fix: "bcrypt.hash(pw, 12) / argon2 from day one — the API is no harder than MD5.",
      },
      {
        mistake: "Accepting any JWT algorithm the header requests",
        explanation:
          "Old libraries trusted the alg field, letting attackers send alg:none unsigned tokens and become anyone.",
        fix: "Pin the algorithm server-side (algorithms:['HS256']), verify expiry, audience and issuer.",
      },
      {
        mistake: "Storing sessions/JWTs in localStorage",
        explanation:
          "Any XSS — even in a dependency — can read localStorage and exfiltrate tokens silently.",
        fix: "Prefer HttpOnly, Secure, SameSite cookies. If you must use localStorage, treat XSS defense as existential.",
      },
      {
        mistake: "Checking authentication but not ownership",
        explanation:
          "Logged-in user changes /orders/1001 to /orders/1002 and sees a stranger's order — classic IDOR.",
        fix: "Authorize every object access against the authenticated user, and return 404 (not 403) to avoid leaking existence.",
      },
    ],
    tools: [
      { name: "bcrypt", desc: "Battle-tested password hashing for Node, Python, PHP and more.", url: "https://github.com/kelektiv/node.bcrypt.js", price: "Free" },
      { name: "OWASP Auth Cheat Sheet", desc: "The reference implementation checklist for login systems.", url: "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html", price: "Free" },
      { name: "haveibeenpwned API", desc: "Screen passwords against 900M+ breached credentials at signup.", url: "https://haveibeenpwned.com/API/v3", price: "Free" },
      { name: "jwt.io Debugger", desc: "Inspect JWT payloads and learn why secrets don't belong inside.", url: "https://jwt.io", price: "Free" },
    ],
    reading: [
      { title: "OWASP Top 10 — A07 Identification & Authentication Failures", source: "owasp.org", type: "Docs", url: "https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/" },
      { title: "Password Storage Cheat Sheet", source: "OWASP Cheat Sheet Series", type: "Docs", url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html" },
      { title: "JWT Best Current Practice (RFC 8725)", source: "IETF", type: "Docs", url: "https://datatracker.ietf.org/doc/html/rfc8725" },
      { title: "Web Authentication: What It Is and How It Works", source: "Auth0/Okta", type: "Article", url: "https://auth0.com/blog" },
    ],
  },

  /* ---------------- 02 · INPUT VALIDATION & SANITIZATION ---------------- */
  {
    id: "input-validation",
    number: 2,
    title: "Input Validation & Sanitization",
    icon: "list-checks",
    severity: "critical",
    categories: ["frontend", "backend"],
    time: "12 min",
    difficulty: "Beginner",
    updated: "Dec 2025",
    owaspLabel: "OWASP A03 — Injection",
    owaspUrl: "https://owasp.org/Top10/A03_2021-Injection/",
    tagline:
      "Every byte from a user is hostile until proven otherwise. Validation is the front door policy of your application.",
    what: {
      text: "Input validation verifies that data matches what you expect (type, length, format, range) before you use it; sanitization transforms data so leftover hostile content is neutralized. Skipping either is the root cause of injection, XSS, path traversal and dozens of other bugs.",
      analogy:
        "A nightclub bouncer who checks IDs (validation) and confiscates prohibited items (sanitization). Skipping the check lets anything walk in.",
      terms: [
        { term: "Allowlist", def: "Define exactly what IS valid (e.g. ^[a-z0-9-]{1,30}$) and reject everything else. The opposite — blocking known-bad input — is a denylist and always loses." },
        { term: "Server-side validation", def: "Validation that happens in your backend. Client-side checks exist for UX only and are trivially bypassed with curl or devtools." },
        { term: "Sanitization", def: "Neutralizing dangerous content (e.g. stripping <script> from HTML) rather than rejecting the input outright." },
      ],
    },
    why: {
      text: "Injection flaws sit in the OWASP Top 3 because input flows everywhere: URLs, forms, headers, file names, JSON bodies, cookies. One unvalidated input is a foothold into your database, filesystem or users' browsers.",
      breaches: [
        {
          company: "MOVEit (Progress Software)",
          year: "2023",
          impact: "2,600+ organizations, 90M+ individuals affected",
          details:
            "The Cl0p ransomware gang exploited a SQL injection rooted in insufficient input handling in the file-transfer product, hitting banks, governments and airlines in one supply-chain wave.",
        },
        {
          company: "TalkTalk",
          year: "2015",
          impact: "157k customers, £400k fine",
          details:
            "Attackers used a trivially exploitable SQL injection on a public-facing page. Inputs weren't validated or parameterized; a teenager did it.",
        },
      ],
      stats: [
        { value: "Top 3", label: "Injection's rank in the OWASP Top 10 (2021)" },
        { value: "274k", label: "CVEs exist — and injection repeatedly ranks among the most exploited weakness classes (CWE-20 Improper Input Validation holds the #1 spot on MITRE's Top 25)" },
      ],
    },
    how: {
      steps: [
        "Attacker maps every input your app accepts: query params, form fields, JSON keys, file names, HTTP headers.",
        "They fuzz each one with unexpected types (negative numbers, 10MB strings), metacharacters (' < > ; -- |) and encodings.",
        "An input that reaches a sensitive sink unvalidated — SQL query, HTML output, shell command, file path — becomes an exploit.",
        "Client-side-only checks are bypassed by sending requests directly with curl, Postman or an intercepting proxy.",
      ],
      types: [
        { name: "Type/Format Abuse", desc: "Strings where numbers are expected, negative quantities, absurd lengths — crash logic or corrupt data." },
        { name: "Injection Probes", desc: "Metacharacters aimed at a downstream interpreter: SQL quotes, HTML tags, shell pipes, template expressions." },
        { name: "Path Traversal", desc: "../../etc/passwd inside file name parameters to escape the intended directory." },
      ],
    },
    vulnerable: [
      {
        lang: "javascript",
        label: "Node.js + Express",
        mark: [3, 8],
        code: `// VULNERABLE — trusting the client completely
app.post('/profile', (req, res) => {
  const { username, age, bio } = req.body;      // any type, any length
  db.run('UPDATE users SET name = ? WHERE id = ?', [username, req.user.id]);
  // 'username' length unchecked → DB errors / abusable payloads stored
  bioEditor.innerHTML = bio;                    // raw user HTML straight to DOM
});

// Bonus: "validation" that lives only in the browser
// <input maxlength="20" required>  ← deleted by the attacker in devtools`,
      },
    ],
    secure: [
      {
        lang: "javascript",
        label: "Node.js + Express",
        mark: [3, 4, 5, 6, 7, 10, 11, 14],
        code: `// SECURE — allowlist schema, enforced on the server
import { body, validationResult } from 'express-validator';
import createDOMPurify from 'dompurify';

app.post('/profile',
  body('username').isString().isLength({ min: 3, max: 30 })
    .matches(/^[a-z0-9-]+$/i),                   // allowlist characters
  body('age').isInt({ min: 13, max: 120 }),      // type + range
  body('bio').isString().isLength({ max: 500 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const cleanBio = createDOMPurify(window).sanitize(req.body.bio,
      { ALLOWED_TAGS: ['b', 'i', 'a'], ALLOWED_ATTR: ['href'] });  // sanitize HTML
    db.run('UPDATE users SET name = ?, age = ?, bio = ? WHERE id = ?',
      [req.body.username, req.body.age, cleanBio, req.user.id]);
    res.send('saved');
  }
);`,
      },
    ],
    fixes: [
      "Every field is validated server-side against an allowlisted schema: type, length, character set and range.",
      "Rich text passes through DOMPurify with a minimal allowlist of tags and attributes before storage or display.",
      "Invalid input gets a 400 with field-level errors — it never reaches the database or the DOM.",
    ],
    rules: [
      "Validate everything on the server; duplicate on the client only for UX.",
      "Allowlist, never denylist: describe valid input precisely and reject the rest.",
      "Enforce type, length, range and format — all four, per field.",
      "Sanitize toward a safe subset (e.g. DOMPurify with allowed tags) instead of trying to delete 'bad' strings.",
      "Reject unknown fields entirely — don't let stray properties flow into queries or ORM updates.",
      "Treat headers, cookies, file names and URL params as user input too.",
    ],
    quiz: [
      {
        q: "Where must input validation happen to be effective?",
        options: ["In the browser", "On the server", "In the DNS layer", "In the browser AND server is optional"],
        correct: 1,
        why: "Client-side checks are bypassed by sending raw HTTP. Server-side enforcement is the only boundary an attacker can't simply skip.",
      },
      {
        q: "An allowlist approach to validation means…",
        options: [
          "Blocking known-dangerous characters like < and '",
          "Defining exactly what is valid and rejecting everything else",
          "Keeping a list of banned IP addresses",
          "Trusting input from logged-in users",
        ],
        correct: 1,
        why: "Denylists always miss encodings and edge cases. Allowlists fail closed: anything not explicitly valid is rejected, so unknown attacks are rejected by default.",
      },
      {
        q: "Which is NOT a place attackers inject untrusted data?",
        options: ["Query-string parameters", "HTTP headers like User-Agent", "Uploaded file names", "Your server's private TLS certificate"],
        correct: 3,
        why: "Params, headers, cookies, bodies and file names are all attacker-controlled. Your private key material isn't an input channel — but everything a client sends is.",
      },
    ],
    mistakes: [
      {
        mistake: "Validating only in the front-end",
        explanation: "Devtools or curl bypasses maxlength, required, pattern and JS checks in seconds.",
        fix: "Re-validate every field server-side; send 400 on violation.",
      },
      {
        mistake: "Trying to strip 'dangerous' strings with regex",
        explanation: "Attackers mutate payloads — <scr<script>ipt> survives naive removal and becomes <script>.",
        fix: "Allowlist-validate structure; sanitize HTML with DOMPurify/validator libraries, not regex.",
      },
      {
        mistake: "Letting unexpected JSON keys reach the ORM",
        explanation: "Mass-assignment: user submits { isAdmin: true } inside the profile form and your ORM updates it.",
        fix: "Pick explicit fields (allowlist keys) before passing data to models.",
      },
    ],
    tools: [
      { name: "express-validator", desc: "Declarative schema validation & sanitization for Express.", url: "https://express-validator.github.io", price: "Free" },
      { name: "Zod / Valibot", desc: "Type-safe schema validation that infers TypeScript types.", url: "https://zod.dev", price: "Free" },
      { name: "OWASP Input Validation Cheat Sheet", desc: "Allowlist patterns for every common input type.", url: "https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html", price: "Free" },
    ],
    reading: [
      { title: "OWASP Top 10 — A03 Injection", source: "owasp.org", type: "Docs", url: "https://owasp.org/Top10/A03_2021-Injection/" },
      { title: "Improper Input Validation — CWE-20", source: "MITRE", type: "Article", url: "https://cwe.mitre.org/data/definitions/20.html" },
      { title: "HTML Form Validation", source: "MDN", type: "Docs", url: "https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation" },
    ],
  },
];
