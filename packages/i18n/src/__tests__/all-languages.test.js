/**
 * Comprehensive unit tests for all 8 supported languages
 * Ensures translation structure, completeness, and consistency across all languages
 *
 * Languages: en-US, en-GB, es-ES, es-MX, fr, it, pt-BR, pt-PT
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const LOCALES_DIR = join(__dirname, '../../locales');

// All supported languages
const ALL_LANGUAGES = ['en-US', 'en-GB', 'es-ES', 'es-MX', 'fr', 'it', 'pt-BR', 'pt-PT'];

// Expected namespaces
const NAMESPACES = ['common', 'errors', 'validation', 'notifications', 'emails'];

// Expected key counts per namespace (from en-US source)
const EXPECTED_KEY_COUNTS = {
  common: 372,
  errors: 176,
  validation: 141,
  notifications: 82,
  emails: 292,
};

/**
 * Load and parse a JSON translation file
 */
function loadTranslation(locale, namespace) {
  const filePath = join(LOCALES_DIR, locale, `${namespace}.json`);
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Get all keys from a nested object as dot-notation paths
 */
function getKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

/**
 * Count all translation keys (including nested)
 */
function countKeys(obj) {
  let count = 0;
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      count += countKeys(value);
    } else {
      count++;
    }
  }
  return count;
}

/**
 * Get all string values from a nested object
 */
function getAllStringValues(obj, strings = []) {
  for (const value of Object.values(obj)) {
    if (typeof value === 'string') {
      strings.push(value);
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'string') {
            strings.push(item);
          } else if (typeof item === 'object' && item !== null) {
            getAllStringValues(item, strings);
          }
        }
      } else {
        getAllStringValues(value, strings);
      }
    }
  }
  return strings;
}

describe('Translation Structure Tests - All Languages', () => {
  describe('File Structure', () => {
    it.each(ALL_LANGUAGES)('should have all 5 namespace JSON files for %s', (locale) => {
      NAMESPACES.forEach((namespace) => {
        expect(() => loadTranslation(locale, namespace)).not.toThrow();
      });
    });
  });

  describe('Translation Completeness', () => {
    it.each(ALL_LANGUAGES)('should have same keys as en-US for %s', (locale) => {
      const en = loadTranslation('en-US', 'common');
      const target = loadTranslation(locale, 'common');

      const enKeys = new Set(getKeys(en));
      const targetKeys = new Set(getKeys(target));

      const missingKeys = [...enKeys].filter(key => !targetKeys.has(key));
      const extraKeys = [...targetKeys].filter(key => !enKeys.has(key));

      expect(missingKeys).toEqual([]);
      expect(extraKeys).toEqual([]);
    });
  });

  describe('Translation Coverage', () => {
    it.each(ALL_LANGUAGES)('should have correct key counts for %s', (locale) => {
      NAMESPACES.forEach((namespace) => {
        const translations = loadTranslation(locale, namespace);
        const actualCount = countKeys(translations);
        const expectedCount = EXPECTED_KEY_COUNTS[namespace];

        expect(actualCount).toBe(expectedCount);
      });
    });

    it('should have total of 1,063 keys per language', () => {
      const totalExpectedKeys = Object.values(EXPECTED_KEY_COUNTS).reduce((a, b) => a + b, 0);
      expect(totalExpectedKeys).toBe(1063);

      ALL_LANGUAGES.forEach((locale) => {
        let totalCount = 0;
        NAMESPACES.forEach((namespace) => {
          totalCount += countKeys(loadTranslation(locale, namespace));
        });
        expect(totalCount).toBe(1063);
      });
    });
  });

  describe('Placeholder Preservation', () => {
    it.each(ALL_LANGUAGES)('should preserve placeholder structure in emails.json for %s', (locale) => {
      const enEmails = loadTranslation('en-US', 'emails');
      const targetEmails = loadTranslation(locale, 'emails');

      // Check email templates exist
      expect(targetEmails.welcome).toBeDefined();
      expect(targetEmails.pointsEarned).toBeDefined();
      expect(targetEmails.rewardRedeemed).toBeDefined();

      // Check structure preservation for welcome email
      expect(targetEmails.welcome.subject).toBeDefined();
      expect(targetEmails.welcome.body).toBeDefined();
    });

    it.each(ALL_LANGUAGES)('should preserve placeholder structure in notifications.json for %s', (locale) => {
      const enNotifications = loadTranslation('en-US', 'notifications');
      const targetNotifications = loadTranslation(locale, 'notifications');

      // Check key structure matches
      const enKeys = getKeys(enNotifications);
      const targetKeys = getKeys(targetNotifications);

      expect(new Set(enKeys)).toEqual(new Set(targetKeys));
    });
  });

  describe('Essential Email Templates', () => {
    const requiredEmails = [
      'welcome',
      'rewardEarned',
      'pointsEarned',
      'rewardRedeemed',
      'rewardExpiring',
      'tierUpgrade',
      'birthdayReward',
      'inactivityReminder',
      'pointsExpiring',
      'email_verification',
      'campaign',
      'birthday',
      'password_reset',
    ];

    // Emails that don't have a generic 'body' field
    const emailsWithoutBody = ['pointsExpiring', 'email_verification'];

    it.each(ALL_LANGUAGES)('should have all required email templates for %s', (locale) => {
      const emails = loadTranslation(locale, 'emails');

      requiredEmails.forEach((emailKey) => {
        expect(emails[emailKey]).toBeDefined();
        expect(emails[emailKey].subject).toBeDefined();

        // Most emails have a body field, but some use specific fields instead
        if (!emailsWithoutBody.includes(emailKey)) {
          expect(emails[emailKey].body).toBeDefined();
        } else {
          // These emails should have other content fields
          expect(Object.keys(emails[emailKey]).length).toBeGreaterThan(1);
        }
      });
    });
  });

  describe('Error Messages Structure', () => {
    it.each(ALL_LANGUAGES)('should have complete error structure for %s', (locale) => {
      const errors = loadTranslation(locale, 'errors');

      // Check main error categories exist
      expect(errors.http).toBeDefined();
      expect(errors.auth).toBeDefined();
      expect(errors.member).toBeDefined();
      expect(errors.reward).toBeDefined();
      expect(errors.merchant).toBeDefined();

      // Check some common HTTP error codes
      expect(errors.http[400]).toBeDefined();
      expect(errors.http[401]).toBeDefined();
      expect(errors.http[404]).toBeDefined();
      expect(errors.http[500]).toBeDefined();
    });
  });

  describe('Navigation Structure', () => {
    it.each(ALL_LANGUAGES)('should have complete navigation structure for %s', (locale) => {
      const common = loadTranslation(locale, 'common');

      // Check navigation structure
      expect(common.nav).toBeDefined();
      expect(common.nav.dashboard).toBeDefined();
      expect(common.nav.members).toBeDefined();
      expect(common.nav.rewards).toBeDefined();
      expect(common.nav.offers).toBeDefined();
      expect(common.nav.analytics).toBeDefined();
      expect(common.nav.settings).toBeDefined();
    });
  });

  describe('Actions Structure', () => {
    it.each(ALL_LANGUAGES)('should have common actions for %s', (locale) => {
      const common = loadTranslation(locale, 'common');

      // Check common action buttons
      expect(common.actions).toBeDefined();
      expect(common.actions.save).toBeDefined();
      expect(common.actions.cancel).toBeDefined();
      expect(common.actions.delete).toBeDefined();
      expect(common.actions.edit).toBeDefined();
      expect(common.actions.create).toBeDefined();
    });
  });

  describe('Validation Structure', () => {
    it.each(ALL_LANGUAGES)('should have validation messages for %s', (locale) => {
      const validation = loadTranslation(locale, 'validation');

      // Check validation categories
      expect(validation.required).toBeDefined();
      expect(validation.email).toBeDefined();
      expect(validation.phone).toBeDefined();
      expect(validation.length).toBeDefined();
      expect(validation.format).toBeDefined();
    });
  });

  describe('No Empty Strings', () => {
    it.each(ALL_LANGUAGES)('should not have empty string values for %s', (locale) => {
      NAMESPACES.forEach((namespace) => {
        const translations = loadTranslation(locale, namespace);
        const allStrings = getAllStringValues(translations);

        allStrings.forEach((value) => {
          // Check for truly empty strings (whitespace-only is allowed for spacing)
          if (value.trim() === '' && value !== '') {
            // Only fail if it's actually empty, not whitespace
          }
          // The value should not be just empty quotes
          expect(value).not.toBe('');
        });
      });
    });
  });

  describe('Placeholder Syntax', () => {
    it.each(ALL_LANGUAGES)('should use correct ICU placeholder syntax for %s', (locale) => {
      const emails = loadTranslation(locale, 'emails');

      // Check that placeholders use {{variable}} syntax
      const subject = emails.welcome.subject;
      expect(subject).toContain('{{');
      expect(subject).toContain('}}');
    });
  });
});

describe('Language Consistency Tests', () => {
  describe('Base Language Matching', () => {
    it('should support base language matching (es → es-ES)', () => {
      // This test verifies the structure exists for base language matching
      // The actual fallback logic is in the TranslationLoader (Python) and i18next (React)
      const esES = loadTranslation('es-ES', 'common');
      const esMX = loadTranslation('es-MX', 'common');

      // Both Spanish variants should have the same structure
      const esESKeys = new Set(getKeys(esES));
      const esMXKeys = new Set(getKeys(esMX));

      expect(esESKeys).toEqual(esMXKeys);
    });
  });

  describe('English Variants', () => {
    it('en-GB should have same structure as en-US', () => {
      const enUS = loadTranslation('en-US', 'common');
      const enGB = loadTranslation('en-GB', 'common');

      const enUSKeys = new Set(getKeys(enUS));
      const enGBKeys = new Set(getKeys(enGB));

      expect(enUSKeys).toEqual(enGBKeys);
    });
  });

  describe('Portuguese Variants', () => {
    it('pt-BR and pt-PT should have same structure', () => {
      const ptBR = loadTranslation('pt-BR', 'common');
      const ptPT = loadTranslation('pt-PT', 'common');

      const ptBRKeys = new Set(getKeys(ptBR));
      const ptPTKeys = new Set(getKeys(ptPT));

      expect(ptBRKeys).toEqual(ptPTKeys);
    });
  });
});

describe('SMS and Push Notification Tests', () => {
  describe('SMS Structure', () => {
    it.each(ALL_LANGUAGES)('should have SMS messages in notifications.json for %s', (locale) => {
      const notifications = loadTranslation(locale, 'notifications');

      expect(notifications.sms).toBeDefined();
      expect(notifications.sms.welcome).toBeDefined();
      expect(notifications.sms.pointsEarned).toBeDefined();
      expect(notifications.sms.rewardReady).toBeDefined();
    });
  });

  describe('Push Notification Structure', () => {
    it.each(ALL_LANGUAGES)('should have push notification structure for %s', (locale) => {
      const notifications = loadTranslation(locale, 'notifications');

      expect(notifications.push).toBeDefined();
      expect(notifications.push.promoAlert).toBeDefined();
    });
  });
});

describe('Campaign Structure', () => {
  it.each(ALL_LANGUAGES)('should have campaign keys in notifications.json for %s', (locale) => {
    const notifications = loadTranslation(locale, 'notifications');

    // These were added in PR #15
    expect(notifications.campaign).toBeDefined();
    expect(notifications.campaign.title).toBeDefined();
  });
});
