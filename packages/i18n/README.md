# @loyaltydog/i18n

Shared internationalization package for all LoyaltyDog platforms.

## Installation

```bash
npm install @loyaltydog/i18n
```

## Quick Start

### React (Frontend)

```jsx
import { useTranslation } from '@loyaltydog/i18n/react';

function MyComponent() {
  const { t } = useTranslation('common');

  return (
    <button>{t('actions.save')}</button>
  );
}
```

### Node.js / FastAPI (Backend)

```python
from loyaltydog_i18n import TranslationLoader

loader = TranslationLoader()
message = loader.get('emails.welcome.subject', lang='es-ES', merchantName='Acme')
# Result: "¡Bienvenido a Acme!"
```

## Package Structure

```
@loyaltydog/i18n/
├── locales/           # Translation files
│   ├── en/            # English (source)
│   │   ├── common.json
│   │   ├── errors.json
│   │   ├── emails.json
│   │   ├── notifications.json
│   │   └── validation.json
│   └── es-ES/         # Spanish (Spain)
├── src/
│   ├── index.js       # Main entry point
│   ├── react/         # i18next integration
│   ├── node/          # Backend loader
│   └── rtl/           # RTL support
└── package.json
```

## Translation Namespaces

| Namespace | Purpose |
|-----------|---------|
| `common` | UI strings (nav, buttons, labels, messages) |
| `errors` | API error messages |
| `emails` | Email templates with `{{variable}}` placeholders |
| `notifications` | SMS and push notification templates |
| `validation` | Form validation messages |

## Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | Source |
| Spanish (Spain) | `es-ES` | Active |

## Translation Key Naming Convention

Use dot notation: `namespace.category.item`

Examples:
- `common.nav.dashboard`
- `common.actions.save`
- `errors.auth.invalidCredentials`
- `emails.welcome.subject`

## Adding New Translations

1. Add keys to the English source file (`locales/en/*.json`)
2. Upload to Lokalise: `npm run lokalise:push`
3. Translate in Lokalise (AI or manual)
4. Download translations: `npm run lokalise:pull`

## Variable Interpolation

Use `{{variable}}` syntax in translation values:

```json
{
  "welcome": {
    "subject": "Welcome to {{merchantName}}!",
    "body": "Hi {{memberName}}, you have {{points}} points."
  }
}
```

## Lokalise CLI Commands

```bash
# Upload English source files to Lokalise
npm run lokalise:upload

# Download all translations from Lokalise
npm run lokalise:download

# Aliases
npm run lokalise:push   # Same as upload
npm run lokalise:pull   # Same as download
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `LOKALISE_API_TOKEN` | Lokalise API token (stored in GitHub Secrets) |
| `LOKALISE_PROJECT_ID` | Lokalise project ID: `71116905697c499a444c46.97764157` |

## RTL Support

For RTL languages (Hebrew, Arabic, etc.):

```jsx
import { isRTL, getTextDirection } from '@loyaltydog/i18n/rtl';

// Check if current language is RTL
if (isRTL('he')) {
  // Apply RTL styles
}

// Get text direction for HTML
<html dir={getTextDirection(currentLanguage)}>
```

## Related Issues

- [SWE-321](https://linear.app/loyaltydog/issue/SWE-321) - Package setup (this)
- [SWE-262](https://linear.app/loyaltydog/issue/SWE-262) - i18next React integration
- [SWE-296](https://linear.app/loyaltydog/issue/SWE-296) - Backend translation loader
- [SWE-322](https://linear.app/loyaltydog/issue/SWE-322) - RTL support hooks
- [SWE-323](https://linear.app/loyaltydog/issue/SWE-323) - CI/CD sync workflow

## License

UNLICENSED - LoyaltyDog Internal Use Only
