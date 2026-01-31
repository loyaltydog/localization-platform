/**
 * SMS and Push Notification Helper Functions
 *
 * This module provides helper functions for sending localized SMS and push notifications
 * with proper character limits, fallback logic, and template rendering.
 *
 * @module @loyaltydog/i18n/node/sms-helpers
 *
 * @example
 * ```python
 * # In FastAPI or backend service
 * from @loyaltydog.i18n.node import getSMSMessage, getPushNotification
 * from translation_loader import TranslationLoader
 *
 * # Send SMS with member language preference
 * message = getSMSMessage(member.preferred_language,
 *                         merchant.default_language,
 *                         'pointsEarned',
 *                         points=100,
 *                         balance=500)
 * sms_service.send(member.phone, message)
 *
 * # Send push notification
 * notification = getPushNotification(member.preferred_language,
 *                                    merchant.default_language,
 *                                    'rewardUnlocked',
 *                                    reward_name="Free Coffee")
 * push_service.send(member.device_id, notification)
 * ```
 */

import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '../index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * SMS character limits
 * Standard SMS is 160 chars for GSM-7 encoding
 * Unicode (emojis, non-Latin scripts) is limited to 70 chars
 */
export const SMS_LIMITS = {
  GSM7: 160,
  UNICODE: 70,
  MULTIPLIER: 153, // Chars per segment for multi-part messages (GSM-7)
};

/**
 * Get the appropriate character limit for a message
 * Uses 160 chars for ASCII-only messages, 70 for messages with Unicode
 *
 * @param {string} message - The message to check
 * @returns {number} Character limit (160 for GSM-7, 70 for Unicode)
 */
export function getCharacterLimit(message) {
  // Check for Unicode characters (non-ASCII)
  for (let i = 0; i < message.length; i++) {
    if (message.charCodeAt(i) > 127) {
      return SMS_LIMITS.UNICODE;
    }
  }
  return SMS_LIMITS.GSM7;
}

/**
 * Check if a message fits within SMS limits
 *
 * @param {string} message - The message to check
 * @param {number} [maxSegments=1] - Maximum number of segments allowed
 * @returns {{fits: boolean, segmentCount: number, characterCount: number, characterLimit: number}} Result object
 */
export function checkSMSLimits(message, maxSegments = 1) {
  const charLimit = getCharacterLimit(message);
  const charCount = message.length;

  let segmentCount;
  if (charCount <= charLimit) {
    segmentCount = 1;
  } else {
    segmentCount = Math.ceil(charCount / SMS_LIMITS.MULTIPLIER);
  }

  const segmentLimit = maxSegments === 1 ? charLimit : SMS_LIMITS.MULTIPLIER * maxSegments;

  return {
    fits: charCount <= segmentLimit,
    segmentCount,
    characterCount: charCount,
    characterLimit: segmentLimit,
  };
}

/**
 * Truncate a message to fit within SMS limits
 * Adds ellipsis (...) if truncated
 *
 * @param {string} message - The message to truncate
 * @param {number} [maxSegments=1] - Maximum number of segments allowed
 * @returns {string} Truncated message
 */
export function truncateForSMS(message, maxSegments = 1) {
  const charLimit = getCharacterLimit(message);
  const maxLength = maxSegments === 1 ? charLimit : SMS_LIMITS.MULTIPLIER * maxSegments;

  if (message.length <= maxLength) {
    return message;
  }

  // Truncate and add ellipsis
  return message.substring(0, maxLength - 3) + '...';
}

/**
 * Resolve locale with fallback chain
 *
 * Fallback order: memberLanguage → merchantLanguage → DEFAULT_LANGUAGE
 *
 * @param {string} [memberLanguage] - Member's preferred language
 * @param {string} [merchantLanguage] - Merchant's default language
 * @returns {string} Resolved language code
 *
 * @example
 * ```js
 * resolveLocale('es-ES', 'en') // Returns: 'es-ES'
 * resolveLocale(null, 'en')    // Returns: 'en'
 * resolveLocale(null, null)    // Returns: 'en' (DEFAULT_LANGUAGE)
 * resolveLocale('de', 'en')    // Returns: 'en' (de not supported)
 * ```
 */
export function resolveLocale(memberLanguage = null, merchantLanguage = null) {
  const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code);

  // Try member language first
  if (memberLanguage && supportedCodes.includes(memberLanguage)) {
    return memberLanguage;
  }

  // Try merchant language
  if (merchantLanguage && supportedCodes.includes(merchantLanguage)) {
    return merchantLanguage;
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Load a translation from the notifications namespace
 *
 * @param {string} locale - Language code
 * @param {string} key - Translation key (supports dot notation)
 * @param {Object} [params] - Parameters for interpolation
 * @returns {string} Translated message
 *
 * @example
 * ```js
 * loadNotification('es-ES', 'pointsEarned', { points: 100, balance: 500 })
 * // Returns: "¡Has ganado 100 puntos! Tu saldo es de 500 puntos."
 * ```
 */
export function loadNotification(locale, key, params = {}) {
  const basePath = join(__dirname, '../../locales');
  const filePath = join(basePath, locale, 'notifications.json');

  try {
    const content = readFileSync(filePath, 'utf-8');
    const translations = JSON.parse(content);

    // Navigate nested keys with dot notation
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Key not found, fallback to English
        return loadNotification(DEFAULT_LANGUAGE, key, params);
      }
    }

    // If value is not a string, return key
    if (typeof value !== 'string') {
      return key;
    }

    // Interpolate parameters
    return interpolateParams(value, params);
  } catch (error) {
    // If file not found or error, fallback to English
    if (locale !== DEFAULT_LANGUAGE) {
      return loadNotification(DEFAULT_LANGUAGE, key, params);
    }
    return key; // Ultimate fallback
  }
}

/**
 * Interpolate parameters into a translation string
 * Supports both {{var}} and {{ var }} syntax
 *
 * @param {string} template - Template string with placeholders
 * @param {Object} params - Parameters to interpolate
 * @returns {string} Interpolated string
 *
 * @example
 * ```js
 * interpolateParams('You earned {{points}} points!', { points: 100 })
 * // Returns: "You earned 100 points!"
 * ```
 */
export function interpolateParams(template, params) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

/**
 * Get an SMS message with proper locale resolution and validation
 *
 * @param {string} memberLanguage - Member's preferred language
 * @param {string} merchantLanguage - Merchant's default language
 * @param {string} key - Translation key
 * @param {Object} [params] - Parameters for interpolation
 * @param {Object} [options] - Options
 * @param {number} [options.maxSegments=1] - Maximum SMS segments
 * @param {boolean} [options.truncate=false] - Truncate if over limit
 * @returns {{message: string, locale: string, validation: Object}} Result object
 *
 * @example
 * ```js
 * const result = getSMSMessage('es-ES', 'en', 'sms.pointsEarned',
 *                              { points: 100, merchantName: 'Test', balance: 500 },
 *                              { maxSegments: 1 });
 * console.log(result.message);
 * console.log(result.validation);
 * ```
 */
export function getSMSMessage(memberLanguage, merchantLanguage, key, params = {}, options = {}) {
  const { maxSegments = 1, truncate = false } = options;

  // Resolve locale
  const locale = resolveLocale(memberLanguage, merchantLanguage);

  // Load translation
  let message = loadNotification(locale, key, params);

  // Validate character limits
  const validation = checkSMSLimits(message, maxSegments);

  // Truncate if needed and requested
  if (!validation.fits && truncate) {
    message = truncateForSMS(message, maxSegments);
    validation.truncated = true;
    // Re-validate after truncation
    const revalidation = checkSMSLimits(message, maxSegments);
    validation.segmentCount = revalidation.segmentCount;
    validation.characterCount = revalidation.characterCount;
  } else {
    validation.truncated = false;
  }

  return {
    message,
    locale,
    validation,
  };
}

/**
 * Get a push notification payload with proper locale resolution
 *
 * @param {string} memberLanguage - Member's preferred language
 * @param {string} merchantLanguage - Merchant's default language
 * @param {string} key - Translation key for title
 * @param {string} bodyKey - Translation key for body
 * @param {Object} [params] - Parameters for interpolation
 * @returns {{title: string, body: string, locale: string}} Push notification payload
 *
 * @example
 * ```js
 * const notification = getPushNotification('es-ES', 'en',
 *                                          'rewardTitle',
 *                                          'rewardBody',
 *                                          { reward: 'Free Coffee' });
 * pushService.send(deviceId, notification);
 * ```
 */
export function getPushNotification(memberLanguage, merchantLanguage, key, bodyKey, params = {}) {
  const locale = resolveLocale(memberLanguage, merchantLanguage);

  return {
    title: loadNotification(locale, key, params),
    body: loadNotification(locale, bodyKey, params),
    locale,
  };
}

/**
 * Get push notification with separate title/body params
 *
 * @param {string} memberLanguage - Member's preferred language
 * @param {string} merchantLanguage - Merchant's default language
 * @param {string} key - Translation key
 * @param {Object} [params] - Parameters for interpolation
 * @param {Object} [bodyParams] - Separate parameters for body
 * @returns {{title: string, body: string, locale: string}} Push notification payload
 */
export function getPushNotificationWithParams(memberLanguage, merchantLanguage, key, params = {}, bodyParams = {}) {
  const locale = resolveLocale(memberLanguage, merchantLanguage);

  return {
    title: loadNotification(locale, key, params),
    body: loadNotification(locale, key, bodyParams),
    locale,
  };
}

/**
 * Batch SMS messages for multiple members
 *
 * @param {Array<{memberLanguage: string, merchantLanguage: string}>} recipients
 * @param {string} key - Translation key
 * @param {Object} [params] - Parameters for interpolation
 * @returns {Array<{phone: string, message: string, locale: string}>} Batch results
 */
export function batchSMSMessages(recipients, key, params = {}) {
  return recipients.map(recipient => {
    const { message, locale } = getSMSMessage(
      recipient.memberLanguage,
      recipient.merchantLanguage,
      key,
      params
    );
    return {
      phone: recipient.phone,
      message,
      locale,
    };
  });
}

/**
 * SMS notification templates reference
 * These keys should exist in the notifications.json files
 */
export const SMS_TEMPLATE_KEYS = {
  POINTS_EARNED: 'pointsEarned',
  REWARD_UNLOCKED: 'rewardUnlocked',
  POINTS_EXPIRING: 'pointsExpiring',
  POINTS_EXPIRED: 'pointsExpired',
  WELCOME_MEMBER: 'welcomeMember',
  WELCOME_MERCHANT: 'welcomeMerchant',
  CAMPAIGN_ANNOUNCEMENT: 'campaignAnnouncement',
  TIER_UPGRADED: 'tierUpgraded',
  BIRTHDAY_REWARD: 'birthdayReward',
};

/**
 * Push notification template keys reference
 */
export const PUSH_TEMPLATE_KEYS = {
  ...SMS_TEMPLATE_KEYS,
  ORDER_PLACED: 'orderPlaced',
  ORDER_READY: 'orderReady',
  NEW_PERK: 'newPerk',
  STAMP_COMPLETE: 'stampComplete',
};
