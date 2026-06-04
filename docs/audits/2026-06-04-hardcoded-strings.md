# Dashboard Hardcoded-String Audit (i18n triage)

_Generated: 2026-06-04T16:31:55.856Z_

Reproduce: `node scripts/audit-hardcoded-strings.mjs` (paths overridable via flags/env).

## How to read this

This is a **heuristic triage list**, not an auto-fixer. It flags user-facing English text (JSX text and a small allowlist of attributes) that is **not** wrapped in a `t(...)` call. **False positives are expected** — e.g. brand names, code-ish text in JSX, or strings that are intentionally untranslated. Treat each finding as a candidate to review, not a guaranteed bug. Prioritize files with the highest finding counts (see the ranking below).

**Spot-check (2026-06-04):** ~15 findings were checked against source; the estimated false-positive rate is roughly **5–10%**. The residual false positives are mostly brand-only single-word labels (e.g. `alt="LoyaltyDog Logo"`, `label="WordPress"`) and short tooltips (e.g. `title="Sync"`) — user-facing, but with little/nothing to translate. Most JSX-text findings are genuine un-localized English copy.

## Summary

| Metric | Value |
|---|---|
| Files scanned | 661 |
| Files affected | 66 |
| Total findings | 469 |
| Kind `attr:alt` | 16 |
| Kind `attr:aria-label` | 4 |
| Kind `attr:helpertext` | 16 |
| Kind `attr:label` | 1 |
| Kind `attr:placeholder` | 5 |
| Kind `attr:title` | 26 |
| Kind `jsx-text` | 401 |

### Inputs

- Frontend src: `/tmp/wt-core_api-i18n/frontend/src`
- TypeScript module: `/tmp/wt-core_api-i18n/frontend/node_modules/typescript`

## Top files by finding count

These are the highest-value un-localized surfaces to prioritize.

| # | File | Findings |
|---|---|---|
| 1 | `src/app/(cpanel)/(user)/loyalty/shopify/[shopId]/forms.tsx` | 117 |
| 2 | `src/app/(mobile)/p/[passSid]/forms.tsx` | 43 |
| 3 | `src/app/(cpanel)/(user)/loyalty/programs/new/form.tsx` | 41 |
| 4 | `src/app/(cpanel)/(user)/loyalty/programs/[programId]/vouchers/[voucherId]/edit/form.tsx` | 31 |
| 5 | `src/app/(cpanel)/(user)/loyalty/programs/[programId]/vouchers/new/form.tsx` | 30 |
| 6 | `src/app/(cpanel)/(user)/profile/settings/form.tsx` | 12 |
| 7 | `src/app/(cpanel)/(user)/layout.tsx` | 9 |
| 8 | `src/app/(cpanel)/(user)/loyalty/shopify/[shopId]/page.tsx` | 9 |
| 9 | `src/app/(mobile)/l/[programSid]/form.tsx` | 8 |
| 10 | `src/app/(auth)/wordpress/auth/form.tsx` | 7 |
| 11 | `src/app/(cpanel)/(user)/loyalty/programs/[programId]/vouchers/[voucherId]/page.tsx` | 7 |
| 12 | `src/components/AIAdvisorChat.tsx` | 7 |
| 13 | `src/components/layouts/Navbar.tsx` | 7 |
| 14 | `src/app/(cpanel)/(user)/loyalty/wordpress/[wpId]/components/OffersForm.tsx` | 6 |
| 15 | `src/app/(cpanel)/(user)/loyalty/wordpress/[wpId]/page.tsx` | 6 |

## Findings by file

### `src/app/(auth)/auth/layout.tsx` (1)

| Line | Kind | Text |
|---|---|---|
| 12 | `attr:alt` | LoyaltyDog Logo |

### `src/app/(auth)/wordpress/auth/form.tsx` (7)

| Line | Kind | Text |
|---|---|---|
| 18 | `jsx-text` | Connect LoyaltyDog |
| 19 | `jsx-text` | Sign in to your LoyaltyDog account to activate your WordPress plugin. |
| 36 | `jsx-text` | Email address |
| 63 | `jsx-text` | Activation Error |
| 67 | `jsx-text` | Go to Dashboard |
| 105 | `jsx-text` | Select a WordPress Site |
| 106 | `jsx-text` | Choose which LoyaltyDog program to connect to your WordPress plugin. |

### `src/app/(cpanel)/(user)/account/templates/[templateId]/client.tsx` (2)

| Line | Kind | Text |
|---|---|---|
| 137 | `jsx-text` | Date reached |
| 151 | `jsx-text` | Pass Yourself |

### `src/app/(cpanel)/(user)/giftcard/programs/new/form.tsx` (4)

| Line | Kind | Text |
|---|---|---|
| 156 | `jsx-text` | Company Name |
| 159 | `attr:helpertext` | Legal name of your business |
| 190 | `jsx-text` | Terms & Conditions |
| 193 | `attr:helpertext` | You can specify terms for your gift card program |

### `src/app/(cpanel)/(user)/layout.tsx` (9)

| Line | Kind | Text |
|---|---|---|
| 81 | `jsx-text` | We are now setting up the LoyaltyDog Management Portal for your use. |
| 83 | `jsx-text` | As soon as it is ready your dedicated Account Manager will contact you and make… |
| 85 | `jsx-text` | If you have any questions in the meantime please feel free to email me at |
| 87 | `jsx-text` | lee@loyalty.dog |
| 91 | `jsx-text` | More Money; More Customers; More Transactions |
| 94 | `jsx-text` | Thank you |
| 96 | `jsx-text` | The LoyaltyDog Team |
| 100 | `jsx-text` | Welcome to LoyaltyDog! |
| 100 | `jsx-text` | Thank you for choosing to add LoyaltyDog. |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/customers/page.tsx` (1)

| Line | Kind | Text |
|---|---|---|
| 39 | `jsx-text` | Total customers: |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/reports/list-members-birthday-period/page.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 47 | `jsx-text` | Loading data... |
| 97 | `jsx-text` | Total Records |
| 113 | `jsx-text` | Don&apos;t have any qualified customers. |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/reports/list-members-email-phone-not-installed/page.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 37 | `jsx-text` | Loading data... |
| 56 | `jsx-text` | Total Records |
| 71 | `jsx-text` | Don&apos;t have any qualified customers. |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/reports/list-members-name-email/page.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 37 | `jsx-text` | Loading data... |
| 56 | `jsx-text` | Total Records |
| 70 | `jsx-text` | Don&apos;t have any qualified customers. |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/reports/list-members-name-phone/page.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 37 | `jsx-text` | Loading data... |
| 56 | `jsx-text` | Total Records |
| 70 | `jsx-text` | Don&apos;t have any qualified customers. |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/reports/list-members-opting-in/page.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 37 | `jsx-text` | Loading data... |
| 56 | `jsx-text` | Total Records |
| 70 | `jsx-text` | Don&apos;t have any qualified customers. |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/reports/list-members-opting-out/page.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 37 | `jsx-text` | Loading data... |
| 56 | `jsx-text` | Total Records |
| 70 | `jsx-text` | Don&apos;t have any qualified customers. |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/reports/list-members-recent-not-visited-period/page.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 45 | `jsx-text` | Loading data... |
| 67 | `jsx-text` | Total Records |
| 82 | `jsx-text` | Don&apos;t have any qualified customers. |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/reports/list-members-sorted-by-points/page.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 43 | `jsx-text` | Loading data... |
| 62 | `jsx-text` | Total Records |
| 77 | `jsx-text` | Don&apos;t have any qualified customers. |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/reports/list-members-with-rewards-claimed-not-redeemed/page.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 43 | `jsx-text` | Loading data... |
| 62 | `jsx-text` | Total Records |
| 77 | `jsx-text` | Don&apos;t have any qualified customers. |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/reports/list-most-common-time-members-join-program/page.tsx` (2)

| Line | Kind | Text |
|---|---|---|
| 24 | `jsx-text` | * Click on a column to download the list of customers |
| 36 | `jsx-text` | Loading data... |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/reports/list-most-common-time-members-use-program/page.tsx` (1)

| Line | Kind | Text |
|---|---|---|
| 37 | `jsx-text` | Loading data... |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/reports/list-most-popular-rewards-period/page.tsx` (1)

| Line | Kind | Text |
|---|---|---|
| 37 | `jsx-text` | Loading data... |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/reports/list-most-rewards-redeemed/form.tsx` (1)

| Line | Kind | Text |
|---|---|---|
| 29 | `jsx-text` | count of offers |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/reports/list-most-rewards-redeemed/page.tsx` (2)

| Line | Kind | Text |
|---|---|---|
| 41 | `jsx-text` | Loading data... |
| 68 | `jsx-text` | Don&apos;t have any qualified offers. |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/reports/list-most-rewards/page.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 42 | `jsx-text` | Loading data... |
| 61 | `jsx-text` | Total Records |
| 75 | `jsx-text` | Don&apos;t have any qualified offers. |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/rules/price/new/page.tsx` (1)

| Line | Kind | Text |
|---|---|---|
| 16 | `jsx-text` | New Price Rule |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/vouchers/[voucherId]/edit/form.tsx` (31)

| Line | Kind | Text |
|---|---|---|
| 71 | `jsx-text` | Pass Type |
| 88 | `jsx-text` | Discount Amount & Conditions |
| 91 | `jsx-text` | Discount Type |
| 96 | `jsx-text` | Fixed amount |
| 103 | `jsx-text` | Discount Value |
| 113 | `attr:helpertext` | Discount amount or percentage (0.00-1.00) |
| 121 | `jsx-text` | WARNING: The discount percentage value is |
| 121 | `jsx-text` | %. Ensure this is the intended discount rate. |
| 131 | `jsx-text` | Currency Code |
| 134 | `attr:helpertext` | For discount amount display |
| 146 | `jsx-text` | Apply Condition |
| 150 | `jsx-text` | No condition applied |
| 151 | `jsx-text` | The value of the most expensive item |
| 152 | `jsx-text` | The value of the cheapest item |
| 158 | `jsx-text` | Special Categories |
| 167 | `jsx-text` | Separate multiple categories by comma &quot;,&quot; |
| 169 | `jsx-text` | If there are many selected products in these categories, only one product which… |
| 179 | `jsx-text` | Special Products |
| 188 | `jsx-text` | Separate multiple products by comma &quot;,&quot; |
| 190 | `jsx-text` | If there are many selected products, only one product which satisfies the apply… |
| 197 | `jsx-text` | Points & Limitations |
| 207 | `jsx-text` | Issue Before Birthday (hours) |
| 216 | `attr:helpertext` | The voucher will be issued this many hours before the customer’s birthday. |
| 225 | `jsx-text` | Expires In (hours) |
| 235 | `attr:helpertext` | The voucher will expire after this duration (in hours) from the time it is issu… |
| 241 | `jsx-text` | Limit per Customer |
| 262 | `jsx-text` | How many times a customer can get this voucher. |
| 267 | `jsx-text` | Availability Count |
| 288 | `jsx-text` | Restrict how often this voucher can be claimed in total by all customers. |
| 293 | `jsx-text` | Require Fields |
| 314 | `jsx-text` | The customer must complete all required fields to receive the voucher. |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/vouchers/[voucherId]/page.tsx` (7)

| Line | Kind | Text |
|---|---|---|
| 60 | `jsx-text` | Pass Type |
| 68 | `jsx-text` | Discount Amount |
| 78 | `jsx-text` | Apply Condition |
| 84 | `jsx-text` | Start Date |
| 92 | `jsx-text` | End Date |
| 100 | `jsx-text` | Limit per Customer |
| 106 | `jsx-text` | Availability Count |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/vouchers/forms.tsx` (4)

| Line | Kind | Text |
|---|---|---|
| 24 | `jsx-text` | Are you sure you want to delete this voucher? |
| 28 | `jsx-text` | No, cancel |
| 31 | `jsx-text` | Yes, confirm delete |
| 60 | `attr:helpertext` | Multiple emails can be separated by commas. |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/vouchers/new/form.tsx` (30)

| Line | Kind | Text |
|---|---|---|
| 66 | `jsx-text` | Pass Type |
| 83 | `jsx-text` | Discount Amount & Conditions |
| 86 | `jsx-text` | Discount Type |
| 91 | `jsx-text` | Fixed amount |
| 98 | `jsx-text` | Discount Value |
| 108 | `attr:helpertext` | Discount amount or percentage (0.00-1.00) |
| 116 | `jsx-text` | WARNING: The discount percentage value is |
| 116 | `jsx-text` | %. Ensure this is the intended discount rate. |
| 126 | `jsx-text` | Currency Code |
| 129 | `attr:helpertext` | For discount amount display |
| 141 | `jsx-text` | Apply Condition |
| 145 | `jsx-text` | No condition applied |
| 146 | `jsx-text` | The value of the most expensive item |
| 147 | `jsx-text` | The value of the cheapest item |
| 153 | `jsx-text` | Special Categories |
| 162 | `jsx-text` | Separate multiple categories by comma &quot;,&quot; |
| 164 | `jsx-text` | If there are many selected products in these categories, only one product which… |
| 174 | `jsx-text` | Special Products |
| 183 | `jsx-text` | Separate multiple products by comma &quot;,&quot; |
| 185 | `jsx-text` | If there are many selected products, only one product which satisfies the apply… |
| 202 | `jsx-text` | Issue Before Birthday (hours) |
| 211 | `attr:helpertext` | The voucher will be issued this many hours before the customer’s birthday. |
| 220 | `jsx-text` | Expires In (hours) |
| 230 | `attr:helpertext` | The voucher will expire after this duration (in hours) from the time it is issu… |
| 236 | `jsx-text` | Limit per Customer |
| 257 | `jsx-text` | How many times a customer can get this voucher. |
| 262 | `jsx-text` | Availability Count |
| 283 | `jsx-text` | Restrict how often this voucher can be claimed in total by all customers. |
| 288 | `jsx-text` | Require Fields |
| 309 | `jsx-text` | The customer must complete all required fields to receive the voucher. |

### `src/app/(cpanel)/(user)/loyalty/programs/[programId]/vouchers/new/page.tsx` (1)

| Line | Kind | Text |
|---|---|---|
| 15 | `jsx-text` | New Pass |

### `src/app/(cpanel)/(user)/loyalty/programs/new/form.tsx` (41)

| Line | Kind | Text |
|---|---|---|
| 82 | `jsx-text` | Loyalty Program |
| 96 | `attr:helpertext` | Short promotional teaser for your program |
| 105 | `jsx-text` | Select country |
| 124 | `attr:helpertext` | The icon needs to be of square format |
| 151 | `jsx-text` | Pass Type ID |
| 172 | `jsx-text` | Program Type |
| 177 | `jsx-text` | Gift Card |
| 213 | `jsx-text` | Stamp Card |
| 237 | `jsx-text` | Tiered Membership |
| 261 | `jsx-text` | Special Offers |
| 271 | `jsx-text` | Choose from one of our ready made schemes above or build your own custom loyalt… |
| 276 | `jsx-text` | Points for Activities |
| 278 | `jsx-text` | Reward your customer points for certain activities |
| 283 | `jsx-text` | Add Email |
| 289 | `jsx-text` | Add Phone Number |
| 295 | `jsx-text` | Install Pass |
| 301 | `jsx-text` | Pass Scanned |
| 311 | `jsx-text` | Chose dynamic if you want to reward a custom number of points for each scan. |
| 316 | `jsx-text` | Customer Referral |
| 320 | `jsx-text` | points after referred customer has |
| 326 | `jsx-text` | Contact & Legal |
| 329 | `jsx-text` | Company Name |
| 332 | `attr:helpertext` | Legal name of your business |
| 363 | `jsx-text` | Terms & Conditions |
| 366 | `attr:helpertext` | You can specify terms for your loyalty program |
| 370 | `jsx-text` | Scanning & Redemption |
| 382 | `jsx-text` | Browser: I want to use another scanning solution that can open URLs. |
| 386 | `jsx-text` | None: I don&apos;t need to scan the cards. |
| 392 | `jsx-text` | Points Change Message |
| 399 | `jsx-text` | Disable Message |
| 403 | `jsx-text` | The default message is |
| 403 | `jsx-text` | &quot;New points: %@&quot; |
| 409 | `jsx-text` | Point Names |
| 417 | `jsx-text` | The default values are One: |
| 417 | `jsx-text` | &quot;Point&quot; |
| 417 | `jsx-text` | &quot;Points&quot; |
| 422 | `jsx-text` | Customer Fields |
| 425 | `jsx-text` | Required Fields |
| 455 | `jsx-text` | Display Name |
| 518 | `attr:helpertext` | Enter available options as comma separated values |
| 553 | `jsx-text` | Add Field |

### `src/app/(cpanel)/(user)/loyalty/programs/new/page.tsx` (1)

| Line | Kind | Text |
|---|---|---|
| 22 | `jsx-text` | New Program |

### `src/app/(cpanel)/(user)/loyalty/shopify/[shopId]/forms.tsx` (117)

| Line | Kind | Text |
|---|---|---|
| 85 | `jsx-text` | Hang tight! We’re getting everything ready for you... |
| 90 | `jsx-text` | Please go to Shopify Admin and enable the Customer Accounts option to use full … |
| 101 | `jsx-text` | It looks like you&apos;ve uninstalled the Loyalty Dog app. We&apos;re sad to se… |
| 106 | `jsx-text` | Reinstall Loyalty Dog |
| 112 | `jsx-text` | You uninstalled the Loyalty Dog app. |
| 123 | `jsx-text` | Please accept the application charge to active your account and use full functi… |
| 127 | `jsx-text` | Active charge |
| 133 | `jsx-text` | Incomplete application charge |
| 144 | `jsx-text` | By default, app embed blocks are deactivated after an app is installed. |
| 146 | `jsx-text` | You need to activate app embed blocks in the theme editor to enable the widget. |
| 154 | `jsx-text` | Activate widget |
| 157 | `jsx-text` | Recheck status |
| 163 | `jsx-text` | Rewards widget inactivated |
| 220 | `jsx-text` | Loyalty Program |
| 232 | `jsx-text` | You have to configure the loyalty program to use full functionality. |
| 233 | `jsx-text` | You can&apos;t change the program after saved! |
| 237 | `jsx-text` | Add new program |
| 244 | `jsx-text` | Select program |
| 253 | `attr:title` | Sync |
| 263 | `jsx-text` | Sync all Shopify customers |
| 270 | `jsx-text` | Reward customers when the financial status is one of |
| 288 | `jsx-text` | Cancel rewards when the financial status is one of |
| 306 | `jsx-text` | Reward customers for shopping |
| 310 | `jsx-text` | Online and in-store (POS) |
| 314 | `jsx-text` | Shop Online only |
| 318 | `jsx-text` | In-store only (POS) |
| 323 | `jsx-text` | Reward customers for the following parts of an order |
| 331 | `jsx-text` | Exclude coupon discounts used |
| 335 | `jsx-text` | Exclude taxes |
| 339 | `jsx-text` | Exclude shipping |
| 386 | `jsx-text` | Sign Up |
| 401 | `jsx-text` | Points awarded |
| 415 | `jsx-text` | Celebrate a birthday |
| 430 | `jsx-text` | Points awarded |
| 444 | `jsx-text` | Place first order |
| 459 | `jsx-text` | Points awarded |
| 485 | `jsx-text` | Like on Facebook |
| 492 | `jsx-text` | Facebook page URL |
| 500 | `jsx-text` | Points awarded |
| 506 | `jsx-text` | Share to Facebook |
| 513 | `jsx-text` | URL to share |
| 521 | `jsx-text` | Points awarded |
| 547 | `jsx-text` | Follow on Twitter |
| 554 | `jsx-text` | Twitter username |
| 562 | `jsx-text` | Points awarded |
| 568 | `jsx-text` | Share to Twitter |
| 575 | `jsx-text` | URL to share |
| 589 | `jsx-text` | Points awarded |
| 611 | `jsx-text` | Follow on Instagram |
| 618 | `jsx-text` | Instagram username |
| 626 | `jsx-text` | Points awarded |
| 664 | `jsx-text` | Order Discounts |
| 665 | `jsx-text` | Product Discounts |
| 666 | `jsx-text` | Shipping Discounts |
| 683 | `attr:title` | View |
| 692 | `attr:title` | Configure |
| 709 | `jsx-text` | No offers found. |
| 716 | `jsx-text` | Edit Options for |
| 719 | `jsx-text` | Combines with |
| 737 | `jsx-text` | Order Discounts |
| 756 | `jsx-text` | Product Discounts |
| 775 | `jsx-text` | Shipping Discounts |
| 1092 | `jsx-text` | Show the Rewards button on the Online Store |
| 1095 | `jsx-text` | Trigger mode |
| 1099 | `jsx-text` | Manual (Advance user) |
| 1102 | `jsx-text` | Manual: hide the launcher button; you can show the panel via JS methods of |
| 1107 | `jsx-text` | Button position |
| 1119 | `jsx-text` | Edge margin (px) |
| 1146 | `jsx-text` | Launcher Button |
| 1152 | `jsx-text` | Button width (px) |
| 1158 | `jsx-text` | Button height (px) |
| 1164 | `jsx-text` | Border radius (px) |
| 1172 | `jsx-text` | Background color |
| 1178 | `jsx-text` | Pulse color |
| 1186 | `jsx-text` | Enable pulse animation when active offer available |
| 1190 | `jsx-text` | Show button text |
| 1193 | `jsx-text` | Button text |
| 1200 | `jsx-text` | Text size (px) |
| 1206 | `jsx-text` | Text color |
| 1214 | `jsx-text` | Show button icon |
| 1218 | `jsx-text` | Icon size (px) |
| 1224 | `jsx-text` | Icon color |
| 1231 | `jsx-text` | Custom icon url |
| 1241 | `jsx-text` | Widget Theme |
| 1248 | `jsx-text` | Panel width (px) |
| 1254 | `jsx-text` | Panel height (px) |
| 1260 | `jsx-text` | Background color |
| 1268 | `jsx-text` | Border width (px) |
| 1274 | `jsx-text` | Border radius (px) |
| 1280 | `jsx-text` | Border color |
| 1289 | `jsx-text` | Border width (px) |
| 1295 | `jsx-text` | Border radius (px) |
| 1301 | `jsx-text` | Border color |
| 1307 | `jsx-text` | Background color |
| 1313 | `jsx-text` | Banner image / gradient |
| 1316 | `jsx-text` | Primary color |
| 1322 | `jsx-text` | Secondary color |
| 1328 | `jsx-text` | Text color |
| 1336 | `jsx-text` | Banner height |
| 1343 | `jsx-text` | % of panel height |
| 1349 | `jsx-text` | Content padding (px) |
| 1360 | `jsx-text` | Banner image url |
| 1363 | `jsx-text` | Tip: should use a small and light image to improve the loading speed. |
| 1369 | `jsx-text` | Text color |
| 1375 | `jsx-text` | Border radius (px) |
| 1384 | `jsx-text` | Primary color |
| 1390 | `jsx-text` | Success color |
| 1396 | `jsx-text` | Error color |
| 1402 | `jsx-text` | Divider color |
| 1504 | `jsx-text` | Widget Text |
| 1532 | `jsx-text` | Advanced Styling |
| 1536 | `jsx-text` | You can add custom css using prefix class name to styling our widget. |
| 1538 | `jsx-text` | Custom styles |
| 1542 | `jsx-text` | Custom root styles (widget size, position) |
| 1545 | `jsx-text` | Caution: This style will be injected to your site. |
| 1597 | `attr:title` | Reset |
| 1602 | `jsx-text` | Reset to Defaults |

### `src/app/(cpanel)/(user)/loyalty/shopify/[shopId]/page.tsx` (9)

| Line | Kind | Text |
|---|---|---|
| 34 | `jsx-text` | Your current authorization does not include the |
| 34 | `jsx-text` | write_discounts |
| 34 | `jsx-text` | scope. Discount features such as offer combination options will use the legacy … |
| 39 | `jsx-text` | Re-authorize |
| 45 | `jsx-text` | Missing &quot;write_discounts&quot; scope |
| 54 | `attr:title` | Settings |
| 57 | `attr:title` | Actions |
| 60 | `attr:title` | Offers |
| 63 | `attr:title` | Widget |

### `src/app/(cpanel)/(user)/loyalty/wordpress/[wpId]/components/ActionsForm.tsx` (4)

| Line | Kind | Text |
|---|---|---|
| 46 | `jsx-text` | Enable points for purchases |
| 66 | `jsx-text` | Sign-up Bonus |
| 69 | `jsx-text` | Award bonus points on sign-up |
| 89 | `jsx-text` | Save Actions |

### `src/app/(cpanel)/(user)/loyalty/wordpress/[wpId]/components/OffersForm.tsx` (6)

| Line | Kind | Text |
|---|---|---|
| 28 | `jsx-text` | No loyalty program linked. |
| 28 | `jsx-text` | Go to the |
| 28 | `jsx-text` | tab to link a loyalty program. Once linked, offers from that program will be av… |
| 38 | `jsx-text` | Manage offers on the |
| 40 | `jsx-text` | Offers page |
| 50 | `jsx-text` | No active offers yet. Create one on the Offers page to make it available for re… |

### `src/app/(cpanel)/(user)/loyalty/wordpress/[wpId]/components/SettingsForm.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 40 | `jsx-text` | — No program linked — |
| 47 | `jsx-text` | Link a loyalty program to enable points earning and offer redemption. |
| 51 | `jsx-text` | Save Settings |

### `src/app/(cpanel)/(user)/loyalty/wordpress/[wpId]/components/WidgetForm.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 38 | `jsx-text` | Plugin not yet initialized. |
| 38 | `jsx-text` | Complete the plugin activation on your WordPress site before configuring widget… |
| 46 | `jsx-text` | The LoyaltyDog widget can be placed in your WordPress site using any of the fol… |

### `src/app/(cpanel)/(user)/loyalty/wordpress/[wpId]/page.tsx` (6)

| Line | Kind | Text |
|---|---|---|
| 22 | `jsx-text` | Plugin not yet activated. Visit your WordPress admin to complete setup. |
| 23 | `jsx-text` | No loyalty program linked. Select a program in the Settings tab. |
| 25 | `attr:title` | Settings |
| 28 | `attr:title` | Actions |
| 31 | `attr:title` | Offers |
| 34 | `attr:title` | Widget |

### `src/app/(cpanel)/(user)/loyalty/wordpress/page.tsx` (2)

| Line | Kind | Text |
|---|---|---|
| 18 | `jsx-text` | No WordPress Sites Connected |
| 19 | `jsx-text` | Install the LoyaltyDog plugin on your WordPress / WooCommerce site to get start… |

### `src/app/(cpanel)/(user)/profile/page.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 20 | `attr:title` | Update |
| 45 | `jsx-text` | Email address |
| 51 | `jsx-text` | Phone number |

### `src/app/(cpanel)/(user)/profile/settings/form.tsx` (12)

| Line | Kind | Text |
|---|---|---|
| 42 | `jsx-text` | First Name |
| 50 | `jsx-text` | Last Name |
| 74 | `jsx-text` | Favorite Amount Spent |
| 151 | `jsx-text` | Current password |
| 159 | `jsx-text` | New password |
| 167 | `jsx-text` | Confirm password |
| 174 | `jsx-text` | Password requirements: |
| 175 | `jsx-text` | Ensure that these requirements are met: |
| 177 | `jsx-text` | At least 10 characters (and up to 100 characters) |
| 178 | `jsx-text` | At least one lowercase character |
| 179 | `jsx-text` | Inclusion of at least one special character, e.g., ! @ # ? |
| 180 | `jsx-text` | Some text here zoltan |

### `src/app/(cpanel)/(user)/profile/settings/page.tsx` (5)

| Line | Kind | Text |
|---|---|---|
| 17 | `attr:title` | General information |
| 20 | `attr:title` | Password information |
| 23 | `attr:title` | Language & Time |
| 24 | `attr:title` | Social accounts |
| 25 | `attr:title` | Alerts & Notifications |

### `src/app/(cpanel)/(user)/programs/new/form.tsx` (2)

| Line | Kind | Text |
|---|---|---|
| 29 | `jsx-text` | Program Type |
| 34 | `jsx-text` | Gift Card |

### `src/app/(cpanel)/(user)/programs/new/page.tsx` (1)

| Line | Kind | Text |
|---|---|---|
| 19 | `jsx-text` | New Program |

### `src/app/(marketing)/_components/CookieConsentBanner.tsx` (1)

| Line | Kind | Text |
|---|---|---|
| 58 | `attr:aria-label` | Cookie consent |

### `src/app/(marketing)/_components/LanguageSwitcher.tsx` (1)

| Line | Kind | Text |
|---|---|---|
| 28 | `attr:aria-label` | Language |

### `src/app/(mobile)/l/[programSid]/form.tsx` (8)

| Line | Kind | Text |
|---|---|---|
| 51 | `jsx-text` | Enter Your Details |
| 54 | `jsx-text` | First Name |
| 60 | `jsx-text` | Last Name |
| 66 | `jsx-text` | Email Address |
| 72 | `jsx-text` | Cell Number |
| 113 | `jsx-text` | I accept the |
| 115 | `jsx-text` | Terms and Conditions |
| 122 | `jsx-text` | Terms & Conditions |

### `src/app/(mobile)/l/c/[customerSid]/offers/[offerSid]/form.tsx` (5)

| Line | Kind | Text |
|---|---|---|
| 18 | `jsx-text` | You currently have an active offer, if you confirm, your active offer will be r… |
| 45 | `jsx-text` | Back to Pass |
| 51 | `jsx-text` | Your Personal Offer |
| 53 | `jsx-text` | You will be notified when it&apos;s ready. |
| 55 | `jsx-text` | You can close this window |

### `src/app/(mobile)/l/c/[customerSid]/offers/page.tsx` (4)

| Line | Kind | Text |
|---|---|---|
| 25 | `attr:title` | Back to Pass |
| 26 | `jsx-text` | Back to Pass |
| 34 | `jsx-text` | Your Active Offer |
| 47 | `jsx-text` | No new offers. |

### `src/app/(mobile)/l/c/[customerSid]/profile/form.tsx` (5)

| Line | Kind | Text |
|---|---|---|
| 39 | `jsx-text` | Enter Your Details |
| 41 | `attr:placeholder` | First Name |
| 44 | `attr:placeholder` | Last Name |
| 47 | `attr:placeholder` | Email Address |
| 50 | `attr:placeholder` | Phone Number |

### `src/app/(mobile)/l/c/[customerSid]/profile/page.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 18 | `attr:title` | Back to Pass |
| 19 | `jsx-text` | Back to Pass |
| 25 | `jsx-text` | Your Profile |

### `src/app/(mobile)/p/[passSid]/forms.tsx` (43)

| Line | Kind | Text |
|---|---|---|
| 36 | `attr:alt` | Add to Apple Wallet |
| 41 | `attr:alt` | Add to Google Wallet |
| 44 | `attr:alt` | Add to Wallet Passes |
| 50 | `attr:alt` | Add to Apple Wallet |
| 53 | `attr:alt` | Add to Google Wallet |
| 83 | `jsx-text` | You pass was sent. |
| 112 | `jsx-text` | Enter Your Details |
| 266 | `jsx-text` | Pass Added |
| 267 | `attr:title` | Open Wallet |
| 268 | `jsx-text` | Open Wallet |
| 271 | `jsx-text` | Show Preview |
| 279 | `jsx-text` | Pass Not Loaded? |
| 282 | `attr:title` | Download Pass |
| 283 | `jsx-text` | Download Pass |
| 285 | `attr:title` | Open Wallet |
| 286 | `jsx-text` | Open Wallet |
| 292 | `attr:alt` | Add to Google Wallet |
| 294 | `jsx-text` | If you don&apos;t have a Wallet app, please download it now: |
| 298 | `attr:title` | Install WalletPasses |
| 301 | `attr:alt` | Add to WalletPasses |
| 303 | `jsx-text` | Your pass will automatically load after you open the app after installation. |
| 307 | `jsx-text` | Show Preview |
| 318 | `attr:title` | auto download |
| 422 | `jsx-text` | Verifying session… |
| 452 | `jsx-text` | Scan this QR Code on your smartphone to download the pass. |
| 465 | `jsx-text` | Email the pass to your mobile device. |
| 483 | `jsx-text` | Print this pass if you don&apos;t want to use your mobile device. |
| 697 | `jsx-text` | How would you like to verify? |
| 719 | `jsx-text` | Get a code by email |
| 742 | `jsx-text` | SMS / Phone |
| 743 | `jsx-text` | Get a code by text message |
| 785 | `jsx-text` | We&apos;ll send a 6-digit verification code to your |
| 807 | `jsx-text` | Code sent to |
| 811 | `jsx-text` | Dev mode — code: |
| 850 | `jsx-text` | ← Change method |
| 875 | `jsx-text` | Activate Your Card |
| 877 | `jsx-text` | Enter the 6-digit security code printed on your gift card to activate it and lo… |
| 900 | `jsx-text` | Security Code (6 digits) |
| 927 | `jsx-text` | Activate Gift Card |
| 929 | `jsx-text` | The security code is printed on the back or sticker of your physical card. |
| 941 | `jsx-text` | ← Start over |
| 953 | `jsx-text` | Activating your gift card… |
| 966 | `jsx-text` | Loading your pass… |

### `src/app/(mobile)/p/[passSid]/page.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 90 | `jsx-text` | The pass is only available on mobile device, please use your smartphone to scan… |
| 103 | `jsx-text` | You can email the pass to your email address so that you can open it on your mo… |
| 121 | `jsx-text` | Print this pass if you don&apos;t want to use your mobile device |

### `src/app/(mobile)/s/[passSid]/status/forms.tsx` (2)

| Line | Kind | Text |
|---|---|---|
| 136 | `jsx-text` | Points added: |
| 137 | `jsx-text` | New points: |

### `src/app/(mobile)/t/[templateSid]/form.tsx` (1)

| Line | Kind | Text |
|---|---|---|
| 38 | `jsx-text` | Enter Your Details |

### `src/app/(mobile)/t/[templateSid]/page.tsx` (5)

| Line | Kind | Text |
|---|---|---|
| 21 | `jsx-text` | Not available |
| 23 | `jsx-text` | Distribution of this pass has been stopped by the pass issuer. |
| 41 | `jsx-text` | Existing Pass |
| 42 | `jsx-text` | You have already created a pass. |
| 45 | `jsx-text` | Open exist Pass |

### `src/app/error.tsx` (3)

| Line | Kind | Text |
|---|---|---|
| 26 | `jsx-text` | Something went wrong! We are already working to solve the problem. |
| 30 | `jsx-text` | Try again |
| 33 | `jsx-text` | Return Home |

### `src/app/error/page.tsx` (1)

| Line | Kind | Text |
|---|---|---|
| 22 | `jsx-text` | Return Home |

### `src/app/not-found.tsx` (2)

| Line | Kind | Text |
|---|---|---|
| 12 | `jsx-text` | Whoops! That page doesn&apos;t exist. |
| 18 | `jsx-text` | Return Home |

### `src/app/test-ai-advisor/page.tsx` (5)

| Line | Kind | Text |
|---|---|---|
| 92 | `jsx-text` | 🧪 AI Advisor - Test Mode |
| 93 | `jsx-text` | This is a mock version for testing UI changes. Try asking: |
| 95 | `jsx-text` | &quot;Show me a table analysis&quot; - to test table pagination |
| 96 | `jsx-text` | &quot;How is my program performing?&quot; - to test heading hierarchy |
| 97 | `jsx-text` | Any message - to test auto-scroll behavior |

### `src/components/AIAdvisorChat.tsx` (7)

| Line | Kind | Text |
|---|---|---|
| 270 | `jsx-text` | 🐕 Loyalty Dog AI Business Advisor |
| 275 | `jsx-text` | Total Transactions |
| 282 | `jsx-text` | Member Participation |
| 289 | `jsx-text` | Total Revenue |
| 367 | `jsx-text` | 💾 Your Download |
| 413 | `jsx-text` | 💡 Try asking: |
| 444 | `attr:placeholder` | Ask about your loyalty program... |

### `src/components/CropModal.tsx` (1)

| Line | Kind | Text |
|---|---|---|
| 36 | `attr:alt` | Crop Modal Image |

### `src/components/design-tabs/FieldForm.tsx` (5)

| Line | Kind | Text |
|---|---|---|
| 317 | `jsx-text` | Normal Field |
| 424 | `jsx-text` | Pass ID |
| 425 | `jsx-text` | Pass URL |
| 426 | `jsx-text` | Template URL |
| 427 | `jsx-text` | Scan URL |

### `src/components/design-tabs/PlaceholderTab.tsx` (2)

| Line | Kind | Text |
|---|---|---|
| 186 | `jsx-text` | 6fed93a1-4214-44a5-bae2-a7eefd7a29af |
| 192 | `jsx-text` | b-2ToUIURKW64qfu_Xoprw |

### `src/components/design-tabs/StripTab.tsx` (1)

| Line | Kind | Text |
|---|---|---|
| 138 | `attr:title` | Background |

### `src/components/layouts/Navbar.tsx` (7)

| Line | Kind | Text |
|---|---|---|
| 49 | `attr:alt` | LoyaltyDog Logo |
| 50 | `attr:alt` | LoyaltyDog Logo |
| 51 | `attr:alt` | LoyaltyDog Logo |
| 63 | `attr:alt` | User settings |
| 104 | `attr:alt` | LoyaltyDog Logo |
| 105 | `attr:alt` | LoyaltyDog Logo |
| 116 | `attr:alt` | User settings |

### `src/components/layouts/Sidebar.tsx` (2)

| Line | Kind | Text |
|---|---|---|
| 202 | `attr:label` | WordPress |
| 339 | `jsx-text` | AI Settings |

### `src/components/PaginatedTable.tsx` (2)

| Line | Kind | Text |
|---|---|---|
| 71 | `attr:aria-label` | Previous page |
| 85 | `attr:aria-label` | Next page |

