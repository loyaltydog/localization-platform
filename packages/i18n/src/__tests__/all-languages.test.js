/**
 * Comprehensive unit tests for all 8 supported languages
 * Validates translation structure, key coverage, and consistency across locales
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const LOCALES_DIR = join(__dirname, '../../locales');

const ALL_LANGUAGES = ['en-US', 'en-GB', 'es-ES', 'es-MX', 'fr', 'it', 'pt-BR', 'pt-PT'];
const NAMESPACES = ['common', 'errors', 'validation', 'notifications', 'emails', 'giftCards', 'eposnow', 'shopify', 'clover'];

/**
 * Load and parse a JSON translation file
 */
function loadTranslation(locale, namespace) {
  const filePath = join(LOCALES_DIR, locale, `${namespace}.json`);
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Get all keys from a nested object as dot-notation paths
 */
function getKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

/**
 * Get all string values from a nested object
 */
function getAllStringValues(obj, strings = []) {
  for (const value of Object.values(obj)) {
    if (typeof value === 'string') {
      strings.push(value);
    } else if (typeof value === 'object' && value !== null) {
      getAllStringValues(value, strings);
    }
  }
  return strings;
}

describe('Translation Structure Tests - All Languages', () => {
  describe('File Structure', () => {
    it.each(ALL_LANGUAGES)('should have all 5 namespace JSON files for %s', (locale) => {
      for (const namespace of NAMESPACES) {
        const filePath = join(LOCALES_DIR, locale, `${namespace}.json`);
        expect(existsSync(filePath)).toBe(true);
      }
    });
  });

  describe('Key Coverage', () => {
    it.each(ALL_LANGUAGES)('should have same keys as en-US in common for %s', (locale) => {
      const en = loadTranslation('en-US', 'common');
      const target = loadTranslation(locale, 'common');

      const enKeys = new Set(getKeys(en));
      const targetKeys = new Set(getKeys(target));

      const missingKeys = [...enKeys].filter(key => !targetKeys.has(key));
      const extraKeys = [...targetKeys].filter(key => !enKeys.has(key));

      expect(missingKeys).toEqual([]);
      expect(extraKeys).toEqual([]);
    });
  });

  describe('No Empty Strings', () => {
    it.each(ALL_LANGUAGES)('should not have empty string values in common for %s', (locale) => {
      const translations = loadTranslation(locale, 'common');
      const allStrings = getAllStringValues(translations);

      const emptyStrings = allStrings.filter(val => val.trim() === '');
      expect(emptyStrings.length).toBe(0);
    });
  });

  describe('Language Variant Consistency', () => {
    it('es-ES and es-MX should have same key structure', () => {
      const esES = loadTranslation('es-ES', 'common');
      const esMX = loadTranslation('es-MX', 'common');

      expect(new Set(getKeys(esES))).toEqual(new Set(getKeys(esMX)));
    });

    it('en-US and en-GB should have same key structure', () => {
      const enUS = loadTranslation('en-US', 'common');
      const enGB = loadTranslation('en-GB', 'common');

      expect(new Set(getKeys(enUS))).toEqual(new Set(getKeys(enGB)));
    });

    it('pt-BR and pt-PT should have same key structure', () => {
      const ptBR = loadTranslation('pt-BR', 'common');
      const ptPT = loadTranslation('pt-PT', 'common');

      expect(new Set(getKeys(ptBR))).toEqual(new Set(getKeys(ptPT)));
    });

    it('fr should have same key structure as en-US', () => {
      const fr = loadTranslation('fr', 'common');
      const enUS = loadTranslation('en-US', 'common');

      expect(new Set(getKeys(fr))).toEqual(new Set(getKeys(enUS)));
    });
  });

  describe('Email Placeholder Syntax', () => {
    it.each(ALL_LANGUAGES)('should use {{variable}} placeholder syntax in emails for %s', (locale) => {
      const emails = loadTranslation(locale, 'emails');

      const subject = emails.welcome?.subject;
      const body = emails.welcome?.body;

      if (subject) {
        expect(subject).toContain('{{');
        expect(subject).toContain('}}');
      }
      if (body) {
        expect(body).toContain('{{');
        expect(body).toContain('}}');
      }
    });
  });

  describe('Placeholder Integrity', () => {
    // Both consumers interpolate {{variable}}: i18next in the dashboard and
    // translation_loader.py on the backend. A single-brace {variable} is therefore
    // never substituted — it reaches the user literally.
    // Dots are part of the name: i18next resolves {{shop.name}} and {{shop.domain}} to
    // different values, so capturing only the segment before the dot would treat them as
    // one variable and let a translation swap one for the other unnoticed.
    const SINGLE_BRACE = /(?<!\{)(?<!\$)\{([A-Za-z_][A-Za-z0-9_.]*)\}(?!\})/g;
    const DOUBLE_BRACE = /\{\{\s*([A-Za-z_][A-Za-z0-9_.]*)\s*(?:,[^}]*)?\}\}/g;

    const varsIn = (value, pattern) => [...value.matchAll(pattern)].map((m) => m[1]);

    // Strings whose single braces are NOT interpolation. The WordPress plugin gives
    // merchants a message template and substitutes these tokens itself; the "adjust the
    // message" string literally instructs merchants to type them, and uses {{first}} /
    // {{second}} alongside for real interpolation. Doubling them would break the plugin
    // and misinstruct merchants.
    // Named per key for the same reason as PENDING_SINGLE_BRACE below: a new variable
    // appearing in one of these strings is still a defect and must still fail.
    const LITERAL_TOKEN_KEYS = new Map([
      [
        'wordpress.wordpress.admin.menu.adjustTheMessageByUsing1s',
        ['friendlyNameToBeAdded', 'friendlyName', 'name', 'value', 'currency'],
      ],
      ['wordpress.wordpress.admin.menu.strongActiveLoyaltyOfferStrongFriendlynametobeadded', ['friendlyNameToBeAdded']],
      ['wordpress.wordpress.admin.menu.strongLoyaltyRewardStrongFriendlynametobeadded', ['friendlyNameToBeAdded']],
      ['wordpress.wordpress.misc.nameFree', ['name']],
      ['wordpress.wordpress.misc.nameValueCurrency', ['name', 'value', 'currency']],
      ['wordpress.wordpress.misc.nameValueCurrency2', ['name', 'value', 'currency']],
    ]);

    // Pre-existing breakage, listed so it stays visible while this test stops NEW
    // regressions. Each entry is a real defect to fix, not an accepted exception.
    //
    // errors.* — no caller in core_api references these by key; they are likely consumed
    //   by the Square/Shopify/Clover/WordPress repos. Confirm the consumer, then either
    //   double the braces or move them to LITERAL_TOKEN_KEYS.
    // notifications.dateRangeTx — same, plus the dashboard's bundled fallback disagrees.
    //
    // Exempting the NAMED variable rather than the whole key keeps the hole the size of
    // the known defect: introduce any other single-brace variable into one of these and
    // the test still fails. Placeholder names are not translated, so one entry covers
    // every locale — and correcting a locale to {{var}} simply stops it matching.
    const PENDING_SINGLE_BRACE = new Map([
      ['errors.validation.business_domain_timeout', ['timeout']],
      ['errors.validation.request_too_large', ['max_size']],
      ['errors.validation.redirect_chain_exceeded', ['max_redirects']],
      ['errors.validation.empty_email', ['accountId']],
      ['errors.auth.invalid_auth_header', ['token']],
      ['errors.auth.token_missing_header', ['token_type']],
      ['errors.operations.duplicated_customers', ['shopId', 'customerId']],
      ['errors.operations.failed_to_renew_certificate', ['message']],
      ['errors.operations.unsupported_pass_style', ['style']],
      ['notifications.dateRangeTx', ['count']],
    ]);

    function entries(locale, namespace) {
      const flat = {};
      (function walk(node, prefix) {
        for (const [key, value] of Object.entries(node)) {
          const full = prefix ? `${prefix}.${key}` : key;
          if (value !== null && typeof value === 'object' && !Array.isArray(value)) walk(value, full);
          else if (typeof value === 'string') flat[full] = value;
        }
      })(loadTranslation(locale, namespace), '');
      return flat;
    }

    const NS_WITH_WORDPRESS = [...NAMESPACES, 'marketing', 'wordpress'];

    it.each(ALL_LANGUAGES)('uses {{variable}} rather than {variable} in %s', (locale) => {
      const offenders = [];
      for (const namespace of NS_WITH_WORDPRESS) {
        if (!existsSync(join(LOCALES_DIR, locale, `${namespace}.json`))) continue;
        for (const [key, value] of Object.entries(entries(locale, namespace))) {
          const qualified = `${namespace}.${key}`;
          const allowed = LITERAL_TOKEN_KEYS.get(qualified) ?? PENDING_SINGLE_BRACE.get(qualified) ?? [];
          const unexpected = varsIn(value, SINGLE_BRACE).filter((name) => !allowed.includes(name));
          if (unexpected.length) offenders.push(`${qualified} {${unexpected}} in ${JSON.stringify(value)}`);
        }
      }
      expect(offenders).toEqual([]);
    });

    // Key parity cannot see this: the key is present, its variable is not.
    it.each(ALL_LANGUAGES.filter((l) => l !== 'en-US'))('carries the same variables as en-US in %s', (locale) => {
      const mismatches = [];
      for (const namespace of NS_WITH_WORDPRESS) {
        if (!existsSync(join(LOCALES_DIR, locale, `${namespace}.json`))) continue;
        if (!existsSync(join(LOCALES_DIR, 'en-US', `${namespace}.json`))) continue;
        const source = entries('en-US', namespace);
        const target = entries(locale, namespace);
        for (const [key, value] of Object.entries(source)) {
          const qualified = `${locale}.${namespace}.${key}`;
          if (!(key in target)) {
            // Key coverage is only asserted for `common` in this file, so an absent key
            // elsewhere would otherwise escape both checks and never have its
            // placeholders verified. Report it here rather than skip it.
            mismatches.push(`${qualified}: absent from ${locale}`);
            continue;
          }
          const expected = [...new Set(varsIn(value, DOUBLE_BRACE))].sort();
          const actual = [...new Set(varsIn(target[key], DOUBLE_BRACE))].sort();
          if (JSON.stringify(expected) !== JSON.stringify(actual)) {
            mismatches.push(`${qualified}: en-US=[${expected}] ${locale}=[${actual}]`);
          }
        }
      }
      expect(mismatches).toEqual([]);
    });
  });
});
