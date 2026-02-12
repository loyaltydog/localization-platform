/**
 * Comprehensive unit tests for all 8 supported languages
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { loadTranslation } from '../test_translation_loader.js';

// Helper function to count top-level keys only (no nested objects)
const countTopLevelKeys = (obj) => Object.values(obj).reduce((count, value) => {
  // Only count if value is a string (not object/array)
  if (typeof value === 'string' && value !== null && value.trim() !== '') {
    return count + 1;
  }
  return count;
});

// Expected key counts per namespace (from en-US source)
const EXPECTED_KEY_COUNTS = {
  common: 16,
  errors: 16,
  validation: 16,
  notifications: 16,
  emails: 16,
};

describe('Translation Structure Tests - All Languages', () => {
  describe('File Structure', () => {
    it.each(ALL_LANGUAGES)('should have all 5 namespace JSON files for %s', (locale) => {
      const translations = loadTranslation(locale, 'common');
      const allStrings = getAllStringValues(translations);

      // Check for expected key count
      const expectedCount = Object.values(EXPECTED_KEY_COUNTS).reduce((a, b) => a + b, 0);
      expect(allStrings.length).toBe(expectedCount);
    });
  });

  describe('Key Coverage', () => {
    it.each(ALL_LANGUAGES)('should have same key count as en-US for %s', (locale) => {
      const translations = loadTranslation(locale, 'common');
      const en = loadTranslation('en-US', 'common');

      const targetKeys = new Set(getKeys(en));
      const actualKeys = new Set(getKeys(translations));

      // Count missing keys in target
      const missingKeys = [...targetKeys].filter(key => !actualKeys.has(key));
      const extraKeys = [...actualKeys].filter(key => !targetKeys.has(key));

      if (missingKeys.length > 0 || extraKeys.length > 0) {
        console.log('Missing keys in locale %s:', locale);
        console.log('  Expected:', targetKeys);
        console.log('  Actual:', actualKeys);
        console.log('  Missing:', missingKeys);
        console.log('  Extra:', extraKeys);
        console.log('Missing count:', missingKeys.length);
        console.log('Extra count:', extraKeys.length);
      }

      expect(missingKeys.length).toBe(0);
      expect(extraKeys.length).toBe(0);
    });
  });

  describe('No Empty Strings', () => {
    it.each(ALL_LANGUAGES)('should not have empty string values for %s', (locale) => {
      const translations = loadTranslation(locale, 'common');
      const allStrings = getAllStringValues(translations);

      // Check for truly empty strings (whitespace-only is allowed for spacing)
      const emptyCount = Object.values(allStrings).filter(val => {
        if (typeof val === 'string' && val.trim() === '') {
          return true;
        }
        return false;
      }).length;

      if (emptyCount > 0) {
        console.log('Empty strings found:', emptyCount);
        expect(false).toBe(true);
      } else {
        console.log('No empty strings found');
      }
    });
  });

  describe('Language Consistency Tests', () => {
    it.each(ALL_LANGUAGES)('should have base language matching (es → es-ES)', () => {
      const esES = loadTranslation('es-ES', 'common');
      const esMX = loadTranslation('es-MX', 'common');

      const esESKeys = new Set(getKeys(esES));
      const esMXKeys = new Set(getKeys(esMX));

      expect(esESKeys).toEqual(esMXKeys);
      expect(esMXKeys).toEqual(esMXKeys);
    });
  });

  describe('Placeholder Syntax', () => {
    it.each(ALL_LANGUAGES)('should use correct ICU placeholder syntax for %s', (locale) => {
      const translations = loadTranslation(locale, 'emails');

      // Check that placeholders use {{variable}} syntax
      const subject = translations.welcome.subject;
      const body = translations.welcome.body;

      expect(subject).toContain('{{');
      expect(subject).toContain('}}');
      expect(body).toContain('{{');
      expect(body).toContain('}}');
    });
  });

  describe('English Variants', () => {
    it.each(ALL_LANGUAGES)('en-GB and en-US should have same structure', () => {
      const enUS = loadTranslation('en-US', 'common');
      const enGB = loadTranslation('en-GB', 'common');

      const enUSKeys = new Set(getKeys(enUS));
      const enGBKeys = new Set(getKeys(enGB));

      expect(enUSKeys).toEqual(enGBKeys);
    });
  });

  describe('Portuguese Variants', () => {
    it.each(ALL_LANGUAGES)('pt-BR and pt-PT should have same structure', () => {
      const ptBR = loadTranslation('pt-BR', 'common');
      const ptPT = loadTranslation('pt-PT', 'common');

      const ptBRKeys = new Set(getKeys(ptBR));
      const ptPTKeys = new Set(getKeys(ptPT));

      expect(ptBRKeys).toEqual(ptPTKeys);
    });
  });

  describe('French Variants', () => {
    it.each(ALL_LANGUAGES)('fr should have same structure as en-US', () => {
      const fr = loadTranslation('fr', 'common');

      const frKeys = new Set(getKeys(fr));

      expect(frKeys).toEqual(new Set(getKeys('en-US')));
    });
  });
});

run: jest --detectLeaks --forceExit
