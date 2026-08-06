# LoyaltyDog Localization Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)

Multi-language localization infrastructure for the LoyaltyDog platform using i18next + a shared i18n package.

This repository is the source of truth for every locale. Translations are authored here, in `main` — there is no external translation service in the loop.

## Overview

This repository contains the shared localization infrastructure used across all LoyaltyDog platforms:
- Merchant Dashboard (core_api)
- Square Integration
- Shopify Integration
- EPOSNow Integration
- Clover Integration
- WordPress Plugin

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   @loyaltydog/i18n (Shared Package)              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /locales        # 11 namespaces × 5,049 keys per locale   │  │
│  │    /en-US        # Source of truth (English - United States)│  │
│  │    /en-GB        # English - United Kingdom                │  │
│  │    /es-ES        # Spanish - Spain                         │  │
│  │    /es-MX        # Spanish - Mexico                        │  │
│  │    /fr           # French                                  │  │
│  │    /it           # Italian                                 │  │
│  │    /pt-BR        # Portuguese - Brazil                     │  │
│  │    /pt-PT        # Portuguese - Portugal                   │  │
│  │                                                          │  │
│  │  /src                                                     │  │
│  │    /react/     # i18next integration                      │  │
│  │    /node/      # Python/FastAPI loader                    │  │
│  │    /rtl/       # RTL hooks for future                     │  │
│  │    /__tests__/ # Key parity + placeholder integrity        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                      │                      │
         ▼                      ▼                      ▼
   ┌──────────┐          ┌──────────┐          ┌──────────┐
   │ core_api │          │ frontend │          │ Square   │
   │(FastAPI) │          │ (React)  │          │ Shopify  │
   │ EPOSNow  │          │          │          │ Clover   │
   └──────────┘          └──────────┘          └──────────┘
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Translation Management** | In-repo, AI-authored, reviewed in PRs |
| **Shared Package** | `@loyaltydog/i18n` |
| **Frontend** | i18next + React |
| **Backend** | JSON loader for FastAPI |
| **Quality gate** | Vitest key-parity + placeholder tests in CI |

## Target Languages

Locale directory names use the hyphenated codes below — these are the exact
strings `SUPPORTED_LANGUAGES` exports and the only ones the loaders resolve.

| Language | Code | Notes |
|----------|------|-------|
| **English (US)** | `en-US` | Source of truth. **US spellings only** — British forms belong in `en-GB` |
| **English (GB)** | `en-GB` | British spellings (programme, colour, authorise) |
| **Spanish (Spain)** | `es-ES` | AI translated |
| **Spanish (Mexico)** | `es-MX` | AI translated |
| **French** | `fr` | AI translated |
| **Italian** | `it` | AI translated |
| **Portuguese (Brazil)** | `pt-BR` | AI translated |
| **Portuguese (Portugal)** | `pt-PT` | AI translated |

**Total:** 5,049 keys per locale across 11 namespaces — every locale carries
the identical key set, enforced by the test suite.

| Namespace | Keys | | Namespace | Keys |
|---|---:|---|---|---:|
| `common` | 2,850 | | `notifications` | 103 |
| `wordpress` | 618 | | `clover` | 35 |
| `giftCards` | 536 | | `marketing` | 32 |
| `emails` | 409 | | `shopify` | 23 |
| `errors` | 284 | | `eposnow` | 18 |
| `validation` | 141 | | | |

## Project Links

- **Linear Project:** [Localization of all platforms](https://linear.app/loyaltydog/project/localization-of-all-platforms-69e910b55561)

---

## For Developers: Integration Guide

### Initial Release Strategy

**Important:** All platforms should release with **English (en-US) only** initially, but implement the localization mechanism from day one. This means:

1. ✅ Install and configure `@loyaltydog/i18n` package
2. ✅ Replace hardcoded strings with translation function calls
3. ✅ Use en-US as the default language
4. ⏸️ Do NOT expose language selector UI yet
5. ⏸️ Do NOT support multiple languages in production yet

**Why?** This makes future language rollout a simple configuration change rather than a rewrite.

---

### Installation

`@loyaltydog/i18n` is **not published to npm** — `npm install @loyaltydog/i18n`
will 404. Consume it from a local path or a git dependency:

```jsonc
// package.json
{
  "dependencies": {
    // monorepo / sibling checkout
    "@loyaltydog/i18n": "file:../localization-platform/packages/i18n"
    // or straight from git
    // "@loyaltydog/i18n": "github:loyaltydog/localization-platform#main"
  }
}
```

The Python loader is likewise unpublished — vendor `src/node/translation_loader.py`
into the consuming service, or add `packages/i18n/src/node` to `PYTHONPATH`.

### Frontend Integration (React)

For React-based platforms (Core API Dashboard, EPOSNow, Square, Shopify, Clover):

**1. Initialize i18next:**

```tsx
// src/i18n.ts or similar entry point
import { initI18n } from '@loyaltydog/i18n/react';

// Initialize with default language (en-US)
initI18n({
  // Override default config if needed
  detection: {
    // For initial release, only support en-US
    lookupLocalStorage: 'loyaltydog_language',
    caches: ['localStorage'],
  },
});
```

**2. Wrap your app with I18nProvider:**

```tsx
// src/App.tsx or similar
import { I18nProvider } from '@loyaltydog/i18n/react';

function App() {
  return (
    <I18nProvider>
      <YourAppRoutes />
    </I18nProvider>
  );
}
```

**3. Replace hardcoded strings with translation calls:**

```tsx
import { useTranslation } from '@loyaltydog/i18n/react';

function Dashboard() {
  const { t } = useTranslation('common');

  return (
    <div>
      <h1>{t('nav.dashboard')}</h1>
      <button>{t('actions.save')}</button>
      <p>{t('loyalty.member')}: {memberName}</p>
    </div>
  );
}
```

**4. For dynamic content with variables:**

```tsx
function WelcomeMessage() {
  const { t } = useTranslation('notifications');

  return (
    <p>{t('sms.welcome', {
      merchantName: 'Acme Store',
      points: '100'
    })}</p>
  );
}
```

### Backend Integration (FastAPI)

For Core API backend and Python services:

**1. Import the translation loader:**

```python
from loyaltydog_i18n import TranslationLoader

# Initialize translator
translator = TranslationLoader()
```

**2. Get translations for a specific language:**

```python
# Get translation for a specific language
subject = translator.translate(
    language='en-US',  # or 'es-ES', 'fr', etc.
    namespace='emails',
    key='welcome.subject',
    merchantName='Acme Store'
)

# List available locales
available_locales = translator.get_available_locales()
```

**3. API endpoint for language switching:**

```python
from fastapi import HTTPException
from pydantic import BaseModel

class LanguageUpdate(BaseModel):
    language: str  # e.g., 'en-US', 'es-ES', 'fr'

@router.put("/merchants/{merchant_id}/language")
async def update_merchant_language(merchant_id: str, data: LanguageUpdate):
    """Update the preferred language for a merchant account."""

    # Validate language code using available locales
    available = translator.get_available_locales()
    if data.language not in available:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported language. Available: {', '.join(available)}"
        )

    # Update merchant preference in database
    # merchant.language_preference = data.language
    # db.commit()

    return {"message": "Language updated successfully"}
```

**4. Email templates with translations:**

```python
def send_welcome_email(member_email: str, member_name: str, merchant_name: str):
    """Send welcome email using translated template."""

    # Get member's preferred language from database
    # member = db.query(Member).filter_by(email=member_email).first()
    # language = member.language_preference or 'en-US'
    language = 'en-US'  # Default for initial release

    subject = translator.translate(
        language, 'emails', 'welcome.subject',
        merchantName=merchant_name
    )
    body = translator.translate(
        language, 'emails', 'welcome.body',
        memberName=member_name,
        merchantName=merchant_name,
        passUrl='https://example.com/pass'
    )

    send_email(member_email, subject, body)
```

---

## Language Change Mechanism

### For Merchant Accounts

Each merchant account has a **language preference** setting that controls:
- UI language (for merchant dashboard users)
- Email template language (for member emails sent by that merchant)
- SMS/Push notification language

### Changing Language for a Merchant Account

**Via API:**

```bash
curl -X PUT "https://api.loyalty.dog/v2/merchants/{merchant_id}/language" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "es-ES"
  }'
```

**Via Database (direct, for testing):**

```sql
UPDATE merchants
SET language_preference = 'es-ES'
WHERE id = '{merchant_id}';
```

**Supported Language Codes:**
- `en-US` - English (United States) - **Default**
- `en-GB` - English (United Kingdom)
- `es-ES` - Spanish (Spain)
- `es-MX` - Spanish (Mexico)
- `fr` - French
- `it` - Italian
- `pt-BR` - Portuguese (Brazil)
- `pt-PT` - Portuguese (Portugal)

### Language Fallback Behavior

If a translation is missing for the merchant's preferred language, the system automatically falls back to:
1. Base language variant (e.g., `es-MX` → `es`)
2. English (en-US) as final fallback

This ensures that users always see some text, never blank placeholders.

---

## Directory Structure

```
localization-platform/
├── README.md                  # This file
├── CLAUDE.md                  # Project context for AI agents
├── docs/                      # Untracked (see .gitignore) — local notes only
├── packages/
│   └── i18n/
│       ├── package.json
│       ├── locales/
│       │   ├── en-US/         # English - United States (source of truth)
│       │   │   ├── common.json        # 2,850 keys - dashboard UI
│       │   │   ├── wordpress.json     #   618 keys - WP/WooCommerce plugin
│       │   │   ├── giftCards.json     #   536 keys - gift card flows
│       │   │   ├── emails.json        #   409 keys - email templates
│       │   │   ├── errors.json        #   284 keys - error messages
│       │   │   ├── validation.json    #   141 keys - form validation
│       │   │   ├── notifications.json #   103 keys - SMS/push
│       │   │   ├── clover.json        #    35 keys - Clover integration
│       │   │   ├── marketing.json     #    32 keys - landing copy
│       │   │   ├── shopify.json       #    23 keys - Shopify integration
│       │   │   └── eposnow.json       #    18 keys - EPOSNow integration
│       │   ├── en-GB/         # English - United Kingdom
│       │   ├── es-ES/         # Spanish - Spain
│       │   ├── es-MX/         # Spanish - Mexico
│       │   ├── fr/            # French
│       │   ├── it/            # Italian
│       │   ├── pt-BR/         # Portuguese - Brazil
│       │   └── pt-PT/         # Portuguese - Portugal
│       └── src/
│           ├── react/         # i18next integration
│           ├── node/          # Python/FastAPI loader
│           ├── rtl/           # RTL support hooks
│           └── __tests__/     # Key parity + placeholder integrity tests
└── .github/
    └── workflows/
        └── ci.yml             # Tests, lint, build on push and PR
```

## Getting Started

### Prerequisites

- Node.js 18+

### Installation

```bash
# Install dependencies
cd packages/i18n
npm install

# Run the locale test suite (key parity + placeholder integrity)
npm test

# Structural validation of the locale files
npm run validate:locales
```

### Usage (React)

```tsx
import { useTranslation } from '@loyaltydog/i18n/react';

function Dashboard() {
  const { t } = useTranslation('common');
  return <h1>{t('nav.dashboard')}</h1>;
}
```

### Usage (FastAPI)

```python
from loyaltydog_i18n import TranslationLoader

translator = TranslationLoader()
subject = translator.translate('es-ES', 'emails', 'welcome.subject',
                               merchantName="Mi Tienda")
```

## Translation Workflow

Translation happens in this repository. A key and its 7 translations land in the same
branch, in the same pull request, and are reviewed together.

1. **Developer adds new keys** to `locales/en-US/*.json` — en-US defines which keys exist
2. **Translate into all 7 target locales** in the same branch (AI-assisted; see below)
3. **Tests enforce the invariants** — key parity, no single-brace `{var}`, and identical
   `{{variable}}` sets across locales
4. **Review and merge to `main`** — `main` is the source of truth for every locale
5. **Consumer repos** update their `@loyaltydog/i18n` dependency

There is no external translation service, no sync step, and no round-trip to wait on. A key
that is missing from a target locale is a defect the test suite reports, not a queued item.

### Adding New Translation Keys

**1. Choose the right namespace file** in `packages/i18n/locales/en-US/`:

| File | Use for |
|------|---------|
| `common.json` | UI labels, navigation, buttons, general strings |
| `errors.json` | Error messages and validation feedback |
| `emails.json` | Email subject lines and body templates |
| `notifications.json` | SMS and push notification templates |
| `validation.json` | Form field validation messages |
| `giftCards.json` | Gift card-specific strings |

**2. Add the key** using dot-notation nesting in `packages/i18n/locales/en-US/common.json`:

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "newSection": "My New Section"
  }
}
```

**3. Add the same key to all 7 target locales**, translating the English value:

`en-GB`, `es-ES`, `es-MX`, `fr`, `it`, `pt-BR`, `pt-PT` — same file, same dot-path, same
`{{variable}}` names. Translations are AI-authored; ask Claude to translate the new keys
against the en-US source and to match the tone of the surrounding strings in each file.

Two rules matter more than wording:

- **Never change a placeholder.** `{{merchantName}}` stays `{{merchantName}}` in every
  locale. Dropping one silently deletes data from the sentence; renaming or inventing one
  renders the raw token, because nothing supplies a value for it.
- **Use double braces.** i18next and `translation_loader.py` both interpolate `{{var}}`.
  A single-brace `{var}` renders literally.

**4. Verify before opening the PR:**

```bash
cd packages/i18n
npm test
```

The suite in `src/__tests__/` fails on a key present in en-US but absent from a target
locale, on any single-brace `{var}`, and on any locale whose variable set differs from
en-US. Known pre-existing exceptions are named individually in `all-languages.test.js`
with the reason each is unresolved — add to those lists only with a reason, never to
silence a new failure.

**5. Use the key in code:**

```tsx
// React
const { t } = useTranslation('common');
t('nav.newSection')  // → "My New Section"
```

```python
# Python
translator.translate('es-ES', 'common', 'nav.newSection')
```

> **Note:** `en-US` is the source of truth for *which keys exist* — always add a new key
> there first. Target locales are then filled in from it in the same change; a key that
> exists only in en-US is an incomplete change, not a handoff to someone else.

## CI/CD

`.github/workflows/ci.yml` runs on every push and pull request to `main`, `staging`, and
`development`. It runs the Vitest suite on Node 18, 20, and 22 — including the key-parity
and placeholder-integrity checks that guard the locale files — plus lint and build.

There is no translation sync workflow. Locale files change only through pull requests.

## Contributing

Everything you need is in this file — there is no separate contributing guide:

- **Adding translation keys** — see [Adding New Translation Keys](#adding-new-translation-keys)
- **Placeholder conventions** — always `{{double}}`, never `{single}`; never add,
  drop, or rename a variable in a translation
- **Spelling** — `en-US` takes US spellings only; British forms belong in `en-GB`
- **Adding a language** — create `locales/<code>/` with all 11 namespaces, add the
  code to `SUPPORTED_LANGUAGES` in `src/index.js` and to `ALL_LANGUAGES` in
  `src/__tests__/all-languages.test.js`, then make the suite pass

## License

MIT License — see [LICENSE.md](LICENSE.md) for details.

Copyright © 2026 LoyaltyDog.
