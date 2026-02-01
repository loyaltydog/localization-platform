/**
 * Unit tests for RTL module
 * Run with: npm test -- src/rtl/__tests__/rtl.test.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  isRTL,
  getTextDirection,
  rtlClass,
  rtlSpacing,
  rtlClassName,
  getRTLLanguages,
  addRTLLanguage,
  isRTLLanguage,
  useRTL,
} from '../index.js';

// Mock window.i18next for useRTL tests
const mockI18next = {
  language: 'en',
};

describe('RTL Module - isRTL()', () => {
  describe('RTL language detection', () => {
    it('should return true for Hebrew', () => {
      expect(isRTL('he')).toBe(true);
      expect(isRTL('he-IL')).toBe(true);
      expect(isRTL('HE')).toBe(true);
    });

    it('should return true for Arabic', () => {
      expect(isRTL('ar')).toBe(true);
      expect(isRTL('ar-SA')).toBe(true);
      expect(isRTL('ar-EG')).toBe(true);
    });

    it('should return true for Farsi (Persian)', () => {
      expect(isRTL('fa')).toBe(true);
      expect(isRTL('fa-IR')).toBe(true);
    });

    it('should return true for Urdu', () => {
      expect(isRTL('ur')).toBe(true);
      expect(isRTL('ur-PK')).toBe(true);
    });

    it('should return true for Yiddish', () => {
      expect(isRTL('yi')).toBe(true);
    });

    it('should return true for Kashmiri', () => {
      expect(isRTL('ks')).toBe(true);
    });

    it('should return true for Sindhi', () => {
      expect(isRTL('sd')).toBe(true);
    });
  });

  describe('LTR language detection', () => {
    it('should return false for English', () => {
      expect(isRTL('en')).toBe(false);
      expect(isRTL('en-US')).toBe(false);
      expect(isRTL('en-GB')).toBe(false);
    });

    it('should return false for Spanish', () => {
      expect(isRTL('es')).toBe(false);
      expect(isRTL('es-ES')).toBe(false);
      expect(isRTL('es-MX')).toBe(false);
    });

    it('should return false for French', () => {
      expect(isRTL('fr')).toBe(false);
      expect(isRTL('fr-FR')).toBe(false);
    });

    it('should return false for German', () => {
      expect(isRTL('de')).toBe(false);
      expect(isRTL('de-DE')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should return false for empty string', () => {
      expect(isRTL('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isRTL(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isRTL(undefined)).toBe(false);
    });

    it('should return false for non-string types', () => {
      expect(isRTL(123)).toBe(false);
      expect(isRTL({})).toBe(false);
      expect(isRTL([])).toBe(false);
    });

    it('should handle case-insensitive language codes', () => {
      expect(isRTL('HE')).toBe(true);
      expect(isRTL('Ar')).toBe(true);
      expect(isRTL('EN')).toBe(false);
    });
  });
});

describe('RTL Module - getTextDirection()', () => {
  it('should return "rtl" for RTL languages', () => {
    expect(getTextDirection('he')).toBe('rtl');
    expect(getTextDirection('ar')).toBe('rtl');
    expect(getTextDirection('fa')).toBe('rtl');
  });

  it('should return "ltr" for LTR languages', () => {
    expect(getTextDirection('en')).toBe('ltr');
    expect(getTextDirection('es')).toBe('ltr');
    expect(getTextDirection('fr')).toBe('ltr');
  });

  it('should return "ltr" for empty/invalid input', () => {
    expect(getTextDirection('')).toBe('ltr');
    expect(getTextDirection(null)).toBe('ltr');
  });
});

describe('RTL Module - rtlClass()', () => {
  it('should return RTL class when using boolean true', () => {
    expect(rtlClass(true, 'rtl-class', 'ltr-class')).toBe('rtl-class');
  });

  it('should return LTR class when using boolean false', () => {
    expect(rtlClass(false, 'rtl-class', 'ltr-class')).toBe('ltr-class');
  });

  it('should return RTL class when using RTL language code', () => {
    expect(rtlClass('he', 'rtl-class', 'ltr-class')).toBe('rtl-class');
    expect(rtlClass('ar', 'rtl-class', 'ltr-class')).toBe('rtl-class');
  });

  it('should return LTR class when using LTR language code', () => {
    expect(rtlClass('en', 'rtl-class', 'ltr-class')).toBe('ltr-class');
    expect(rtlClass('es', 'rtl-class', 'ltr-class')).toBe('ltr-class');
  });

  it('should return empty string as default LTR class', () => {
    expect(rtlClass(false, 'rtl-class')).toBe('');
  });

  it('should handle empty rtlClass', () => {
    expect(rtlClass(true, '', 'ltr-class')).toBe('');
  });
});

describe('RTL Module - rtlSpacing()', () => {
  it('should return original styles when not RTL', () => {
    const styles = { marginLeft: '10px', marginRight: '20px' };
    expect(rtlSpacing(styles, false)).toEqual(styles);
  });

  it('should return original styles when isRtl is falsy', () => {
    const styles = { marginLeft: '10px', marginRight: '20px' };
    expect(rtlSpacing(styles, null)).toEqual(styles);
  });

  it('should swap marginLeft and marginRight for RTL', () => {
    const styles = { marginLeft: '10px', marginRight: '20px' };
    const result = rtlSpacing(styles, true);
    expect(result.marginLeft).toBe('20px');
    expect(result.marginRight).toBe('10px');
  });

  it('should swap paddingLeft and paddingRight for RTL', () => {
    const styles = { paddingLeft: '5px', paddingRight: '15px' };
    const result = rtlSpacing(styles, true);
    expect(result.paddingLeft).toBe('15px');
    expect(result.paddingRight).toBe('5px');
  });

  it('should swap border properties for RTL', () => {
    const styles = {
      borderLeftWidth: '2px',
      borderRightWidth: '1px',
      borderLeftColor: 'red',
      borderRightColor: 'blue',
    };
    const result = rtlSpacing(styles, true);
    expect(result.borderLeftWidth).toBe('1px');
    expect(result.borderRightWidth).toBe('2px');
    expect(result.borderLeftColor).toBe('blue');
    expect(result.borderRightColor).toBe('red');
  });

  it('should handle non-spacing properties correctly', () => {
    const styles = {
      marginLeft: '10px',
      marginRight: '20px',
      color: 'red',
      fontSize: '16px',
    };
    const result = rtlSpacing(styles, true);
    expect(result.color).toBe('red');
    expect(result.fontSize).toBe('16px');
  });

  it('should handle only one side present', () => {
    const styles = { marginLeft: '10px' };
    const result = rtlSpacing(styles, true);
    // Only marginLeft exists, no marginRight to swap with
    expect(result.marginLeft).toBe('10px');
  });

  it('should handle numeric values', () => {
    const styles = { marginLeft: 10, marginRight: 20 };
    const result = rtlSpacing(styles, true);
    expect(result.marginLeft).toBe(20);
    expect(result.marginRight).toBe(10);
  });

  it('should return null for null input', () => {
    expect(rtlSpacing(null, true)).toBe(null);
  });

  it('should return undefined for undefined input', () => {
    expect(rtlSpacing(undefined, true)).toBe(undefined);
  });

  it('should not mutate original object', () => {
    const styles = { marginLeft: '10px', marginRight: '20px' };
    rtlSpacing(styles, true);
    expect(styles.marginLeft).toBe('10px');
    expect(styles.marginRight).toBe('20px');
  });
});

describe('RTL Module - rtlClassName()', () => {
  it('should combine base and RTL classes for RTL language', () => {
    const result = rtlClassName({
      base: 'flex items-center',
      rtl: 'flex-row-reverse',
      ltr: 'flex-row',
      isRTL: 'he',
    });
    expect(result).toBe('flex items-center flex-row-reverse');
  });

  it('should combine base and LTR classes for LTR language', () => {
    const result = rtlClassName({
      base: 'flex items-center',
      rtl: 'flex-row-reverse',
      ltr: 'flex-row',
      isRTL: 'en',
    });
    expect(result).toBe('flex items-center flex-row');
  });

  it('should work with boolean isRTL', () => {
    const result = rtlClassName({
      base: 'flex',
      rtl: 'rtl-class',
      ltr: 'ltr-class',
      isRTL: true,
    });
    expect(result).toBe('flex rtl-class');
  });

  it('should handle missing base class', () => {
    const result = rtlClassName({
      rtl: 'rtl-class',
      ltr: 'ltr-class',
      isRTL: 'ar',
    });
    expect(result).toBe('rtl-class');
  });

  it('should handle missing rtl/ltr classes', () => {
    const result = rtlClassName({
      base: 'flex',
      isRTL: 'he',
    });
    expect(result).toBe('flex');
  });

  it('should filter out empty strings', () => {
    const result = rtlClassName({
      base: '',
      rtl: '',
      ltr: '',
      isRTL: 'he',
    });
    expect(result).toBe('');
  });
});

describe('RTL Module - getRTLLanguages()', () => {
  it('should return array of RTL language codes', () => {
    const languages = getRTLLanguages();
    expect(Array.isArray(languages)).toBe(true);
    expect(languages.length).toBeGreaterThan(0);
  });

  it('should include known RTL languages', () => {
    const languages = getRTLLanguages();
    expect(languages).toContain('ar');
    expect(languages).toContain('he');
    expect(languages).toContain('fa');
    expect(languages).toContain('ur');
  });

  it('should return sorted array', () => {
    const languages = getRTLLanguages();
    const sorted = [...languages].sort();
    expect(languages).toEqual(sorted);
  });
});

describe('RTL Module - addRTLLanguage()', () => {
  it('should add new RTL language', () => {
    addRTLLanguage('ps'); // Pashto
    expect(isRTLLanguage('ps')).toBe(true);
  });

  it('should handle language codes with region', () => {
    addRTLLanguage('ps-AF');
    expect(isRTLLanguage('ps')).toBe(true);
  });

  it('should be case-insensitive', () => {
    addRTLLanguage('XX');
    expect(isRTLLanguage('xx')).toBe(true);
  });

  it('should handle null gracefully', () => {
    expect(() => addRTLLanguage(null)).not.toThrow();
  });

  it('should handle non-string gracefully', () => {
    expect(() => addRTLLanguage(123)).not.toThrow();
  });
});

describe('RTL Module - isRTLLanguage()', () => {
  it('should return true for RTL languages', () => {
    expect(isRTLLanguage('ar')).toBe(true);
    expect(isRTLLanguage('he')).toBe(true);
    expect(isRTLLanguage('fa')).toBe(true);
  });

  it('should return false for LTR languages', () => {
    expect(isRTLLanguage('en')).toBe(false);
    expect(isRTLLanguage('es')).toBe(false);
  });

  it('should handle region-specific codes', () => {
    expect(isRTLLanguage('he-IL')).toBe(true);
    expect(isRTLLanguage('en-US')).toBe(false);
  });

  it('should be case-insensitive', () => {
    expect(isRTLLanguage('HE')).toBe(true);
    expect(isRTLLanguage('AR')).toBe(true);
  });

  it('should handle invalid input', () => {
    expect(isRTLLanguage('')).toBe(false);
    expect(isRTLLanguage(null)).toBe(false);
    expect(isRTLLanguage(undefined)).toBe(false);
    expect(isRTLLanguage(123)).toBe(false);
  });
});

describe('RTL Module - useRTL()', () => {
  let originalWindow;

  beforeEach(() => {
    originalWindow = global.window;
    global.window = { i18next: { ...mockI18next } };
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('should return RTL status for Hebrew', () => {
    global.window.i18next.language = 'he';
    const result = useRTL();
    expect(result.isRTL).toBe(true);
    expect(result.dir).toBe('rtl');
  });

  it('should return LTR status for English', () => {
    global.window.i18next.language = 'en';
    const result = useRTL();
    expect(result.isRTL).toBe(false);
    expect(result.dir).toBe('ltr');
  });

  it('should return rtlClass function', () => {
    const result = useRTL();
    expect(typeof result.rtlClass).toBe('function');
    expect(result.rtlClass('rtl-cls', 'ltr-cls')).toBe('ltr-cls');
  });

  it('should return rtlSpacing function', () => {
    const result = useRTL();
    expect(typeof result.rtlSpacing).toBe('function');
    const styles = { marginLeft: '10px', marginRight: '20px' };
    // For LTR (en), should not swap
    expect(result.rtlSpacing(styles)).toEqual(styles);
  });

  it('should default to English when i18next not available', () => {
    delete global.window.i18next;
    const result = useRTL();
    expect(result.isRTL).toBe(false);
    expect(result.dir).toBe('ltr');
  });

  it('should handle RTL language correctly with rtlClass', () => {
    global.window.i18next.language = 'ar';
    const result = useRTL();
    expect(result.rtlClass('rtl-cls', 'ltr-cls')).toBe('rtl-cls');
  });
});
