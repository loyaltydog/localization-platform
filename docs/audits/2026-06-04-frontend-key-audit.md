# Frontend i18n Key-Reference Audit

_Generated: 2026-06-04T17:29:36.751Z_

Reproduce: `node scripts/audit-frontend-keys.mjs` (paths overridable via flags/env).

## Summary

| Metric | Value |
|---|---|
| Files scanned | 716 |
| Total `t()` reference occurrences | 2124 |
| Unique referenced keys (ns:key) | 1858 |
| **M1** referenced but MISSING from en-US JSON | **0** |
| **M3** referenced but MISSING from BOTH JSON & bundle | **0** |
| Namespace mismatch (key exists, wrong namespace) | 0 |
| M2 referenced: in JSON, not in bundle | 0 |
| M2 referenced: in bundle, not in JSON | 0 |
| M2 full drift: in JSON, not in bundle | 2187 |
| M2 full drift: in bundle, not in JSON | 4 |
| Dynamic keys (manual review) | 32 |

### Inputs

- Frontend src: `/tmp/wt-core_api-i18n/frontend/src`
- en-US locale dir: `/tmp/wt-locplat-i18n/packages/i18n/locales/en-US`
- Bundled fallback: `/tmp/wt-core_api-i18n/frontend/src/lib/i18n-utils.ts`
- TypeScript module: `/tmp/wt-core_api-i18n/frontend/node_modules/typescript`

### Locale JSON namespaces (leaf key counts)

- `clover`: 35
- `common`: 2782
- `emails`: 409
- `eposnow`: 18
- `errors`: 284
- `giftCards`: 536
- `marketing`: 32
- `notifications`: 103
- `shopify`: 23
- `validation`: 141
- `wordpress`: 618

### Bundled fallback namespaces (leaf key counts)

- `common`: 2766
- `marketing`: 32

## M1 — Referenced in frontend, MISSING from en-US JSON

These keys must be ADDED to the en-US source-of-truth (grouped by namespace).
`(bundled)` = also present in the frontend fallback bundle (so it renders today but isn't in source JSON).

_None._

## M3 — Referenced but MISSING from BOTH JSON and bundle (likely code bug)

Probable wrong path/casing in frontend code — these need a CODE FIX.

_None._

## Namespace mismatch — key exists, but under a DIFFERENT namespace

The code references `resolvedNs:key`, and `key` is absent from `resolvedNs` but present under another namespace in JSON (and/or bundle). These are informational: either the code's namespace attribution is wrong, or the resolved namespace (often via the nearest `useTranslation` heuristic) mis-attributed the call. They are NOT counted as truly-missing (M1/M3). Spot-check before acting.

_None._

## M2 — JSON / bundle drift

### Referenced keys present in JSON but NOT in bundle (0)

These render from the API but would be missing if the backend is unreachable (fallback gap).

_None._

### Referenced keys present in bundle but NOT in JSON (0)

_None._

### Full drift (all keys, not just referenced)

- In JSON but not bundle: **2187**
- In bundle but not JSON: **4**

## Dynamic keys — manual review

Keys built from template literals / variables; not statically resolvable.

- src/app/(cpanel)/(admin)/admin/ai-advisor/page.tsx:227 — `labelKey`
- src/app/(cpanel)/(admin)/admin/reports/ReportsClientParts.tsx:16 — `titleKey`
- src/app/(cpanel)/(admin)/admin/reports/ReportsClientParts.tsx:24 — `titleKey`
- src/app/(cpanel)/(user)/account/verification/page.tsx:44 — `errorKey`
- src/app/(cpanel)/(user)/loyalty/[programId]/analytics-client.tsx:41 — `label`
- src/app/(cpanel)/(user)/loyalty/programs/[programId]/offers/offers-table.tsx:53 — ``loyalty.offers.status.${offer.status.toLowerCase()}``
- src/app/(cpanel)/(user)/loyalty/programs/[programId]/vouchers/vouchers-table.tsx:45 — ``loyalty.vouchers.status.${voucher.status.toLowerCase()}``
- src/app/(marketing)/_components/ComingSoonRow.tsx:21 — `i.descriptionKey`
- src/app/(marketing)/_components/CookieConsentBanner.tsx:60 — `M.cookies.banner`
- src/app/(marketing)/_components/CookieConsentBanner.tsx:63 — `M.cookies.essentialsOnly`
- src/app/(marketing)/_components/CookieConsentBanner.tsx:66 — `M.cookies.acceptAll`
- src/app/(marketing)/_components/FaqSection.tsx:21 — `item.q`
- src/app/(marketing)/_components/FaqSection.tsx:22 — `item.a`
- src/app/(marketing)/_components/Hero.tsx:15 — `M.hero.headline`
- src/app/(marketing)/_components/Hero.tsx:16 — `M.hero.subhead`
- src/app/(marketing)/_components/Hero.tsx:22 — `M.hero.ctaPrimary`
- src/app/(marketing)/_components/Hero.tsx:24 — `M.hero.ctaDisclaimer`
- src/app/(marketing)/_components/Hero.tsx:26 — `M.hero.ctaLogin`
- src/app/(marketing)/_components/IntegrationGrid.tsx:19 — `i.descriptionKey`
- src/app/(marketing)/_components/IntegrationTile.tsx:27 — `M.integrations.comingSoon`
- src/app/(marketing)/_components/MarketingFooter.tsx:16 — `M.footer.privacy`
- src/app/(marketing)/_components/MarketingFooter.tsx:17 — `M.footer.terms`
- src/app/(marketing)/_components/MarketingFooter.tsx:18 — `M.footer.dpa`
- src/app/(marketing)/_components/MarketingFooter.tsx:19 — `M.footer.cookies`
- src/app/(marketing)/_components/MarketingNav.tsx:29 — `M.nav.login`
- src/app/(marketing)/_components/MarketingNav.tsx:32 — `M.nav.trial`
- src/app/(marketing)/_components/Pricing.tsx:18 — `M.pricing.amount`
- src/app/(marketing)/_components/Pricing.tsx:19 — `M.pricing.period`
- src/app/(marketing)/_components/Pricing.tsx:21 — `M.pricing.disclaimer`
- src/app/(marketing)/_components/Pricing.tsx:22 — `M.pricing.channelNote`
- src/components/MetricSwitcher.tsx:48 — `METRIC_OPTIONS.find((opt) => opt.value === selectedMetric)?.translationKey || "components.metricSelectMetric"`
- src/components/MetricSwitcher.tsx:82 — `option.translationKey`

