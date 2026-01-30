/**
 * i18next configuration for React applications
 * @module @loyaltydog/i18n/react
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, NAMESPACES } from '../index.js';

// Import English translations for bundling (always available)
import commonEn from '../../locales/en/common.json';
import errorsEn from '../../locales/en/errors.json';
import emailsEn from '../../locales/en/emails.json';
import notificationsEn from '../../locales/en/notifications.json';
import validationEn from '../../locales/en/validation.json';

/**
 * Default i18next configuration options
 */
export const defaultConfig = {
  // Language settings
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES.map((lang) => lang.code),

  // Namespace settings
  defaultNS: 'common',
  ns: NAMESPACES,

  // Interpolation settings
  interpolation: {
    escapeValue: false, // React already escapes values
    formatSeparator: ',',
  },

  // Detection settings
  detection: {
    // Order of detection methods
    order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
    // Keys to look for
    lookupQuerystring: 'lang',
    lookupLocalStorage: 'loyaltydog_language',
    // Cache user language
    caches: ['localStorage'],
  },

  // Backend settings (for loading additional languages)
  backend: {
    // Path to load translations from
    // This will be configured by the consuming application
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },

  // React settings
  react: {
    useSuspense: true,
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added removed',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'span'],
  },

  // Bundled English resources (always available, no HTTP request needed)
  resources: {
    en: {
      common: commonEn,
      errors: errorsEn,
      emails: emailsEn,
      notifications: notificationsEn,
      validation: validationEn,
    },
  },

  // Only load non-English languages via HTTP
  partialBundledLanguages: true,
};

/**
 * Initialize i18next with default configuration
 * @param {Object} overrides - Configuration overrides
 * @returns {Promise<import('i18next').i18n>} Initialized i18next instance
 */
export function initI18n(overrides = {}) {
  // Guard against multiple initializations
  if (i18n.isInitialized) {
    return Promise.resolve(i18n);
  }

  const config = {
    ...defaultConfig,
    ...overrides,
    // Deep merge detection settings
    detection: {
      ...defaultConfig.detection,
      ...(overrides.detection || {}),
    },
    // Deep merge backend settings
    backend: {
      ...defaultConfig.backend,
      ...(overrides.backend || {}),
    },
    // Deep merge react settings
    react: {
      ...defaultConfig.react,
      ...(overrides.react || {}),
    },
  };

  // Only add HttpBackend if we need to load languages dynamically
  const useHttpBackend = config.supportedLngs.some(
    (lang) => lang !== 'en' && !config.resources?.[lang]
  );

  if (useHttpBackend) {
    i18n.use(HttpBackend);
  }

  return i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(config);
}

/**
 * Get the i18next instance (must call initI18n first)
 * @returns {import('i18next').i18n}
 */
export function getI18n() {
  return i18n;
}

/**
 * Change the current language
 * @param {string} langCode - Language code to switch to
 * @returns {Promise<void>}
 */
export async function changeLanguage(langCode) {
  if (!SUPPORTED_LANGUAGES.some((lang) => lang.code === langCode)) {
    console.warn(`Language "${langCode}" is not supported. Falling back to "${DEFAULT_LANGUAGE}".`);
    langCode = DEFAULT_LANGUAGE;
  }
  return i18n.changeLanguage(langCode);
}

/**
 * Get the current language code
 * @returns {string}
 */
export function getCurrentLanguage() {
  return i18n.language || DEFAULT_LANGUAGE;
}

/**
 * Check if translations are loaded for a language
 * @param {string} langCode - Language code to check
 * @param {string} [namespace='common'] - Namespace to check
 * @returns {boolean}
 */
export function hasLoadedLanguage(langCode, namespace = 'common') {
  return i18n.hasResourceBundle(langCode, namespace);
}

/**
 * Preload translations for a language
 * @param {string} langCode - Language code to preload
 * @returns {Promise<void>}
 */
export async function preloadLanguage(langCode) {
  if (!hasLoadedLanguage(langCode)) {
    await i18n.loadLanguages(langCode);
  }
}

export default i18n;
