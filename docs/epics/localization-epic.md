# Epic: Localization Platform

**Epic ID:** LOC-001
**Status:** In Progress
**Priority:** High
**Target Languages:** English → Spanish (Spain) → European languages

---

## Epic Overview

Enable multi-language support across all LoyaltyDog platforms (merchant dashboard, POS integrations, customer communications) using a centralized translation management system and shared i18n infrastructure.

### Success Criteria
- [ ] Spanish language fully supported across all touchpoints
- [ ] Translation workflow automated (CI/CD sync with Lokalise)
- [ ] Language switcher implemented in merchant dashboard
- [ ] All emails, SMS, and push notifications localized
- [ ] RTL hooks in place for future Hebrew/Arabic support
- [ ] Each integration repo can consume shared translations

### Estimated Timeline
- **Phase 1 (Foundation):** 2 weeks
- **Phase 2 (Spanish Translation):** 1-2 weeks
- **Phase 3 (Implementation):** 3 weeks
- **Phase 4 (Integrations):** 3 weeks
- **Phase 5 (Launch):** 1 week

**Total:** 10-11 weeks for Spanish rollout

---

## Stories Breakdown

### Phase 1: Foundation (Weeks 1-2)

| Story ID | Title | Priority | Estimate |
|----------|-------|----------|----------|
| SWE-321 | Set up Lokalise Project & Shared i18n Package | High | 3-5 days |
| SWE-262 | Implement i18next React Integration | High | 2-3 days |
| SWE-296 | Build Backend Translation Loader (FastAPI) | High | 2-3 days |
| SWE-322 | Implement RTL Support Hooks | Medium | 1-2 days |
| SWE-323 | Set Up CI/CD Sync with Lokalise | High | 1-2 days |

**Dependencies:** None (foundational work)

### Phase 2: Spanish Translation (Weeks 2-3)

| Story ID | Title | Priority | Estimate |
|----------|-------|----------|----------|
| SWE-324 | Add Spanish (Spain) Translations via Lokalise AI | High | 3-5 days |

**Dependencies:** SWE-321

### Phase 3: Implementation (Weeks 3-6)

| Story ID | Title | Priority | Estimate |
|----------|-------|----------|----------|
| SWE-326 | Create Language Switcher Component | High | 1-2 days |
| SWE-262 (expanded) | Localize Merchant Dashboard UI | High | 5-8 days |
| SWE-297 | Localize Email Templates | High | 2-3 days |
| SWE-325 | Localize SMS and Push Notifications | High | 2-3 days |
| SWE-299 | Add Language Detection & Persistence | High | 2-3 days |

**Dependencies:** SWE-262, SWE-296, SWE-324

### Phase 4: Integrations (Weeks 6-9)

| Story ID | Title | Priority | Estimate |
|----------|-------|----------|----------|
| SWE-266 | Localize Square Integration | Medium | 3-5 days |
| SWE-264 | Localize Shopify Integration | Medium | 3-5 days |
| SWE-263 | Localize EPOSNow Integration | Medium | 3-5 days |
| SWE-265 | Localize Clover Integration | Low | 2-3 days |
| SWE-267 | Localize WordPress Plugin | Low | 2-3 days |

**Dependencies:** SWE-262, SWE-324

**Note:** Integration work can be parallelized across multiple developers.

### Phase 5: Launch (Weeks 9-10)

| Story ID | Title | Priority | Estimate |
|----------|-------|----------|----------|
| SWE-327 | Comprehensive Testing & QA for Localization | High | 3-5 days |
| SWE-328 | Documentation & Developer Guide | Medium | 2-3 days |

**Dependencies:** All implementation stories

---

## Story Dependencies

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PHASE 1: FOUNDATION                         │
├─────────────────────────────────────────────────────────────────────┤
│  SWE-321: Set up Lokalise + i18n package         ← START HERE       │
│  SWE-262: i18next React integration                                 │
│  SWE-296: Backend translation loader (FastAPI)                      │
│  SWE-322: RTL support hooks                                         │
│  SWE-323: CI/CD sync with Lokalise                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         PHASE 2: TRANSLATION                        │
├─────────────────────────────────────────────────────────────────────┤
│  SWE-324: Add Spanish translations (Lokalise AI)                    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      PHASE 3: IMPLEMENTATION                        │
├─────────────────────────────────────────────────────────────────────┤
│  SWE-326: Language switcher component                               │
│  SWE-262: Localize merchant dashboard UI                            │
│  SWE-297: Localize email templates                                  │
│  SWE-325: Localize SMS/push notifications                           │
│  SWE-299: Language detection & persistence                          │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      PHASE 4: INTEGRATIONS                          │
├─────────────────────────────────────────────────────────────────────┤
│  SWE-266: Square integration  │                                     │
│  SWE-264: Shopify integration │  (Can run in parallel)               │
│  SWE-263: EPOSNow integration│                                     │
│  SWE-265: Clover integration │                                     │
│  SWE-267: WordPress plugin   │                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        PHASE 5: LAUNCH                              │
├─────────────────────────────────────────────────────────────────────┤
│  SWE-327: Testing & QA                                              │
│  SWE-328: Documentation                                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **Lokalise** | Best i18next integration, CLI for automation, AI translation |
| **Shared npm package** | Single source of truth, type-safe, no runtime dependency |
| **i18next + http-backend** | Load languages on-demand, smaller bundle |
| **JSON source files** | Language-agnostic, works for frontend + backend |
| **RTL hooks from day 1** | Zero-cost now, easy to enable later |
| **CI/CD sync** | Translations update automatically every 6 hours |

---

## Open Questions

| Question | Answer |
|----------|--------|
| **Lokalise API Token** | Stored in GitHub Secrets (`LOKALISE_API_TOKEN`) |
| **Project ID** | `71116905697c499a444c46.97764157` |
| **Spanish Translation Method** | Lokalise AI Translation (cost-effective) |
| **RTL Languages** | Hooks ready for Hebrew/Arabic (Phase 3+) |
| **Mono-repo or separate** | Separate repo: `loyaltydog/localization-platform` |

---

## Links

- **Linear Project:** [Localization of all platforms](https://linear.app/loyaltydog/project/localization-of-all-platforms-69e910b55561)
- **GitHub Repo:** [loyaltydog/localization-platform](https://github.com/loyaltydog/localization-platform)
- **Lokalise Project:** [LoyaltyDog Platform](https://app.lokalise.com/project/71116905697c499a444c46.97764157)

---

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Set up initial structure
3. ⏳ Begin SWE-321 (Set up Lokalise + i18n package)
4. ⏳ Install dependencies and test upload/download workflow

**Current Status:** Foundation setup complete. Ready to begin SWE-321.
