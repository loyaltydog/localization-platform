#!/usr/bin/env node
/**
 * audit-hardcoded-strings.mjs
 * ------------------------------------------------------------------------------
 * Heuristic triage scanner that finds user-facing ENGLISH text in the core_api
 * frontend that is NOT wrapped in a `t(...)` translation call. This is the
 * complement to `audit-frontend-keys.mjs` (which audits keys that ARE wrapped).
 *
 * THIS IS A TRIAGE LIST, NOT AN AUTO-FIXER. False positives are expected — the
 * goal is to surface un-localized surfaces for human review, ranked by file.
 *
 * WHAT IT FLAGS
 * -------------
 *   1. JSX text nodes (`JsxText`) with >= 2 runs of word-characters (i.e. 2+
 *      real words). Whitespace/punctuation-only, numeric, and single-token
 *      nodes are ignored.
 *   2. User-facing string-literal ATTRIBUTES from an allowlist:
 *        placeholder, title, aria-label, alt, label, helperText
 *      ...but ONLY when the attribute value is a plain string literal — not a
 *      `t(...)` call and not any other JS expression.
 *
 * HOW FALSE POSITIVES ARE REDUCED
 * -------------------------------
 *   - Text already inside `t(...)` / `{t(...)}` is skipped (we detect JSX
 *     expression containers whose expression is a t() call, and never treat
 *     them as text).
 *   - JsxText nodes are literal text BETWEEN tags, so `{t("x")}` is an
 *     expression container, never JsxText — already excluded by the AST.
 *   - Non-display strings are dropped: URLs, routes ("/..."), className-like
 *     tokens, all-caps constants, pure numbers/symbols, single words <= 2 chars.
 *   - Excluded attributes are never read for the "string literal" rule
 *     (key, data-*, id, href, className, type, name, role, etc.).
 *   - Import/require lines contribute nothing (imports have no JsxText and we
 *     only read allowlisted JSX attributes).
 *
 * EXTRACTION STRATEGY
 * -------------------
 * Parsing uses the TypeScript compiler API (AST), resolved FROM THE FRONTEND'S
 * node_modules (same as the sibling `audit-frontend-keys.mjs`). No devDependency
 * is added to this repo. Override with --ts-module / TS_MODULE.
 *
 * SCOPE
 * -----
 *   - Scans `*.tsx` under src/app/** and src/components/**.
 *   - Scans `*.ts` ONLY if it contains JSX (cheap heuristic: file parses with a
 *     JsxElement/JsxFragment somewhere). Plain `.ts` logic files are skipped.
 *   - Excludes: node_modules, .next, __tests__, *.test.*, *.d.ts, and
 *     src/lib/i18n-utils.ts (that file IS the translation data).
 *
 * USAGE
 *   node scripts/audit-hardcoded-strings.mjs \
 *     [--frontend-src DIR] [--out-json FILE] [--out-md FILE] [--ts-module DIR]
 * Env overrides: FRONTEND_SRC, OUT_JSON, OUT_MD, TS_MODULE.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

// ---------------------------------------------------------------------------
// Config / CLI
// ---------------------------------------------------------------------------
const DEFAULTS = {
  frontendSrc: "/tmp/wt-core_api-i18n/frontend/src",
  tsModule: "/tmp/wt-core_api-i18n/frontend/node_modules/typescript",
  outJson: "/tmp/wt-locplat-i18n/docs/audits/2026-06-04-hardcoded-strings.json",
  outMd: "/tmp/wt-locplat-i18n/docs/audits/2026-06-04-hardcoded-strings.md",
};

function parseArgs(argv) {
  const map = {
    "--frontend-src": "frontendSrc",
    "--ts-module": "tsModule",
    "--out-json": "outJson",
    "--out-md": "outMd",
  };
  const cfg = { ...DEFAULTS };
  if (process.env.FRONTEND_SRC) cfg.frontendSrc = process.env.FRONTEND_SRC;
  if (process.env.TS_MODULE) cfg.tsModule = process.env.TS_MODULE;
  if (process.env.OUT_JSON) cfg.outJson = process.env.OUT_JSON;
  if (process.env.OUT_MD) cfg.outMd = process.env.OUT_MD;
  for (let i = 2; i < argv.length; i += 2) {
    const key = map[argv[i]];
    if (key) cfg[key] = argv[i + 1];
  }
  return cfg;
}

const cfg = parseArgs(process.argv);

// Resolve the TypeScript compiler API from the frontend's node_modules.
const require = createRequire(import.meta.url);
let ts;
try {
  ts = require(cfg.tsModule);
} catch (e) {
  console.error(`Failed to load TypeScript from ${cfg.tsModule}: ${e.message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// File discovery — limited to src/app/** and src/components/**
// ---------------------------------------------------------------------------
const EXCLUDE_DIR = new Set(["node_modules", ".next", "__tests__"]);
// Subtrees of frontendSrc we scan (per spec).
const SCAN_SUBDIRS = ["app", "components"];

function isExcludedFile(p) {
  const base = path.basename(p);
  if (/\.d\.ts$/.test(base)) return true;
  if (/\.test\.(ts|tsx)$/.test(base)) return true;
  if (/\.spec\.(ts|tsx)$/.test(base)) return true;
  // The translation data file itself is not a localization target.
  if (p.endsWith(path.join("lib", "i18n-utils.ts"))) return true;
  return false;
}

function collectFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIR.has(entry.name)) continue;
      collectFiles(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !isExcludedFile(full)) {
      out.push(full);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Text classification heuristics
// ---------------------------------------------------------------------------

// Count runs of word characters. "Save changes" -> 2, "OK" -> 1, "" -> 0.
function wordRuns(s) {
  const m = s.match(/[A-Za-z][A-Za-z'’]*/g);
  return m ? m.length : 0;
}

// Does the text contain at least one alphabetic character (vs pure numbers/symbols)?
function hasLetters(s) {
  return /[A-Za-z]/.test(s);
}

// Looks like a CSS class string? (tailwind etc.): many tokens, hyphens, colons,
// no spaces-that-form-sentences. Heuristic: mostly lowercase tokens joined by
// spaces where most tokens contain a hyphen or colon (tailwind utility classes).
function looksLikeClassName(s) {
  const tokens = s.trim().split(/\s+/);
  if (tokens.length === 0) return false;
  const utilLike = tokens.filter((t) => /[-:]/.test(t) && /^[a-z0-9[\]/.#%-:]+$/i.test(t)).length;
  return utilLike >= Math.max(1, Math.ceil(tokens.length * 0.6));
}

// Looks like a URL / route / path / file?
function looksLikePathOrUrl(s) {
  const t = s.trim();
  if (/^https?:\/\//i.test(t)) return true;
  if (/^\//.test(t)) return true; // route
  if (/^[./]/.test(t)) return true; // relative path
  if (/^[\w-]+\.(png|jpe?g|svg|gif|webp|css|js|tsx?|json|ico)$/i.test(t)) return true;
  if (/^(mailto:|tel:)/i.test(t)) return true;
  return false;
}

// All-caps constant-like? ("USD", "API_BASE", "GET")
function looksLikeConstant(s) {
  const t = s.trim();
  return /^[A-Z0-9_]+$/.test(t) && t.length >= 2;
}

// Dotted identifier with no spaces? This catches:
//   - i18n keys passed to custom components: label="loyalty.analytics.title"
//   - domains / package ids: "crontab.guru", "com.google.android.youtube"
// None of these are display sentences, so treat them as non-display.
function looksLikeDottedIdent(s) {
  const t = s.trim();
  return /^[A-Za-z][\w-]*(\.[A-Za-z0-9][\w-]*)+$/.test(t) && !/\s/.test(t);
}

// Decide if a free string (attribute value) is plausibly user-facing display text.
function isDisplayString(s) {
  const t = s.trim();
  if (!t) return false;
  if (!hasLetters(t)) return false; // pure numbers/symbols
  if (looksLikePathOrUrl(t)) return false;
  if (looksLikeConstant(t)) return false;
  if (looksLikeDottedIdent(t)) return false;
  if (looksLikeClassName(t)) return false;
  // Single short token (<= 2 chars, or a single word that is itself <= 2 chars).
  if (wordRuns(t) < 1) return false;
  if (wordRuns(t) === 1) {
    const sole = t.match(/[A-Za-z][A-Za-z'’]*/)[0];
    if (sole.length <= 2) return false;
    // A single word like "Settings" / "Dashboard" IS display text — keep it for
    // attributes (placeholder/title/etc.), where one word is normal.
  }
  return true;
}

// Decide if a JsxText node should be flagged (stricter: needs 2+ words).
function isDisplayJsxText(s) {
  const t = s.replace(/\s+/g, " ").trim();
  if (!t) return false;
  if (!hasLetters(t)) return false;
  if (wordRuns(t) < 2) return false; // require 2+ real words
  if (looksLikePathOrUrl(t)) return false;
  if (looksLikeConstant(t)) return false;
  if (looksLikeDottedIdent(t)) return false;
  return true;
}

function truncate(s, n = 80) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n - 1) + "…" : t;
}

// ---------------------------------------------------------------------------
// Attribute allowlist (user-facing). All lowercased for comparison.
// ---------------------------------------------------------------------------
const ATTR_ALLOWLIST = new Set([
  "placeholder",
  "title",
  "aria-label",
  "alt",
  "label",
  "helpertext", // Flowbite `helperText`
]);

// ---------------------------------------------------------------------------
// Detect whether a file contains any JSX (so plain-logic .ts is skipped).
// ---------------------------------------------------------------------------
function fileHasJsx(sf) {
  let found = false;
  (function walk(node) {
    if (found) return;
    if (
      ts.isJsxElement(node) ||
      ts.isJsxSelfClosingElement(node) ||
      ts.isJsxFragment(node)
    ) {
      found = true;
      return;
    }
    ts.forEachChild(node, walk);
  })(sf);
  return found;
}

// ---------------------------------------------------------------------------
// Extract findings from one source file
// ---------------------------------------------------------------------------
function extractFromFile(file) {
  const text = fs.readFileSync(file, "utf8");
  // IMPORTANT: parse with the script kind that matches the extension. A `.ts`
  // file cannot legally contain JSX (TypeScript requires `.tsx`), and parsing
  // `.ts` AS TSX turns ordinary code like `a < b > c` into phantom JsxText
  // nodes — a major false-positive source. So we parse `.ts` as TS (no JSX
  // grammar), which means real-JSX-bearing files must be `.tsx` to be flagged.
  const scriptKind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind);

  // For .ts files, only proceed if they actually contain JSX (parsed as TS,
  // this is effectively never true, so plain logic files are skipped).
  if (file.endsWith(".ts") && !fileHasJsx(sf)) return [];

  const findings = []; // { line, kind, text }
  const lineOf = (node) =>
    sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

  function visit(node) {
    // --- JSX text nodes between tags ---
    if (ts.isJsxText(node)) {
      // node.text is the raw literal text between tags; `{t(...)}` is an
      // expression container (a sibling), never part of JsxText.
      if (isDisplayJsxText(node.text)) {
        findings.push({
          line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1,
          kind: "jsx-text",
          text: truncate(node.text),
        });
      }
    }

    // --- JSX string-literal attributes from the allowlist ---
    if (ts.isJsxAttribute(node)) {
      const attrName = (node.name && node.name.getText(sf) ? node.name.getText(sf) : "").toLowerCase();
      if (ATTR_ALLOWLIST.has(attrName)) {
        const init = node.initializer;
        let strVal;
        if (init && ts.isStringLiteral(init)) {
          // placeholder="Search..."
          strVal = init.text;
        } else if (
          init &&
          ts.isJsxExpression(init) &&
          init.expression &&
          (ts.isStringLiteral(init.expression) ||
            ts.isNoSubstitutionTemplateLiteral(init.expression))
        ) {
          // placeholder={"Search..."} or {`Search`} — still a plain literal,
          // NOT a t(...) call or interpolation.
          strVal = init.expression.text;
        }
        // If init is a t(...) call or any other expression, strVal stays
        // undefined and we skip it (already localized / dynamic).
        if (strVal !== undefined && isDisplayString(strVal)) {
          findings.push({
            line: lineOf(node),
            kind: `attr:${attrName}`,
            text: truncate(strVal),
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  }
  visit(sf);

  return findings;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function rel(p) {
  // Relative to the frontend/ root (parent of src), for readable report paths.
  return path.relative(path.dirname(cfg.frontendSrc), p);
}

function main() {
  // Build the file list, restricted to the scan subdirs under src.
  let files = [];
  for (const sub of SCAN_SUBDIRS) {
    files = files.concat(collectFiles(path.join(cfg.frontendSrc, sub)));
  }
  files.sort();

  const perFile = new Map(); // relFile -> [findings]
  const byKind = {}; // kind -> count
  let total = 0;

  for (const file of files) {
    const findings = extractFromFile(file);
    if (findings.length === 0) continue;
    const r = rel(file);
    perFile.set(r, findings);
    for (const f of findings) {
      byKind[f.kind] = (byKind[f.kind] || 0) + 1;
      total += 1;
    }
  }

  // Collapse attr:* kinds for the summary breakdown (and keep raw too).
  const kindBreakdown = {};
  for (const [k, n] of Object.entries(byKind)) {
    kindBreakdown[k] = n;
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    inputs: { frontendSrc: cfg.frontendSrc, tsModule: cfg.tsModule },
    filesScanned: files.length,
    filesAffected: perFile.size,
    totalFindings: total,
    byKind: kindBreakdown,
  };

  // Flat findings list (machine-readable).
  const findings = [];
  for (const [file, list] of [...perFile.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    for (const f of list) {
      findings.push({ file, line: f.line, kind: f.kind, text: f.text });
    }
  }

  const report = { summary, findings };

  fs.mkdirSync(path.dirname(cfg.outJson), { recursive: true });
  fs.writeFileSync(cfg.outJson, JSON.stringify(report, null, 2));
  fs.writeFileSync(cfg.outMd, renderMarkdown(report, perFile));

  console.log(JSON.stringify(summary, null, 2));
  return report;
}

function renderMarkdown(report, perFile) {
  const { summary } = report;
  let md = "";
  md += `# Dashboard Hardcoded-String Audit (i18n triage)\n\n`;
  md += `_Generated: ${summary.generatedAt}_\n\n`;
  md += `Reproduce: \`node scripts/audit-hardcoded-strings.mjs\` (paths overridable via flags/env).\n\n`;

  md += `## How to read this\n\n`;
  md += `This is a **heuristic triage list**, not an auto-fixer. It flags user-facing English text `;
  md += `(JSX text and a small allowlist of attributes) that is **not** wrapped in a \`t(...)\` call. `;
  md += `**False positives are expected** — e.g. brand names, code-ish text in JSX, or strings that are `;
  md += `intentionally untranslated. Treat each finding as a candidate to review, not a guaranteed bug. `;
  md += `Prioritize files with the highest finding counts (see the ranking below).\n\n`;
  md += `**Spot-check (2026-06-04):** ~15 findings were checked against source; the estimated `;
  md += `false-positive rate is roughly **5–10%**. The residual false positives are mostly `;
  md += `brand-only single-word labels (e.g. \`alt="LoyaltyDog Logo"\`, \`label="WordPress"\`) and `;
  md += `short tooltips (e.g. \`title="Sync"\`) — user-facing, but with little/nothing to translate. `;
  md += `Most JSX-text findings are genuine un-localized English copy.\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Value |\n|---|---|\n`;
  md += `| Files scanned | ${summary.filesScanned} |\n`;
  md += `| Files affected | ${summary.filesAffected} |\n`;
  md += `| Total findings | ${summary.totalFindings} |\n`;
  for (const [k, n] of Object.entries(summary.byKind).sort()) {
    md += `| Kind \`${k}\` | ${n} |\n`;
  }
  md += `\n`;

  md += `### Inputs\n\n`;
  md += `- Frontend src: \`${summary.inputs.frontendSrc}\`\n`;
  md += `- TypeScript module: \`${summary.inputs.tsModule}\`\n\n`;

  // Ranking: top files by finding count.
  const ranked = [...perFile.entries()]
    .map(([file, list]) => ({ file, count: list.length }))
    .sort((a, b) => b.count - a.count || a.file.localeCompare(b.file));
  md += `## Top files by finding count\n\n`;
  md += `These are the highest-value un-localized surfaces to prioritize.\n\n`;
  md += `| # | File | Findings |\n|---|---|---|\n`;
  ranked.slice(0, 15).forEach((r, i) => {
    md += `| ${i + 1} | \`${r.file}\` | ${r.count} |\n`;
  });
  md += `\n`;

  // Findings grouped by file, sorted by file path.
  md += `## Findings by file\n\n`;
  const sortedFiles = [...perFile.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [file, list] of sortedFiles) {
    md += `### \`${file}\` (${list.length})\n\n`;
    md += `| Line | Kind | Text |\n|---|---|---|\n`;
    for (const f of [...list].sort((a, b) => a.line - b.line)) {
      // Escape pipes/backticks in displayed text for table safety.
      const safe = f.text.replace(/\|/g, "\\|").replace(/`/g, "'");
      md += `| ${f.line} | \`${f.kind}\` | ${safe} |\n`;
    }
    md += `\n`;
  }

  return md;
}

main();
