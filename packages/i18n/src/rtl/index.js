/**
 * RTL (Right-to-Left) language support for @loyaltydog/i18n
 *
 * This module provides utilities for detecting and handling RTL languages
 * (Arabic, Hebrew, Farsi, Urdu). It's designed to be zero-cost when not
 * using RTL languages.
 *
 * @module @loyaltydog/i18n/rtl
 *
 * @example
 * ```tsx
 * import { useRTL, rtlClass, getTextDirection } from '@loyaltydog/i18n/rtl';
 *
 * function Navbar() {
 *   const { isRTL, dir } = useRTL();
 *   return (
 *     <nav dir={dir} className={rtlClass(isRTL, 'flex-row-reverse', 'flex-row')}>
 *       <Logo />
 *       <Menu />
 *     </nav>
 *   );
 * }
 * ```
 */

import { DEFAULT_LANGUAGE } from '../index.js';

// RTL language codes (base language codes)
const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur', 'yi', 'ks', 'sd']);

/**
 * Spacing property pairs for RTL mirroring
 * Only "left" properties are listed - they map to their "right" equivalents
 */
const SPACING_MAPPINGS = {
  marginLeft: 'marginRight',
  paddingLeft: 'paddingRight',
  borderLeftWidth: 'borderRightWidth',
  borderLeftColor: 'borderRightColor',
  borderLeftStyle: 'borderRightStyle',
};

/**
 * Check if a language code is RTL (Right-to-Left)
 *
 * @param {string} langCode - Language code (e.g., 'he', 'ar', 'es-ES')
 * @returns {boolean} True if the language is RTL
 *
 * @example
 * isRTL('he')      // true
 * isRTL('ar-SA')   // true
 * isRTL('en')      // false
 * isRTL('es-ES')   // false
 */
export function isRTL(langCode) {
  if (!langCode || typeof langCode !== 'string') return false;
  const baseLang = langCode.split('-')[0].toLowerCase();
  return RTL_LANGUAGES.has(baseLang);
}

/**
 * Get text direction for a language
 *
 * Returns the value for the HTML `dir` attribute.
 *
 * @param {string} langCode - Language code
 * @returns {'ltr' | 'rtl'} Text direction
 *
 * @example
 * getTextDirection('he')  // 'rtl'
 * getTextDirection('en')  // 'ltr'
 */
export function getTextDirection(langCode) {
  return isRTL(langCode) ? 'rtl' : 'ltr';
}

/**
 * Conditionally return a CSS class based on RTL
 *
 * @param {string|boolean} rtlOrLangCode - Either RTL boolean or language code
 * @param {string} rtlClass - Class to apply for RTL languages
 * @param {string} [ltrClass=''] - Class to apply for LTR languages
 * @returns {string} The appropriate CSS class
 *
 * @example
 * // Using boolean
 * rtlClass(true, 'flex-row-reverse', 'flex-row')
 *
 * // Using language code
 * rtlClass('he', 'flex-row-reverse', 'flex-row')
 */
export function rtlClass(rtlOrLangCode, rtlClass, ltrClass = '') {
  const isRtl = typeof rtlOrLangCode === 'boolean'
    ? rtlOrLangCode
    : isRTL(rtlOrLangCode);
  return isRtl ? rtlClass : ltrClass;
}

/**
 * Mirror spacing values for RTL layouts
 *
 * Converts CSS spacing object properties to their RTL equivalents.
 * Useful for inline styles that need RTL awareness.
 *
 * @param {Object} styles - CSS style object
 * @param {boolean} isRtl - Whether the layout is RTL
 * @returns {Object} Mirrored style object
 *
 * @example
 * // LTR
 * rtlSpacing({ marginLeft: '10px', marginRight: '20px' }, false)
 * // => { marginLeft: '10px', marginRight: '20px' }
 *
 * // RTL (mirrored)
 * rtlSpacing({ marginLeft: '10px', marginRight: '20px' }, true)
 * // => { marginLeft: '20px', marginRight: '10px' }
 */
export function rtlSpacing(styles, isRtl) {
  if (!isRtl || !styles || typeof styles !== 'object') {
    return styles;
  }

  const mirrored = { ...styles };

  for (const [ltrProp, rtlProp] of Object.entries(SPACING_MAPPINGS)) {
    if (ltrProp in mirrored && rtlProp in mirrored) {
      // Swap the values
      const ltrValue = mirrored[ltrProp];
      const rtlValue = mirrored[rtlProp];
      mirrored[ltrProp] = rtlValue;
      mirrored[rtlProp] = ltrValue;
    }
  }

  return mirrored;
}

/**
 * React hook for RTL detection
 *
 * Uses the current i18next language to determine RTL status.
 * Requires react-i18next to be configured in your app.
 *
 * Note: This hook must be used within a component wrapped by I18nProvider
 * from react-i18next. For non-React usage, use isRTL() and getTextDirection()
 * directly with a language code.
 *
 * @returns {Object} RTL utilities
 * @returns {boolean} returns.isRTL - Whether current language is RTL
 * @returns {'ltr' | 'rtl'} returns.dir - Text direction for HTML dir attribute
 * @returns {Function} returns.rtlClass - Class selector function
 * @returns {Function} returns.rtlSpacing - Style mirroring function
 *
 * @example
 * function Component() {
 *   const { isRTL, dir } = useRTL();
 *   return <div dir={dir}>Content is {isRTL ? 'RTL' : 'LTR'}</div>;
 * }
 */
export function useRTL() {
  // Dynamic import of useTranslation to avoid hard dependency
  // This allows the module to be used in non-React contexts
  try {
    // Try to get useTranslation from react-i18next
    const { useTranslation } = require('react-i18next');
    const { i18n } = useTranslation();

    const currentLang = i18n.language;
    const isRtl = isRTL(currentLang);
    const dir = getTextDirection(currentLang);

    return {
      isRTL: isRtl,
      dir,
      rtlClass: (rtlCls, ltrCls = '') => rtlClass(isRtl, rtlCls, ltrCls),
      rtlSpacing: (styles) => rtlSpacing(styles, isRtl),
    };
  } catch (error) {
    // Log error for debugging but provide fallback behavior
    if (typeof console !== 'undefined') {
      console.error('useRTL: Error loading react-i18next, using fallback:', error);
    }

    // react-i18next not available, fall back to checking window
    const currentLang =
      typeof window !== 'undefined' && window.i18next
        ? window.i18next.language
        : DEFAULT_LANGUAGE;

    const isRtl = isRTL(currentLang);
    const dir = getTextDirection(currentLang);

    return {
      isRTL: isRtl,
      dir,
      rtlClass: (rtlCls, ltrCls = '') => rtlClass(isRtl, rtlCls, ltrCls),
      rtlSpacing: (styles) => rtlSpacing(styles, isRtl),
    };
  }
}

/**
 * Higher-order component class name utility
 *
 * Returns a className string with RTL-aware classes.
 *
 * @param {Object} config - Class configuration
 * @param {string} [config.base] - Base class always applied
 * @param {string} [config.rtl] - Class applied for RTL languages
 * @param {string} [config.ltr] - Class applied for LTR languages
 * @param {string|boolean} [config.isRTL] - RTL state or language code
 * @returns {string} Combined className string
 *
 * @example
 * // Returns 'flex items-center gap-4 flex-row-reverse'
 * rtlClassName({
 *   base: 'flex items-center gap-4',
 *   rtl: 'flex-row-reverse',
 *   ltr: 'flex-row',
 *   isRTL: 'he'
 * })
 */
export function rtlClassName({ base = '', rtl = '', ltr = '', isRTL: rtlOrLang }) {
  const classes = [base];
  const isRtl = typeof rtlOrLang === 'boolean' ? rtlOrLang : isRTL(rtlOrLang);
  classes.push(isRtl ? rtl : ltr);
  return classes.filter(Boolean).join(' ');
}

/**
 * Get all supported RTL language codes
 *
 * @returns {string[]} Array of RTL language codes
 *
 * @example
 * getRTLLanguages() // ['ar', 'fa', 'he', 'ks', 'sd', 'ur', 'yi']
 */
export function getRTLLanguages() {
  return Array.from(RTL_LANGUAGES).sort();
}

/**
 * Add a custom RTL language code
 *
 * Useful for adding new RTL languages not in the default list.
 *
 * @param {string} langCode - Base language code to add
 *
 * @example
 * addRTLLanguage('ps'); // Add Pashto
 */
export function addRTLLanguage(langCode) {
  if (langCode && typeof langCode === 'string') {
    RTL_LANGUAGES.add(langCode.toLowerCase().split('-')[0]);
  }
}

/**
 * Check if a specific language is in the RTL languages list
 *
 * @param {string} langCode - Language code to check
 * @returns {boolean} True if the language is a known RTL language
 *
 * @example
 * isRTLLanguage('he')  // true
 * isRTLLanguage('en')  // false
 */
export function isRTLLanguage(langCode) {
  if (!langCode || typeof langCode !== 'string') return false;
  const baseLang = langCode.split('-')[0].toLowerCase();
  return RTL_LANGUAGES.has(baseLang);
}
