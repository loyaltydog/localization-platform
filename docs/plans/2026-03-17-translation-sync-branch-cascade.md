# Translation Sync Branch Cascade Plan

**Date:** March 17, 2026
**Status:** ✅ Complete — Lokalise → Crowdin migration finished March 18, 2026
**Priority:** High

## Overview

Migration from Lokalise to Crowdin for translation management, completed as part of open-source release.

## Background

Previous state:
- Using Lokalise for translation management
- Single main branch for all translations
- CI/CD synced every 12 hours via GitHub Actions

Migration goals (all achieved):
- Switch to Crowdin (Open Source program) ✅
- Establish proper branch-based workflow ✅
- Enable community translations ✅
- Reduce costs ✅

---

## Tasks

### Task 1: Open-Source Preparation — ✅ Complete (March 18, 2026)
- ✅ Add MIT LICENSE file
- ✅ Update README.md for open-source with badges
- ✅ Make repository public
- ✅ Protect branches (main, staging, development) — loyaltydog/Development team only, admins can bypass

### Task 2: Apply for Crowdin Open Source License — ✅ Complete (March 18, 2026)
- ✅ Application submitted and approved same day

### Task 3: Create Crowdin Project — ✅ Complete (March 18, 2026)
- ✅ Project ID: 881724
- ✅ Source: English (US), 7 target languages configured

### Task 4: Install Crowdin CLI & Configure — ✅ Complete (March 18, 2026)
- ✅ `crowdin.yml` created at repo root
- ✅ `package.json` scripts updated (`crowdin:upload`, `crowdin:download`, `crowdin:status`)
- ✅ GitHub secrets added to `production` environment (`CROWDIN_PERSONAL_TOKEN`)

### Task 5: Update GitHub Actions Workflow — ✅ Complete (March 18, 2026)
- ✅ `i18n-sync.yml` updated to use Crowdin CLI
- ✅ Workflow now creates a PR instead of pushing directly to protected main

### Task 6: Migrate Existing Translations — ✅ Complete (March 18, 2026)
- ✅ Source strings (en-US) uploaded to Crowdin
- ✅ All 7 target language translations uploaded with `--import-eq-suggestions --auto-approve-imported`
- ✅ 1,650 translations confirmed in Crowdin

### Task 7: Update Documentation — ✅ Complete (March 18, 2026)
- ✅ README.md updated — Crowdin throughout, badges, MIT license
- ✅ `crowdin.yml` is the configuration reference

### Task 8: Test Migration — ✅ Complete (March 18, 2026)
- ✅ Translations seeded and visible in Crowdin dashboard
- ✅ Export pattern warning resolved (en-US mapping added)

### Task 9: Cleanup Lokalise — ✅ Complete (March 18, 2026)
- ✅ Removed `.lokalise2.yml`, `.lokalise.json`, `.lokalise-upload.yml`
- ✅ Removed `bin/lokalise2` Go binary
- ✅ Removed `i18n-upload.yml` GitHub Actions workflow
- ✅ Removed all underscore-format locale directories (en_US, en_GB, es_ES, es_MX, fr_FR, it_IT, pt_BR, pt_PT)
- ✅ Removed Lokalise npm scripts from `package.json`

### Task 10: Launch — ✅ Complete (March 18, 2026)
- ✅ Repository is public
- ✅ Community translations enabled via Crowdin open-source project

---

## Remaining Work: Increase Translation Coverage

The current translation keys cover navigation, actions, and core UI. The following areas need additional keys added to expand coverage:

- Merchant dashboard pages (forms, tables, settings)
- Backend email templates (currently hardcoded in Python)
- Error messages in consumer-facing flows
- Shopify / EPOSNow / Square integration strings

**Process for adding new keys:**
1. Add keys to `packages/i18n/locales/en-US/<namespace>.json`
2. Run `npm run crowdin:upload` to push new source strings to Crowdin
3. Crowdin AI translates for all 7 target languages
4. Run `npm run crowdin:download` or trigger the sync workflow to pull translations back
5. Commit updated locale files

---

## Success Criteria — All Met ✅

- ✅ Repository is public
- ✅ Crowdin project is created and configured
- ✅ All 8 languages are migrated
- ✅ CI/CD workflow is working
- ✅ Documentation is updated
- ✅ Lokalise is completely removed
- ✅ Translation sync creates PRs (compatible with branch protection)

---

**Last Updated:** March 18, 2026
**Maintainer:** Haim Barad (haim@loyalty.dog)
