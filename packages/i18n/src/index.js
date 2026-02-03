/**
 * @loyaltydog/i18n - Shared internationalization package
 *
 * This is the main entry point. Import specific modules for your use case:
 * - @loyaltydog/i18n/react - For React/i18next integration
 * - @loyaltydog/i18n/node - For Node.js/FastAPI backend
 * - @loyaltydog/i18n/rtl - For RTL language support
 */

import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Re-export locales path for direct access (cross-platform)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const LOCALES_PATH = resolve(__dirname, '../locales');

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)', flag: '🇲x️' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', flag: '🇵🇹' },
];

// Default/fallback language
export const DEFAULT_LANGUAGE = 'en-US';

// Translation namespaces
export const NAMESPACES = [
  'common',
  'errors',
  'emails',
  'notifications',
  'validation',
];

/**
 * Normalize language code for comparison
 * @param {string} code - Language code
 * @returns {string} Normalized code (lowercase)
 */
function normalizeCode(code) {
  return code?.toLowerCase() ?? '';
}

/**
 * Get language by code (supports base language matching, e.g., 'es' matches 'es-ES')
 * @param {string|undefined|null} code - Language code (e.g., 'en', 'es-ES', 'es')
 * @returns {object|undefined} Language object or undefined
 */
export function getLanguage(code) {
  if (!code) return undefined;
  const normalized = normalizeCode(code);
  // Exact match first
  const exact = SUPPORTED_LANGUAGES.find((lang) => normalizeCode(lang.code) === normalized);
  if (exact) return exact;
  // Base language match (e.g., 'es' matches 'es-ES')
  const baseCode = normalized.split('-')[0];
  return SUPPORTED_LANGUAGES.find((lang) => normalizeCode(lang.code).startsWith(baseCode + '-') || normalizeCode(lang.code) === baseCode);
}

/**
 * Check if a language code is supported (supports base language matching)
 * @param {string|undefined|null} code - Language code to check
 * @returns {boolean}
 */
export function isLanguageSupported(code) {
  return getLanguage(code) !== undefined;
}
