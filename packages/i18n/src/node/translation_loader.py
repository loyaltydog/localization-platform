"""
Translation Loader for FastAPI Backend Integration

This module provides translation loading and interpolation capabilities
for Python/FastAPI backend services using the @loyaltydog/i18n package.

Example:
    >>> from translation_loader import TranslationLoader
    >>> translator = TranslationLoader()
    >>> subject = translator.translate('es', 'emails', 'welcome.subject',
    ...                                 merchantName="Mi Tienda")
    >>> print(subject)
    '¡Bienvenido a Mi Tienda!'

The loader supports:
- Nested key access with dot notation (e.g., 'emails.welcome.subject')
- Variable interpolation with {{variable}} placeholders
- Fallback to English for missing translations
- Lazy loading and caching of translation files
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any, Dict, Optional, Union
from threading import Lock


class TranslationLoader:
    """
    Load and translate strings from JSON translation files.

    This class provides translation services for backend applications,
    with support for nested keys, variable interpolation, and language
    fallback to English.

    Attributes:
        base_path: Base directory containing locale files
        default_locale: Fallback locale when translation is not found
        _cache: Thread-local cache for loaded translations
        _lock: Thread lock for cache synchronization
    """

    # Regex pattern to find {{variable}} placeholders
    PLACEHOLDER_PATTERN = re.compile(r'\{\{(\w+)\}\}')

    def __init__(
        self,
        base_path: Optional[Union[str, Path]] = None,
        default_locale: str = 'en-US'
    ) -> None:
        """
        Initialize the TranslationLoader.

        Args:
            base_path: Path to locales directory. Defaults to the
                locales directory relative to this file.
            default_locale: Fallback locale when translation not found.
                Defaults to 'en-US' (English US).

        Raises:
            ValueError: If base_path doesn't exist or is not a directory
        """
        if base_path is None:
            # Default to the locales directory relative to this package
            self.base_path = Path(__file__).parent.parent.parent / 'locales'
        else:
            self.base_path = Path(base_path)

        if not self.base_path.exists() or not self.base_path.is_dir():
            raise ValueError(
                f"Invalid base_path: {self.base_path}. "
                "Directory must exist."
            )

        self.default_locale = default_locale
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = Lock()

    def _get_locale_path(self, locale: str) -> Path:
        """
        Get the filesystem path for a locale.

        Args:
            locale: Language code (e.g., 'en', 'es-ES')

        Returns:
            Path to the locale directory
        """
        return self.base_path / locale

    def _get_namespace_path(self, locale: str, namespace: str) -> Path:
        """
        Get the filesystem path for a namespace file.

        Args:
            locale: Language code
            namespace: Translation namespace (e.g., 'emails', 'common')

        Returns:
            Path to the namespace JSON file
        """
        return self._get_locale_path(locale) / f'{namespace}.json'

    def _load_namespace(self, locale: str, namespace: str) -> Dict[str, Any]:
        """
        Load a translation namespace from disk.

        Args:
            locale: Language code
            namespace: Translation namespace

        Returns:
            Dictionary containing translations

        Raises:
            FileNotFoundError: If namespace file doesn't exist
            json.JSONDecodeError: If file contains invalid JSON
        """
        cache_key = f'{locale}:{namespace}'

        # Check cache first
        if cache_key in self._cache:
            return self._cache[cache_key]

        file_path = self._get_namespace_path(locale, namespace)

        if not file_path.exists():
            raise FileNotFoundError(
                f"Translation file not found: {file_path}"
            )

        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # Cache the result
        with self._lock:
            self._cache[cache_key] = data

        return data

    def _get_nested_value(self, data: Dict[str, Any], key: str) -> Any:
        """
        Get a value from nested dictionary using dot notation.

        Args:
            data: Dictionary to search
            key: Dot-notation key (e.g., 'welcome.subject')

        Returns:
            Value at the nested key

        Raises:
            KeyError: If key path doesn't exist
        """
        keys = key.split('.')
        value = data

        for k in keys:
            if isinstance(value, dict):
                value = value.get(k)
                if value is None:
                    raise KeyError(f"Key '{k}' not found in path '{key}'")
            else:
                raise KeyError(
                    f"Cannot access key '{k}' on non-dict value in path '{key}'"
                )

        return value

    def _interpolate(self, template: str, **params: Any) -> str:
        """
        Replace {{variable}} placeholders in a template string.

        Args:
            template: String containing {{variable}} placeholders
            **params: Keyword arguments for variable substitution

        Returns:
            Interpolated string with placeholders replaced

        Example:
            >>> _interpolate('Hello {{name}}!', name='World')
            'Hello World!'
        """
        def replacer(match: re.Match) -> str:
            key = match.group(1)
            if key not in params:
                # Return original placeholder if param not provided
                return match.group(0)
            value = params[key]
            return str(value) if value is not None else ''

        return self.PLACEHOLDER_PATTERN.sub(replacer, template)

    def _translate_with_fallback(
        self,
        locale: str,
        namespace: str,
        key: str,
        **params: Any
    ) -> str:
        """
        Translate with fallback to default locale.

        Args:
            locale: Preferred language code
            namespace: Translation namespace
            key: Translation key (dot notation supported)
            **params: Variables for interpolation

        Returns:
            Translated and interpolated string

        Raises:
            TranslationError: If translation not found in any locale
        """
        locales_to_try = [locale]

        # Add base language fallback (e.g., es-ES -> es)
        if '-' in locale:
            base_lang = locale.split('-')[0]
            locales_to_try.append(base_lang)

        # Add default locale as final fallback
        if self.default_locale not in locales_to_try:
            locales_to_try.append(self.default_locale)

        last_error = None

        for try_locale in locales_to_try:
            try:
                data = self._load_namespace(try_locale, namespace)
                value = self._get_nested_value(data, key)

                if not isinstance(value, str):
                    raise TranslationError(
                        f"Translation value for '{namespace}.{key}' "
                        f"in locale '{try_locale}' is not a string"
                    )

                return self._interpolate(value, **params)

            except FileNotFoundError:
                last_error = TranslationError(
                    f"Namespace '{namespace}' not found for locale '{try_locale}'"
                )
            except KeyError as e:
                last_error = TranslationError(
                    f"Key '{namespace}.{key}' not found in locale '{try_locale}'"
                )

        # All attempts failed
        raise last_error or TranslationError(
            f"Translation failed for '{namespace}.{key}' in locale '{locale}'"
        )

    def translate(
        self,
        locale: str,
        namespace: str,
        key: str,
        **params: Any
    ) -> str:
        """
        Get a translated string with variable interpolation.

        This is the main entry point for translations. It supports
        nested keys (e.g., 'emails.welcome.subject') and automatic
        fallback to English for missing translations.

        Args:
            locale: Language code (e.g., 'en', 'es-ES', 'es')
            namespace: Translation namespace (filename without .json)
            key: Translation key, supports dot notation for nested keys
            **params: Variables for {{placeholder}} interpolation

        Returns:
            Translated string with placeholders replaced

        Raises:
            TranslationError: If translation not found in any locale
            ValueError: If namespace or key is empty

        Example:
            >>> translator = TranslationLoader()
            >>> translator.translate('es', 'emails', 'welcome.subject',
            ...                    merchantName='Tienda')
            '¡Bienvenido a Tienda!'
        """
        if not namespace:
            raise ValueError("Namespace cannot be empty")
        if not key:
            raise ValueError("Key cannot be empty")

        return self._translate_with_fallback(locale, namespace, key, **params)

    def has_translation(self, locale: str, namespace: str, key: str) -> bool:
        """
        Check if a translation exists without raising an exception.

        Args:
            locale: Language code
            namespace: Translation namespace
            key: Translation key

        Returns:
            True if translation exists, False otherwise
        """
        try:
            self.translate(locale, namespace, key)
            return True
        except TranslationError:
            return False

    def clear_cache(self) -> None:
        """
        Clear the translation cache.

        Useful for development or when translation files are updated
        at runtime.
        """
        with self._lock:
            self._cache.clear()

    def get_available_locales(self) -> list[str]:
        """
        Get list of available locale directories.

        Returns:
            List of locale codes (e.g., ['en', 'es-ES'])
        """
        locales = []
        for item in self.base_path.iterdir():
            if item.is_dir() and not item.name.startswith('.'):
                locales.append(item.name)
        return sorted(locales)

    def get_available_namespaces(self, locale: str) -> list[str]:
        """
        Get list of available namespace files for a locale.

        Args:
            locale: Language code

        Returns:
            List of namespace names (e.g., ['common', 'emails'])
        """
        locale_path = self._get_locale_path(locale)
        if not locale_path.exists():
            return []

        namespaces = []
        for item in locale_path.glob('*.json'):
            namespaces.append(item.stem)
        return sorted(namespaces)


class TranslationError(Exception):
    """Exception raised when translation lookup fails."""

    pass


# Convenience function for simple translations
def translate(
    locale: str,
    namespace: str,
    key: str,
    base_path: Optional[Union[str, Path]] = None,
    **params: Any
) -> str:
    """
    Convenience function for one-off translations.

    Creates a new TranslationLoader instance for each call.
    For multiple translations, create a TranslationLoader instance
    and reuse it for better performance.

    Args:
        locale: Language code
        namespace: Translation namespace
        key: Translation key
        base_path: Optional custom path to locales directory
        **params: Variables for interpolation

    Returns:
        Translated string

    Example:
        >>> from translation_loader import translate
        >>> translate('es', 'emails', 'welcome.subject', merchantName='Tienda')
        '¡Bienvenido a Tienda!'
    """
    loader = TranslationLoader(base_path=base_path)
    return loader.translate(locale, namespace, key, **params)


# Singleton instance for convenient imports
_default_loader: Optional[TranslationLoader] = None
_default_loader_lock = Lock()


def get_loader(base_path: Optional[Union[str, Path]] = None) -> TranslationLoader:
    """
    Get or create the default singleton TranslationLoader.

    Args:
        base_path: Optional custom path (only used on first call)

    Returns:
        The singleton TranslationLoader instance
    """
    global _default_loader

    if _default_loader is None:
        with _default_loader_lock:
            if _default_loader is None:
                _default_loader = TranslationLoader(base_path=base_path)

    return _default_loader
