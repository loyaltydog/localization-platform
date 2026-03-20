#!/usr/bin/env node
/**
 * Locale validation script
 *
 * Checks that all non-English locale files have the same keys as en-US.
 * Run manually: npm run validate:locales
 * Run in CI:    included in test suite via all-languages.test.js
 *
 * Exit code 0 = all locales in sync
 * Exit code 1 = missing or extra keys found
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, '../locales');

const LOCALES = ['en-US', 'en-GB', 'es-ES', 'es-MX', 'fr', 'it', 'pt-BR', 'pt-PT'];
const NAMESPACES = ['common', 'errors', 'validation', 'notifications', 'emails', 'giftCards', 'eposnow', 'shopify', 'clover'];

function getKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...getKeys(value, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function loadJSON(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

let errors = 0;

for (const ns of NAMESPACES) {
  const sourcePath = join(LOCALES_DIR, 'en-US', `${ns}.json`);
  if (!existsSync(sourcePath)) {
    console.warn(`⚠️  en-US/${ns}.json not found — skipping`);
    continue;
  }
  const sourceKeys = new Set(getKeys(loadJSON(sourcePath)));

  for (const locale of LOCALES) {
    if (locale === 'en-US') continue;
    const targetPath = join(LOCALES_DIR, locale, `${ns}.json`);
    if (!existsSync(targetPath)) {
      console.error(`❌  ${locale}/${ns}.json missing`);
      errors++;
      continue;
    }
    const targetKeys = new Set(getKeys(loadJSON(targetPath)));
    const missing = [...sourceKeys].filter(k => !targetKeys.has(k));
    const extra   = [...targetKeys].filter(k => !sourceKeys.has(k));
    if (missing.length || extra.length) {
      if (missing.length) console.error(`❌  ${locale}/${ns}: missing keys:\n    ${missing.join('\n    ')}`);
      if (extra.length)   console.error(`❌  ${locale}/${ns}: extra keys:\n    ${extra.join('\n    ')}`);
      errors++;
    } else {
      console.log(`✅  ${locale}/${ns}`);
    }
  }
}

if (errors) {
  console.error(`\n${errors} issue(s) found. Run 'npm test' for full diagnostics.`);
  process.exit(1);
} else {
  console.log('\nAll locales in sync with en-US ✓');
}
