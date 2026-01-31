/**
 * React/i18next integration for @loyaltydog/i18n
 *
 * @example
 * ```jsx
 * // In your app entry point
 * import { I18nProvider } from '@loyaltydog/i18n/react';
 *
 * function App() {
 *   return (
 *     <I18nProvider>
 *       <YourApp />
 *     </I18nProvider>
 *   );
 * }
 *
 * // In your components
 * import { useTranslation } from '@loyaltydog/i18n/react';
 *
 * function Dashboard() {
 *   const { t, changeLanguage, isRTL } = useTranslation('common');
 *
 *   return (
 *     <div dir={isRTL ? 'rtl' : 'ltr'}>
 *       <h1>{t('nav.dashboard')}</h1>
 *     </div>
 *   );
 * }
 * ```
 *
 * @module @loyaltydog/i18n/react
 */

// Re-export from react-i18next for convenience
export { Trans, withTranslation } from 'react-i18next';

// Configuration and initialization
export {
  initI18n,
  getI18n,
  changeLanguage,
  getCurrentLanguage,
  hasLoadedLanguage,
  preloadLanguage,
  defaultConfig,
} from './i18n-config.js';

// Provider component
export { I18nProvider } from './I18nProvider.js';

// Custom hooks
export {
  useTranslation,
  useLanguages,
  useDateFormat,
  useNumberFormat,
} from './hooks.js';

// Re-export core utilities
export {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  NAMESPACES,
  getLanguage,
  isLanguageSupported,
} from '../index.js';

// Re-export RTL utilities
export { isRTL, getTextDirection, rtlClass } from '../rtl/index.js';
