/**
 * RTL (Right-to-Left) language support for @loyaltydog/i18n
 * TypeScript type definitions
 */

/**
 * Check if a language code is RTL (Right-to-Left)
 * @param langCode - Language code (e.g., 'he', 'ar', 'es-ES')
 * @returns True if the language is RTL
 */
export function isRTL(langCode: string): boolean;

/**
 * Get text direction for a language
 * @param langCode - Language code
 * @returns Text direction for HTML dir attribute
 */
export function getTextDirection(langCode: string): 'ltr' | 'rtl';

/**
 * Conditionally return a CSS class based on RTL
 * @param rtlOrLangCode - Either RTL boolean or language code
 * @param rtlClass - Class to apply for RTL languages
 * @param ltrClass - Class to apply for LTR languages (default: '')
 * @returns The appropriate CSS class
 */
export function rtlClass(
  rtlOrLangCode: string | boolean,
  rtlClass: string,
  ltrClass?: string
): string;

/**
 * Configuration object for rtlClassName
 */
export interface RTLClassNameConfig {
  /** Base class always applied */
  base?: string;
  /** Class applied for RTL languages */
  rtl?: string;
  /** Class applied for LTR languages */
  ltr?: string;
  /** RTL state or language code */
  isRTL?: string | boolean;
}

/**
 * Higher-order component class name utility
 * @param config - Class configuration
 * @returns Combined className string
 */
export function rtlClassName(config: RTLClassNameConfig): string;

/**
 * CSS style object with spacing properties
 */
export interface SpacingStyles {
  marginLeft?: string | number;
  marginRight?: string | number;
  paddingLeft?: string | number;
  paddingRight?: string | number;
  borderLeftWidth?: string | number;
  borderRightWidth?: string | number;
  borderLeftColor?: string;
  borderRightColor?: string;
  borderLeftStyle?: string;
  borderRightStyle?: string;
  [key: string]: string | number | undefined;
}

/**
 * Mirror spacing values for RTL layouts
 * @param styles - CSS style object
 * @param isRtl - Whether the layout is RTL
 * @returns Mirrored style object
 */
export function rtlSpacing(styles: SpacingStyles, isRtl: boolean): SpacingStyles;

/**
 * Return type for useRTL hook
 */
export interface UseRTLReturn {
  /** Whether current language is RTL */
  isRTL: boolean;
  /** Text direction for HTML dir attribute */
  dir: 'ltr' | 'rtl';
  /** Class selector function */
  rtlClass: (rtlCls: string, ltrCls?: string) => string;
  /** Style mirroring function */
  rtlSpacing: (styles: SpacingStyles) => SpacingStyles;
}

/**
 * React hook for RTL detection
 * @returns RTL utilities object
 */
export function useRTL(): UseRTLReturn;

/**
 * Get all supported RTL language codes
 * @returns Array of RTL language codes
 */
export function getRTLLanguages(): string[];

/**
 * Add a custom RTL language code
 * @param langCode - Base language code to add
 */
export function addRTLLanguage(langCode: string): void;

/**
 * Check if a specific language is in the RTL languages list
 * @param langCode - Language code to check
 * @returns True if the language is a known RTL language
 */
export function isRTLLanguage(langCode: string): boolean;
