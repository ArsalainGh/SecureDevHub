// ============================================================
// SecureDevHub — lightweight syntax highlighter (Prism-style)
// Produces token classes: tok-com, tok-str, tok-kw, tok-num,
// tok-fn, tok-tag, tok-attr, tok-prop (styled in index.css)
// ============================================================

export interface Token {
  text: string;
  cls?: string;
}

const KEYWORDS: Record<string, string[]> = {
  javascript: [
    "const", "let", "var", "function", "return", "if", "else", "new", "import", "from",
    "export", "default", "async", "await", "class", "extends", "try", "catch", "finally",
    "throw", "typeof", "instanceof", "switch", "case", "break", "continue", "for", "while",
    "do", "null", "undefined", "true", "false", "this", "of", "in", "delete", "yield",
    "static", "get", "set", "void", "require", "module", "process",
  ],
  python: [
    "def", "return", "if", "elif", "else", "import", "from", "as", "pass", "raise",
    "try", "except", "finally", "class", "lambda", "with", "while", "for", "in", "is",
    "not", "and", "or", "None", "True", "False", "global", "nonlocal", "async", "await",
    "yield", "del", "assert", "break", "continue", "self",
  ],
  php: [
    "function", "echo", "return", "if", "else", "elseif", "foreach", "as", "while", "for",
    "class", "new", "public", "private", "protected", "static", "try", "catch", "throw",
    "use", "namespace", "require", "require_once", "include", "include_once", "isset", "empty",
    "null", "true", "false", "fn", "match", "switch", "case", "break", "continue", "global",
    "const", "die", "exit",
  ],
  bash: [
    "if", "then", "fi", "else", "elif", "for", "while", "do", "done", "case", "esac",
    "echo", "export", "local", "return", "in", "function", "set", "cd", "cp", "mv",
  ],
  http: [],
  sql: [
    "SELECT", "select", "FROM", "from", "WHERE", "where", "INSERT", "insert", "INTO", "into",
    "VALUES", "values", "UPDATE", "update", "DELETE", "delete", "DROP", "drop", "TABLE",
    "table", "UNION", "union", "AND", "and", "OR", "or", "ORDER", "BY", "LIMIT", "JOIN",
  ],
  json: [],
  html: [],
};

/* Master token regex per language family. Order = priority. */
function buildMaster(lang: string): RegExp {
  const parts: string[] = [];
  // comments
  if (lang === "python" || lang === "bash") {
    parts.push("(#[^\\n]*)");
  } else if (lang === "php") {
    parts.push("((?:\\/\\/|#)[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)");
  } else if (lang === "sql") {
    parts.push("(--[^\\n]*)");
  } else if (lang === "http" || lang === "json") {
    parts.push("(#[^\\n]*)");
  } else {
    parts.push("(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)");
  }
  // strings
  if (lang === "php") {
    parts.push("('(?:\\\\.|[^'\\\\])*'|\"(?:\\\\.|[^\"\\\\])*\")");
  } else if (lang === "python") {
    parts.push(
      "((?:f|b|r|u)?'''[\\s\\S]*?'''|(?:f|b|r|u)?\"\"\"[\\s\\S]*?\"\"\"|(?:f|b|r|u)?'(?:\\\\.|[^'\\\\\\n])*'|(?:f|b|r|u)?\"(?:\\\\.|[^\"\\\\\\n])*\")"
    );
  } else if (lang === "json") {
    parts.push("(\"(?:\\\\.|[^\"\\\\])*\")");
  } else {
    parts.push("('(?:\\\\.|[^'\\\\])*'|\"(?:\\\\.|[^\"\\\\])*\"|`(?:\\\\.|[^`\\\\])*`)");
  }
  // numbers
  parts.push("(\\b\\d[\\d_]*(?:\\.\\d+)?\\b)");
  // function call
  parts.push("(\\b[A-Za-z_$][\\w$]*(?=\\s*\\())");
  // word (keyword test / http header)
  if (lang === "http") {
    parts.push("([A-Za-z-]+(?=:))");
    parts.push("\\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|HTTP/1\\.1|HTTP/2)\\b");
  }
  parts.push("\\b[A-Za-z_$][\\w$:-]*\\b");
  return new RegExp(parts.join("|"), "g");
}

export function highlight(code: string, lang: string): Token[] {
  const useLang = KEYWORDS[lang] ? lang : "javascript";
  const kw = new Set(KEYWORDS[useLang]);
  const master = buildMaster(useLang);
  const tokens: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = master.exec(code)) !== null) {
    if (m.index > last) tokens.push({ text: code.slice(last, m.index) });
    const full = m[0];
    const [, com, str, num, fn, wordOrHeader, httpMethod, word] = m;
    if (com !== undefined) tokens.push({ text: com, cls: "tok-com" });
    else if (str !== undefined) tokens.push({ text: str, cls: "tok-str" });
    else if (num !== undefined) tokens.push({ text: num, cls: "tok-num" });
    else if (fn !== undefined) tokens.push({ text: fn, cls: "tok-fn" });
    else if (wordOrHeader !== undefined) tokens.push({ text: wordOrHeader, cls: "tok-attr" });
    else if (httpMethod !== undefined) tokens.push({ text: httpMethod, cls: "tok-kw" });
    else if (word !== undefined) {
      if (kw.has(word)) tokens.push({ text: word, cls: "tok-kw" });
      else if (/^\$/.test(word)) tokens.push({ text: word, cls: "tok-prop" });
      else tokens.push({ text: word });
    } else tokens.push({ text: full });
    last = m.index + full.length;
    if (master.lastIndex === m.index) master.lastIndex++;
  }
  if (last < code.length) tokens.push({ text: code.slice(last) });
  return tokens;
}

/* HTML gets a dedicated pass: tags, attributes, strings, comments. */
export function highlightHtml(code: string): Token[] {
  const master =
    /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z][\w-]*|\/?>)|([a-zA-Z-]+)(?==)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
  const tokens: Token[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = master.exec(code)) !== null) {
    if (m.index > last) tokens.push({ text: code.slice(last, m.index) });
    if (m[1] !== undefined) tokens.push({ text: m[1], cls: "tok-com" });
    else if (m[2] !== undefined) tokens.push({ text: m[2], cls: "tok-tag" });
    else if (m[3] !== undefined) tokens.push({ text: m[3], cls: "tok-attr" });
    else if (m[4] !== undefined) tokens.push({ text: m[4], cls: "tok-str" });
    last = m.index + m[0].length;
    if (master.lastIndex === m.index) master.lastIndex++;
  }
  if (last < code.length) tokens.push({ text: code.slice(last) });
  return tokens;
}

export function tokenize(code: string, lang: string): Token[] {
  return lang === "html" ? highlightHtml(code) : highlight(code, lang);
}
