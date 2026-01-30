# @loyaltydog/i18n

Shared localization package for the LoyaltyDog platform using i18next and Lokalise.

## Installation

```bash
npm install @loyaltydog/i18n
```

## Usage

### React (Frontend)

```tsx
import { useTranslation } from '@loyaltydog/i18n/react';

function Dashboard() {
  const { t, i18n } = useTranslation('common');

  const switchLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div>
      <h1>{t('nav.dashboard')}</h1>
      <button onClick={() => switchLanguage('es')}>Español</button>
      <button onClick={() => switchLanguage('en')}>English</button>
    </div>
  );
}
```

### FastAPI (Backend)

```python
from @loyaltydog.i18n import TranslationLoader

# Initialize translator for a specific locale
translator = TranslationLoader('es-ES')

# Get translated string with variable interpolation
subject = translator.translate(
    'emails',
    'welcome.subject',
    merchantName="Mi Tienda"
)
# Result: "¡Bienvenido al programa de lealtad de Mi Tienda!"
```

## Translation File Structure

```
locales/
├── en/                    # English (source of truth)
│   ├── common.json        # Navigation, buttons, labels
│   ├── errors.json        # Error messages
│   ├── emails.json        # Email templates
│   ├── notifications.json # SMS/push templates
│   └── validation.json    # Form validation messages
└── es-ES/                 # Spanish (Spain)
    ├── common.json        # Same structure as en/
    ├── errors.json
    ├── emails.json
    ├── notifications.json
    └── validation.json
```

## Translation Keys

Key format: `namespace.category.item`

```json
{
  "nav": {
    "dashboard": "Dashboard",
    "rewards": "Rewards"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel"
  },
  "emails": {
    "welcome": {
      "subject": "Welcome to {{merchantName}}!",
      "body": "Hi {{memberName}}, you have {{points}} points."
    }
  }
}
```

## Lokalise Workflow

### Upload New Translations

```bash
cd packages/i18n
npm run lokalise:upload
```

### Download Translations

```bash
cd packages/i18n
npm run lokalise:download
```

### CI/CD Auto-Sync

Translations are automatically synced from Lokalise every 6 hours via GitHub Actions.

Manual sync: Go to Actions → "Sync Translations" → "Run workflow"

## Adding New Translation Keys

1. Add keys to `locales/en/*.json` (English is source of truth)
2. Run `npm run lokalise:upload`
3. Translators work in Lokalise (AI or manual)
4. Wait for CI/CD sync or run `npm run lokalise:download`

## Adding New Languages

1. Add language in Lokalise project
2. Configure in `.lokalise.json`:
   ```json
   {
     "download": {
       "langs": [
         { "lang_iso": "fr", "trans_replace": ["locales/fr"] }
       ]
     }
   }
   ```
3. Run `npm run lokalise:download`
4. Update `supportedLngs` in `src/react/i18n-config.ts`

## RTL Support

For future Hebrew/Arabic support:

```tsx
import { getTextDirection, rtlClass } from '@loyaltydog/i18n/rtl';

<nav dir={getTextDirection()} className={rtlClass({
  base: 'flex',
  rtl: 'flex-row-reverse'
})}>
  {/* Menu items */}
</nav>
```

## Namespaces

| Namespace | Purpose |
|-----------|---------|
| `common` | Navigation, buttons, labels |
| `errors` | Error messages |
| `emails` | Email templates |
| `notifications` | SMS/push notifications |
| `validation` | Form validation messages |
| `square` | Square integration |
| `shopify` | Shopify integration |
| `eposnow` | EPOSNow integration |

## License

Copyright © 2025 LoyaltyDog. All rights reserved.
