/**
 * RTL (Right-to-Left) language support for @loyaltydog/i18n
 *
 * This module will be implemented in SWE-322.
 * It will provide:
 * - isRTL() function
 * - getTextDirection() function
 * - rtlClass() utility for conditional CSS classes
 * - useRTL() React hook
 */

// RTL language codes
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/**
 * Check if a language code is RTL
 * @param {string} langCode - Language code (e.g., 'he', 'ar')
 * @returns {boolean}
 */
export function isRTL(langCode) {
  if (!langCode) return false;
  const baseLang = langCode.split('-')[0].toLowerCase();
  return RTL_LANGUAGES.includes(baseLang);
}

/**
 * Get text direction for a language
 * @param {string} langCode - Language code
 * @returns {'ltr' | 'rtl'}
 */
export function getTextDirection(langCode) {
  return isRTL(langCode) ? 'rtl' : 'ltr';
}

/**
 * Conditionally return a CSS class based on RTL
 * @param {string} langCode - Language code
 * @param {string} rtlClass - Class to apply for RTL languages
 * @param {string} [ltrClass=''] - Class to apply for LTR languages
 * @returns {string}
 */
export function rtlClass(langCode, rtlClass, ltrClass = '') {
  return isRTL(langCode) ? rtlClass : ltrClass;
}
