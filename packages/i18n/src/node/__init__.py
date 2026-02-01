"""
Node.js/Python Backend Integration for @loyaltydog/i18n

This module provides translation loading capabilities for Python/FastAPI
backend services. It reads JSON translation files from the shared package
and provides utilities for nested key access and variable interpolation.

Example usage:
    >>> from translation_loader import TranslationLoader, translate
    >>>
    >>> # Using the class directly
    >>> translator = TranslationLoader()
    >>> subject = translator.translate('es', 'emails', 'welcome.subject',
    ...                                 merchantName="Mi Tienda")
    >>>
    >>> # Or using the convenience function
    >>> subject = translate('es', 'emails', 'welcome.subject',
    ...                    merchantName="Mi Tienda")

The module supports:
- Nested key access with dot notation (e.g., 'emails.welcome.subject')
- Variable interpolation with {{variable}} placeholders
- Automatic fallback to English for missing translations
- Base language matching (e.g., 'es' resolves to 'es-ES')
"""

from .translation_loader import (
    TranslationLoader,
    TranslationError,
    translate,
    get_loader,
)

__all__ = [
    'TranslationLoader',
    'TranslationError',
    'translate',
    'get_loader',
]

__version__ = '1.0.0'
