/**
 * Tests for i18next configuration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initI18n,
  getI18n,
  changeLanguage,
  getCurrentLanguage,
  hasLoadedLanguage,
  defaultConfig,
} from '../i18n-config.js';
import { SUPPORTED_LANGUAGES } from '../../index.js';

describe('i18n-config', () => {
  describe('defaultConfig', () => {
    it('should have English as default language', () => {
      expect(defaultConfig.lng).toBe('en');
    });

    it('should have English as fallback language', () => {
      expect(defaultConfig.fallbackLng).toBe('en');
    });

    it('should have common as default namespace', () => {
      expect(defaultConfig.defaultNS).toBe('common');
    });

    it('should include all required namespaces', () => {
      expect(defaultConfig.ns).toContain('common');
      expect(defaultConfig.ns).toContain('errors');
      expect(defaultConfig.ns).toContain('emails');
      expect(defaultConfig.ns).toContain('notifications');
      expect(defaultConfig.ns).toContain('validation');
    });

    it('should have English resources bundled', () => {
      expect(defaultConfig.resources).toHaveProperty('en');
      expect(defaultConfig.resources.en).toHaveProperty('common');
      expect(defaultConfig.resources.en).toHaveProperty('errors');
      expect(defaultConfig.resources.en).toHaveProperty('emails');
      expect(defaultConfig.resources.en).toHaveProperty('notifications');
      expect(defaultConfig.resources.en).toHaveProperty('validation');
    });

    it('should not escape values (React handles escaping)', () => {
      expect(defaultConfig.interpolation.escapeValue).toBe(false);
    });

    it('should support required languages', () => {
      expect(defaultConfig.supportedLngs).toContain('en');
      expect(defaultConfig.supportedLngs).toContain('es-ES');
    });
  });

  describe('initI18n', () => {
    // Note: i18n singleton is initialized once; tests verify state after init
    it('should initialize i18next with default config', async () => {
      await initI18n();
      const i18n = getI18n();

      expect(i18n.isInitialized).toBe(true);
      expect(i18n.language).toBe('en');
    });

    it('should return existing instance if already initialized', async () => {
      const first = await initI18n();
      const second = await initI18n({ lng: 'es-ES' });

      // Should return same instance, not re-initialize
      expect(first).toBe(second);
    });
  });

  describe('getCurrentLanguage', () => {
    it('should return a valid supported language', async () => {
      await initI18n();
      const lang = getCurrentLanguage();

      expect(typeof lang).toBe('string');
      expect(SUPPORTED_LANGUAGES.some((l) => l.code === lang || l.code.startsWith(lang.split('-')[0]))).toBe(true);
    });
  });

  describe('hasLoadedLanguage', () => {
    it('should return true for English (bundled)', async () => {
      await initI18n();

      expect(hasLoadedLanguage('en')).toBe(true);
      expect(hasLoadedLanguage('en', 'common')).toBe(true);
      expect(hasLoadedLanguage('en', 'errors')).toBe(true);
    });

    it('should return false for non-loaded languages', async () => {
      // Use English-only config to avoid triggering HTTP backend
      await initI18n({ supportedLngs: ['en'] });

      // Spanish isn't bundled, so it shouldn't be loaded
      expect(hasLoadedLanguage('es-ES')).toBe(false);
    });
  });

  describe('changeLanguage', () => {
    it('should change to a supported language', async () => {
      await initI18n();

      // English should always work since it's bundled
      await changeLanguage('en');
      expect(getCurrentLanguage()).toBe('en');
    });

    it('should fall back to English for unsupported languages', async () => {
      await initI18n();
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await changeLanguage('invalid-lang');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('not supported')
      );
      expect(getCurrentLanguage()).toBe('en');

      consoleSpy.mockRestore();
    });
  });
});

describe('Translation content', () => {
  beforeEach(async () => {
    // initI18n guards against re-initialization, safe to call
    const i18n = getI18n();
    if (!i18n.isInitialized) {
      await initI18n();
    }
  });

  it('should translate common navigation keys', () => {
    const i18n = getI18n();

    expect(i18n.t('nav.dashboard', { ns: 'common' })).toBe('Dashboard');
    expect(i18n.t('nav.members', { ns: 'common' })).toBe('Members');
    expect(i18n.t('nav.rewards', { ns: 'common' })).toBe('Rewards');
  });

  it('should translate common action keys', () => {
    const i18n = getI18n();

    expect(i18n.t('actions.save', { ns: 'common' })).toBe('Save');
    expect(i18n.t('actions.cancel', { ns: 'common' })).toBe('Cancel');
    expect(i18n.t('actions.delete', { ns: 'common' })).toBe('Delete');
  });

  it('should interpolate variables', () => {
    const i18n = getI18n();

    const result = i18n.t('pagination.showing', {
      ns: 'common',
      start: 1,
      end: 10,
      total: 100,
    });

    expect(result).toBe('Showing 1 to 10 of 100');
  });

  it('should translate error messages', () => {
    const i18n = getI18n();

    expect(i18n.t('http.401', { ns: 'errors' })).toBe(
      'You are not authorized. Please log in again.'
    );
    expect(i18n.t('auth.invalidCredentials', { ns: 'errors' })).toBe(
      'Invalid email or password.'
    );
  });

  it('should translate email templates with variables', () => {
    const i18n = getI18n();

    const subject = i18n.t('welcome.subject', {
      ns: 'emails',
      merchantName: 'Acme Store',
    });

    expect(subject).toBe('Welcome to Acme Store!');
  });

  it('should translate validation messages with variables', () => {
    const i18n = getI18n();

    const message = i18n.t('length.min', {
      ns: 'validation',
      min: 8,
    });

    expect(message).toBe('Must be at least 8 characters');
  });
});
