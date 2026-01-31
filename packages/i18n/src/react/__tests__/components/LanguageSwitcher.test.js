/**
 * Unit tests for Language Switcher component
 * Run with: npm test -- src/react/__tests__/components/LanguageSwitcher.test.js
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { SUPPORTED_LANGUAGES } from '../../../index.js';

// Create a stable mock function that we can reference in tests
const mockChangeLanguage = vi.fn().mockResolvedValue(undefined);

// Mock our custom hooks module
vi.mock('../../hooks.js', () => ({
  useTranslation: () => ({
    i18n: {
      languages: ['en-US', 'es-ES'],
      language: 'en-US',
      t: (key) => key,
    },
    language: 'en-US',
    changeLanguage: mockChangeLanguage,
    t: (key) => key,
    isRTL: false,
    textDirection: 'ltr',
    languages: SUPPORTED_LANGUAGES,
    currentLanguage: SUPPORTED_LANGUAGES[0],
  }),
}));

// Import component after mocks are set up
import { LanguageSwitcher, LanguageSwitcherCompact } from '../../components/LanguageSwitcher.jsx';

// Helper function to create elements without JSX
const createElement = (type, props, ...children) => {
  return React.createElement(type, props, ...children);
};

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the language switcher button', () => {
      render(createElement(LanguageSwitcher));

      const button = screen.getByRole('button', { name: /change language/i });
      expect(button).toBeInTheDocument();
    });

    it('should display current language flag', () => {
      render(createElement(LanguageSwitcher));

      const flag = screen.getByRole('img', { name: /English \(US\)/i });
      expect(flag).toBeInTheDocument();
      expect(flag).toHaveTextContent('🇺🇸');
    });

    it('should display current language name on larger screens', () => {
      render(createElement(LanguageSwitcher));

      const button = screen.getByRole('button', { name: /change language/i });
      expect(button).toHaveTextContent('English (US)');
    });

    it('should support custom className', () => {
      render(createElement(LanguageSwitcher, { className: 'custom-class' }));

      const wrapper = screen.getByRole('button', { name: /change language/i }).parentElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Dropdown Interaction', () => {
    it('should open dropdown when button is clicked', async () => {
      render(createElement(LanguageSwitcher));

      const button = screen.getByRole('button', { name: /change language/i });

      // Dropdown should not be visible initially
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      // Click to open
      await fireEvent.click(button);

      // Dropdown should now be visible
      expect(screen.getByRole('listbox', { name: /available languages/i })).toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', async () => {
      render(createElement(LanguageSwitcher));

      const button = screen.getByRole('button', { name: /change language/i });

      // Open dropdown
      await fireEvent.click(button);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Click outside
      fireEvent.mouseDown(document.body);

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('should close dropdown with Escape key', async () => {
      render(createElement(LanguageSwitcher));

      const button = screen.getByRole('button', { name: /change language/i });

      // Open dropdown
      await fireEvent.click(button);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      // Press Escape
      await fireEvent.keyDown(button, { key: 'Escape' });

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Language Options', () => {
    it('should display all supported languages', async () => {
      render(createElement(LanguageSwitcher));

      // Open dropdown
      await fireEvent.click(screen.getByRole('button', { name: /change language/i }));

      // Check all languages are displayed using getAllByText for duplicates
      for (const lang of SUPPORTED_LANGUAGES) {
        const elements = screen.getAllByText(lang.nativeName);
        expect(elements.length).toBeGreaterThan(0);
        // Use getAllByRole for flags since there are duplicates (button + dropdown)
        const flags = screen.getAllByRole('img', { name: lang.name });
        expect(flags.length).toBeGreaterThan(0);
        expect(flags[0]).toHaveTextContent(lang.flag);
      }
    });

    it('should mark current language as selected', async () => {
      render(createElement(LanguageSwitcher));

      // Open dropdown
      await fireEvent.click(screen.getByRole('button', { name: /change language/i }));

      // Find all options - there should be one for each language
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(SUPPORTED_LANGUAGES.length);

      // English (US) should be marked as selected
      const englishOption = options.find(opt => opt.textContent.includes('English (US)'));
      expect(englishOption).toHaveAttribute('aria-selected', 'true');

      // Spanish should not be selected
      const spanishOption = options.find(opt => opt.textContent.includes('Español'));
      expect(spanishOption).toHaveAttribute('aria-selected', 'false');
    });

    it('should have checkmark for selected language', async () => {
      render(createElement(LanguageSwitcher));

      // Open dropdown
      await fireEvent.click(screen.getByRole('button', { name: /change language/i }));

      // English (US) should have a checkmark icon
      const options = screen.getAllByRole('option');
      const englishOption = options.find(opt => opt.textContent.includes('English (US)'));
      const checkIcon = englishOption.querySelector('.ld-lang-switcher__check');
      expect(checkIcon).toBeInTheDocument();
    });
  });

  describe('Language Change', () => {
    it('should call changeLanguage when option is clicked', async () => {
      render(createElement(LanguageSwitcher));

      // Open dropdown
      await fireEvent.click(screen.getByRole('button', { name: /change language/i }));

      // Click Spanish option
      const options = screen.getAllByRole('option');
      const spanishOption = options.find(opt => opt.textContent.includes('Español'));
      await fireEvent.click(spanishOption);

      expect(mockChangeLanguage).toHaveBeenCalledWith('es-ES');
    });

    it('should call onLanguageChange callback if provided', async () => {
      const onLanguageChange = vi.fn();
      render(createElement(LanguageSwitcher, { onLanguageChange }));

      // Open dropdown and change language
      await fireEvent.click(screen.getByRole('button', { name: /change language/i }));
      const options = screen.getAllByRole('option');
      const spanishOption = options.find(opt => opt.textContent.includes('Español'));
      await fireEvent.click(spanishOption);

      await waitFor(() => {
        expect(onLanguageChange).toHaveBeenCalledWith('es-ES');
      });
    });

    it('should not change language if same language is selected', async () => {
      render(createElement(LanguageSwitcher));

      // Open dropdown
      await fireEvent.click(screen.getByRole('button', { name: /change language/i }));

      // Click English (US) (current language)
      const options = screen.getAllByRole('option');
      const englishOption = options.find(opt => opt.textContent.includes('English (US)'));
      await fireEvent.click(englishOption);

      // changeLanguage should not be called
      expect(mockChangeLanguage).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(createElement(LanguageSwitcher));

      const button = screen.getByRole('button', { name: /change language/i });
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    });

    it('should support keyboard navigation', async () => {
      render(createElement(LanguageSwitcher));

      const button = screen.getByRole('button', { name: /change language/i });

      // Press Enter to open
      await fireEvent.keyDown(button, { key: 'Enter' });

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('should be keyboard accessible within dropdown', async () => {
      render(createElement(LanguageSwitcher));

      // Open dropdown
      await fireEvent.click(screen.getByRole('button', { name: /change language/i }));

      // Tab through options should work
      const options = screen.getAllByRole('option');
      options.forEach(option => {
        expect(option).toHaveAttribute('type', 'button');
      });
    });
  });
});

describe('LanguageSwitcherCompact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render as native select element', () => {
    render(createElement(LanguageSwitcherCompact));

    const select = screen.getByRole('combobox', { name: /select language/i });
    expect(select).toBeInTheDocument();
  });

  it('should have all languages as options', () => {
    render(createElement(LanguageSwitcherCompact));

    const select = screen.getByRole('combobox', { name: /select language/i });

    // Check that all languages are options
    expect(select).toHaveTextContent(/🇺🇸 English \(US\)/);
    expect(select).toHaveTextContent(/🇪🇸 Español/);
  });

  it('should call changeLanguage when selection changes', async () => {
    render(createElement(LanguageSwitcherCompact));

    const select = screen.getByRole('combobox', { name: /select language/i });

    // Change to Spanish
    await fireEvent.change(select, { target: { value: 'es-ES' } });

    expect(mockChangeLanguage).toHaveBeenCalledWith('es-ES');
  });

  it('should support custom className', () => {
    render(createElement(LanguageSwitcherCompact, { className: 'custom-class' }));

    const wrapper = screen.getByRole('combobox', { name: /select language/i }).parentElement;
    expect(wrapper).toHaveClass('custom-class');
  });
});
