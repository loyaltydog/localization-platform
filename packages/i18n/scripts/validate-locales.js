#!/usr/bin/env node
/**
 * Locale validation script
 *
 * Checks that all non-English locale files have the same keys as en-US,
 * and that en-GB does not use a title-cased key name as the translation.
 * Run manually: npm run validate:locales
 * Run in CI:    included in test suite via all-languages.test.js
 *
 * Exit code 0 = all locales in sync
 * Exit code 1 = missing or extra keys, or key-name placeholders, found
 */

import { readFileSync, existsSync, readdirSync, realpathSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = join(__dirname, '../locales');

const LOCALES = ['en-US', 'en-GB', 'es-ES', 'es-MX', 'fr', 'it', 'pt-BR', 'pt-PT'];
const NAMESPACES = ['common', 'errors', 'validation', 'notifications', 'emails', 'giftCards', 'eposnow', 'shopify', 'clover'];

/**
 * US → British spelling pairs, longest first, used only to recognise a
 * title-cased key that was lightly Britishised (program → programme) and
 * to spell en-GB replacements. Word boundaries keep "programme" and
 * "programming" intact.
 */
const SPELLING_PAIRS = [
  ['organizational', 'organisational'],
  ['organizations', 'organisations'],
  ['organization', 'organisation'],
  ['personalization', 'personalisation'],
  ['personalizing', 'personalising'],
  ['personalized', 'personalised'],
  ['personalize', 'personalise'],
  ['customization', 'customisation'],
  ['customizing', 'customising'],
  ['customized', 'customised'],
  ['customize', 'customise'],
  ['optimization', 'optimisation'],
  ['optimizing', 'optimising'],
  ['optimized', 'optimised'],
  ['optimize', 'optimise'],
  ['unauthorized', 'unauthorised'],
  ['authorization', 'authorisation'],
  ['authorizing', 'authorising'],
  ['authorized', 'authorised'],
  ['authorize', 'authorise'],
  ['analyzing', 'analysing'],
  ['analyzed', 'analysed'],
  ['analyze', 'analyse'],
  ['organizing', 'organising'],
  ['organized', 'organised'],
  ['organize', 'organise'],
  ['canceling', 'cancelling'],
  ['canceled', 'cancelled'],
  ['enrollment', 'enrolment'],
  ['enroll', 'enrol'],
  ['favorites', 'favourites'],
  ['favorite', 'favourite'],
  ['behaviors', 'behaviours'],
  ['behavioral', 'behavioural'],
  ['behavior', 'behaviour'],
  ['colors', 'colours'],
  ['colored', 'coloured'],
  ['coloring', 'colouring'],
  ['color', 'colour'],
  ['flavors', 'flavours'],
  ['flavor', 'flavour'],
  ['honoring', 'honouring'],
  ['honored', 'honoured'],
  ['honors', 'honours'],
  ['honor', 'honour'],
  ['neighbors', 'neighbours'],
  ['neighbor', 'neighbour'],
  ['traveling', 'travelling'],
  ['traveled', 'travelled'],
  ['traveler', 'traveller'],
  ['modeling', 'modelling'],
  ['modeled', 'modelled'],
  ['labeling', 'labelling'],
  ['labeled', 'labelled'],
  ['fulfillment', 'fulfilment'],
  ['fulfill', 'fulfil'],
  ['acknowledgments', 'acknowledgements'],
  ['acknowledgment', 'acknowledgement'],
  ['catalogs', 'catalogues'],
  ['catalog', 'catalogue'],
  ['jewelry', 'jewellery'],
  ['dialogs', 'dialogues'],
  ['dialog', 'dialogue'],
  ['defense', 'defence'],
  ['offense', 'offence'],
  ['programs', 'programmes'],
  ['program', 'programme'],
  ['centers', 'centres'],
  ['center', 'centre'],
  ['licenses', 'licences'],
  ['license', 'licence'],
  ['aging', 'ageing'],
  ['artifacts', 'artefacts'],
  ['artifact', 'artefact'],
  ['gray', 'grey'],
];

const PROTECTED = /(\{\{[\s\S]*?\}\}|\{[A-Za-z_][^}]*\}|<\/?[A-Za-z][^>]*>)/g;

function applyCase(src, repl) {
  if (src === src.toUpperCase()) return repl.toUpperCase();
  if (src[0] === src[0].toUpperCase()) return repl[0].toUpperCase() + repl.slice(1);
  return repl;
}

/** British spelling for prose copied from en-US. Placeholders and tags are left byte-for-byte. */
export function toBritish(text) {
  const parts = String(text).split(PROTECTED);
  return parts.map((part, i) => {
    if (i % 2 === 1) return part;
    let out = part;
    for (const [us, uk] of SPELLING_PAIRS) {
      out = out.replace(new RegExp(`\\b${us}\\b`, 'gi'), (m) => applyCase(m, uk));
    }
    out = out.replace(/\bZIP Code\b/g, 'Postcode');
    out = out.replace(/\bZip Code\b/g, 'Postcode');
    out = out.replace(/\bzip code\b/g, 'postcode');
    return out;
  }).join('');
}

/** Compare words ignoring case, punctuation, and US/UK spelling. */
export function canonicalWords(text) {
  let out = String(text).toLowerCase();
  const byUk = [...SPELLING_PAIRS].sort((a, b) => b[1].length - a[1].length);
  for (const [us, uk] of byUk) {
    out = out.replace(new RegExp(`\\b${uk}\\b`, 'g'), us);
  }
  return out.replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * Title-case a leaf key the way the placeholder generator did:
 * camelCase splits, including a capital after a digit ("step1Link" → "Step1 Link"),
 * but "step1" stays one word.
 */
export function titleCaseLeaf(key) {
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim();
  return spaced.split(/\s+/).filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function stripEllipsis(value) {
  return value.replace(/(?:\.{3}|…)+$/u, '').trim();
}

function acronymDamaged(value, source) {
  const caps = source.match(/\b[A-Z]{2,}s?\b/g) || [];
  for (const cap of caps) {
    const titled = cap[0] + cap.slice(1).toLowerCase();
    if (titled !== cap && value.includes(titled) && !value.includes(cap)) return true;
  }
  return false;
}

function punctuationDamaged(value, source) {
  const count = (s, re) => (s.match(re) || []).length;
  if (count(value, /[()]/g) !== count(source, /[()]/g)) return true;
  const hyphens = source.match(/\b[A-Za-z]+-[A-Za-z]+\b/g) || [];
  for (const hyphenated of hyphens) {
    const split = hyphenated.replace('-', ' ');
    if (!value.includes(hyphenated) && value.includes(split)) return true;
  }
  return false;
}

/**
 * True when an en-GB value is the leaf key turned into a label
 * ("warningDescription" → "Warning Description", or the British spelling of
 * that label) instead of the en-US text.
 *
 * Same words in a different case ("Amount Spent" / "Amount spent") are real
 * copy and are not flagged. Acronym and punctuation damage is
 * ("Pass Type Ids" for "Pass Type IDs", "Noname" for "(noname)", "Re Run"
 * for "Re-Run"). A sentence-case label is flagged only when en-US is a
 * substantially longer sentence, so "No start scheduled" is left alone.
 */
export function isKeyNamePlaceholder(leaf, value, source) {
  if (typeof value !== 'string' || typeof source !== 'string') return false;
  if (value === source || toBritish(source) === value) return false;

  const label = titleCaseLeaf(leaf);
  const ukLabel = toBritish(label);
  const sentence = label.charAt(0) + label.slice(1).toLowerCase();
  const ukSentence = toBritish(sentence);
  const core = stripEllipsis(value);
  const titleForms = new Set([label, ukLabel]);
  const sentenceForms = new Set([sentence, ukSentence]);
  const exactTitle = titleForms.has(value) || titleForms.has(core);
  const exactSentence = sentenceForms.has(value) || sentenceForms.has(core);

  const sourceWords = canonicalWords(source).split(/\s+/).filter(Boolean);
  const valueWords = canonicalWords(core).split(/\s+/).filter(Boolean);
  const muchLongerSource = sourceWords.length >= valueWords.length + 3;

  if (!exactTitle && !exactSentence) {
    const labelWords = canonicalWords(label).split(/\s+/).filter(Boolean);
    const sameAsLabel = canonicalWords(core) === canonicalWords(label);
    if (sameAsLabel && canonicalWords(value) !== canonicalWords(source) && muchLongerSource) return true;
    if (valueWords.length >= 2 && valueWords.length <= 4 && /helper|label$/.test(valueWords[valueWords.length - 1])) {
      const suffix = labelWords.slice(-valueWords.length).join(' ');
      if (suffix === valueWords.join(' ') && muchLongerSource && canonicalWords(value) !== canonicalWords(source)) {
        return true;
      }
    }
    return false;
  }

  if (canonicalWords(value) === canonicalWords(source)) {
    return acronymDamaged(value, source) || punctuationDamaged(value, source);
  }
  if (!exactTitle && exactSentence) return muchLongerSource;
  return true;
}

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

function flattenStrings(obj, prefix = '', out = []) {
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) flattenStrings(value, full, out);
    else if (typeof value === 'string') out.push({ full, leaf: key, value });
  }
  return out;
}

function loadJSON(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

/**
 * en-GB values that are a title-cased key name rather than the en-US text.
 * Scoped to en-GB: the same shape in es/fr/pt is a different (untranslated
 * English) problem, and legitimate short labels such as "Dashboard" match
 * en-US so they are not reported.
 */
export function findKeyNamePlaceholders(localesDir = LOCALES_DIR) {
  const sourceDir = join(localesDir, 'en-US');
  const targetDir = join(localesDir, 'en-GB');
  if (!existsSync(sourceDir) || !existsSync(targetDir)) return [];
  const files = readdirSync(sourceDir).filter((name) => name.endsWith('.json') && existsSync(join(targetDir, name)));
  const hits = [];
  for (const file of files) {
    const source = new Map(flattenStrings(loadJSON(join(sourceDir, file))).map((e) => [e.full, e.value]));
    for (const entry of flattenStrings(loadJSON(join(targetDir, file)))) {
      const enUs = source.get(entry.full);
      if (enUs === undefined) continue;
      if (isKeyNamePlaceholder(entry.leaf, entry.value, enUs)) {
        hits.push(`en-GB/${file} ${entry.full}: ${JSON.stringify(entry.value)}`);
      }
    }
  }
  return hits;
}

function main() {
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

  const placeholders = findKeyNamePlaceholders();
  if (placeholders.length) {
    console.error(`❌  en-GB title-cased key-name placeholders (${placeholders.length}):\n    ${placeholders.join('\n    ')}`);
    errors++;
  } else {
    console.log('✅  en-GB has no title-cased key-name placeholders');
  }

  if (errors) {
    console.error(`\n${errors} issue(s) found. Run 'npm test' for full diagnostics.`);
    process.exit(1);
  } else {
    console.log('\nAll locales in sync with en-US ✓');
  }
}

const invokedDirectly = process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
if (invokedDirectly) main();
