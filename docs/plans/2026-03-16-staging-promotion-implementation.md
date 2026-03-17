# Staging Promotion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Promote localization support from development to staging across localization-platform, core_api, and prepare template for integration repos.

**Architecture:** Branch-per-environment model where localization-platform `staging` branch feeds translation files into core_api's staging Docker build via CI checkout + copy step.

**Tech Stack:** GitHub Actions, Docker, Git, Lokalise CLI

---

## Task 1: Verify localization-platform staging branch exists

**Files:**
- Verify: `remote branch origin/staging`

**Step 1: Verify staging branch exists on remote**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/localization-platform
git fetch origin
git branch -r | grep staging
```

Expected output:
```
origin/staging
```

**Step 2: Verify staging branch contains design doc**

```bash
git checkout staging
git log --oneline -3
ls docs/plans/
```

Expected: File `docs/plans/2026-03-16-staging-promotion-design.md` exists and most recent commit references it.

**Step 3: No commit needed** — branch was created in previous step.

---

## Task 2: Add checkout step to core_api backend staging deploy

**Files:**
- Modify: `/Users/haimbarad/Documents/GitHub/loyaltydog/core_api/.github/workflows/deploy-backend-staging.yml`

**Step 1: Locate the build_and_push job in deploy-backend-staging.yml**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/core_api
cat .github/workflows/deploy-backend-staging.yml | grep -A 30 "build_and_push:" | head -35
```

Expected output shows job structure with steps including Docker build. Note the line number of the step immediately before `docker/build-push-action`.

**Step 2: Add checkout and copy steps before Docker build**

Insert these two steps **immediately before** the `Build and Push Application to DigitalOcean Container Registry` step:

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
```

**Step 3: Verify workflow syntax is valid**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/core_api
yamllint .github/workflows/deploy-backend-staging.yml || echo "yamllint not installed, skipping syntax check"
```

Expected: No syntax errors (if yamllint is available).

**Step 4: Commit the change**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/core_api
git checkout development
git pull origin development
git checkout -b feature/deploy-staging-localization-checkout
git add .github/workflows/deploy-backend-staging.yml
git commit -m "feat(deploy): checkout localization-platform@staging in backend staging deploy (LOC-8.0)

- Add checkout step for localization-platform repo using staging ref
- Copy locales/ into backend/ build context before Docker build
- Enables staging environment to use staging translations

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Add checkout step to core_api frontend staging deploy

**Files:**
- Modify: `/Users/haimbarad/Documents/GitHub/loyaltydog/core_api/.github/workflows/deploy-frontend-staging.yml`

**Step 1: Add checkout and copy steps before Docker build**

Insert the same two steps from Task 2, **immediately before** the `Build and Push Application to DigitalOcean Container Registry` step:

```yaml
      - name: Checkout localization-platform translations
        uses: actions/checkout@v4
        with:
          repository: loyaltydog/localization-platform
          ref: staging
          path: localization-platform
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Copy translation files into build context
        run: cp -r localization-platform/packages/i18n/locales frontend/locales
```

**Step 2: Commit the change**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/core_api
git add .github/workflows/deploy-frontend-staging.yml
git commit -m "feat(deploy): checkout localization-platform@staging in frontend staging deploy (LOC-8.0)

- Add checkout step for localization-platform repo using staging ref
- Copy locales/ into frontend/ build context before Docker build
- Enables staging environment to use staging translations

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Verify I18N_PACKAGE_PATH and Docker COPY instruction alignment

**Files:**
- Inspect: `/Users/haimbarad/Documents/GitHub/loyaltydog/core_api/backend/loyaltydog_api/api/v2/localization.py`
- Inspect: `/Users/haimbarad/Documents/GitHub/loyaltydog/core_api/backend/Dockerfile`
- Inspect: `/Users/haimbarad/Documents/GitHub/loyaltydog/core_api/frontend/Dockerfile`

**Step 1: Find I18N_PACKAGE_PATH usage in backend code**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/core_api/backend
grep -rn "I18N_PACKAGE_PATH" loyaltydog_api/
```

Expected: File `loyaltydog_api/api/v2/localization.py` uses this environment variable or config value. Note the default path it resolves to.

**Step 2: Check backend Dockerfile for COPY instruction**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/core_api/backend
grep -n "COPY\|locales\|i18n" Dockerfile
```

Expected: Note whether there's an existing COPY instruction for locales, or if it expects locales to be in the build context.

**Step 3: Verify path alignment**

The copy destination in the workflow (`backend/locales` or `frontend/locales`) must match:
1. The path `I18N_PACKAGE_PATH` resolves to at runtime
2. The path Dockerfile copies from (e.g., `COPY locales /app/locales`)

**If path mismatch exists:**

Create a task to adjust the copy destination path in the workflow to match the Dockerfile expectation.

**If path alignment confirmed:**

Document in implementation notes that no path adjustment is needed.

**Step 4: No commit needed** — this is a verification task. Document findings in a comment or note.

---

## Task 5: Open PR in core_api (development → staging)

**Files:**
- Create: GitHub PR from `feature/deploy-staging-localization-checkout` to `staging`

**Step 1: Push feature branch to remote**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/core_api
git push -u origin feature/deploy-staging-localization-checkout
```

**Step 2: Create PR using gh CLI**

```bash
gh pr create \
  --base staging \
  --title "feat(deploy): add localization checkout to staging deploy workflows (LOC-8.0)" \
  --body "## Summary

This PR integrates staging translations from localization-platform into core_api staging deployments.

### Changes

- \`deploy-backend-staging.yml\`: Checkout localization-platform@staging and copy locales to backend/
- \`deploy-frontend-staging.yml\`: Checkout localization-platform@staging and copy locales to frontend/

### Test Plan

- [ ] Verify workflow syntax is valid (yamllint)
- [ ] After merge, trigger staging deploy and verify locales are copied into build
- [ ] In staging environment, verify backend GET /v2/localization/translations/{lng} returns translations from staging branch

### Related

Design doc: [localization-platform/docs/plans/2026-03-16-staging-promotion-design.md](https://github.com/loyaltydog/localization-platform/blob/main/docs/plans/2026-03-16-staging-promotion-design.md)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

Expected: PR created at URL like `https://github.com/loyaltydog/core_api/pull/XXX`

**Step 3: Request review from appropriate team member**

```bash
# Example: request review from @haimbarad
gh pr edit --add-reviewer haimbarad
```

**Step 4: No commit needed** — PR is the delivery mechanism.

---

## Task 6: Document template for eposnow integration (when localization is implemented)

**Files:**
- Create: `/Users/haimbarad/Documents/GitHub/loyaltydog/loyalty-cards-eposnow/.github/workflows/deploy-staging.yml` (when it exists)

**Step 1: Create documentation file in eposnow repo**

```bash
# Only when eposnow localization work begins
cd /Users/haimbarad/Documents/GitHub/loyaltydog/loyalty-cards-eposnow
mkdir -p docs/plans
cat > docs/plans/localization-staging-template.md << 'EOF'
# EPOSNow Localization Staging Integration (Template)

When localization is implemented in this repo, follow these steps to integrate with localization-platform staging:

## Step 1: Add checkout step to staging deploy workflow

In `.github/workflows/deploy-staging.yml`, add before Docker build:

\`\`\`yaml
      - name: Checkout localization-platform translations
        uses: actions/checkout@v4
        with:
          repository: loyaltydog/localization-platform
          ref: staging
          path: localization-platform
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Copy translation files into build context
        run: cp -r localization-platform/packages/i18n/locales <your-build-context>/locales
\`\`\`

Replace \`<your-build-context>\` with the appropriate path for your project structure.

## Step 2: Verify path alignment

Ensure the copy destination matches where your i18n loader expects translation files at runtime.

## Reference

Full design: [localization-platform/docs/plans/2026-03-16-staging-promotion-design.md](https://github.com/loyaltydog/localization-platform/blob/main/docs/plans/2026-03-16-staging-promotion-design.md)
EOF
```

**Step 2: Commit the template**

```bash
git add docs/plans/localization-staging-template.md
git commit -m "docs: add localization staging integration template (LOC-8.0)

Document steps for future localization integration with localization-platform staging branch.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

**Step 3: Create equivalent documentation in shopify repo**

Repeat the same process in `/Users/haimbarad/Documents/GitHub/loyaltydog/loyalty-cards-shopify`.

---

## Task 7: Update MEMORY.md with staging branch status

**Files:**
- Modify: `/Users/haimbarad/.claude/projects/-Users-haimbarad-Documents-GitHub-loyaltydog-localization-platform/memory/MEMORY.md`

**Step 1: Add staging branch information to project memory**

Add entry to MEMORY.md:

```markdown
## Staging Promotion Strategy (2026-03-16)

**Branch Strategy:**
- localization-platform: `main` (production), `staging` (staging translations)
- core_api: staging deploy workflows checkout localization-platform@staging and copy locales into build context
- Promotion: Manual PR from localization-platform main → staging

**Implementation Status:**
- ✅ localization-platform staging branch created
- ✅ Design doc: docs/plans/2026-03-16-staging-promotion-design.md
- 🔄 core_api staging deploy workflows modified (PR pending)
- 📋 eposnow/shopify templates documented (for future use)

**Next Steps:**
- Merge core_api staging deploy PR
- QA staging environment with staging translations
- Add same checkout steps to production deploy workflows when ready
```

**Step 2: Commit memory update**

```bash
cd /Users/haimbarad/.claude/projects/-Users-haimbarad-Documents-GitHub-loyaltydog-localization-platform/memory
git add MEMORY.md
git commit -m "mem: document staging promotion strategy and implementation status (LOC-8.0)"
```

---

## Verification Steps (After All Tasks Complete)

**Verify 1: Check workflow syntax**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/core_api
yamllint .github/workflows/deploy-backend-staging.yml
yamllint .github/workflows/deploy-frontend-staging.yml
```

**Verify 2: Test checkout and copy locally**

```bash
# Create a temporary test directory
cd /tmp
mkdir test-i18n-checkout
cd test-i18n-checkout

# Test checkout
gh repo clone loyaltydog/localization-platform -- --branch staging --depth 1
ls localization-platform/packages/i18n/locales

# Verify all expected locales exist
ls localization-platform/packages/i18n/locales/
```

Expected: Directories for `en-US`, `en-GB`, `es-ES`, `es-MX`, `fr`, `it`, `pt-BR`, `pt-PT`

**Verify 3: Confirm staging branch in localization-platform**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/localization-platform
git fetch origin
git branch -r | grep staging
git log origin/staging --oneline -3
```

Expected: `origin/staging` exists and shows recent commits including design doc.

---

## Rollback Plan (If Issues Arise)

**Rollback 1: Revert staging deploy workflow changes**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/core_api
git checkout staging
git revert <commit-hash-of-deploy-workflow-change>
git push origin staging
```

**Rollback 2: Delete staging branch in localization-platform (if unused)**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/localization-platform
git push origin --delete staging
git branch -D staging
```

---

## Open Decisions / Deferred Items

1. **Path alignment:** Exact destination path (`backend/locales` vs other) to be confirmed during Task 4 based on Dockerfile inspection.

2. **Production promotion:** Adding `ref: main` checkout steps to production deploy workflows is deferred until staging is validated.

3. **npm package publishing:** Decision on publishing `@loyaltydog/i18n` to npm remains open — current path dependency model continues.

---

## Related Work

- **Design Document:** `docs/plans/2026-03-16-staging-promotion-design.md`
- **Linear Project:** Localization of all platforms
- **Lokalise Project:** [LoyaltyDog Platform](https://app.lokalise.com/project/71116905697c499a444c46.97764157)
