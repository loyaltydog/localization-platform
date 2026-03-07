import json
import re
from pathlib import Path
from datetime import datetime, timezone

# -------------------------------------------------------------------
# Language configuration (equivalent to index.js exports)
# -------------------------------------------------------------------

SUPPORTED_LANGUAGES = [
    {"code": "en-US", "name": "English (US)", "flag": "🇺🇸", "nativeName": "English (US)"},
    {"code": "en-GB", "name": "English (UK)", "flag": "🇬🇧", "nativeName": "English (UK)"},
    {"code": "es-ES", "name": "Spanish (Spain)", "flag": "🇪🇸", "nativeName": "Español (España)"},
    {"code": "fr", "name": "French", "flag": "🇫🇷", "nativeName": "Français"},
    {"code": "it", "name": "Italian", "flag": "🇮🇹", "nativeName": "Italiano"},
    {"code": "pt-PT", "name": "Portuguese (Portugal)", "flag": "🇵🇹", "nativeName": "Português (Portugal)"},
    {"code": "pt-BR", "name": "Portuguese (Brazil)", "flag": "🇧🇷", "nativeName": "Português (Brasil)"},
]

DEFAULT_LANGUAGE = "en-US"


def getLanguage(code: str):
    """Equivalent to getLanguage() from index.js"""
    if not code:
        return None

    code = code.lower()
    for lang in SUPPORTED_LANGUAGES:
        if lang["code"].lower() == code:
            return lang

    return None


# -------------------------------------------------------------------
# Path helpers
# -------------------------------------------------------------------

CURRENT_DIR = Path(__file__).resolve().parent
LOCALES_BASE = CURRENT_DIR.parent.parent / "locales"


# -------------------------------------------------------------------
# JSON loader
# -------------------------------------------------------------------

def loadNamespaceJSON(language_code: str, namespace: str, locales_path=None):
    """
    Load a JSON namespace file for a language
    """

    base_path = Path(locales_path) if locales_path else LOCALES_BASE
    file_path = base_path / language_code / f"{namespace}.json"

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except Exception:
        raise


# -------------------------------------------------------------------
# Accept-Language parser
# -------------------------------------------------------------------

ACCEPT_LANG_PATTERN = re.compile(r"^([^;]+)(?:;\s*q\s*=\s*([0-9.]+))?$", re.I)


def parseAcceptLanguage(accept_language: str):
    """
    Parse Accept-Language header
    """

    if not accept_language or not isinstance(accept_language, str):
        return [{"code": DEFAULT_LANGUAGE, "quality": 1}]

    parsed = []

    for lang in accept_language.split(","):
        trimmed = lang.strip()
        match = ACCEPT_LANG_PATTERN.match(trimmed)

        if not match:
            continue

        code, q = match.groups()

        if q:
            try:
                quality = max(0, min(1, float(q)))
            except ValueError:
                quality = 1
        else:
            quality = 1

        parsed.append({
            "code": code.strip().lower(),
            "quality": quality
        })

    parsed.sort(key=lambda x: x["quality"], reverse=True)

    return parsed


# -------------------------------------------------------------------
# Browser language detection
# -------------------------------------------------------------------

def detectBrowserLanguage(accept_language: str, supported_codes=None):
    """
    Detect language from Accept-Language header
    """

    supported = supported_codes or [l["code"] for l in SUPPORTED_LANGUAGES]
    supported_lower = [s.lower() for s in supported]

    parsed = parseAcceptLanguage(accept_language)

    for item in parsed:
        code = item["code"]

        # exact match
        if code in supported_lower:
            return supported[supported_lower.index(code)]

        # base language match
        base = code.split("-")[0]

        for idx, s in enumerate(supported_lower):
            if s.split("-")[0] == base:
                return supported[idx]

    return DEFAULT_LANGUAGE


# -------------------------------------------------------------------
# Supported languages API
# -------------------------------------------------------------------

def getSupportedLanguagesForAPI():
    """
    Return supported languages list
    """

    return [
        {
            "code": lang["code"],
            "name": lang["name"],
            "flag": lang["flag"],
            "nativeName": lang["nativeName"],
        }
        for lang in SUPPORTED_LANGUAGES
    ]


# -------------------------------------------------------------------
# Translations loader
# -------------------------------------------------------------------

DEFAULT_NAMESPACES = [
    "common",
    "errors",
    "validation",
    "notifications",
    "emails"
]


def getTranslationsForAPI(language_code: str, locales_path=None):
    """
    Load all namespaces for a language
    """

    translations = {}

    for namespace in DEFAULT_NAMESPACES:
        translations[namespace] = loadNamespaceJSON(
            language_code,
            namespace,
            locales_path
        )

    return translations


def getNamespaceTranslations(language_code: str, namespace: str, locales_path=None):
    """
    Load single namespace
    """

    return loadNamespaceJSON(language_code, namespace, locales_path)


# -------------------------------------------------------------------
# Language validation
# -------------------------------------------------------------------

def isLanguageSupported(language_code: str):
    return getLanguage(language_code) is not None


def getDefaultLanguage():
    return DEFAULT_LANGUAGE


# -------------------------------------------------------------------
# Language preference helpers
# -------------------------------------------------------------------

def buildLanguagePreference(language_code: str, source="manual"):
    """
    Build preference object for DB storage
    """

    return {
        "code": language_code,
        "source": source,
        "updatedAt": datetime.now(timezone.utc).isoformat()
    }


def formatLanguagePreference(language_code):
    """
    Format language preference for API response
    """

    if not language_code:
        return {
            "code": None,
            "name": None,
            "flag": None
        }

    language = getLanguage(language_code)

    if not language:
        return {
            "code": language_code,
            "name": None,
            "flag": None
        }

    return {
        "code": language["code"],
        "name": language["name"],
        "flag": language["flag"]
    }


# -------------------------------------------------------------------
# Migration helper
# -------------------------------------------------------------------

def getMigrationSQL():

    merchants_sql = """
-- Add defaultLanguage column to merchants table
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS default_language VARCHAR(10) DEFAULT 'en-US';

CREATE INDEX IF NOT EXISTS idx_merchants_default_language
ON merchants(default_language);

ALTER TABLE merchants
ADD CONSTRAINT chk_merchants_default_language
CHECK (default_language IN ('en-US', 'en-GB', 'es-ES', 'fr', 'it', 'pt-PT', 'pt-BR'));
""".strip()

    customers_sql = """
-- Add preferredLanguage column to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10);

CREATE INDEX IF NOT EXISTS idx_customers_preferred_language
ON customers(preferred_language);

ALTER TABLE customers
ADD CONSTRAINT chk_customers_preferred_language
CHECK (preferred_language IS NULL OR preferred_language IN ('en-US', 'en-GB', 'es-ES', 'fr', 'it', 'pt-PT', 'pt-BR'));
""".strip()

    return {
        "merchants": merchants_sql,
        "customers": customers_sql
    }