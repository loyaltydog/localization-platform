# Staging Promotion Strategy — Localization Platform

**Date:** 2026-03-16
**Status:** Approved
**Scope:** localization-platform, core_api, loyaltydog-eposnow, loyaltydog-shopify

---

## Problem

Localization work (translation files, i18next integration, backend API endpoints) has been built in `development` but has no path to staging. The `localization-platform` repo has no remote `staging` branch, and consumer repo deploy workflows do not embed translations at build time.

---

## Approach: Branch-per-environment + CI copy

Each environment (`staging`, `production`) maps to a branch in `localization-platform`. Consumer repo deploy workflows check out the appropriate branch and copy translation files into the Docker build context before building the image.

---

## Branch Structure

### localization-platform

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready translations. Lokalise CI sync targets this branch only. |
| `staging` | Translations validated for staging. Promoted from `main` via manual PR. |

The Lokalise 12-hourly sync (`i18n-sync.yml`) continues to target `main` unchanged. No automated sync to `staging`.

### core_api

No branch structure changes. Existing `development` → `staging` → `main` model is used as-is.

---

## Translation Promotion Flow

```
Lokalise AI Translation
        ↓
  i18n/sync-* branch → auto-PR → localization-platform:main
                                          ↓
                               Manual PR: main → staging
                               (team decision: batch ready for staging QA)
                                          ↓
                         core_api staging deploy embeds locales
                                          ↓
                               QA validates in staging environment
                                          ↓
                         core_api development → staging PR merged
```

**Promotion is manual and deliberate** — a developer opens `main → staging` in localization-platform when a translation batch is ready for QA. No automation; this is an intentional gate.

---

## CI/CD Changes

### core_api — `deploy-backend-staging.yml` and `deploy-frontend-staging.yml`

Add the following two steps inside the `build_and_push` job, **before** the Docker build step:

```yaml
- name: Checkout localization-platform translations
  uses: actions/checkout@v4
  with:
    repository: loyaltydog/localization-platform
    ref: staging
    path: localization-platform
    token: ${{ secrets.GITHUB_TOKEN }}

- name: Copy translation files into build context
  run: cp -r localization-platform/packages/i18n/locales backend/locales
  # frontend workflow: cp -r localization-platform/packages/i18n/locales frontend/locales
```

> **Note:** The exact destination path (`backend/locales`) must be confirmed against the value `I18N_PACKAGE_PATH` resolves to inside the container, and the `COPY` instruction in the Dockerfile.

### core_api — Production (future)

Same change applied to `deploy-backend-production.yml` and `deploy-frontend-production.yml`, using `ref: main` instead of `ref: staging`.

---

## Repo-by-Repo Summary

| Repo | Immediate Change | Future |
|------|-----------------|--------|
| `localization-platform` | Create and push `staging` branch from current `main` HEAD | Maintain `staging` as long-lived environment branch |
| `core_api` | Open PR: `development` → `staging` (50+ localization commits); add checkout+copy steps to staging deploy workflows | Same pattern for production deploy workflows |
| `loyaltydog-eposnow` | No change — localization not yet implemented | Add checkout+copy steps when localization work begins |
| `loyaltydog-shopify` | No change — localization not yet implemented | Add checkout+copy steps when localization work begins |

---

## What "Staging Promotion" Means Operationally

To promote a new set of translations to staging:

1. Ensure translations are merged and passing tests on `localization-platform:main`
2. Open PR: `localization-platform:main` → `localization-platform:staging`
3. Merge PR
4. Trigger or wait for next `core_api` staging deploy (push to `core_api:staging` or `workflow_dispatch`)
5. New translations are live in staging environment

To promote core_api localization features to staging:

1. Open PR: `core_api:development` → `core_api:staging`
2. Ensure staging deploy workflows include the localization checkout+copy steps
3. Merge and deploy

---

## Out of Scope

- Publishing `@loyaltydog/i18n` to npm (deferred open decision)
- Language persistence strategy (DB vs localStorage vs cookie)
- Shopify locale source (`window.Shopify.locale` vs API)
- Upgrading loyaltydog-eposnow from React 16 before localization
