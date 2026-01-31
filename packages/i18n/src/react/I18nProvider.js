/**
 * React Provider component for i18next
 * @module @loyaltydog/i18n/react
 */

import React, { useEffect, useState, useRef } from 'react';
import { I18nextProvider } from 'react-i18next';
import { initI18n, getI18n } from './i18n-config.js';

/**
 * I18nProvider component - wraps your app with i18next context
 *
 * @example
 * ```jsx
 * import { I18nProvider } from '@loyaltydog/i18n/react';
 *
 * function App() {
 *   return (
 *     <I18nProvider loadPath="/api/translations/{{lng}}/{{ns}}">
 *       <YourApp />
 *     </I18nProvider>
 *   );
 * }
 * ```
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} [props.loadPath] - Path template for loading translations
 * @param {string} [props.defaultLanguage] - Default language code
 * @param {Object} [props.config] - Additional i18next config overrides
 * @param {React.ReactNode} [props.fallback] - Fallback UI while loading
 */
export function I18nProvider({
  children,
  loadPath,
  defaultLanguage,
  config = {},
  fallback = null,
}) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [i18nInstance, setI18nInstance] = useState(null);
  const initializedRef = useRef(false);
  // Store config in ref to avoid dependency on object reference
  const configRef = useRef(config);

  useEffect(() => {
    // Prevent re-initialization
    if (initializedRef.current) {
      return;
    }
    // Mark as initializing synchronously to prevent race conditions
    initializedRef.current = true;

    const overrides = { ...configRef.current };

    if (loadPath) {
      overrides.backend = { loadPath };
    }

    if (defaultLanguage) {
      overrides.lng = defaultLanguage;
    }

    initI18n(overrides)
      .then(() => {
        setI18nInstance(getI18n());
        setIsReady(true);
      })
      .catch((err) => {
        console.error('Failed to initialize i18n:', err);
        setError(err);
      });
  }, [loadPath, defaultLanguage]);

  if (error) {
    return fallback;
  }

  if (!isReady || !i18nInstance) {
    return fallback;
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
      {children}
    </I18nextProvider>
  );
}

export default I18nProvider;
