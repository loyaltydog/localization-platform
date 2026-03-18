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
});
