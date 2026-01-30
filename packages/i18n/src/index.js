/**
 * @loyaltydog/i18n - Shared internationalization package
 *
 * This is the main entry point. Import specific modules for your use case:
 * - @loyaltydog/i18n/react - For React/i18next integration
 * - @loyaltydog/i18n/node - For Node.js/FastAPI backend
 * - @loyaltydog/i18n/rtl - For RTL language support
 */

// Re-export locales path for direct access
export const LOCALES_PATH = new URL('../locales', import.meta.url).pathname;

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)', flag: '🇪🇸' },
];

// Default/fallback language
export const DEFAULT_LANGUAGE = 'en';

// Translation namespaces
export const NAMESPACES = [
  'common',
  'errors',
  'emails',
  'notifications',
  'validation',
];

/**
 * Get language by code
 * @param {string} code - Language code (e.g., 'en', 'es-ES')
 * @returns {object|undefined} Language object or undefined
 */
export function getLanguage(code) {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}

/**
 * Check if a language code is supported
 * @param {string} code - Language code to check
 * @returns {boolean}
 */
export function isLanguageSupported(code) {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
}
