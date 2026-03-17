# Consumer Repo Integration Plan

**Created:** March 1, 2026
**Status:** Foundation Complete — Consumer Integration Pending
**Author:** Analysis of current codebase state

---

## Background

The `@loyaltydog/i18n` package is **fully built and ready for consumption**:
- 8 locales: en-US, en-GB, es-ES, es-MX, fr, it, pt-BR, pt-PT
- 6 namespaces: common, errors, emails, notifications, validation, giftCards
- React hooks, `I18nProvider`, `LanguageSwitcher` component
- Python `TranslationLoader` for FastAPI
- RTL support hooks
- Automated Lokalise CI/CD sync (every 12 hours)

**None of the consumer repos have integrated it yet.** All have extensive hardcoded English strings.

---

## Integration Readiness Matrix

| Repo | Type | i18n Lib Installed | Hardcoded Strings | Priority |
|------|------|--------------------|-------------------|----------|
| `core_api` | Next.js 14 + FastAPI | None | Extensive | **High** |
| `loyaltydog-eposnow` | React 16 + Webpack | None | All | **High** |
| `loyaltydog-shopify` (loyalty-button) | React | `react-intl` (wrong lib) | Partially | **Medium** |
| `loyaltydog-shopify` (pos) | React | None | All | **Medium** |
| `consumer-portal` | Next.js 14 | None | All | **Low** |
| `loyaltydog-square` | No code yet | N/A | N/A | **Deferred** |

---

## Repo-by-Repo Integration Steps

### 1. `core_api` — Highest Priority

#### Frontend (Next.js 14 App Router)

**Step 1 — Install dependencies**
```bash
# In core_api/frontend/
npm install @loyaltydog/i18n react-i18next i18next-browser-languagedetector
```

**Step 2 — Wrap app with `I18nProvider`**
```typescript
// core_api/frontend/src/app/layout.tsx
import { I18nProvider } from '@loyaltydog/i18n/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

**Step 3 — Add `LanguageSwitcher` to merchant nav**
```typescript
import { LanguageSwitcher } from '@loyaltydog/i18n/react';
// Already built — just drop it into the nav/header component
```

**Step 4 — Convert components to use `useTranslation` hook**

Key files to migrate (hardcoded strings confirmed):
- `src/components/ActionButton.tsx` — toast messages ("Progressing...", "Success!")
- `src/app/layout.tsx` — page title, metadata description
- All `page.tsx` files — page titles via `generateMetadata()`
- Nav items, button labels, form labels throughout `src/components/`

Pattern:
```typescript
import { useTranslation } from '@loyaltydog/i18n/react';

export function ActionButton({ ... }) {
  const { t } = useTranslation('common');

  toast.promise(onAction(), {
    loading: loadingText ?? t('actions.processing'),
    success: successText ?? t('actions.success'),
    error: (err) => err?.message ?? t('errors.generic'),
  });
}
```

**Step 5 — Dynamic page metadata**
```typescript
// For Next.js App Router, use generateMetadata with translations
// Note: metadata must be generated server-side — use Accept-Language header
export async function generateMetadata({ params }): Promise<Metadata> {
  const lang = detectLanguageFromHeaders(); // util from @loyaltydog/i18n/node
  const t = getTranslations(lang, 'common');
  return { title: t('nav.dashboard') };
}
```

**Step 6 — Store user language preference**
- Add `language` field to user/merchant profile in DB
- On login, load saved preference
- On language switch, persist to DB via API call

---

#### Backend (FastAPI Python)

**Step 1 — Import `TranslationLoader`**
```python
# core_api/backend/loyaltydog_api/i18n.py
import sys
sys.path.insert(0, '/path/to/@loyaltydog/i18n/src/node')
from translation_loader import TranslationLoader

# Or copy translation_loader.py into the backend directly
loader = TranslationLoader(locales_path='path/to/locales')
```

> **Simpler option:** Copy `localization-platform/packages/i18n/src/node/translation_loader.py`
> and the `locales/` directory into `core_api/backend/` and reference locally until
> the package is published to npm/PyPI.

**Step 2 — Add `Accept-Language` middleware**
```python
# core_api/backend/loyaltydog_api/middleware/language.py
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class LanguageMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        lang = request.headers.get('Accept-Language', 'en-US')
        lang = resolve_language(lang)  # normalize to supported locale
        request.state.language = lang
        return await call_next(request)
```

**Step 3 — Localize email templates**
```python
# core_api/backend/loyaltydog_api/tasks/user.py (currently hardcoded)
async def send_welcome_email(user, language='en-US'):
    t = loader.get_translator(language, 'emails')
    msg = MessageSchema(
        subject=t('welcome.subject', {'merchantName': user.merchant_name}),
        ...
    )
```

Key files to update:
- `tasks/user.py` — welcome email (`"Welcome to LoyaltyDog"` hardcoded)
- Any other email-sending tasks
- API error responses — return localized error messages from `errors` namespace

**Step 4 — Localize API error responses**
```python
# In exception handlers / routers
from fastapi import Request
def localized_error(request: Request, key: str, **kwargs):
    lang = getattr(request.state, 'language', 'en-US')
    return loader.get(lang, 'errors', key, kwargs)
```

---

### 2. `loyaltydog-eposnow` — High Priority

**Step 1 — Install dependencies**
```bash
# Confirm React 16 compatibility with react-i18next v11.x
npm install @loyaltydog/i18n react-i18next@11 i18next@21 i18next-browser-languagedetector@6
```

> Note: React 16 requires older react-i18next (v11.x) and i18next (v21.x).
> Consider upgrading React to 18 first for simpler integration.

**Step 2 — Configure i18next in app entry point**
```javascript
// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// Import translations from @loyaltydog/i18n locales
```

**Step 3 — Wrap Redux root with `I18nProvider`**

**Step 4 — Audit and convert hardcoded strings**
- EPOSNow UI components (styled-components)
- Redux action/error messages
- Button labels, form fields, notifications

**Step 5 — Add language switcher to EPOSNow UI**

---

### 3. `loyaltydog-shopify` — Medium Priority

#### loyalty-button (storefront widget)

**Current state:** Uses `react-intl` with hardcoded `locale="en"`, loads strings from a layout object instead of the i18n package.

**Step 1 — Replace `react-intl` with `@loyaltydog/i18n`**
```bash
npm uninstall react-intl
npm install @loyaltydog/i18n react-i18next i18next
```

**Step 2 — Detect locale from Shopify storefront context**
```javascript
// Shopify provides locale via `Shopify.locale` global or theme config
const locale = window.Shopify?.locale ?? 'en';
```

**Step 3 — Wire translations from the i18n package**
- Replace `messages={layout.text}` with `@loyaltydog/i18n` translation keys

#### pos (admin app)

**Step 1 — Install dependencies**
```bash
npm install @loyaltydog/i18n react-i18next i18next-browser-languagedetector
```

**Step 2 — Wrap app with `I18nProvider`**

**Step 3 — Convert hardcoded strings** throughout the POS admin UI

---

### 4. `consumer-portal` — Lower Priority

**Step 1 — Install dependencies**
```bash
# In consumer-portal/
npm install @loyaltydog/i18n react-i18next i18next-browser-languagedetector
```

**Step 2 — Wrap app in `layout.tsx`**

**Step 3 — Convert pages**
- `src/app/page.tsx` — homepage ("Welcome to LoyaltyDog", "Sign In", "Create Account")
- Auth pages — sign in, sign up forms
- All UI labels and messages

**Step 4 — Auto-detect browser language**
- Use `i18next-browser-languagedetector` — detects from browser settings
- Store preference in Supabase user profile after login

---

## Recommended Execution Order

```
1. core_api frontend    →  merchant-facing, highest impact
2. core_api backend     →  email/SMS/error localization
3. loyaltydog-eposnow   →  existing POS integration (consider React upgrade first)
4. loyaltydog-shopify   →  both loyalty-button + pos
5. consumer-portal      →  consumer-facing, auto-detect language from browser
```

---

## Shared Implementation Notes

### Using the TranslationLoader in Python (Backend)

The `TranslationLoader` class is at:
`localization-platform/packages/i18n/src/node/translation_loader.py`

Until the package is published to PyPI, copy it into each backend repo alongside the `locales/` directory. The locales directory is the source of truth — keep it in sync via git submodule or by copying as part of a build step.

### Language Code Normalization

The package supports: `en-US`, `en-GB`, `es-ES`, `es-MX`, `fr`, `it`, `pt-BR`, `pt-PT`.

When reading `Accept-Language` headers (e.g. `en,en-US;q=0.9,es;q=0.8`), normalize using the `api-helpers.js` utility from `@loyaltydog/i18n/node`.

### Translation Key Naming Convention

Follow the existing pattern in the namespaces:
- `namespace.category.item` — e.g. `common.nav.dashboard`, `errors.auth.unauthorized`
- New UI strings → add to `common.json` in localization-platform first, then upload to Lokalise
- New error strings → add to `errors.json`
- New email templates → add to `emails.json`

### Adding New Translation Keys

1. Add to `en-US` locale in localization-platform
2. Run `npm run lokalise:upload` in localization-platform
3. Lokalise AI auto-translates to all 8 languages
4. CI/CD syncs back to the repo within 12 hours (or run `npm run lokalise:download` manually)

---

## Open Items / Decisions Needed

| Question | Context |
|----------|---------|
| **Publish `@loyaltydog/i18n` to npm?** | Currently only available as a local path. Publishing would simplify `npm install` in consumer repos. |
| **Publish `translation_loader.py` to PyPI?** | Same issue for FastAPI backend. Alternatively, use git submodule or copy-on-build. |
| **React upgrade for EPOSNow?** | React 16 complicates i18next integration. Worth upgrading to React 18 before localizing. |
| **Language persistence strategy?** | DB field per user vs. browser localStorage vs. cookie. Recommendation: DB field as primary, localStorage as fallback. |
| **Shopify locale source?** | Pull from `window.Shopify.locale` for the storefront widget vs. Shopify admin API for the POS app. |

---

## Links

- **i18n Package:** `localization-platform/packages/i18n/`
- **React integration:** `packages/i18n/src/react/`
- **Python TranslationLoader:** `packages/i18n/src/node/translation_loader.py`
- **Locales directory:** `packages/i18n/locales/`
- **Linear Epic:** [Localization of all platforms](https://linear.app/loyaltydog/project/localization-of-all-platforms-69e910b55561)
- **Lokalise Project:** [LoyaltyDog Platform](https://app.lokalise.com/project/71116905697c499a444c46.97764157)
