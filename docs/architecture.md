# Localization Architecture

**Last Updated:** January 30, 2026

---

## Overview

The LoyaltyDog localization platform provides multi-language support across all products using a centralized translation management system (Lokalise) and a shared i18n package.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Lokalise (SaaS)                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Translation Editor                                      │  │
│  │  • AI Translation (Spanish first)                        │  │
│  │  • Screenshot context for translators                    │  │
│  │  • QA checks (missing keys, length limits)               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↕ CLI Sync (every 6 hours)
┌─────────────────────────────────────────────────────────────────┐
│                   @loyaltydog/i18n (Shared Package)              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /locales/en           # English (source of truth)       │  │
│  │  /locales/es-ES        # Spanish (Spain)                 │  │
│  │  /src/react/           # i18next integration             │  │
│  │  /src/node/            # Python/FastAPI loader           │  │
│  │  /src/rtl/             # RTL support (future)            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   ┌──────────┐         ┌──────────┐         ┌──────────┐
   │ core_api │         │  Square  │         │ Shopify  │
   │ (FastAPI)│         │ Shopify  │         │ EPOSNow  │
   │ EPOSNow  │         │ Clover   │         │          │
   └──────────┘         └──────────┘         └──────────┘
```

## Technology Choices

### Why Lokalise?

| Feature | Benefit |
|---------|---------|
| AI Translation | Fast, cost-effective Spanish translation |
| Screenshot Context | Translators see exactly where text appears |
| CLI Integration | Automated sync via GitHub Actions |
| i18next Support | First-class integration with our stack |
| Quality Checks | Prevents missing keys, length violations |

### Why Shared npm Package?

| Benefit | Description |
|---------|-------------|
| Single Source of Truth | All translations in one place |
| Type Safety | TypeScript interfaces for keys |
| No Runtime Dependency | Translations bundled with code |
| Version Management | Deps update with `npm update` |
| Zero Cost | No API calls at runtime |

### Why i18next?

| Feature | Benefit |
|---------|---------|
| Industry Standard | Widely adopted, well-documented |
| React Integration | Built-in hooks, HOCs, components |
| Namespace Support | Organize translations by feature |
| HTTP Backend | Load languages on-demand |
| Interpolation | Native `{{variable}}` support |

## Data Flow

### Translation Update Flow

```
1. Developer adds key to locales/en/common.json
2. Run: npm run lokalise:upload
3. Lokalise receives new keys
4. Translator uses Lokalise UI (or AI auto-translates)
5. CI/CD runs every 6 hours (or manual trigger)
6. Lokalise CLI downloads to locales/{lang}/
7. Git commit + push
8. Consumer repo: npm update @loyaltydog/i18n
```

### Runtime Flow (Frontend)

```
1. Component mounts
2. useTranslation('common') hook called
3. i18next loads translations from @loyaltydog/i18n/locales/en/
4. If user switches to Spanish:
   - i18next.changeLanguage('es-ES')
   - HTTP backend loads @loyaltydog/i18n/locales/es-ES/
   - Components re-render with new strings
5. User preference saved to localStorage + API
```

### Runtime Flow (Backend)

```
1. Email service needs to send welcome email
2. Load member's preferredLanguage (or merchant's default)
3. TranslationLoader.load(locale, 'emails')
4. Parse JSON from @loyaltydog/i18n/locales/{locale}/emails.json
5. Interpolate variables: {{memberName}}, {{points}}
6. Send via email service
```

## File Structure

### Translation Files

```
locales/
├── en/                    # English (source)
│   ├── common.json        # Navigation, buttons, labels
│   ├── errors.json        # API error messages
│   ├── emails.json        # Email templates
│   ├── notifications.json # SMS/push templates
│   └── validation.json    # Form validation
└── es-ES/                 # Spanish (Spain)
    ├── common.json        # Same structure as en/
    ├── errors.json
    ├── emails.json
    ├── notifications.json
    └── validation.json
```

### Key Naming Convention

```
namespace.category.item

Examples:
nav.dashboard          - Navigation → Dashboard
actions.save           - Actions → Save button
errors.auth.invalidCredentials  - Errors → Auth → Invalid credentials
emails.welcome.subject - Emails → Welcome → Subject line
```

## Language Detection & Fallback

```
1. Check URL param: ?lang=es
2. Check localStorage: 'preferredLanguage'
3. Check member record: member.preferredLanguage
4. Check merchant record: merchant.defaultLanguage
5. Check browser: navigator.language
6. Fallback to: 'en'
```

## RTL Support (Future)

```
RTL Languages: Hebrew (he), Arabic (ar), Farsi (fa), Urdu (ur)

When RTL enabled:
- HTML dir="rtl" attribute
- CSS logical properties (margin-inline-start)
- Flex direction reversal where needed
- Mirrored spacing

Zero-cost implementation:
- isRTL() returns false for LTR languages
- No performance impact until RTL languages added
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Sync Translations
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:        # Manual trigger

jobs:
  download:
    - Checkout code
    - Install Lokalise CLI
    - Download translations (using API token secret)
    - Commit if changed
    - Push to main
```

### Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `LOKALISE_API_TOKEN` | GitHub Secret | Read-write token for Lokalise API |
| `LOKALISE_PROJECT_ID` | `.lokalise.json` | Project ID: `71116905697c499a444c46.97764157` |

## Integration Points

### Merchant Dashboard (core_api)

**Frontend:**
```tsx
import { useTranslation } from '@loyaltydog/i18n/react';

function Dashboard() {
  const { t } = useTranslation('common');
  return <h1>{t('nav.dashboard')}</h1>;
}
```

**Backend:**
```python
from @loyaltydog.i18n import TranslationLoader

translator = TranslationLoader('es')
subject = translator.t('emails', 'welcome.subject', merchantName="Mi Tienda")
```

### Square Integration

```tsx
import { useTranslation } from '@loyaltydog/i18n/react';

function SquarePosTerminal() {
  const { t } = useTranslation('square');
  return <Prompt>{t('scanToEarn')}</Prompt>;
}
```

### WordPress Plugin

WordPress uses its own i18n system (`.po`/`.mo` files). We generate these from the shared package:

```bash
npm run generate:wp-i18n
# Creates: languages/loyaltydog-es_ES.po
# Compiles to: languages/loyaltydog-es_ES.mo
```

## Performance Considerations

| Concern | Solution |
|---------|----------|
| Bundle size | HTTP backend loads languages on-demand |
| Initial load | English bundled, others lazy-loaded |
| Memory | i18next caches loaded languages |
| Network | Translations bundled, no runtime API calls |

## Security

| Concern | Solution |
|---------|----------|
| API Token | Stored in GitHub Secrets, never in code |
| Token Exposure | `.lokalise.json` uses `${LOKALISE_API_TOKEN}` |
| Public Access | Repo is private |
| Lokalise Access | Token scoped to single project |

## Future Enhancements

| Phase | Feature |
|-------|---------|
| Phase 2 | French, German languages |
| Phase 3 | Hebrew (RTL support) |
| Phase 4 | Per-merchant custom translations |
| Phase 5 | OTA (Over-the-Air) updates from Lokalise |
