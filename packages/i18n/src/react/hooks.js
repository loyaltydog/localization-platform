/**
 * Custom React hooks for i18next
 * @module @loyaltydog/i18n/react
 */

import { useCallback, useMemo } from 'react';
import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLanguage } from '../index.js';
import { isRTL, getTextDirection } from '../rtl/index.js';
import { changeLanguage as configChangeLanguage } from './i18n-config.js';

/**
 * Enhanced useTranslation hook with additional utilities
 *
 * @example
 * ```jsx
 * function MyComponent() {
 *   const { t, language, changeLanguage, isRTL } = useTranslation('common');
 *
 *   return (
 *     <div dir={isRTL ? 'rtl' : 'ltr'}>
 *       <h1>{t('nav.dashboard')}</h1>
 *       <button onClick={() => changeLanguage('es-ES')}>
 *         {t('actions.switchLanguage')}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param {string|string[]} [namespace='common'] - Namespace(s) to use
 * @param {Object} [options] - i18next useTranslation options
 * @returns {Object} Translation utilities
 */
export function useTranslation(namespace = 'common', options = {}) {
  const { t, i18n, ready } = useI18nextTranslation(namespace, options);

  const language = i18n.language || DEFAULT_LANGUAGE;

  const changeLanguage = useCallback(
    (langCode) => {
      return configChangeLanguage(langCode);
    },
    []
  );

  const isCurrentRTL = useMemo(() => isRTL(language), [language]);
  const textDirection = useMemo(() => getTextDirection(language), [language]);

  const languages = useMemo(() => SUPPORTED_LANGUAGES, []);

  const currentLanguage = useMemo(
    () => getLanguage(language) || SUPPORTED_LANGUAGES[0],
    [language]
  );

  return {
    // Core i18next returns
    t,
    i18n,
    ready,

    // Enhanced utilities
    language,
    changeLanguage,
    isRTL: isCurrentRTL,
    textDirection,
    languages,
    currentLanguage,
  };
}

/**
 * Hook to get available languages
 *
 * @example
 * ```jsx
 * function LanguagePicker() {
 *   const { languages, currentCode, setLanguage } = useLanguages();
 *
 *   return (
 *     <select value={currentCode} onChange={(e) => setLanguage(e.target.value)}>
 *       {languages.map((lang) => (
 *         <option key={lang.code} value={lang.code}>
 *           {lang.flag} {lang.nativeName}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 *
 * @returns {Object} Language utilities
 */
export function useLanguages() {
  const { i18n } = useI18nextTranslation();

  const currentCode = i18n.language || DEFAULT_LANGUAGE;

  const setLanguage = useCallback(
    (langCode) => {
      return configChangeLanguage(langCode);
    },
    []
  );

  const currentLanguage = useMemo(
    () => getLanguage(currentCode) || SUPPORTED_LANGUAGES[0],
    [currentCode]
  );

  return {
    languages: SUPPORTED_LANGUAGES,
    currentCode,
    currentLanguage,
    setLanguage,
  };
}

/**
 * Hook for formatting dates according to current locale
 *
 * @example
 * ```jsx
 * function DateDisplay({ date }) {
 *   const { formatDate, formatRelative } = useDateFormat();
 *
 *   return (
 *     <div>
 *       <span>{formatDate(date)}</span>
 *       <span>{formatRelative(date)}</span>
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns {Object} Date formatting utilities
 */
export function useDateFormat() {
  const { i18n } = useI18nextTranslation();
  const locale = i18n.language || DEFAULT_LANGUAGE;

  const formatDate = useCallback(
    (date, options = {}) => {
      const dateObj = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        ...options,
      }).format(dateObj);
    },
    [locale]
  );

  const formatTime = useCallback(
    (date, options = {}) => {
      const dateObj = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(locale, {
        timeStyle: 'short',
        ...options,
      }).format(dateObj);
    },
    [locale]
  );

  const formatDateTime = useCallback(
    (date, options = {}) => {
      const dateObj = date instanceof Date ? date : new Date(date);
      return new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
        ...options,
      }).format(dateObj);
    },
    [locale]
  );

  const formatRelative = useCallback(
    (date) => {
      const dateObj = date instanceof Date ? date : new Date(date);
      const now = new Date();
      const diffInSeconds = Math.floor((now - dateObj) / 1000);

      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

      if (Math.abs(diffInSeconds) < 60) {
        return rtf.format(-diffInSeconds, 'second');
      }
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (Math.abs(diffInMinutes) < 60) {
        return rtf.format(-diffInMinutes, 'minute');
      }
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (Math.abs(diffInHours) < 24) {
        return rtf.format(-diffInHours, 'hour');
      }
      const diffInDays = Math.floor(diffInHours / 24);
      if (Math.abs(diffInDays) < 30) {
        return rtf.format(-diffInDays, 'day');
      }
      const diffInMonths = Math.floor(diffInDays / 30);
      if (Math.abs(diffInMonths) < 12) {
        return rtf.format(-diffInMonths, 'month');
      }
      const diffInYears = Math.floor(diffInDays / 365);
      return rtf.format(-diffInYears, 'year');
    },
    [locale]
  );

  return {
    formatDate,
    formatTime,
    formatDateTime,
    formatRelative,
    locale,
  };
}

/**
 * Hook for formatting numbers and currency according to current locale
 *
 * @example
 * ```jsx
 * function PriceDisplay({ amount, currency }) {
 *   const { formatCurrency, formatNumber } = useNumberFormat();
 *
 *   return (
 *     <div>
 *       <span>{formatCurrency(amount, currency)}</span>
 *       <span>{formatNumber(1234567.89)}</span>
 *     </div>
 *   );
 * }
 * ```
 *
 * @returns {Object} Number formatting utilities
 */
export function useNumberFormat() {
  const { i18n } = useI18nextTranslation();
  const locale = i18n.language || DEFAULT_LANGUAGE;

  const formatNumber = useCallback(
    (number, options = {}) => {
      return new Intl.NumberFormat(locale, options).format(number);
    },
    [locale]
  );

  const formatCurrency = useCallback(
    (amount, currency = 'USD', options = {}) => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        ...options,
      }).format(amount);
    },
    [locale]
  );

  const formatPercent = useCallback(
    (number, options = {}) => {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        ...options,
      }).format(number);
    },
    [locale]
  );

  const formatCompact = useCallback(
    (number, options = {}) => {
      return new Intl.NumberFormat(locale, {
        notation: 'compact',
        ...options,
      }).format(number);
    },
    [locale]
  );

  return {
    formatNumber,
    formatCurrency,
    formatPercent,
    formatCompact,
    locale,
  };
}
