/**
 * Node.js/Python backend integration for @loyaltydog/i18n
 *
 * This module provides translation loading capabilities and API helpers
 * for backend services (FastAPI, Express, etc.).
 *
 * Python Module:
 *   The Python translation loader is located at:
 *   src/node/translation_loader.py
 *
 *   Python Usage Example:
 *   ```python
 *   from translation_loader import TranslationLoader, translate
 *
 *   # Using the class directly
 *   translator = TranslationLoader()
 *   subject = translator.translate('es', 'emails', 'welcome.subject',
 *                                  merchantName="Mi Tienda")
 *
 *   # Or using the convenience function
 *   subject = translate('es', 'emails', 'welcome.subject',
 *                      merchantName="Mi Tienda")
 *   ```
 *
 * JavaScript/Node.js API Helpers:
 *   See api-helpers.js for language detection, translation retrieval,
 *   and API response formatting.
 *
 *   JS Usage Example:
 *   ```js
 *   import {
 *     detectBrowserLanguage,
 *     getSupportedLanguagesForAPI,
 *     getTranslationsForAPI
 *   } from '@loyaltydog/i18n/node';
 *
 *   const acceptLang = request.headers.get('accept-language');
 *   const detectedLang = detectBrowserLanguage(acceptLang);
 *   const languages = getSupportedLanguagesForAPI();
 *   const translations = await getTranslationsForAPI(detectedLang);
 *   ```
 *
 * SMS/Push Notification Helpers:
 *   See sms-helpers.js for SMS character limits, locale resolution,
 *   and message formatting.
 *
 *   JS Usage Example:
 *   ```js
 *   import { getSMSMessage, getPushNotification } from '@loyaltydog/i18n/node';
 *
 *   const sms = getSMSMessage(member.preferred_language,
 *                            merchant.default_language,
 *                            'sms.pointsEarned',
 *                            { points: '100', merchantName: 'My Store', balance: '500' });
 *   smsService.send(member.phone, sms.message);
 *   ```
 *
 * @module @loyaltydog/i18n/node
 * @see https://github.com/loyaltydog/localization-platform
 */

// Export Python module info (for documentation)
export const pythonModule = {
  path: './src/node/translation_loader.py',
  description: 'Python translation loader for FastAPI backend integration'
};

// Export API helpers
export {
  parseAcceptLanguage,
  detectBrowserLanguage,
  getSupportedLanguagesForAPI,
  getTranslationsForAPI,
  getNamespaceTranslations,
  isLanguageSupported,
  getDefaultLanguage,
  buildLanguagePreference,
  formatLanguagePreference,
  getMigrationSQL,
} from './api-helpers.js';

// Export SMS/Push notification helpers
export {
  getCharacterLimit,
  checkSMSLimits,
  truncateForSMS,
  resolveLocale,
  loadNotification,
  interpolateParams,
  getSMSMessage,
  getPushNotification,
  getPushNotificationWithParams,
  batchSMSMessages,
  SMS_LIMITS,
  SMS_TEMPLATE_KEYS,
  PUSH_TEMPLATE_KEYS,
} from './sms-helpers.js';

