/**
 * API Helper Functions for Backend Integration
 *
 * This module provides helper functions for backend integrations (FastAPI, Express, etc.)
 * to handle language detection, translation retrieval, and language preference management.
 *
 * @module @loyaltydog/i18n/node/api-helpers
 *
 * @example
 * ```python
 * # In FastAPI
 * from @loyaltydog.i18n.node import detectLanguage, getSupportedLanguages
 *
 * @app.get("/v2/localization/languages")
 * async def get_languages():
 *     return getSupportedLanguages()
 *
 * @app.get("/v2/localization/translations/{language_code}")
 * async def get_translations(language_code: str):
 *     return getTranslationsForAPI(language_code)
 * ```
 */

import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load a JSON namespace file for a language
 * @param {string} languageCode - Language code (e.g., 'en', 'es-ES')
 * @param {string} namespace - Namespace (e.g., 'common', 'errors')
 * @param {string} [localesPath] - Optional path to locales directory
 * @returns {Object} Namespace translations
 */
function loadNamespaceJSON(languageCode, namespace, localesPath) {
  const basePath = localesPath || join(__dirname, '../../locales');
  const filePath = join(basePath, languageCode, `${namespace}.json`);

  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // If file not found, return empty object
    return {};
  }
}

/**
 * Parse Accept-Language header and return sorted list of preferred languages
 *
 * @param {string} acceptLanguage - The Accept-Language header value
 * @returns {Array<{code: string, quality: number}>} Sorted list of language preferences
 *
 * @example
 * ```js
 * const parsed = parseAcceptLanguage('en-US,en;q=0.9,es-ES;q=0.8');
 * // Returns: [
 * //   { code: 'en-US', quality: 1.0 },
 * //   { code: 'en', quality: 0.9 },
 * //   { code: 'es-ES', quality: 0.8 }
 * // ]
 * ```
 */
export function parseAcceptLanguage(acceptLanguage) {
  if (!acceptLanguage || typeof acceptLanguage !== 'string') {
    return [{ code: DEFAULT_LANGUAGE, quality: 1 }];
  }

  return acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q] = lang.trim().split(';q=');
      const quality = q ? parseFloat(q) : 1;
      return { code: code.trim().toLowerCase(), quality };
    })
    .filter(lang => lang.code)
    .sort((a, b) => b.quality - a.quality);
}

/**
 * Detect language from browser Accept-Language header
 *
 * This function follows the detection flow:
 * 1. Parse Accept-Language header
 * 2. Check if language is supported
 * 3. If not supported, fallback to DEFAULT_LANGUAGE
 * 4. Return detected language code
 *
 * @param {string} acceptLanguage - The Accept-Language header value
 * @param {string[]} [supportedCodes] - Optional list of supported language codes
 * @returns {string} Detected language code
 *
 * @example
 * ```js
 * // In FastAPI/Express request handler
 * const acceptLang = request.headers.get('accept-language');
 * const detectedLang = detectBrowserLanguage(acceptLang);
 * // Returns: 'es-ES' or 'en' based on support
 * ```
 */
export function detectBrowserLanguage(acceptLanguage, supportedCodes = null) {
  const supported = supportedCodes || SUPPORTED_LANGUAGES.map(l => l.code);
  const supportedLower = supported.map(c => c.toLowerCase());

  const parsed = parseAcceptLanguage(acceptLanguage);

  // Find first supported language, trying exact then base match for each language in quality order
  for (const { code } of parsed) {
    // Try exact match first (case-insensitive)
    const idx = supportedLower.indexOf(code);
    if (idx !== -1) {
      return supported[idx]; // Return original case
    }

    // Try base language match (case-insensitive)
    const baseCode = code.split('-')[0];
    const baseIdx = supportedLower.findIndex(s => {
      const sBase = s.split('-')[0];
      return sBase === baseCode;
    });
    if (baseIdx !== -1) {
      return supported[baseIdx]; // Return original case
    }
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Get supported languages list for API response
 *
 * Returns the list of supported languages in a format suitable for API responses.
 *
 * @returns {Array<{code: string, name: string, flag: string, nativeName: string}>} Language list
 *
 * @example
 * ```js
 * GET /v2/localization/languages
 *
 * getSupportedLanguagesForAPI();
 * // Returns: [
 * //   { code: "en", name: "English", flag: "🇺🇸", nativeName: "English" },
 * //   { code: "es-ES", name: "Spanish (Spain)", flag: "🇪🇸", nativeName: "Español (España)" }
 * // ]
 * ```
 */
export function getSupportedLanguagesForAPI() {
  return SUPPORTED_LANGUAGES.map(({ code, name, flag, nativeName }) => ({
    code,
    name,
    flag,
    nativeName,
  }));
}

/**
 * Get translations for a specific language for API response
 *
 * Returns all translations for a language in a nested object format.
 * Useful for frontend consumption or API responses.
 *
 * @param {string} languageCode - The language code (e.g., 'en', 'es-ES')
 * @param {string} [localesPath] - Optional path to locales directory
 * @returns {Object} Nested translations object
 *
 * @example
 * ```js
 * GET /v2/localization/translations/es-ES
 *
 * const translations = await getTranslationsForAPI('es-ES');
 * // Returns: {
 * //   common: { nav: { dashboard: "Panel de Control" } },
 * //   errors: { unauthorized: "No autorizado" }
 * // }
 * ```
 */
export function getTranslationsForAPI(languageCode, localesPath = null) {
  const translations = {};
  const namespaces = ['common', 'errors', 'validation', 'notifications', 'emails'];

  for (const namespace of namespaces) {
    translations[namespace] = loadNamespaceJSON(languageCode, namespace, localesPath);
  }

  return translations;
}

/**
 * Get a single namespace translation for API response
 *
 * Returns translations for a specific namespace only.
 *
 * @param {string} languageCode - The language code (e.g., 'en', 'es-ES')
 * @param {string} namespace - The namespace (e.g., 'common', 'errors')
 * @param {string} [localesPath] - Optional path to locales directory
 * @returns {Object} Namespace translations
 *
 * @example
 * ```js
 * GET /v2/localization/translations/es-ES/common
 *
 * const common = await getNamespaceTranslations('es-ES', 'common');
 * // Returns: { nav: { dashboard: "Panel de Control" } }
 * ```
 */
export function getNamespaceTranslations(languageCode, namespace, localesPath = null) {
  return loadNamespaceJSON(languageCode, namespace, localesPath);
}

/**
 * Validate if a language code is supported
 *
 * @param {string} languageCode - The language code to validate
 * @returns {boolean} True if supported
 */
export function isLanguageSupported(languageCode) {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === languageCode);
}

/**
 * Get the default language code
 *
 * @returns {string} Default language code
 */
export function getDefaultLanguage() {
  return DEFAULT_LANGUAGE;
}

/**
 * Build a language preference object for database storage
 *
 * Creates a normalized language preference object that can be stored
 * in database fields like `Merchants.defaultLanguage` or `Customers.preferredLanguage`.
 *
 * @param {string} languageCode - The language code
 * @param {string} [source='manual'] - How the language was set ('browser', 'manual', 'detected')
 * @returns {{code: string, source: string, updatedAt: string}} Language preference object
 *
 * @example
 * ```js
 * // When storing language preference
 * const preference = buildLanguagePreference('es-ES', 'browser');
 * // Returns: { code: 'es-ES', source: 'browser', updatedAt: '2026-01-31T20:00:00Z' }
 * ```
 */
export function buildLanguagePreference(languageCode, source = 'manual') {
  return {
    code: languageCode,
    source,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Format language preference for API response
 *
 * @param {string|null} languageCode - The stored language code (may be null)
 * @returns {{code: string|null, name: string|null, flag: string|null}} Formatted preference
 */
export function formatLanguagePreference(languageCode) {
  if (!languageCode) {
    return { code: null, name: null, flag: null };
  }

  const language = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);

  if (!language) {
    return { code: languageCode, name: null, flag: null };
  }

  return {
    code: language.code,
    name: language.name,
    flag: language.flag,
  };
}

/**
 * Migration helper: SQL statements for adding language fields
 *
 * Returns SQL statements for adding language preference fields to existing tables.
 * Supports PostgreSQL (used in core_api).
 *
 * @returns {Object<{merchants: string, customers: string}>} SQL migration statements
 *
 * @example
 * ```js
 * const { merchants, customers } = getMigrationSQL();
 * // Use in Alembic or Flyway migrations
 * ```
 */
export function getMigrationSQL() {
  return {
    merchants: `
-- Add defaultLanguage column to merchants table
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS default_language VARCHAR(10) DEFAULT 'en';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_merchants_default_language
ON merchants(default_language);

-- Add check constraint to ensure only supported languages
ALTER TABLE merchants
ADD CONSTRAINT chk_merchants_default_language
CHECK (default_language IN ('en', 'es-ES', 'fr', 'de', 'he'));
    `.trim(),

    customers: `
-- Add preferredLanguage column to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_preferred_language
ON customers(preferred_language);

-- Add check constraint to ensure only supported languages
ALTER TABLE customers
ADD CONSTRAINT chk_customers_preferred_language
CHECK (preferred_language IS NULL OR preferred_language IN ('en', 'es-ES', 'fr', 'de', 'he'));
    `.trim(),
  };
}
