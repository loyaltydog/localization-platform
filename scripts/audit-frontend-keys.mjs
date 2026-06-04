#!/usr/bin/env node
/**
 * audit-frontend-keys.mjs
 * ------------------------------------------------------------------------------
 * Produces an authoritative, reproducible diff of every i18n `t()` key that a
 * consumer frontend REFERENCES against:
 *   (a) the en-US source-of-truth locale JSON, and
 *   (b) the frontend's bundled fallback (`i18n-utils.ts`).
 *
 * It emits both a machine-readable `.json` and a human-readable `.md` report
 * with four buckets:
 *   M1 — referenced in frontend, MISSING from en-US JSON  (drives "add new keys")
 *   M2 — JSON/bundle drift (present in JSON but not bundle, and vice-versa),
 *        both limited to referenced keys and as a full-drift count
 *   M3 — referenced but MISSING from BOTH JSON and bundle  (likely a code bug)
 *   Dynamic — keys built from template literals / variables (manual review)
 *
 * EXTRACTION STRATEGY
 * -------------------
 * Keys are extracted via the TypeScript compiler API (AST), not regex, so we
 * correctly handle nesting, comments, JSX, and multi-arg calls.
 *
 * `typescript` is RESOLVED FROM THE FRONTEND'S node_modules (see TS_MODULE
 * below) — no devDependency is added to this repo. Override with --ts-module.
 *
 * Two `t()` call shapes are recognised (per the core_api frontend):
 *   - CLIENT  `t("key.path"[, opts])`            — from useTranslation("ns")
 *             namespace = nearest enclosing useTranslation("ns") (default common)
 *   - SERVER  `t(localeExpr, "key.path"[, "ns"])` — from @/lib/i18n-server
 *             namespace = 3rd-arg string literal if present, else common
 *
 * Disambiguation heuristic (matches the spec):
 *   - arg0 is a string literal              -> CLIENT, key = arg0
 *   - arg0 is NOT a string literal AND
 *     arg1 IS a string literal              -> SERVER, key = arg1, ns = arg2|common
 *   - key arg is a template literal / non-literal -> DYNAMIC (manual review)
 *
 * i18next `ns:key` prefix: if the resolved key string itself contains a
 * namespace prefix (e.g. `t("common:foo.bar")` on an i18n instance), the
 * prefix wins and overrides the useTranslation-derived namespace. Only
 * prefixes matching a known namespace are stripped (so legitimate keys that
 * happen to contain a colon are left intact).
 *
 * Namespace resolution for CLIENT calls: we scan each file for
 * `useTranslation("ns")` declarations and bind them by variable scope where
 * possible. In practice the frontend always destructures `const { t } = ...`,
 * so we track the most recent `useTranslation` ns seen lexically before the
 * call (per-file, source-order). Confidence note: this is heuristic; a file
 * that mixes namespaces in sibling scopes could mis-attribute. We flag files
 * with >1 distinct namespace so reviewers can spot-check.
 *
 * BUNDLE PARSING
 * --------------
 * The bundled fallback object literal is extracted by AST-walking the
 * `allTranslations` (or `enUSFallback`) object-literal node and reading its
 * string-valued leaves. We do NOT transpile+eval (avoids executing arbitrary
 * module code and resolving imports); AST walking of the literal is robust and
 * side-effect free.
 *
 * USAGE
 *   node scripts/audit-frontend-keys.mjs \
 *     [--frontend-src DIR] [--locale-dir DIR] [--fallback FILE] \
 *     [--out-json FILE] [--out-md FILE] [--ts-module DIR]
 * All overridable via env: FRONTEND_SRC, LOCALE_DIR, FALLBACK_FILE,
 * OUT_JSON, OUT_MD, TS_MODULE.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

// ---------------------------------------------------------------------------
// Config / CLI
// ---------------------------------------------------------------------------
const DEFAULTS = {
  frontendSrc: "/tmp/wt-core_api-i18n/frontend/src",
  localeDir: "/tmp/wt-locplat-i18n/packages/i18n/locales/en-US",
  fallback: "/tmp/wt-core_api-i18n/frontend/src/lib/i18n-utils.ts",
  tsModule: "/tmp/wt-core_api-i18n/frontend/node_modules/typescript",
  outJson: "/tmp/wt-locplat-i18n/docs/audits/2026-06-04-frontend-key-audit.json",
  outMd: "/tmp/wt-locplat-i18n/docs/audits/2026-06-04-frontend-key-audit.md",
};

function parseArgs(argv) {
  const map = {
    "--frontend-src": "frontendSrc",
    "--locale-dir": "localeDir",
    "--fallback": "fallback",
    "--ts-module": "tsModule",
    "--out-json": "outJson",
    "--out-md": "outMd",
  };
  const cfg = { ...DEFAULTS };
  // env overrides
  if (process.env.FRONTEND_SRC) cfg.frontendSrc = process.env.FRONTEND_SRC;
  if (process.env.LOCALE_DIR) cfg.localeDir = process.env.LOCALE_DIR;
  if (process.env.FALLBACK_FILE) cfg.fallback = process.env.FALLBACK_FILE;
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
// Helpers: file discovery
// ---------------------------------------------------------------------------
const EXCLUDE_DIR = new Set(["node_modules", ".next", "__tests__"]);
function isExcludedFile(p) {
  const base = path.basename(p);
  if (/\.d\.ts$/.test(base)) return true;
  if (/\.test\.(ts|tsx)$/.test(base)) return true;
  return false;
}
function collectFiles(dir, out = []) {
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
// Helpers: flatten nested object -> dotted leaf keys
// ---------------------------------------------------------------------------
function flatten(obj, prefix, out) {
  for (const [k, v] of Object.entries(obj)) {
    const dotted = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      flatten(v, dotted, out);
    } else {
      out.add(dotted);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Load en-US JSON namespaces
// ---------------------------------------------------------------------------
function loadLocaleJson(dir) {
  const perNs = {}; // ns -> Set<dotted>
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".json")) continue;
    const ns = f.replace(/\.json$/, "");
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    perNs[ns] = flatten(data, "", new Set());
  }
  return perNs;
}

// ---------------------------------------------------------------------------
// Parse bundled fallback: AST-walk allTranslations -> en-US subtree -> per-ns sets
// ---------------------------------------------------------------------------
function objectLiteralToPlain(node) {
  // Convert a TS ObjectLiteralExpression AST node to a plain JS object,
  // following identifier references to other top-level const declarations.
  const out = {};
  for (const prop of node.properties) {
    if (!ts.isPropertyAssignment(prop) && !ts.isShorthandPropertyAssignment(prop)) continue;
    const name = prop.name;
    let key;
    if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
      key = name.text;
    } else {
      continue;
    }
    let valNode = ts.isPropertyAssignment(prop) ? prop.initializer : prop.name;
    out[key] = valueOf(valNode);
  }
  return out;
}

let TOP_LEVEL_CONSTS = new Map(); // name -> initializer node (for resolving references)

function valueOf(node) {
  if (!node) return undefined;
  // `expr satisfies T` / `expr as T` — unwrap
  if (ts.isSatisfiesExpression?.(node) || ts.isAsExpression(node)) {
    return valueOf(node.expression);
  }
  if (ts.isParenthesizedExpression(node)) return valueOf(node.expression);
  if (ts.isObjectLiteralExpression(node)) return objectLiteralToPlain(node);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isTemplateExpression(node)) return "<dynamic>";
  if (ts.isIdentifier(node)) {
    const ref = TOP_LEVEL_CONSTS.get(node.text);
    if (ref) return valueOf(ref);
    return "<ref>";
  }
  return "<expr>";
}

function loadBundle(file) {
  const text = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

  // Index top-level const declarations so references (e.g. enUSFallback) resolve.
  TOP_LEVEL_CONSTS = new Map();
  let allTranslationsNode;
  let enUSFallbackNode;
  for (const stmt of sf.statements) {
    if (ts.isVariableStatement(stmt)) {
      for (const decl of stmt.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.initializer) {
          TOP_LEVEL_CONSTS.set(decl.name.text, decl.initializer);
          if (decl.name.text === "allTranslations") allTranslationsNode = decl.initializer;
          if (decl.name.text === "enUSFallback") enUSFallbackNode = decl.initializer;
        }
      }
    }
  }

  // Prefer the en-US subtree from allTranslations; fall back to enUSFallback.
  let enUsTree;
  if (allTranslationsNode && ts.isObjectLiteralExpression(allTranslationsNode)) {
    const all = objectLiteralToPlain(allTranslationsNode);
    enUsTree = all["en-US"];
  }
  if (!enUsTree && enUSFallbackNode) {
    enUsTree = valueOf(enUSFallbackNode);
  }
  if (!enUsTree || typeof enUsTree !== "object") {
    throw new Error("Could not extract en-US subtree from bundle");
  }

  const perNs = {};
  for (const [ns, sub] of Object.entries(enUsTree)) {
    if (sub && typeof sub === "object") {
      perNs[ns] = flatten(sub, "", new Set());
    }
  }
  return perNs;
}

// ---------------------------------------------------------------------------
// Extract referenced keys from a source file via AST
// ---------------------------------------------------------------------------
function extractFromFile(file, knownNamespaces) {
  const text = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  // Resolve an i18next `ns:key` prefix if `ns` is a known namespace.
  function resolveKey(rawKey, fallbackNs) {
    const idx = rawKey.indexOf(":");
    if (idx > 0) {
      const maybeNs = rawKey.slice(0, idx);
      if (knownNamespaces.has(maybeNs)) {
        return { ns: maybeNs, key: rawKey.slice(idx + 1) };
      }
    }
    return { ns: fallbackNs, key: rawKey };
  }

  const refs = []; // { ns, key, line }
  const dynamics = []; // { line, raw }
  const namespacesSeen = new Set();

  // First pass: collect useTranslation("ns") positions (source order).
  const nsByPos = []; // { pos, ns }
  function collectNs(node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "useTranslation") {
      const a0 = node.arguments[0];
      let ns = "common";
      if (a0 && (ts.isStringLiteral(a0) || ts.isNoSubstitutionTemplateLiteral(a0))) ns = a0.text;
      nsByPos.push({ pos: node.getStart(sf), ns });
      namespacesSeen.add(ns);
    }
    ts.forEachChild(node, collectNs);
  }
  collectNs(sf);
  nsByPos.sort((a, b) => a.pos - b.pos);

  function nsForPos(pos) {
    // nearest useTranslation lexically before this call (source order)
    let ns = "common";
    for (const e of nsByPos) {
      if (e.pos <= pos) ns = e.ns;
      else break;
    }
    return ns;
  }

  const lineOf = (node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

  function isStrLit(n) {
    return n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n));
  }
  function isDynamicKeyNode(n) {
    return n && (ts.isTemplateExpression(n) || ts.isBinaryExpression(n) ||
      ts.isIdentifier(n) || ts.isPropertyAccessExpression(n) ||
      ts.isElementAccessExpression(n) || ts.isConditionalExpression(n) ||
      ts.isCallExpression(n));
  }

  // Second pass: find t(...) calls. Match callee named `t` (identifier or
  // `obj.t` member access — i18next instances are sometimes `i18n.t`).
  function isTCallee(expr) {
    if (ts.isIdentifier(expr)) return expr.text === "t";
    if (ts.isPropertyAccessExpression(expr)) return expr.name.text === "t";
    return false;
  }

  function visit(node) {
    if (ts.isCallExpression(node) && isTCallee(node.expression)) {
      const args = node.arguments;
      const a0 = args[0];
      const a1 = args[1];
      const a2 = args[2];
      const line = lineOf(node);

      if (isStrLit(a0)) {
        // CLIENT: t("key"[, opts]) — ns from useTranslation, unless key has ns: prefix
        const resolved = resolveKey(a0.text, nsForPos(node.getStart(sf)));
        refs.push({ ns: resolved.ns, key: resolved.key, line, shape: "client" });
      } else if (a0 && !isStrLit(a0) && isStrLit(a1)) {
        // SERVER: t(localeExpr, "key"[, "ns"]) — explicit ns arg, else ns: prefix, else common
        const explicitNs = isStrLit(a2) ? a2.text : "common";
        const resolved = resolveKey(a1.text, explicitNs);
        refs.push({ ns: resolved.ns, key: resolved.key, line, shape: "server" });
      } else if (a0) {
        // Dynamic key (template literal / variable / expression) — manual review.
        // Only record if it's plausibly a key arg (a0 dynamic for client, or
        // a1 dynamic for server-shaped call).
        if (isDynamicKeyNode(a0)) {
          dynamics.push({ line, raw: a0.getText(sf).slice(0, 160), arg: 0 });
        } else if (a1 && isDynamicKeyNode(a1)) {
          dynamics.push({ line, raw: a1.getText(sf).slice(0, 160), arg: 1 });
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);

  return { refs, dynamics, namespacesSeen };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function rel(p) {
  // present file paths relative to frontend src for compactness in the report
  return path.relative(path.dirname(cfg.frontendSrc), p);
}

function main() {
  const localeNs = loadLocaleJson(cfg.localeDir); // ns -> Set
  const bundleNs = loadBundle(cfg.fallback); // ns -> Set

  const localeAll = new Set();
  for (const s of Object.values(localeNs)) for (const k of s) localeAll.add(k);

  // Known namespaces (for stripping i18next `ns:key` prefixes during extraction).
  const knownNamespaces = new Set([...Object.keys(localeNs), ...Object.keys(bundleNs)]);

  const files = collectFiles(cfg.frontendSrc);

  // Aggregate references. Key identity = `${ns}:${key}`.
  const refMap = new Map(); // id -> { ns, key, locations:[{file,line,shape}] }
  const dynamicList = []; // { file, line, raw }
  const multiNsFiles = [];

  for (const file of files) {
    const { refs, dynamics, namespacesSeen } = extractFromFile(file, knownNamespaces);
    if (namespacesSeen.size > 1) multiNsFiles.push({ file: rel(file), namespaces: [...namespacesSeen] });
    for (const r of refs) {
      const id = `${r.ns}:${r.key}`;
      if (!refMap.has(id)) refMap.set(id, { ns: r.ns, key: r.key, locations: [] });
      refMap.get(id).locations.push({ file: rel(file), line: r.line, shape: r.shape });
    }
    for (const d of dynamics) dynamicList.push({ file: rel(file), line: d.line, raw: d.raw });
  }

  const totalRefOccurrences = [...refMap.values()].reduce((n, r) => n + r.locations.length, 0);

  // Classify each unique referenced key.
  const m1 = {}; // ns -> [{key, locations}]  (missing from JSON)
  const m3 = []; // [{ns,key,locations}]      (missing from JSON AND bundle)
  for (const ref of refMap.values()) {
    const inJsonNs = localeNs[ref.ns]?.has(ref.key) ?? false;
    // A key may exist under its declared ns OR (defensively) anywhere in JSON.
    const inJsonAnywhere = localeAll.has(ref.key);
    const inJson = inJsonNs || inJsonAnywhere;
    const inBundleNs = bundleNs[ref.ns]?.has(ref.key) ?? false;
    const inBundleAnywhere = Object.values(bundleNs).some((s) => s.has(ref.key));
    const inBundle = inBundleNs || inBundleAnywhere;

    if (!inJson) {
      (m1[ref.ns] ??= []).push({ key: ref.key, locations: ref.locations, inBundle });
    }
    if (!inJson && !inBundle) {
      m3.push({ ns: ref.ns, key: ref.key, locations: ref.locations });
    }
  }

  // M2: drift between JSON and bundle.
  // Referenced-only view + full view.
  const referencedKeys = new Set([...refMap.values()].map((r) => `${r.ns}:${r.key}`));

  const m2 = {
    referenced: { jsonNotBundle: [], bundleNotJson: [] },
    full: { jsonNotBundleCount: 0, bundleNotJsonCount: 0, jsonNotBundle: [], bundleNotJson: [] },
  };
  const allNs = new Set([...Object.keys(localeNs), ...Object.keys(bundleNs)]);
  for (const ns of allNs) {
    const jset = localeNs[ns] ?? new Set();
    const bset = bundleNs[ns] ?? new Set();
    for (const k of jset) {
      if (!bset.has(k)) {
        m2.full.jsonNotBundle.push(`${ns}:${k}`);
        if (referencedKeys.has(`${ns}:${k}`)) m2.referenced.jsonNotBundle.push(`${ns}:${k}`);
      }
    }
    for (const k of bset) {
      if (!jset.has(k)) {
        m2.full.bundleNotJson.push(`${ns}:${k}`);
        if (referencedKeys.has(`${ns}:${k}`)) m2.referenced.bundleNotJson.push(`${ns}:${k}`);
      }
    }
  }
  m2.full.jsonNotBundleCount = m2.full.jsonNotBundle.length;
  m2.full.bundleNotJsonCount = m2.full.bundleNotJson.length;

  const m1Count = Object.values(m1).reduce((n, a) => n + a.length, 0);

  const summary = {
    generatedAt: new Date().toISOString(),
    inputs: {
      frontendSrc: cfg.frontendSrc,
      localeDir: cfg.localeDir,
      fallback: cfg.fallback,
      tsModule: cfg.tsModule,
    },
    filesScanned: files.length,
    totalReferenceOccurrences: totalRefOccurrences,
    uniqueReferencedKeys: refMap.size,
    localeNamespaces: Object.fromEntries(Object.entries(localeNs).map(([k, v]) => [k, v.size])),
    bundleNamespaces: Object.fromEntries(Object.entries(bundleNs).map(([k, v]) => [k, v.size])),
    counts: {
      m1_missingFromJson: m1Count,
      m2_referenced_jsonNotBundle: m2.referenced.jsonNotBundle.length,
      m2_referenced_bundleNotJson: m2.referenced.bundleNotJson.length,
      m2_full_jsonNotBundle: m2.full.jsonNotBundleCount,
      m2_full_bundleNotJson: m2.full.bundleNotJsonCount,
      m3_missingFromBoth: m3.length,
      dynamic_manualReview: dynamicList.length,
    },
  };

  const report = { summary, m1, m2, m3, dynamic: dynamicList, multiNsFiles };

  // ----- write JSON -----
  fs.mkdirSync(path.dirname(cfg.outJson), { recursive: true });
  fs.writeFileSync(cfg.outJson, JSON.stringify(report, null, 2));

  // ----- write Markdown -----
  fs.writeFileSync(cfg.outMd, renderMarkdown(report));

  // Console summary (kept terse).
  console.log(JSON.stringify(summary, null, 2));
  return report;
}

function locStr(locations) {
  return locations.map((l) => `${l.file}:${l.line}`).join(", ");
}

function renderMarkdown(report) {
  const { summary, m1, m2, m3, dynamic, multiNsFiles } = report;
  const c = summary.counts;
  let md = "";
  md += `# Frontend i18n Key-Reference Audit\n\n`;
  md += `_Generated: ${summary.generatedAt}_\n\n`;
  md += `Reproduce: \`node scripts/audit-frontend-keys.mjs\` (paths overridable via flags/env).\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Value |\n|---|---|\n`;
  md += `| Files scanned | ${summary.filesScanned} |\n`;
  md += `| Total \`t()\` reference occurrences | ${summary.totalReferenceOccurrences} |\n`;
  md += `| Unique referenced keys (ns:key) | ${summary.uniqueReferencedKeys} |\n`;
  md += `| **M1** referenced but MISSING from en-US JSON | **${c.m1_missingFromJson}** |\n`;
  md += `| **M3** referenced but MISSING from BOTH JSON & bundle | **${c.m3_missingFromBoth}** |\n`;
  md += `| M2 referenced: in JSON, not in bundle | ${c.m2_referenced_jsonNotBundle} |\n`;
  md += `| M2 referenced: in bundle, not in JSON | ${c.m2_referenced_bundleNotJson} |\n`;
  md += `| M2 full drift: in JSON, not in bundle | ${c.m2_full_jsonNotBundle} |\n`;
  md += `| M2 full drift: in bundle, not in JSON | ${c.m2_full_bundleNotJson} |\n`;
  md += `| Dynamic keys (manual review) | ${c.dynamic_manualReview} |\n\n`;

  md += `### Inputs\n\n`;
  md += `- Frontend src: \`${summary.inputs.frontendSrc}\`\n`;
  md += `- en-US locale dir: \`${summary.inputs.localeDir}\`\n`;
  md += `- Bundled fallback: \`${summary.inputs.fallback}\`\n`;
  md += `- TypeScript module: \`${summary.inputs.tsModule}\`\n\n`;

  md += `### Locale JSON namespaces (leaf key counts)\n\n`;
  for (const [ns, n] of Object.entries(summary.localeNamespaces)) md += `- \`${ns}\`: ${n}\n`;
  md += `\n### Bundled fallback namespaces (leaf key counts)\n\n`;
  for (const [ns, n] of Object.entries(summary.bundleNamespaces)) md += `- \`${ns}\`: ${n}\n`;
  md += `\n`;

  // M1
  md += `## M1 — Referenced in frontend, MISSING from en-US JSON\n\n`;
  md += `These keys must be ADDED to the en-US source-of-truth (grouped by namespace).\n`;
  md += `\`(bundled)\` = also present in the frontend fallback bundle (so it renders today but isn't in source JSON).\n\n`;
  const m1Namespaces = Object.keys(m1).sort();
  if (m1Namespaces.length === 0) md += `_None._\n\n`;
  for (const ns of m1Namespaces) {
    const items = m1[ns].sort((a, b) => a.key.localeCompare(b.key));
    md += `### \`${ns}\` (${items.length})\n\n`;
    for (const it of items) {
      md += `- \`${it.key}\`${it.inBundle ? " _(bundled)_" : ""} — ${locStr(it.locations)}\n`;
    }
    md += `\n`;
  }

  // M3
  md += `## M3 — Referenced but MISSING from BOTH JSON and bundle (likely code bug)\n\n`;
  md += `Probable wrong path/casing in frontend code — these need a CODE FIX.\n\n`;
  if (m3.length === 0) md += `_None._\n\n`;
  else {
    const sorted = [...m3].sort((a, b) => `${a.ns}:${a.key}`.localeCompare(`${b.ns}:${b.key}`));
    for (const it of sorted) md += `- \`${it.ns}:${it.key}\` — ${locStr(it.locations)}\n`;
    md += `\n`;
  }

  // M2
  md += `## M2 — JSON / bundle drift\n\n`;
  md += `### Referenced keys present in JSON but NOT in bundle (${m2.referenced.jsonNotBundle.length})\n\n`;
  md += `These render from the API but would be missing if the backend is unreachable (fallback gap).\n\n`;
  if (m2.referenced.jsonNotBundle.length === 0) md += `_None._\n\n`;
  else { for (const k of m2.referenced.jsonNotBundle.sort()) md += `- \`${k}\`\n`; md += `\n`; }
  md += `### Referenced keys present in bundle but NOT in JSON (${m2.referenced.bundleNotJson.length})\n\n`;
  if (m2.referenced.bundleNotJson.length === 0) md += `_None._\n\n`;
  else { for (const k of m2.referenced.bundleNotJson.sort()) md += `- \`${k}\`\n`; md += `\n`; }
  md += `### Full drift (all keys, not just referenced)\n\n`;
  md += `- In JSON but not bundle: **${m2.full.jsonNotBundleCount}**\n`;
  md += `- In bundle but not JSON: **${m2.full.bundleNotJsonCount}**\n\n`;

  // Dynamic
  md += `## Dynamic keys — manual review\n\n`;
  md += `Keys built from template literals / variables; not statically resolvable.\n\n`;
  if (dynamic.length === 0) md += `_None._\n\n`;
  else {
    for (const d of dynamic) md += `- ${d.file}:${d.line} — \`${d.raw.replace(/\n/g, " ")}\`\n`;
    md += `\n`;
  }

  // Multi-namespace files (confidence note)
  if (multiNsFiles.length) {
    md += `## Files with >1 useTranslation namespace (verify client-key attribution)\n\n`;
    for (const f of multiNsFiles) md += `- ${f.file} — ${f.namespaces.join(", ")}\n`;
    md += `\n`;
  }

  return md;
}

main();
