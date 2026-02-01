/**
 * Unit tests for SMS Helpers
 * Run with: npm test -- src/node/__tests__/sms-helpers.test.js
 */

import { describe, it, expect } from 'vitest';
import {
  getCharacterLimit,
  checkSMSLimits,
  truncateForSMS,
  resolveLocale,
  loadNotification,
  interpolateParams,
  getSMSMessage,
  getPushNotification,
  SMS_LIMITS,
  SMS_TEMPLATE_KEYS,
  PUSH_TEMPLATE_KEYS,
} from '../sms-helpers.js';

describe('SMS Helpers', () => {
  describe('getCharacterLimit', () => {
    it('should return 160 for ASCII-only messages', () => {
      expect(getCharacterLimit('Hello World')).toBe(SMS_LIMITS.GSM7);
      expect(getCharacterLimit('Points: 100, Balance: 500')).toBe(SMS_LIMITS.GSM7);
    });

    it('should return 70 for Unicode messages', () => {
      expect(getCharacterLimit('Hello 👋')).toBe(SMS_LIMITS.UNICODE);
      expect(getCharacterLimit('¡Hola!')).toBe(SMS_LIMITS.UNICODE);
      expect(getCharacterLimit('你好')).toBe(SMS_LIMITS.UNICODE);
    });
  });

  describe('checkSMSLimits', () => {
    it('should validate short ASCII messages', () => {
      const result = checkSMSLimits('Hello World');
      expect(result.fits).toBe(true);
      expect(result.segmentCount).toBe(1);
      expect(result.characterCount).toBe(11);
    });

    it('should validate long ASCII messages', () => {
      const longMessage = 'A'.repeat(170);
      const result = checkSMSLimits(longMessage);
      expect(result.fits).toBe(false);
      expect(result.segmentCount).toBe(2);
    });

    it('should validate Unicode messages', () => {
      const message = '¡Hola! You have earned 100 points.';
      const result = checkSMSLimits(message);
      expect(result.characterLimit).toBe(SMS_LIMITS.UNICODE);
    });

    it('should handle multi-segment limits', () => {
      const longMessage = 'A'.repeat(300);
      const result = checkSMSLimits(longMessage, 2);
      expect(result.segmentCount).toBe(2);
      expect(result.characterLimit).toBe(SMS_LIMITS.MULTIPLIER * 2);
    });
  });

  describe('truncateForSMS', () => {
    it('should not truncate short messages', () => {
      const message = 'Hello World';
      expect(truncateForSMS(message)).toBe(message);
    });

    it('should truncate long messages', () => {
      const longMessage = 'A'.repeat(170);
      const truncated = truncateForSMS(longMessage);
      expect(truncated.length).toBe(157 + 3); // 157 chars + '...' (160 - 3 for ellipsis)
      expect(truncated.endsWith('...')).toBe(true);
    });

    it('should handle Unicode messages', () => {
      const longMessage = '¡'.repeat(80);
      const truncated = truncateForSMS(longMessage);
      expect(truncated.length).toBeLessThan(80);
    });
  });

  describe('resolveLocale', () => {
    it('should use member language when supported', () => {
      expect(resolveLocale('es-ES', 'en')).toBe('es-ES');
    });

    it('should fallback to merchant language', () => {
      expect(resolveLocale(null, 'es-ES')).toBe('es-ES');
      expect(resolveLocale('de', 'es-ES')).toBe('es-ES');
    });

    it('should fallback to default language', () => {
      expect(resolveLocale(null, null)).toBe('en-US');
      expect(resolveLocale('de', null)).toBe('en-US');
      expect(resolveLocale(null, 'de')).toBe('en-US');
    });
  });

  describe('loadNotification', () => {
    it('should load English (US) notification', () => {
      const result = loadNotification('en-US', 'sms.pointsEarned', { points: '100', merchantName: 'Test Store', balance: '500' });
      expect(result).toContain('100');
      expect(result).toContain('500');
    });

    it('should load Spanish notification', () => {
      const result = loadNotification('es-ES', 'sms.pointsEarned', { points: '100', merchantName: 'Test Store', balance: '500' });
      expect(result).toContain('100');
      expect(result).toContain('500');
    });

    it('should fallback to English (US) for unsupported language', () => {
      const result = loadNotification('de', 'sms.pointsEarned', { points: '100', merchantName: 'Test Store', balance: '500' });
      expect(result).toBeDefined();
    });

    it('should handle missing keys gracefully', () => {
      const result = loadNotification('en-US', 'nonexistent.key', { points: '100' });
      expect(result).toBe('nonexistent.key');
    });
  });

  describe('interpolateParams', () => {
    it('should replace single parameter', () => {
      const result = interpolateParams('You earned {{points}} points!', { points: 100 });
      expect(result).toBe('You earned 100 points!');
    });

    it('should replace multiple parameters', () => {
      const result = interpolateParams('{{greeting}}, you have {{points}} points!', {
        greeting: 'Hello',
        points: 100,
      });
      expect(result).toBe('Hello, you have 100 points!');
    });

    it('should handle spaces in placeholders', () => {
      const result = interpolateParams('Hello {{ name }}', { name: 'World' });
      expect(result).toBe('Hello World');
    });

    it('should keep unreplaced placeholders', () => {
      const result = interpolateParams('Hello {{name}}', {});
      expect(result).toBe('Hello {{name}}');
    });

    it('should convert numbers to strings', () => {
      const result = interpolateParams('Points: {{points}}', { points: 100.5 });
      expect(result).toBe('Points: 100.5');
    });
  });

  describe('getSMSMessage', () => {
    it('should get message with locale resolution', () => {
      const result = getSMSMessage('es-ES', 'en-US', 'sms.pointsEarned', { points: '100', merchantName: 'Test Store', balance: '500' });
      expect(result.message).toBeDefined();
      expect(result.locale).toBe('es-ES');
      expect(result.validation).toBeDefined();
    });

    it('should validate character limits', () => {
      const result = getSMSMessage('en-US', 'en-US', 'sms.pointsEarned', { points: '100', merchantName: 'Test', balance: '500' });
      expect(result.validation.fits).toBe(true);
      expect(result.validation.segmentCount).toBe(1);
    });

    it('should truncate when requested', () => {
      // Create a very long message
      const result = getSMSMessage('en-US', 'en-US', 'sms.promoAlert',
        { merchantName: 'Test', promoMessage: 'X'.repeat(200) },
        { truncate: true, maxSegments: 1 }
      );
      expect(result.validation.truncated).toBe(true);
    });
  });

  describe('getPushNotification', () => {
    it('should get push notification with title and body', () => {
      const result = getPushNotification('es-ES', 'en-US', 'sms.pointsEarned', 'sms.pointsEarned', { points: '100' });
      expect(result.title).toBeDefined();
      expect(result.body).toBeDefined();
      expect(result.locale).toBe('es-ES');
    });
  });

  describe('Template Keys', () => {
    it('should have SMS template keys', () => {
      expect(SMS_TEMPLATE_KEYS.POINTS_EARNED).toBe('pointsEarned');
      expect(SMS_TEMPLATE_KEYS.REWARD_UNLOCKED).toBe('rewardUnlocked');
    });

    it('should have push notification template keys', () => {
      expect(PUSH_TEMPLATE_KEYS.ORDER_PLACED).toBe('orderPlaced');
      expect(PUSH_TEMPLATE_KEYS.ORDER_READY).toBe('orderReady');
    });
  });
});
