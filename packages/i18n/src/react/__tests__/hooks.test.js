/**
 * Tests for React hooks
 */

import { describe, it, expect, beforeEach } from 'vitest';
// renderHook is exported from @testing-library/react in v13.1+ (merged from @testing-library/react-hooks)
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { initI18n, getI18n } from '../i18n-config.js';
import { useTranslation, useLanguages, useDateFormat, useNumberFormat } from '../hooks.js';

// Wrapper component for hooks that need i18n context
function createWrapper() {
  const i18n = getI18n();
  return function Wrapper({ children }) {
    return React.createElement(I18nextProvider, { i18n }, children);
  };
}

describe('useTranslation hook', () => {
  beforeEach(async () => {
    await initI18n();
  });

  it('should provide translation function', () => {
    const { result } = renderHook(() => useTranslation('common'), {
      wrapper: createWrapper(),
    });

    expect(result.current.t).toBeDefined();
    expect(typeof result.current.t).toBe('function');
  });

  it('should translate keys', () => {
    const { result } = renderHook(() => useTranslation('common'), {
      wrapper: createWrapper(),
    });

    expect(result.current.t('nav.dashboard')).toBe('Dashboard');
  });

  it('should provide current language', () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: createWrapper(),
    });

    expect(result.current.language).toBe('en-US');
  });

  it('should provide RTL status', () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isRTL).toBe(false);
    expect(result.current.textDirection).toBe('ltr');
  });

  it('should provide list of supported languages', () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: createWrapper(),
    });

    expect(result.current.languages).toBeDefined();
    expect(Array.isArray(result.current.languages)).toBe(true);
    expect(result.current.languages.length).toBeGreaterThan(0);
  });

  it('should provide current language object', () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentLanguage).toBeDefined();
    expect(result.current.currentLanguage.code).toBe('en-US');
    expect(result.current.currentLanguage.name).toBe('English (US)');
  });

  it('should provide changeLanguage function', () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: createWrapper(),
    });

    expect(result.current.changeLanguage).toBeDefined();
    expect(typeof result.current.changeLanguage).toBe('function');
  });
});

describe('useLanguages hook', () => {
  beforeEach(async () => {
    await initI18n();
  });

  it('should provide list of languages', () => {
    const { result } = renderHook(() => useLanguages(), {
      wrapper: createWrapper(),
    });

    expect(result.current.languages).toBeDefined();
    expect(result.current.languages.some((l) => l.code === 'en-US')).toBe(true);
    expect(result.current.languages.some((l) => l.code === 'es-ES')).toBe(true);
  });

  it('should provide current language code', () => {
    const { result } = renderHook(() => useLanguages(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCode).toBe('en-US');
  });

  it('should provide setLanguage function', () => {
    const { result } = renderHook(() => useLanguages(), {
      wrapper: createWrapper(),
    });

    expect(result.current.setLanguage).toBeDefined();
    expect(typeof result.current.setLanguage).toBe('function');
  });
});

describe('useDateFormat hook', () => {
  beforeEach(async () => {
    await initI18n();
  });

  it('should format dates', () => {
    const { result } = renderHook(() => useDateFormat(), {
      wrapper: createWrapper(),
    });

    const date = new Date('2024-01-15');
    const formatted = result.current.formatDate(date);

    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    // Should contain the date parts
    expect(formatted).toMatch(/Jan|15|2024/);
  });

  it('should format times', () => {
    const { result } = renderHook(() => useDateFormat(), {
      wrapper: createWrapper(),
    });

    const date = new Date('2024-01-15T14:30:00');
    const formatted = result.current.formatTime(date);

    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should format relative dates', () => {
    const { result } = renderHook(() => useDateFormat(), {
      wrapper: createWrapper(),
    });

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const formatted = result.current.formatRelative(yesterday);

    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    // Don't assert specific locale words - just verify non-empty output
    expect(formatted.length).toBeGreaterThan(0);
  });
});

describe('useNumberFormat hook', () => {
  beforeEach(async () => {
    await initI18n();
  });

  it('should format numbers', () => {
    const { result } = renderHook(() => useNumberFormat(), {
      wrapper: createWrapper(),
    });

    const formatted = result.current.formatNumber(1234567.89);

    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    expect(formatted).toMatch(/1.*234.*567/); // Should have thousand separators
  });

  it('should format currency', () => {
    const { result } = renderHook(() => useNumberFormat(), {
      wrapper: createWrapper(),
    });

    const formatted = result.current.formatCurrency(99.99, 'USD');

    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    expect(formatted).toMatch(/\$|USD/);
    expect(formatted).toMatch(/99/);
  });

  it('should format percentages', () => {
    const { result } = renderHook(() => useNumberFormat(), {
      wrapper: createWrapper(),
    });

    const formatted = result.current.formatPercent(0.75);

    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('75');
    expect(formatted).toContain('%');
  });

  it('should format compact numbers', () => {
    const { result } = renderHook(() => useNumberFormat(), {
      wrapper: createWrapper(),
    });

    const formatted = result.current.formatCompact(1500000);

    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    expect(formatted).toMatch(/1\.5.*[Mm]|M.*1\.5/);
  });
});
