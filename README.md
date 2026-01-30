# LoyaltyDog Localization Platform

Multi-language localization infrastructure for the LoyaltyDog platform using Lokalise + i18next + shared i18n package.

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
│                    Lokalise (SaaS)                              │
│  Translation Editor + AI Translation + QA                       │
└─────────────────────────────────────────────────────────────────┘
                            ↕ CLI Sync
┌─────────────────────────────────────────────────────────────────┐
│                   @loyaltydog/i18n (Shared Package)              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /locales                                                 │  │
│  │    /en          # Source of truth (English)               │  │
│  │    /es-ES       # Spanish (Spain)                         │  │
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

| Language | Code | Status | Priority |
|----------|------|--------|----------|
| English | `en` | ✅ Complete | Source |
| Spanish (Spain) | `es-ES` | 🚧 In Progress | High |
| French | `fr` | 📋 Planned | Medium |
| German | `de` | 📋 Planned | Medium |
| Hebrew | `he` | 📋 Planned | Low (RTL) |

## Project Links

- **Linear Project:** [Localization of all platforms](https://linear.app/loyaltydog/project/localization-of-all-platforms-69e910b55561)
- **Lokalise Project:** [LoyaltyDog Platform](https://app.lokalise.com/project/71116905697c499a444c46.97764157)

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
│       │   ├── en/            # English (source)
│       │   │   ├── common.json
│       │   │   ├── errors.json
│       │   │   ├── emails.json
│       │   │   ├── notifications.json
│       │   │   └── validation.json
│       │   └── es-ES/         # Spanish (Spain)
│       │       └── ...
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
from @loyaltydog.i18n import TranslationLoader

translator = TranslationLoader()
subject = translator.translate('es', 'emails', 'welcome.subject',
                               merchantName="Mi Tienda")
```

## Translation Workflow

1. **Developer adds new keys** to `locales/en/*.json`
2. **Upload to Lokalise:** `npm run lokalise:upload`
3. **Translators work** in Lokalise (AI translation or manual)
4. **CI/CD auto-syncs** every 6 hours (or manual trigger)
5. **Translations downloaded** to `locales/{lang}/`
6. **Consumer repos** update `@loyaltydog/i18n` dependency

## CI/CD

Translations are automatically synced from Lokalise every 6 hours via GitHub Actions.

Manual sync: Go to Actions → "Sync Translations" → "Run workflow"

## Contributing

See `docs/contributing.md` for guidelines on:
- Adding new translation keys
- Adding new languages
- Lokalise best practices

## License

Copyright © 2025 LoyaltyDog. All rights reserved.
