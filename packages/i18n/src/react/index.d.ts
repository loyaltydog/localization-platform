/**
 * TypeScript definitions for @loyaltydog/i18n/react
 */

import { i18n, TFunction, InitOptions } from 'i18next';
import { UseTranslationResponse } from 'react-i18next';
import { ReactNode } from 'react';

// Re-export from react-i18next
export { Trans, withTranslation } from 'react-i18next';

// Language types
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export declare const SUPPORTED_LANGUAGES: Language[];
export declare const DEFAULT_LANGUAGE: string;
export declare const NAMESPACES: string[];

export declare function getLanguage(code: string): Language | undefined;
export declare function isLanguageSupported(code: string): boolean;

// RTL utilities
export declare function isRTL(langCode: string): boolean;
export declare function getTextDirection(langCode: string): 'ltr' | 'rtl';
export declare function rtlClass(langCode: string, rtlClass: string, ltrClass?: string): string;

// i18next configuration
export interface I18nConfig extends InitOptions {
  detection?: {
    order?: string[];
    lookupQuerystring?: string;
    lookupLocalStorage?: string;
    caches?: string[];
  };
  backend?: {
    loadPath?: string;
  };
}

export declare const defaultConfig: I18nConfig;

export declare function initI18n(overrides?: Partial<I18nConfig>): Promise<i18n>;
export declare function getI18n(): i18n;
export declare function changeLanguage(langCode: string): Promise<void>;
export declare function getCurrentLanguage(): string;
export declare function hasLoadedLanguage(langCode: string, namespace?: string): boolean;
export declare function preloadLanguage(langCode: string): Promise<void>;

// Provider component
export interface I18nProviderProps {
  children: ReactNode;
  loadPath?: string;
  defaultLanguage?: string;
  config?: Partial<I18nConfig>;
  fallback?: ReactNode;
}

export declare function I18nProvider(props: I18nProviderProps): JSX.Element;

// Enhanced useTranslation hook
export interface UseTranslationResult {
  t: TFunction;
  i18n: i18n;
  ready: boolean;
  language: string;
  changeLanguage: (langCode: string) => Promise<void>;
  isRTL: boolean;
  textDirection: 'ltr' | 'rtl';
  languages: Language[];
  currentLanguage: Language;
}

export declare function useTranslation(
  namespace?: string | string[],
  options?: object
): UseTranslationResult;

// useLanguages hook
export interface UseLanguagesResult {
  languages: Language[];
  currentCode: string;
  currentLanguage: Language;
  setLanguage: (langCode: string) => Promise<void>;
}

export declare function useLanguages(): UseLanguagesResult;

// useDateFormat hook
export interface UseDateFormatResult {
  formatDate: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatDateTime: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  formatRelative: (date: Date | string | number) => string;
  locale: string;
}

export declare function useDateFormat(): UseDateFormatResult;

// useNumberFormat hook
export interface UseNumberFormatResult {
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string, options?: Intl.NumberFormatOptions) => string;
  formatPercent: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCompact: (number: number, options?: Intl.NumberFormatOptions) => string;
  locale: string;
}

export declare function useNumberFormat(): UseNumberFormatResult;

// Translation key types (for autocomplete)
// These would be generated from the JSON files in a real setup
export type CommonNamespace = 'common';
export type ErrorsNamespace = 'errors';
export type EmailsNamespace = 'emails';
export type NotificationsNamespace = 'notifications';
export type ValidationNamespace = 'validation';
export type Namespace = CommonNamespace | ErrorsNamespace | EmailsNamespace | NotificationsNamespace | ValidationNamespace;
