# Translation Sync Branch Cascade Plan

**Date:** March 17, 2026
**Status:** Draft
**Priority:** High

## Overview

Plan to migrate from Lokalise to Crowdin for translation management and establish proper branch synchronization workflow.

## Background

Current state:
- Using Lokalise for translation management
- Single main branch for all translations
- CI/CD syncs every 12 hours via GitHub Actions

Migration goals:
- Switch to Crowdin (Open Source program)
- Establish proper branch-based workflow
- Enable community translations
- Reduce costs

---

## Tasks

### Task 1: Open-Source Preparation

**Status:** ✅ Complete
**Completed:** March 18, 2026

**Steps:**
1. ✅ Add MIT LICENSE file
2. ✅ Update README.md for open-source
3. ✅ Add badges (License, GitHub stars)
4. ✅ Add contributing guidelines
5. ⏸️ Make repository public (manual step)

**Required actions:**
- Manual: Go to https://github.com/loyaltydog/localization-platform/settings
- Scroll to "Danger Zone"
- Click "Change repository visibility"
- Select "Public" and confirm

---

### Task 2: Apply for Crowdin Open Source License

**Status:** ⏸️ Pending
**Priority:** High

**Steps:**
1. Visit: https://crowdin.com/product/for-open-source
2. Submit application for loyaltydog/localization-platform
3. Provide repository URL and description
4. Await approval (typically 1-3 business days)

**Required information:**
- Repository: https://github.com/loyaltydog/localization-platform
- Description: Multi-language localization infrastructure for web applications
- Languages: 8 target languages
- Project type: Open source

---

### Task 3: Create Crowdin Project

**Status:** ⏸️ Pending
**Blocked by:** Task 2 (Open Source approval)

**Steps:**
1. Log in to Crowdin
2. Create new project
3. Configure project settings:
   - **Project name:** LoyaltyDog Localization Platform
   - **Source language:** English (United States)
   - **Target languages:**
     - English (United Kingdom) - en-GB
     - Spanish (Spain) - es-ES
     - Spanish (Mexico) - es-MX
     - French - fr
     - Italian - it
     - Portuguese (Brazil) - pt-BR
     - Portuguese (Portugal) - pt-PT
4. Connect GitHub repository
5. Configure file mapping

**File mapping configuration:**
```
Source: /packages/i18n/locales/en-US/*.json
Translation: /packages/i18n/locales/%two_letters_code%/%original_file_name%
Type: JSON
```

---

### Task 4: Install Crowdin CLI

**Status:** ⏸️ Pending
**Blocked by:** Task 3 (Project creation)

**Steps:**

**Create `.crowdin.yml` at repository root:**

```yaml
project_id: "YOUR_PROJECT_ID"
api_token_env: "CROWDIN_PERSONAL_TOKEN"
base_path: "."
preserve_hierarchy: true

files:
  - source: /packages/i18n/locales/en-US/*.json
    translation: /packages/i18n/locales/%two_letters_code%/%original_file_name%
    type: json
    translate_attributes: false
    translate_content: true
    escape_quotes: 3
    escape_special_characters: true

    # Language mapping for special cases
    languages_mapping:
      two_letters_code:
        en-GB: en-GB
        es-ES: es-ES
        es-MX: es-MX
        pt-BR: pt-BR
        pt-PT: pt-PT
```

**Install Crowdin CLI:**

```bash
# Via npm
npm install -g @crowdin/cli

# Or via homebrew (macOS)
brew install crowdin
```

**Update package.json scripts:**

```json
{
  "scripts": {
    "crowdin:download": "crowdin download",
    "crowdin:upload": "crowdin upload sources",
    "crowdin:status": "crowdin status"
  }
}
```

---

### Task 5: Update GitHub Actions Workflow

**Status:** ⏸️ Pending
**Blocked by:** Task 3 (Project creation)

**Steps:**

**Update `.github/workflows/i18n-sync.yml`:**

```yaml
name: Sync Translations

on:
  workflow_dispatch:
  schedule:
    # Run every 12 hours at 00:00 and 12:00 UTC
    - cron: '0 */12 * * *'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.I18N_SYNC_PAT }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install Crowdin CLI
        run: npm install -g @crowdin/cli

      - name: Download translations from Crowdin
        run: crowdin download
        env:
          CROWDIN_PROJECT_ID: ${{ secrets.CROWDIN_PROJECT_ID }}
          CROWDIN_PERSONAL_TOKEN: ${{ secrets.CROWDIN_PERSONAL_TOKEN }}

      - name: Check for changes
        id: check_changes
        run: |
          if git diff --quiet packages/i18n/locales/; then
            echo "has_changes=false" >> $GITHUB_OUTPUT
          else
            echo "has_changes=true" >> $GITHUB_OUTPUT
          fi

      - name: Create Pull Request
        if: steps.check_changes.outputs.has_changes == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git checkout -b chore/update-translations-$(date +%Y%m%d-%H%M%S)
          git add packages/i18n/locales/
          git commit -m "chore: update translations from Crowdin"
          git push origin chore/update-translations-$(date +%Y%m%d-%H%M%S)
          gh pr create --title "chore: update translations from Crowdin" --body "Automated translation sync from Crowdin"
        env:
          GITHUB_TOKEN: ${{ secrets.I18N_SYNC_PAT }}
```

**Remove old Lokalise workflow and secrets:**
- Delete old `.github/workflows/i18n-sync.yml` (if exists)
- Remove secrets: `LOKALISE_API_TOKEN`, `LOKALISE_PROJECT_ID`
- Add secrets: `CROWDIN_PERSONAL_TOKEN`, `CROWDIN_PROJECT_ID`

---

### Task 6: Migrate Existing Translations

**Status:** ⏸️ Pending
**Blocked by:** Task 3 (Project creation)

**Steps:**

**Option A: Via Crowdin CLI (Recommended)**

```bash
# Export from Lokalise (one-time)
cd packages/i18n
npm run lokalise:download

# Upload to Crowdin
crowdin upload sources
crowdin upload translations --auto-approve-imported
```

**Option B: Manual Upload via Crowdin UI**

1. Download all translations from Lokalise
2. Go to Crowdin project
3. Use "Upload Files" feature
4. Upload all translation files manually
5. Map to correct languages

**Verification:**
- Check Crowdin dashboard for translation counts
- Verify all 1,063 keys are present
- Verify all 8 languages are configured
- Test download: `npm run crowdin:download`

---

### Task 7: Update Documentation

**Status:** ⏸️ Pending
**Blocked by:** Task 3 (Project creation)

**Files to update:**

**README.md:**
- Update architecture diagram
- Replace "Lokalise" with "Crowdin"
- Update installation instructions
- Update contribution guidelines

**CLAUDE.md:**
- Update Lokalise configuration section
- Update workflow descriptions
- Update project ID references

**docs/architecture.md:**
- Update translation management layer
- Update CI/CD workflow

**docs/contributing.md (create):**
```markdown
# Contributing to Translations

## Via Crowdin

1. Join our [Crowdin project](https://crowdin.com/project/loyaltydog-localization)
2. Select your language
3. Start translating!

## Adding New Translation Keys

1. Add keys to `packages/i18n/locales/en-US/[namespace].json`
2. Run `npm run crowdin:upload`
3. Translators will be notified
4. Translations will sync via CI/CD

## Adding New Languages

Contact maintainers to request a new language. We'll add it to Crowdin and configure the mapping.
```

---

### Task 8: Test Migration

**Status:** ⏸️ Pending
**Blocked by:** Task 6 (Migration complete)

**Test Checklist:**

- [ ] Download translations via CLI: `npm run crowdin:download`
- [ ] Verify all files are present: `ls packages/i18n/locales/*`
- [ ] Verify key counts match (1,063 keys per language)
- [ ] Test in React app: import and use translations
- [ ] Test in Python app: load translations via loader
- [ ] Trigger GitHub Actions manually
- [ ] Verify PR is created correctly
- [ ] Test language switching functionality
- [ ] Verify fallback behavior works

---

### Task 9: Cleanup

**Status:** ⏸️ Pending
**Blocked by:** Task 8 (Testing complete)

**Steps:**

**Remove Lokalise references:**
1. Delete `.lokalise.json` files
2. Remove Lokalise CLI scripts from package.json
3. Remove Lokalise dependencies
4. Archive Lokalise project

**Update CI/CD:**
1. Remove old Lokalise workflow file
2. Update GitHub secrets
3. Test new Crowdin workflow

**Archive Lokalise Project:**
1. Export final translations (backup)
2. Archive project in Lokalise
3. Cancel subscription (if applicable)

---

### Task 10: Launch

**Status:** ⏸️ Pending
**Blocked by:** Task 9 (Cleanup complete)

**Steps:**

1. **Make repository public** (if not already done)
2. **Announce migration:**
   - Create GitHub release
   - Update Linear project
   - Notify team members

3. **Enable community translations:**
   - Configure Crowdin project settings
   - Set up translation memory
   - Enable quality checks

4. **Monitor first sync:**
   - Watch GitHub Actions run
   - Verify translations download correctly
   - Check for any errors

---

## Success Criteria

- [ ] Repository is public
- [ ] Crowdin project is created and configured
- [ ] All 8 languages are migrated
- [ ] All 1,063 translation keys are present
- [ ] CI/CD workflow is working
- [ ] Documentation is updated
- [ ] Lokalise is completely removed
- [ ] First automated sync completes successfully

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Crowdin Open Source approval delay | High | Submit application early, have paid plan as fallback |
| Translation keys mismatch | Medium | Comprehensive testing before launch |
| CI/CD workflow issues | Medium | Test thoroughly in feature branch |
| Community translation quality | Low | Enable Crowdin QA checks, review process |

---

## Timeline

| Task | Duration | Dependencies |
|------|----------|--------------|
| Open-Source preparation | 1 day | None |
| Crowdin application | 1-3 days (waiting) | None |
| Project creation | 1 day | Application approved |
| CLI installation | 0.5 day | Project created |
| GitHub Actions update | 0.5 day | CLI installed |
| Migration | 1 day | Project created |
| Documentation update | 0.5 day | Migration complete |
| Testing | 1 day | Migration complete |
| Cleanup | 0.5 day | Testing complete |
| Launch | 0.5 day | Cleanup complete |

**Total:** 7-10 days (excluding waiting for approval)

---

## Next Steps

1. **Immediate:** Make repository public
2. **Today:** Submit Crowdin Open Source application
3. **This week:** Prepare all configuration files
4. **Upon approval:** Execute migration tasks

---

## References

- Crowdin Open Source: https://crowdin.com/product/for-open-source
- Crowdin CLI docs: https://developer.crowdin.com/crowdin-cli/
- Crowdin GitHub Action: https://github.com/crowdin/github-action
- Repository: https://github.com/loyaltydog/localization-platform
- Linear Project: [Localization of all platforms](https://linear.app/loyaltydog/project/localization-of-all-platforms-69e910b55561)

---

**Last Updated:** March 18, 2026
**Maintainer:** Haim Barad (haim@loyalty.dog)
