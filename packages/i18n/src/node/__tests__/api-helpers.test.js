/**
 * Unit tests for API Helpers
 * Run with: npm test -- src/node/__tests__/api-helpers.test.js
 */

import { describe, it, expect } from 'vitest';
import {
  parseAcceptLanguage,
  detectBrowserLanguage,
  getSupportedLanguagesForAPI,
  getTranslationsForAPI,
  getNamespaceTranslations,
  isLanguageSupported,
  getDefaultLanguage,
  buildLanguagePreference,
  formatLanguagePreference,
  getMigrationSQL,
} from '../api-helpers.js';

// Note: These tests require file system access (locales/ directory)
// They are synchronous in Node.js environment

describe('API Helpers', () => {
  describe('parseAcceptLanguage', () => {
    it('should parse Accept-Language header correctly', () => {
      const result = parseAcceptLanguage('en-US,en;q=0.9,es-ES;q=0.8');

      expect(result).toEqual([
        { code: 'en-us', quality: 1.0 },
        { code: 'en', quality: 0.9 },
        { code: 'es-es', quality: 0.8 },
      ]);
    });

    it('should handle single language', () => {
      const result = parseAcceptLanguage('en');

      expect(result).toEqual([{ code: 'en', quality: 1.0 }]);
    });

    it('should handle empty or null input', () => {
      expect(parseAcceptLanguage('')).toEqual([{ code: 'en-US', quality: 1 }]);
      expect(parseAcceptLanguage(null)).toEqual([{ code: 'en-US', quality: 1 }]);
      expect(parseAcceptLanguage(undefined)).toEqual([{ code: 'en-US', quality: 1 }]);
    });

    it('should sort by quality (highest first)', () => {
      const result = parseAcceptLanguage('es;q=0.5,en;q=0.9,fr;q=0.7');

      expect(result[0].code).toBe('en');
      expect(result[0].quality).toBe(0.9);
      expect(result[1].code).toBe('fr');
      expect(result[2].code).toBe('es');
    });
  });

  describe('detectBrowserLanguage', () => {
    it('should detect exact match from supported languages', () => {
      const result = detectBrowserLanguage('es-ES,en;q=0.9');

      expect(result).toBe('es-ES');
    });

    it('should fallback to default for unsupported languages', () => {
      const result = detectBrowserLanguage('de-DE,zh;q=0.9');

      expect(result).toBe('en-US');
    });

    it('should detect supported language from Accept-Language', () => {
      const result = detectBrowserLanguage('fr-FR,en;q=0.9');

      expect(result).toBe('fr');
    });

    it('should match base language when exact not available', () => {
      // es is not in our list, but es-ES is
      const result = detectBrowserLanguage('es,en;q=0.9', ['es-ES', 'en']);

      expect(result).toBe('es-ES');
    });

    it('should use default when no match found', () => {
      const result = detectBrowserLanguage('zh-CN,ja;q=0.9');

      expect(result).toBe('en-US');
    });
  });

  describe('getSupportedLanguagesForAPI', () => {
    it('should return array of language objects', () => {
      const result = getSupportedLanguagesForAPI();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Check structure of first item
      const first = result[0];
      expect(first).toHaveProperty('code');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('flag');
      expect(first).toHaveProperty('nativeName');
    });

    it('should include English (US)', () => {
      const result = getSupportedLanguagesForAPI();

      const english = result.find(l => l.code === 'en-US');
      expect(english).toBeDefined();
      expect(english.name).toBe('English (US)');
      expect(english.flag).toBe('🇺🇸');
    });

    it('should include Spanish', () => {
      const result = getSupportedLanguagesForAPI();

      const spanish = result.find(l => l.code === 'es-ES');
      expect(spanish).toBeDefined();
      expect(spanish.name).toBe('Spanish (Spain)');
      expect(spanish.flag).toBe('🇪🇸');
    });
  });

  describe('getTranslationsForAPI', () => {
    it('should load English (US) translations', () => {
      const result = getTranslationsForAPI('en-US');

      expect(result).toHaveProperty('common');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('validation');
      expect(result).toHaveProperty('notifications');
      expect(result).toHaveProperty('emails');
    });

    it('should load Spanish translations', () => {
      const result = getTranslationsForAPI('es-ES');

      expect(result).toHaveProperty('common');
      expect(result).toHaveProperty('errors');

      // Check a known Spanish translation
      expect(result.common.nav.dashboard).toBe('Panel de Control');
    });

    it('should handle missing namespaces gracefully', () => {
      const result = getTranslationsForAPI('en-US');

      // Should have all namespaces even if some are empty
      expect(Object.keys(result)).toContain('common');
    });
  });

  describe('getNamespaceTranslations', () => {
    it('should load single namespace', () => {
      const result = getNamespaceTranslations('en-US', 'common');

      expect(result).toHaveProperty('nav');
      expect(result.nav.dashboard).toBe('Dashboard');
    });

    it('should load Spanish namespace', () => {
      const result = getNamespaceTranslations('es-ES', 'common');

      expect(result.nav.dashboard).toBe('Panel de Control');
    });
  });

  describe('isLanguageSupported', () => {
    it('should return true for supported languages', () => {
      expect(isLanguageSupported('en-US')).toBe(true);
      expect(isLanguageSupported('en-GB')).toBe(true);
      expect(isLanguageSupported('es-ES')).toBe(true);
      expect(isLanguageSupported('fr')).toBe(true);
      expect(isLanguageSupported('it')).toBe(true);
      expect(isLanguageSupported('pt-PT')).toBe(true);
      expect(isLanguageSupported('pt-BR')).toBe(true);
    });

    it('should return false for unsupported languages', () => {
      expect(isLanguageSupported('de')).toBe(false);
      expect(isLanguageSupported('zh')).toBe(false);
      expect(isLanguageSupported('ja')).toBe(false);
    });
  });

  describe('getDefaultLanguage', () => {
    it('should return "en-US" as default', () => {
      expect(getDefaultLanguage()).toBe('en-US');
    });
  });

  describe('buildLanguagePreference', () => {
    it('should build preference object with timestamp', () => {
      const result = buildLanguagePreference('es-ES', 'browser');

      expect(result.code).toBe('es-ES');
      expect(result.source).toBe('browser');
      expect(result.updatedAt).toBeDefined();
      expect(result.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should default source to "manual"', () => {
      const result = buildLanguagePreference('en');

      expect(result.source).toBe('manual');
    });
  });

  describe('formatLanguagePreference', () => {
    it('should format valid language code', () => {
      const result = formatLanguagePreference('es-ES');

      expect(result.code).toBe('es-ES');
      expect(result.name).toBe('Spanish (Spain)');
      expect(result.flag).toBe('🇪🇸');
    });

    it('should handle null input', () => {
      const result = formatLanguagePreference(null);

      expect(result.code).toBeNull();
      expect(result.name).toBeNull();
      expect(result.flag).toBeNull();
    });

    it('should handle unsupported language code', () => {
      const result = formatLanguagePreference('de-DE');

      expect(result.code).toBe('de-DE');
      expect(result.name).toBeNull();
      expect(result.flag).toBeNull();
    });
  });

  describe('getMigrationSQL', () => {
    it('should return migration SQL for merchants', () => {
      const { merchants } = getMigrationSQL();

      expect(merchants).toContain('ALTER TABLE merchants');
      expect(merchants).toContain('ADD COLUMN IF NOT EXISTS default_language');
      expect(merchants).toContain("DEFAULT 'en-US'");
    });

    it('should return migration SQL for customers', () => {
      const { customers } = getMigrationSQL();

      expect(customers).toContain('ALTER TABLE customers');
      expect(customers).toContain('ADD COLUMN IF NOT EXISTS preferred_language');
      expect(customers).toContain("'en-US'");
    });

    it('should include constraint for supported languages', () => {
      const { merchants } = getMigrationSQL();

      expect(merchants).toContain('CHECK');
      expect(merchants).toContain("'en-US'");
      expect(merchants).toContain("'en-GB'");
      expect(merchants).toContain("'es-ES'");
      expect(merchants).toContain("'fr'");
      expect(merchants).toContain("'it'");
      expect(merchants).toContain("'pt-PT'");
      expect(merchants).toContain("'pt-BR'");
    });
  });
});
