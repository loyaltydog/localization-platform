# LoyaltyDog Localization Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[![Crowdin](https://badges.crowdin.net/loyaltydog/localized.svg)](https://crowdin.com/project/loyaltydog)

Multi-language localization infrastructure for the LoyaltyDog platform using Crowdin + i18next + shared i18n package.

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
│                    Crowdin (SaaS)                               │
│  Translation Editor + AI Translation + QA                       │
└─────────────────────────────────────────────────────────────────┘
                            ↕ CLI Sync
┌─────────────────────────────────────────────────────────────────┐
│                   @loyaltydog/i18n (Shared Package)              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /locales                                                 │  │
│  │    /en_US         # Source of truth (English - United States) │  │
│  │    /en_GB         # English - United Kingdom (Target)         │  │
│  │    /es_ES         # Spanish - Spain                          │  │
│  │    /es_MX         # Spanish - Mexico                          │  │
│  │    /fr            # French                                   │  │
│  │    /it            # Italian                                  │  │
│  │    /pt_BR         # Portuguese - Brazil                       │  │
│  │    /pt_PT         # Portuguese - Portugal                     │  │
│  │                                                          │  │
│  │  /src                                                     │  │
│  │    /react/     # i18next integration                      │  │
│  │    /node/      # Python/FastAPI loader                    │  │
│  │    /rtl/       # RTL hooks for future                     │  │
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
| **Translation Management** | Crowdin (AI Translation) |
| **Shared Package** | `@loyaltydog/i18n` |
| **Frontend** | i18next + React |
| **Backend** | JSON loader for FastAPI |
| **Sync** | Crowdin CLI + GitHub Actions |

## Target Languages

| Language | Code | Status | Notes |
|----------|------|--------|-------|
| **English (US)** | `en_US` | ✅ Complete | Base language, source of truth |
| **English (GB)** | `en_GB` | ✅ Complete | Ready for British spelling review |
| **Spanish (Spain)** | `es_ES` | ✅ Complete | AI translated |
| **Spanish (Mexico)** | `es_MX` | ✅ Complete | AI translated |
| **French** | `fr` | ✅ Complete | AI translated (99%+) |
| **Italian** | `it` | ✅ Complete | AI translated (99%+) |
| **Portuguese (Brazil)** | `pt_BR` | ✅ Complete | AI translated |
| **Portuguese (Portugal)** | `pt_PT` | ✅ Complete | AI translated |

**Total:** 1,063 translation keys per language across 5 namespaces (common, errors, emails, notifications, validation).

## Project Links

- **Linear Project:** [Localization of all platforms](https://linear.app/loyaltydog/project/localization-of-all-platforms-69e910b55561)
- **Crowdin Project:** [LoyaltyDog Platform](https://crowdin.com/project/loyaltydog-platform)

---

## For Developers: Integration Guide

### Initial Release Strategy

**Important:** All platforms should release with **English (en_US) only** initially, but implement the localization mechanism from day one. This means:

1. ✅ Install and configure `@loyaltydog/i18n` package
2. ✅ Replace hardcoded strings with translation function calls
3. ✅ Use en_US as the default language
4. ⏸️ Do NOT expose language selector UI yet
5. ⏸️ Do NOT support multiple languages in production yet

**Why?** This makes future language rollout a simple configuration change rather than a rewrite.

---

### Installation

```bash
# Install the shared i18n package
npm install @loyaltydog/i18n@latest
```

### Frontend Integration (React)

For React-based platforms (Core API Dashboard, EPOSNow, Square, Shopify, Clover):

**1. Initialize i18next:**

```tsx
// src/i18n.ts or similar entry point
import { initI18n } from '@loyaltydog/i18n/react';

// Initialize with default language (en_US)
initI18n({
  // Override default config if needed
  detection: {
    // For initial release, only support en_US
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
    language='en_US',  # or 'es_ES', 'fr', etc.
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
    language: str  # e.g., 'en_US', 'es_ES', 'fr'

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
    # language = member.language_preference or 'en_US'
    language = 'en_US'  # Default for initial release

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
    "language": "es_ES"
  }'
```

**Via Database (direct, for testing):**

```sql
UPDATE merchants
SET language_preference = 'es_ES'
WHERE id = '{merchant_id}';
```

**Supported Language Codes:**
- `en_US` - English (United States) - **Default**
- `en_GB` - English (United Kingdom)
- `es_ES` - Spanish (Spain)
- `es_MX` - Spanish (Mexico)
- `fr` - French
- `it` - Italian
- `pt_BR` - Portuguese (Brazil)
- `pt_PT` - Portuguese (Portugal)

### Language Fallback Behavior

If a translation is missing for the merchant's preferred language, the system automatically falls back to:
1. Base language variant (e.g., `es_MX` → `es`)
2. English (en_US) as final fallback

This ensures that users always see some text, never blank placeholders.

---

## Directory Structure

```
localization-platform/
├── README.md                  # This file
├── CLAUDE.md                  # Project context for AI agents
├── crowdin.yml                # Crowdin CLI config
├── docs/
│   ├── architecture.md        # Technical architecture decisions
│   ├── epics/                 # Epic breakdown
│   │   └── localization-epic.md
│   └── sprints/               # Sprint planning
│       └── sprint-plan.md
├── packages/
│   └── i18n/
│       ├── package.json
│       ├── locales/
│       │   ├── en_US/         # English - United States (source)
│       │   │   ├── common.json      # 372 keys - UI strings
│       │   │   ├── errors.json      # 176 keys - Error messages
│       │   │   ├── emails.json      # 292 keys - Email templates
│       │   │   ├── notifications.json # 82 keys - SMS/Push
│       │   │   └── validation.json  # 141 keys - Form validation
│       │   ├── en_GB/         # English - United Kingdom
│       │   ├── es_ES/         # Spanish - Spain
│       │   ├── es_MX/         # Spanish - Mexico
│       │   ├── fr/            # French
│       │   ├── it/            # Italian
│       │   ├── pt_BR/         # Portuguese - Brazil
│       │   └── pt_PT/         # Portuguese - Portugal
│       └── src/
│           ├── react/         # i18next integration
│           ├── node/          # Python/FastAPI loader
│           └── rtl/           # RTL support hooks
└── .github/
    └── workflows/
        └── i18n-sync.yml      # CI/CD sync with Crowdin
```

## Getting Started

### Prerequisites

- Node.js 18+
- Crowdin CLI: `npm install -g @crowdin/cli`
- Access to the Crowdin project

### Installation

```bash
# Install dependencies
cd packages/i18n
npm install

# Download latest translations from Crowdin
npm run crowdin:download

# Upload English source files to Crowdin
npm run crowdin:upload
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
subject = translator.translate('es_ES', 'emails', 'welcome.subject',
                               merchantName="Mi Tienda")
```

## Translation Workflow

1. **Developer adds new keys** to `locales/en-US/*.json`
2. **Upload to Crowdin:** `npm run crowdin:upload`
3. **AI Translation** triggered in Crowdin for all target languages
4. **CI/CD auto-syncs** on merge via GitHub Actions
5. **Translations downloaded** to `locales/{lang}/`
6. **Consumer repos** update `@loyaltydog/i18n` dependency

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

**3. Upload the source file to Crowdin:**

```bash
cd packages/i18n
npm run crowdin:upload
```

This uploads all `en-US` source files. Crowdin will auto-translate the new key into all 7 target languages using AI translation.

**4. Pull translations back** (once Crowdin has processed them):

```bash
npm run crowdin:download
```

Or trigger the sync manually via GitHub Actions: **Actions → "Sync Translations from Crowdin" → Run workflow**. This opens a PR with the updated translation files.

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

> **Note:** Never add keys directly to non-`en-US` locale files. All translation authoring happens in Crowdin.

## CI/CD

Translations are automatically synced from Crowdin via GitHub Actions on push to `main`.

Manual sync: Go to Actions → "Sync Translations" → "Run workflow"

## Contributing

See `docs/contributing.md` for guidelines on:
- Adding new translation keys
- Adding new languages
- Crowdin best practices

## License

MIT License — see [LICENSE.md](LICENSE.md) for details.

Copyright © 2026 LoyaltyDog.
