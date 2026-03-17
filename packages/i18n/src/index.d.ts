/**
 * Type definitions for @loyaltydog/i18n
 */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export declare const LOCALES_PATH: string;
export declare const SUPPORTED_LANGUAGES: readonly Language[];
export declare const DEFAULT_LANGUAGE: string;
export declare const NAMESPACES: readonly string[];

export declare function getLanguage(code: string | undefined | null): Language | undefined;
export declare function isLanguageSupported(code: string | undefined | null): boolean;
