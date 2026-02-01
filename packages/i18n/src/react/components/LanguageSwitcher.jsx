/**
 * Language Switcher Component
 *
 * A dropdown component for switching between supported languages.
 * Displays available languages with their flags and native names.
 *
 * @module @loyaltydog/i18n/react/components
 *
 * @example
 * ```jsx
 * import { LanguageSwitcher } from '@loyaltydog/i18n/react';
 *
 * function Header() {
 *   return (
 *     <header>
 *       <Logo />
 *       <LanguageSwitcher />
 *       <UserMenu />
 *     </header>
 *   );
 * }
 * ```
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../hooks.js';
import { SUPPORTED_LANGUAGES } from '../../index.js';

/**
 * Language Switcher Dropdown Component
 *
 * Features:
 * - Shows current language with flag
 * - Dropdown with all available languages
 * - Optimistic UI update (switches immediately)
 * - Mobile-responsive design
 * - Accessible with ARIA labels and keyboard navigation
 * - Click outside to close
 */
export function LanguageSwitcher({ className = '', onLanguageChange = null }) {
  const { i18n, language: currentLang = 'en', changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Find current language object
  const currentLanguage = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === currentLang || currentLang.startsWith(lang.code)
  ) || SUPPORTED_LANGUAGES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle language selection
  const handleLanguageSelect = async (langCode) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }

    // Optimistic UI update - update immediately
    try {
      await changeLanguage(langCode);

      // Call optional callback for persistence
      if (onLanguageChange) {
        onLanguageChange(langCode);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }

    setIsOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (!isOpen) {
        event.preventDefault();
        setIsOpen(true);
      }
    }
  };

  const currentLangName = currentLanguage?.nativeName || currentLanguage?.name || 'Language';

  return (
    <div className={`ld-lang-switcher ${className}`}>
      <button
        ref={buttonRef}
        className="ld-lang-switcher__button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        type="button"
      >
        <span className="ld-lang-switcher__flag" role="img" aria-label={currentLanguage?.name || 'Current language'}>
          {currentLanguage?.flag || '🌐'}
        </span>
        <span className="ld-lang-switcher__current">
          {currentLangName}
        </span>
        <svg
          className={`ld-lang-switcher__chevron ${isOpen ? 'ld-lang-switcher__chevron--open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M6 8.825L1.175 4 2.468 4 6 7.525 9.532 4 10.825 5.293 6 8.825z"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="ld-lang-switcher__dropdown"
          role="listbox"
          aria-label="Available languages"
        >
          <ul className="ld-lang-switcher__list" role="presentation">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang || currentLang.startsWith(lang.code);
              return (
                <li key={lang.code} role="presentation">
                  <button
                    className={`ld-lang-switcher__option ${isSelected ? 'ld-lang-switcher__option--selected' : ''}`}
                    onClick={() => handleLanguageSelect(lang.code)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleLanguageSelect(lang.code);
                      }
                    }}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                  >
                    <span className="ld-lang-switcher__flag" role="img" aria-label={lang.name}>
                      {lang.flag}
                    </span>
                    <span className="ld-lang-switcher__name">{lang.nativeName}</span>
                    {isSelected && (
                      <svg
                        className="ld-lang-switcher__check"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          d="M13.485 2.515a3.5 3.5 0 0 0-4.95 0L6 9.05 2.515 3.515a3.5 3.5 0 0 0 4.95 4.95l7 7a3.5 3.5 0 0 0 4.95 0l7-7a3.5 3.5 0 0 0-4.95-4.95z"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version of Language Switcher (for mobile/small spaces)
 *
 * Shows only the current language flag and name in a smaller format.
 *
 * @example
 * ```jsx
 * <LanguageSwitcherCompact />
 * ```
 */
export function LanguageSwitcherCompact({ className = '', onLanguageChange = null }) {
  const { language: currentLang = 'en', changeLanguage } = useTranslation();

  const currentLanguage = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === currentLang || currentLang.startsWith(lang.code)
  ) || SUPPORTED_LANGUAGES[0];

  const handleLanguageSelect = async (langCode) => {
    if (langCode === currentLang) return;

    try {
      await changeLanguage(langCode);
      if (onLanguageChange) {
        onLanguageChange(langCode);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <div className={`ld-lang-switcher-compact ${className}`}>
      <select
        className="ld-lang-switcher-compact__select"
        value={currentLang}
        onChange={(e) => handleLanguageSelect(e.target.value)}
        aria-label="Select language"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSwitcher;
