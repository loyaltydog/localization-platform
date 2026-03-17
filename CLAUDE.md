# LoyaltyDog Localization Platform - Project Context

**Last Updated:** January 30, 2026
**Status:** Phase 1 - Foundation Setup
**Repository:** https://github.com/loyaltydog/localization-platform

---

## Project Overview

Multi-language localization infrastructure for all LoyaltyDog platforms. Uses Lokalise for translation management with a shared `@loyaltydog/i18n` package consumed by all integrations.

### Core Architecture

```
Lokalise (Translation Management)
    ↓ CLI Sync
@loyaltydog/i18n (Shared Package)
    ↓ npm install
┌──────────┬──────────┬──────────┬──────────┐
│ core_api │  Square  │ Shopify  │ EPOSNow  │
│(FastAPI) │          │          │          │
└──────────┴──────────┴──────────┴──────────┘
```

---

## Technology Decisions

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Translation Mgmt** | Lokalise | AI Translation, CLI sync, screenshot context |
| **Shared Package** | `@loyaltydog/i18n` | Single source of truth, type-safe |
| **Frontend** | i18next + React | Industry standard, React integration |
| **Backend** | JSON loader | Language-agnostic, works with FastAPI |
| **RTL Support** | Custom hooks | Zero-cost when not used |

---

## Lokalise Configuration

| Setting | Value |
|---------|-------|
| **Project ID** | `71116905697c499a444c46.97764157` |
| **API Token** | Stored in GitHub Secrets (`LOKALISE_API_TOKEN`) |
| **Source Language** | English (`en`) |
| **First Target** | Spanish (Spain) - `es-ES` |
| **Translation Method** | Lokalise AI Translation |

---

## Target Languages

| Language | Code | Status | Priority |
|----------|------|--------|----------|
| English | `en` | ✅ Source | - |
| Spanish (Spain) | `es-ES` | 🚧 Phase 1 | High |
| French | `fr` | 📋 Phase 2 | Medium |
| German | `de` | 📋 Phase 2 | Medium |
| Hebrew | `he` | 📋 Phase 3 | Low (RTL) |

---

## Repository Structure

```
localization-platform/
├── packages/i18n/           # Shared i18n package
│   ├── locales/             # Translation files
│   │   ├── en/              # English (source)
│   │   │   ├── common.json  # UI strings
│   │   │   ├── errors.json  # API errors
│   │   │   ├── emails.json  # Email templates
│   │   │   ├── notifications.json  # SMS/push
│   │   │   └── validation.json    # Form validation
│   │   └── es-ES/           # Spanish (Spain)
│   ├── src/
│   │   ├── react/           # i18next integration
│   │   ├── node/            # Python/FastAPI loader
│   │   └── rtl/             # RTL support hooks
│   ├── package.json
│   └── .lokalise.json       # Lokalise CLI config
├── docs/
│   ├── architecture.md
│   ├── epics/
│   └── sprints/
└── .github/workflows/
    └── i18n-sync.yml        # CI/CD sync
```

---

## Key Implementation Stories

From Linear Project: "Localization of all platforms"

### Phase 1: Foundation (Weeks 1-2)
- **SWE-321 (LOC-1.1):** Set up Lokalise + i18n package
- **SWE-262 (LOC-2.1):** i18next React integration
- **SWE-296 (LOC-2.2):** Backend translation loader
- **SWE-322 (LOC-2.3):** RTL support hooks
- **SWE-323 (LOC-3.1):** CI/CD sync with Lokalise

### Phase 2: Spanish Translation (Week 3)
- **SWE-324 (LOC-4.1):** Add Spanish via Lokalise AI

### Phase 3: Implementation (Weeks 4-6)
- **SWE-326 (LOC-5.1):** Language switcher component
- **SWE-262 (LOC-5.2):** Localize merchant dashboard
- **SWE-297 (LOC-5.3):** Localize email templates
- **SWE-325 (LOC-5.4):** Localize SMS/push
- **SWE-299 (LOC-6.1):** Language detection & persistence

### Phase 4: Integrations (Weeks 7-9)
- **SWE-266 (LOC-7.1):** Square localization
- **SWE-264 (LOC-7.2):** Shopify localization
- **SWE-263 (LOC-7.3):** EPOSNow localization
- **SWE-265/267 (LOC-7.4):** Clover + WordPress

### Phase 5: Launch (Week 10)
- **SWE-327 (LOC-8.1):** Testing & QA
- **SWE-328 (LOC-9.1):** Documentation

---

## Translation Workflow

```
1. Developer adds keys to locales/en/*.json
2. npm run lokalise:upload
3. Translators use Lokalise (AI or manual)
4. CI/CD syncs every 6 hours (or manual)
5. npm run lokalise:download
6. Consumer repos: npm update @loyaltydog/i18n
```

---

## For AI Agents

### Translation Key Naming Convention
- Use dot notation: `namespace.category.item`
- Examples: `nav.dashboard`, `actions.save`, `errors.unauthorized`
- Be descriptive but concise
- Group related keys together

### When Adding New Translations
1. Always add to English (`locales/en/`) first
2. Run `npm run lokalise:upload` to sync to Lokalise
3. Wait for translation (AI is automatic, manual takes time)
4. Run `npm run lokalise:download` to get translations

### When Creating New Components
- Import from `@loyaltydog/i18n/react`
- Use `useTranslation` hook with namespace
- Never hardcode English strings in JSX

### Email Template Format
Use `{{variable}}` placeholders:
```json
{
  "welcome": {
    "subject": "Welcome to {{merchantName}}!",
    "body": "Hi {{memberName}}, you have {{points}} points."
  }
}
```

---

## Contacts

- **Product Owner:** Haim Barad (haim@loyalty.dog)
- **Linear Project:** [Localization of all platforms](https://linear.app/loyaltydog/project/localization-of-all-platforms-69e910b55561)
- **Lokalise:** [LoyaltyDog Platform](https://app.lokalise.com/project/71116905697c499a444c46.97764157)

---

## Related Repositories

- **core_api:** Merchant dashboard (FastAPI + React)
- **integration-service:** Square/Shopify integrations
- **loyalty-cards-eposnow:** EPOSNow integration
- **loyalty-cards-square:** Square integration
- **loyalty-cards-shopify:** Shopify integration
