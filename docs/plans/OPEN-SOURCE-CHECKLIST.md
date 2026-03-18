# Open-Source & Crowdin Migration — Completed ✅

**Date Completed:** March 18, 2026

All phases of the open-source release and Lokalise → Crowdin migration are complete.

---

## Phase 1: Open-Source ✅
- ✅ Add MIT license (`LICENSE`, `LICENSE.md`)
- ✅ Update README.md with badges and Crowdin info
- ✅ Make repository public
- ✅ Protect branches (main, staging, development) — `loyaltydog/Development` team, admins can bypass

## Phase 2: Crowdin Setup ✅
- ✅ Crowdin open-source application approved (March 18, 2026)
- ✅ Crowdin project created (ID: 881724)
- ✅ `crowdin.yml` configured with correct locale mappings
- ✅ GitHub environment secrets added (`CROWDIN_PERSONAL_TOKEN` in `production`)

## Phase 3: Migration ✅
- ✅ Source strings (en-US) uploaded to Crowdin
- ✅ All 7 target language translations seeded (1,650 translations loaded, `--import-eq-suggestions`)
- ✅ Export pattern warning resolved (en-US added to `languages_mapping`)
- ✅ CI/CD sync workflow updated to Crowdin (creates PR on sync)

## Phase 4: Cleanup ✅
- ✅ Lokalise config files removed (`.lokalise2.yml`, `.lokalise.json`, `.lokalise-upload.yml`, `bin/lokalise2`)
- ✅ Lokalise GitHub Actions workflow removed (`i18n-upload.yml`)
- ✅ Underscore-format locale directories removed (en_US, en_GB, es_ES, es_MX, fr_FR, it_IT, pt_BR, pt_PT)
- ✅ Lokalise npm scripts replaced with Crowdin scripts in `package.json`

---

## Remaining Work: Increase Translation Coverage

Translation infrastructure is complete. Next phase is expanding string coverage:

| Area | Status |
|------|--------|
| Navigation & core UI | ✅ Done |
| Merchant dashboard pages & forms | ⏳ Pending |
| Backend email templates | ⏳ Pending |
| Consumer-facing error messages | ⏳ Pending |
| Shopify / EPOSNow / Square strings | ⏳ Pending |

**Quick commands:**
```bash
# Add new keys to the right namespace file, then:
npm run crowdin:upload    # push new source strings to Crowdin
npm run crowdin:download  # pull translated strings back
npm run crowdin:status    # check translation progress
```

---

**Repository:** https://github.com/loyaltydog/localization-platform
**Crowdin Project:** https://crowdin.com/project/loyaltydog
**Linear:** [Localization of all platforms](https://linear.app/loyaltydog/project/localization-of-all-platforms-69e910b55561)
**Maintainer:** Haim Barad (haim@loyalty.dog)
