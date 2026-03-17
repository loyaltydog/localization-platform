# Staging Promotion Implementation Plan — REVISED (Critical Fixes)

> **For Claude:** This plan supersedes parts of the original implementation plan due to critical architectural findings from Task 4.

**Date:** 2026-03-16 (Revised after Task 4 verification)
**Original Plan:** `docs/plans/2026-03-16-staging-promotion-implementation.md`

---

## Critical Issues Found (Task 4)

**Original Implementation (Incorrect):**
- CI copied to `backend/locales`
- Dockerfile didn't include locale files
- No `I18N_PACKAGE_PATH` environment variable

**Backend Requirements (from `localization.py`):**
- `I18N_PACKAGE_PATH` must point to package root (e.g., `/app/packages/i18n/`)
- Path must match hardcoded allowlist
- Package must contain `src/node/api_helpers.py`

**The Fix:**
1. Copy entire package structure: `backend/packages/i18n/`
2. Dockerfile: `COPY packages/i18n ./packages/i18n`
3. Set `ENV I18N_PACKAGE_PATH=/app/packages/i18n`

---

## Revised Task 2: Add checkout step to core_api backend staging deploy

**Files:**
- Modify: `/Users/haimbarad/Documents/GitHub/loyaltydog/core_api/.github/workflows/deploy-backend-staging.yml`
- Modify: `/Users/haimbarad/Documents/GitHub/loyaltydog/core_api/backend/Dockerfile`

**Step 1: Update workflow copy destination**

Replace the previous copy step with the correct package structure:

```yaml
      # NOTE: localization-platform is private. GITHUB_TOKEN cross-repo access may fail.
      # If checkout fails, create a PAT secret and use: token: ${{ secrets.LOCALIZATION_PAT }}
      - name: Checkout localization-platform translations
        uses: actions/checkout@v4
        with:
          repository: loyaltydog/localization-platform
          ref: staging
          path: localization-platform
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Copy i18n package into build context
        run: cp -r localization-platform/packages/i18n backend/packages/i18n

      - name: Verify i18n package was copied
        run: |
          if [ ! -d "backend/packages/i18n" ]; then
            echo "ERROR: backend/packages/i18n not found after copy"
            exit 1
          fi
          if [ ! -f "backend/packages/i18n/src/node/api_helpers.py" ]; then
            echo "ERROR: api_helpers.py not found - package structure incomplete"
            exit 1
          fi
          echo "i18n package copied successfully:"
          ls -la backend/packages/i18n/
```

**Step 2: Update backend Dockerfile**

Add to `/Users/haimbarad/Documents/GitHub/loyaltydog/core_api/backend/Dockerfile` (after the existing COPY instructions):

```dockerfile
# Copy i18n package for localization support
COPY packages/i18n ./packages/i18n

# Set i18n package path
ENV I18N_PACKAGE_PATH=/app/packages/i18n
```

**Step 3: Verify and commit**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/core_api

# Verify Dockerfile syntax
docker build -f backend/Dockerfile --target test . || echo "Dockerfile syntax check"

# Create or reset feature branch
git checkout development
git pull origin development
git checkout -b feature/deploy-staging-localization-checkout

# If branch already exists with old commits, reset it
# git branch -D feature/deploy-staging-localization-checkout
# git checkout -b feature/deploy-staging-localization-checkout

git add .github/workflows/deploy-backend-staging.yml backend/Dockerfile
git commit -m "feat(deploy): add i18n package to backend staging deploy (LOC-8.0)

- Checkout localization-platform@staging and copy entire i18n package
- Update Dockerfile to COPY packages/i18n into container
- Set I18N_PACKAGE_PATH=/app/packages/i18n environment variable
- Fixes path alignment with backend localization.py requirements

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Revised Task 3: Frontend staging deploy — NO CHANGES NEEDED

**Finding:** Frontend loads translations via backend API, not filesystem.

**Action:** No checkout/copy steps needed in frontend workflow.

**Step 1: Verify frontend workflow is clean**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/core_api
git checkout feature/deploy-staging-localization-checkout

# If frontend workflow was previously modified, revert those changes
# git checkout origin/development -- .github/workflows/deploy-frontend-staging.yml

# Verify no locale-related steps in frontend workflow
grep -i "locale\|i18n\|localization" .github/workflows/deploy-frontend-staging.yml || echo "No locale steps in frontend workflow (correct)"
```

**Step 2: No commit needed** — frontend workflow should remain unchanged.

---

## Task 5: Open PR in core_api (development → staging)

**Changes:**
- Only backend workflow and Dockerfile are modified
- Frontend workflow is unchanged

**PR Body:**

```markdown
## Summary

This PR integrates staging translations from localization-platform into core_api **backend** staging deployments. Frontend requires no changes as it loads translations via backend API.

### Changes

- `deploy-backend-staging.yml`: Checkout localization-platform@staging and copy entire i18n package
- `backend/Dockerfile`: COPY packages/i18n into container, set I18N_PACKAGE_PATH
- `deploy-frontend-staging.yml`: No changes (frontend loads via API)

### Test Plan

- [ ] Verify workflow syntax is valid (yamllint)
- [ ] Verify Dockerfile builds successfully
- [ ] After merge, trigger staging deploy and verify i18n package is in container
- [ ] In staging environment, verify GET /v2/localization/translations/{lng} returns translations from staging branch
- [ ] Verify I18N_PACKAGE_PATH is set correctly in container

### Related

Design doc: [localization-platform/docs/plans/2026-03-16-staging-promotion-design.md](https://github.com/loyaltydog/localization-platform/blob/main/docs/plans/2026-03-16-staging-promotion-design.md)
Revised plan: [localization-platform/docs/plans/2026-03-16-staging-promotion-implementation-revised.md](https://github.com/loyaltydog/localization-platform/blob/main/docs/plans/2026-03-16-staging-promotion-implementation-revised.md)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## Verification Steps (After Implementation)

**Verify 1: Check package structure in build context**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/core_api

# Temporarily run the checkout and copy steps locally
mkdir -p /tmp/test-i18n-build
cd /tmp/test-i18n-build

git clone https://github.com/loyaltydog/localization-platform.git --branch staging --depth 1
cp -r localization-platform/packages/i18n backend/packages/i18n

# Verify structure
ls -la backend/packages/i18n/
ls -la backend/packages/i18n/src/node/

# Should see api_helpers.py
test -f backend/packages/i18n/src/node/api_helpers.py && echo "✅ Package structure correct" || echo "❌ Missing api_helpers.py"
```

**Verify 2: Check Dockerfile COPY instruction**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/core_api/backend
grep -A 2 "COPY packages/i18n" Dockerfile
grep "I18N_PACKAGE_PATH" Dockerfile
```

Expected:
```
COPY packages/i18n ./packages/i18n
ENV I18N_PACKAGE_PATH=/app/packages/i18n
```

**Verify 3: Test Docker build (optional)**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/core_api
# Note: This requires the i18n package to be in backend/packages/i18n first
# docker build -f backend/Dockerfile --target test .
```

---

## Rollback Plan (If Issues Arise)

**Rollback 1: Revert staging deploy workflow and Dockerfile changes**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/core_api
git checkout staging
git revert <commit-hash-of-deploy-workflow-change>
git revert <commit-hash-of-dockerfile-change>
git push origin staging
```

**Rollback 2: Delete staging branch in localization-platform (if unused)**

```bash
cd /Users/haimbarad/Documents/GitHub/loyaltydog/localization-platform
git push origin --delete staging
git branch -D staging
```

---

## Summary of Changes from Original Plan

| Task | Original Plan | Revised Plan | Rationale |
|------|--------------|--------------|-----------|
| Task 2 | Copy to `backend/locales` | Copy to `backend/packages/i18n` | Backend expects package root, not locales directory |
| Task 2 | No Dockerfile changes | Add COPY + ENV instruction | Container needs package files inside |
| Task 3 | Copy to `frontend/locales` | No changes | Frontend loads via API, not filesystem |
| Task 4 | Verification task | Complete — critical findings found | Identified path mismatch |

---

## Remaining Tasks (Unchanged from Original Plan)

- **Task 6:** Document template for eposnow/shopify integration
- **Task 7:** Update MEMORY.md with staging status
- **Verification Steps:** Run all verification steps after implementation
- **Rollback Plan:** Use if issues arise in staging

---

## Next Steps

1. Execute Revised Task 2 (workflow + Dockerfile changes)
2. Skip Revised Task 3 (no changes needed)
3. Execute Task 5 (create PR)
4. Execute Tasks 6-7 (documentation and memory)
5. Run verification steps
6. QA in staging environment

---

## Related Documents

- **Original Implementation Plan:** `docs/plans/2026-03-16-staging-promotion-implementation.md`
- **Design Document:** `docs/plans/2026-03-16-staging-promotion-design.md`
- **Task 4 Findings:** Path mismatch between CI workflow and backend expectations
