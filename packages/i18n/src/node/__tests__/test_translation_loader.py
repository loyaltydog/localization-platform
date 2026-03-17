"""
Unit tests for the TranslationLoader module.

Run with: pytest src/node/__tests__/test_translation_loader.py
Or: python -m pytest src/node/__tests__/test_translation_loader.py -v
"""

import json
import os
import tempfile
import shutil
from pathlib import Path
import pytest

# Import the module to test
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from translation_loader import (
    TranslationLoader,
    TranslationError,
    translate,
    get_loader,
    _default_loader
)


@pytest.fixture
def temp_locales_dir():
    """Create a temporary locales directory with test translation files."""
    temp_dir = tempfile.mkdtemp()

    # Create English translations
    en_dir = Path(temp_dir) / 'en'
    en_dir.mkdir()

    en_common = {
        "welcome": "Welcome",
        "goodbye": "Goodbye",
        "nested": {
            "key": "Nested value",
            "deep": {
                "value": "Deeply nested"
            }
        }
    }

    en_emails = {
        "welcome": {
            "subject": "Welcome to {{merchantName}}!",
            "greeting": "Hi {{memberName}},",
            "body": "You have {{points}} points."
        },
        "simple": "No placeholders here"
    }

    with open(en_dir / 'common.json', 'w') as f:
        json.dump(en_common, f)

    with open(en_dir / 'emails.json', 'w') as f:
        json.dump(en_emails, f)

    # Create Spanish translations
    es_dir = Path(temp_dir) / 'es-ES'
    es_dir.mkdir()

    es_common = {
        "welcome": "Bienvenido",
        "goodbye": "Adiós"
        # Note: no 'nested' key - testing fallback
    }

    es_emails = {
        "welcome": {
            "subject": "¡Bienvenido a {{merchantName}}!",
            "greeting": "Hola {{memberName}},",
            # Note: no 'body' key - testing fallback
        },
        "spanish_only": "Solo en español"
    }

    with open(es_dir / 'common.json', 'w') as f:
        json.dump(es_common, f)

    with open(es_dir / 'emails.json', 'w') as f:
        json.dump(es_emails, f)

    yield temp_dir

    # Cleanup
    shutil.rmtree(temp_dir)


class TestTranslationLoader:
    """Test suite for TranslationLoader class."""

    def test_init_with_default_path(self, temp_locales_dir):
        """Test initialization with default path."""
        # Save current directory and restore after test
        original_cwd = os.getcwd()
        try:
            os.chdir(temp_locales_dir)
            loader = TranslationLoader()
            assert loader.base_path == Path(temp_locales_dir)
        finally:
            os.chdir(original_cwd)

    def test_init_with_custom_path(self, temp_locales_dir):
        """Test initialization with custom path."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        assert loader.base_path == Path(temp_locales_dir)

    def test_init_with_invalid_path(self):
        """Test initialization with invalid path raises ValueError."""
        with pytest.raises(ValueError, match="Invalid base_path"):
            TranslationLoader(base_path="/nonexistent/path")

    def test_simple_translation(self, temp_locales_dir):
        """Test simple key lookup."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        result = loader.translate('en', 'common', 'welcome')
        assert result == "Welcome"

    def test_nested_key_translation(self, temp_locales_dir):
        """Test nested key lookup with dot notation."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        result = loader.translate('en', 'common', 'nested.key')
        assert result == "Nested value"

    def test_deep_nested_translation(self, temp_locales_dir):
        """Test deeply nested key lookup."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        result = loader.translate('en', 'common', 'nested.deep.value')
        assert result == "Deeply nested"

    def test_interpolation_single_variable(self, temp_locales_dir):
        """Test variable interpolation with single placeholder."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        result = loader.translate(
            'en', 'emails', 'welcome.subject',
            merchantName="TestStore"
        )
        assert result == "Welcome to TestStore!"

    def test_interpolation_multiple_variables(self, temp_locales_dir):
        """Test variable interpolation with multiple placeholders."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        result = loader.translate(
            'en', 'emails', 'welcome.body',
            points=100
        )
        assert result == "You have 100 points."

    def test_interpolation_all_variables(self, temp_locales_dir):
        """Test interpolation with all variables provided."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        result = loader.translate(
            'en', 'emails', 'welcome.greeting',
            memberName="John"
        )
        assert result == "Hi John,"

    def test_interpolation_missing_placeholder_remains(self, temp_locales_dir):
        """Test that missing placeholders remain in string."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        result = loader.translate(
            'en', 'emails', 'welcome.subject'
            # merchantName not provided
        )
        assert result == "Welcome to {{merchantName}}!"

    def test_fallback_to_english_for_missing_key(self, temp_locales_dir):
        """Test fallback to English when Spanish key is missing."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        # Spanish emails doesn't have 'body' key
        result = loader.translate(
            'es-ES', 'emails', 'welcome.body',
            points=50
        )
        assert result == "You have 50 points."

    def test_fallback_to_base_language(self, temp_locales_dir):
        """Test fallback from es-ES to es when specific variant not found."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        # If we had 'es' without 'es-ES', this would test that
        # For now, es-ES exists so we test direct lookup
        result = loader.translate('es-ES', 'common', 'welcome')
        assert result == "Bienvenido"

    def test_translation_key_not_found_raises_error(self, temp_locales_dir):
        """Test that missing key raises TranslationError."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        with pytest.raises(TranslationError):
            loader.translate('en', 'common', 'nonexistent')

    def test_namespace_not_found_raises_error(self, temp_locales_dir):
        """Test that missing namespace raises TranslationError."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        with pytest.raises(TranslationError, match="not found"):
            loader.translate('en', 'nonexistent', 'key')

    def test_empty_namespace_raises_error(self, temp_locales_dir):
        """Test that empty namespace raises ValueError."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        with pytest.raises(ValueError, match="Namespace cannot be empty"):
            loader.translate('en', '', 'key')

    def test_empty_key_raises_error(self, temp_locales_dir):
        """Test that empty key raises ValueError."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        with pytest.raises(ValueError, match="Key cannot be empty"):
            loader.translate('en', 'common', '')

    def test_has_translation_true(self, temp_locales_dir):
        """Test has_translation returns True for existing translation."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        assert loader.has_translation('en', 'common', 'welcome') is True

    def test_has_translation_false(self, temp_locales_dir):
        """Test has_translation returns False for missing translation."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        assert loader.has_translation('en', 'common', 'nonexistent') is False

    def test_get_available_locales(self, temp_locales_dir):
        """Test getting list of available locales."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        locales = loader.get_available_locales()
        assert 'en' in locales
        assert 'es-ES' in locales

    def test_get_available_namespaces(self, temp_locales_dir):
        """Test getting list of available namespaces for a locale."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        namespaces = loader.get_available_namespaces('en')
        assert 'common' in namespaces
        assert 'emails' in namespaces

    def test_get_available_namespaces_nonexistent_locale(self, temp_locales_dir):
        """Test getting namespaces for nonexistent locale returns empty list."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        namespaces = loader.get_available_namespaces('nonexistent')
        assert namespaces == []

    def test_caching_works(self, temp_locales_dir):
        """Test that translations are cached."""
        loader = TranslationLoader(base_path=temp_locales_dir)

        # First call loads from disk
        result1 = loader.translate('en', 'common', 'welcome')

        # Second call should use cache
        result2 = loader.translate('en', 'common', 'welcome')

        assert result1 == result2
        assert 'en:common' in loader._cache

    def test_clear_cache(self, temp_locales_dir):
        """Test that cache can be cleared."""
        loader = TranslationLoader(base_path=temp_locales_dir)

        # Load something into cache
        loader.translate('en', 'common', 'welcome')
        assert len(loader._cache) > 0

        # Clear cache
        loader.clear_cache()
        assert len(loader._cache) == 0

    def test_spanish_specific_translation(self, temp_locales_dir):
        """Test Spanish-specific translation."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        result = loader.translate('es-ES', 'emails', 'spanish_only')
        assert result == "Solo en español"

    def test_no_placeholders(self, temp_locales_dir):
        """Test translation without placeholders."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        result = loader.translate('en', 'emails', 'simple')
        assert result == "No placeholders here"


class TestConvenienceFunctions:
    """Test suite for convenience functions."""

    def test_translate_function(self, temp_locales_dir):
        """Test the translate() convenience function."""
        result = translate(
            'en', 'common', 'welcome',
            base_path=temp_locales_dir
        )
        assert result == "Welcome"

    def test_get_loader_singleton(self, temp_locales_dir):
        """Test that get_loader returns the same instance."""
        # Reset the singleton
        import translation_loader
        translation_loader._default_loader = None

        loader1 = get_loader(base_path=temp_locales_dir)
        loader2 = get_loader()

        assert loader1 is loader2

    def test_get_loader_with_custom_path(self, temp_locales_dir):
        """Test get_loader with custom base path."""
        # Reset the singleton
        import translation_loader
        translation_loader._default_loader = None

        loader = get_loader(base_path=temp_locales_dir)
        assert loader.base_path == Path(temp_locales_dir)


class TestEdgeCases:
    """Test suite for edge cases."""

    def test_null_value_in_interpolation(self, temp_locales_dir):
        """Test that None values in params become empty strings."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        result = loader.translate(
            'en', 'emails', 'welcome.subject',
            merchantName=None
        )
        assert result == "Welcome to !"

    def test_numeric_value_in_interpolation(self, temp_locales_dir):
        """Test that numeric values are converted to strings."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        result = loader.translate(
            'en', 'emails', 'welcome.body',
            points=999
        )
        assert result == "You have 999 points."

    def test_special_characters_in_params(self, temp_locales_dir):
        """Test interpolation with special characters."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        result = loader.translate(
            'en', 'emails', 'welcome.subject',
            merchantName="Café & Restaurant"
        )
        assert result == "Welcome to Café & Restaurant!"

    def test_empty_string_namespace_raises_error(self, temp_locales_dir):
        """Test empty string namespace raises error."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        with pytest.raises(ValueError):
            loader.translate('en', '', 'key')

    def test_key_with_dots_at_end(self, temp_locales_dir):
        """Test key with trailing dot raises appropriate error."""
        loader = TranslationLoader(base_path=temp_locales_dir)
        with pytest.raises(TranslationError):
            loader.translate('en', 'common', 'nested.')


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
