# @loyaltydog/i18n

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/loyaltydog/localization-platform?style=social)](https://github.com/loyaltydog/localization-platform)

Multi-language localization infrastructure for modern web applications.

## Overview

Shared i18n package with translations for all LoyaltyDog platforms. Uses Crowdin for translation management with open-source collaboration support.

**Perfect for:**
- Multi-language SaaS applications
- Merchant dashboards
- E-commerce integrations
- Customer-facing applications

**Features:**
- 8 pre-configured locales (en-US, en-GB, es-ES, es-MX, fr, it, pt-BR, pt-PT)
- 1,063+ translation keys across 5 namespaces
- React (i18next) and Python (FastAPI) support
- RTL support hooks included
- Automated CI/CD sync with Crowdin

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Lokalise (SaaS)                              │
│  Translation Editor + AI Translation + QA                       │
└─────────────────────────────────────────────────────────────────┘
                            ↕ CLI Sync
┌─────────────────────────────────────────────────────────────────┐
│                   @loyaltydog/i18n (Shared Package)              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /locales                                                 │  │
│  │    /en-US         # Source of truth (English - United States) │  │
│  │    /en-GB         # English - United Kingdom (Target)         │  │
│  │    /es-ES         # Spanish - Spain                          │  │
│  │    /es-MX         # Spanish - Mexico                          │  │
│  │    /fr            # French                                   │  │
│  │    /it            # Italian                                  │  │
│  │    /pt-BR         # Portuguese - Brazil                       │  │
│  │    /pt-PT         # Portuguese - Portugal                     │  │
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
| **Translation Management** | Lokalise (AI Translation) |
| **Shared Package** | `@loyaltydog/i18n` |
| **Frontend** | i18next + React |
| **Backend** | JSON loader for FastAPI |
| **Sync** | Lokalise CLI + GitHub Actions |

## Target Languages

| Language | Code | Status | Notes |
|----------|------|--------|-------|
| **English (US)** | `en-US` | ✅ Complete | Base language, source of truth |
| **English (GB)** | `en-GB` | ✅ Complete | Ready for British spelling review |
| **Spanish (Spain)** | `es-ES` | ✅ Complete | AI translated |
| **Spanish (Mexico)** | `es-MX` | ✅ Complete | AI translated |
| **French** | `fr` | ✅ Complete | AI translated (99%+) |
| **Italian** | `it` | ✅ Complete | AI translated (99%+) |
| **Portuguese (Brazil)** | `pt-BR` | ✅ Complete | AI translated |
| **Portuguese (Portugal)** | `pt-PT` | ✅ Complete | AI translated |

**Total:** 1,063 translation keys per language across 5 namespaces (common, errors, emails, notifications, validation).

## Project Links

- **Linear Project:** [Localization of all platforms](https://linear.app/loyaltydog/project/localization-of-all-platforms-69e910b55561)
- **Lokalise Project:** [LoyaltyDog Platform](https://app.lokalise.com/project/71116905697c499a444c46.97764157)

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

### npm

```bash
npm install @loyaltydog/i18n
```

### yarn

```bash
yarn add @loyaltydog/i18n
```

### pnpm

```bash
pnpm add @loyaltydog/i18n
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/loyaltydog/localization-platform.git
cd localization-platform/packages/i18n
npm install
```

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
├── docs/
│   ├── architecture.md        # Technical architecture decisions
│   ├── epics/                 # Epic breakdown
│   │   └── localization-epic.md
│   └── sprints/               # Sprint planning
│       └── sprint-plan.md
├── packages/
│   └── i18n/
│       ├── package.json
│       ├── .lokalise.json     # Lokalise CLI config
│       ├── locales/
│       │   ├── en-US/         # English - United States (source)
│       │   │   ├── common.json      # 372 keys - UI strings
│       │   │   ├── errors.json      # 176 keys - Error messages
│       │   │   ├── emails.json      # 292 keys - Email templates
│       │   │   ├── notifications.json # 82 keys - SMS/Push
│       │   │   └── validation.json  # 141 keys - Form validation
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
│           └── rtl/           # RTL support hooks
└── .github/
    └── workflows/
        └── i18n-sync.yml      # CI/CD sync with Lokalise
```

## Getting Started

### Prerequisites

- Node.js 18+
- Lokalise CLI: `npm install -g @lokalise/cli`
- Access to Lokalise project: `71116905697c499a444c46.97764157`

### Installation

```bash
# Install dependencies
cd packages/i18n
npm install

# Download latest translations from Lokalise
npm run lokalise:download

# Upload English source files to Lokalise
npm run lokalise:upload
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
subject = translator.translate('es', 'emails', 'welcome.subject',
                               merchantName="Mi Tienda")
```

## Translation Workflow

1. **Developer adds new keys** to `locales/en-US/*.json`
2. **Upload to Lokalise:** `npm run lokalise:upload`
3. **AI Translation** triggered in Lokalise for all target languages
4. **CI/CD auto-syncs** every 12 hours (or manual trigger)
5. **Translations downloaded** to `locales/{lang}/`
6. **Consumer repos** update `@loyaltydog/i18n` dependency

## CI/CD

Translations are automatically synced from Lokalise every 12 hours via GitHub Actions (00:00 and 12:00 UTC).

Manual sync: Go to Actions → "Sync Translations" → "Run workflow"

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Translation Contributions

Translations are managed via [Crowdin](https://crowdin.com/). Join our project to help translate:

1. Visit our [Crowdin project](https://crowdin.com/project/loyaltydog-localization)
2. Sign up for a free Crowdin account
3. Start translating!

### Code Contributions

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [LoyaltyDog](https://github.com/loyaltydog)

This project is open-source and available under the [MIT License](LICENSE).

---

**Built with ❤️ by the LoyaltyDog team**

[GitHub](https://github.com/loyaltydog/localization-platform) • [Report Issue](https://github.com/loyaltydog/localization-platform/issues) • [Request Feature](https://github.com/loyaltydog/localization-platform/issues/new?template=feature_request.md)
