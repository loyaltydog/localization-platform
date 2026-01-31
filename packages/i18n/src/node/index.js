/**
 * Node.js/Python backend integration for @loyaltydog/i18n
 *
 * This module provides translation loading capabilities for Python/FastAPI
 * backend services. The Python module is located at:
 *   src/node/translation_loader.py
 *
 * Python Usage Example:
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
 * The Python module supports:
 * - Nested key access with dot notation (e.g., 'emails.welcome.subject')
 * - Variable interpolation with {{variable}} placeholders
 * - Automatic fallback to English for missing translations
 * - Base language matching (e.g., 'es' resolves to 'es-ES')
 * - Thread-safe caching for performance
 *
 * @module @loyaltydog/i18n/node
 * @see https://github.com/loyaltydog/localization-platform
 */

// This is a documentation stub. The actual implementation is in:
// - translation_loader.py (Python module)
// - __init__.py (Python package exports)

export const pythonModule = {
  path: './src/node/translation_loader.py',
  description: 'Python translation loader for FastAPI backend integration'
};

