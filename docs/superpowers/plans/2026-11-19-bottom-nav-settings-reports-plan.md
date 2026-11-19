# Bottom Nav Simplification, Settings Hub, and Reports UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the mobile bottom navigation bar to 4 core tabs, move Budgets and Goals access into a dedicated section within Settings, and fix/polish the Reports page UI (responsive layout, Donut Chart + Category Breakdown integration, metrics grid, and mobile styling).

**Architecture:** 
- Mobile bottom navigation is streamlined from 6 crowded items to 4 primary tabs (`Overview`, `Activity`, `Reports`, `Settings`), giving larger touch targets and eliminating text wrapping on compact viewports.
- Settings page is enhanced with a prominent "Financial Planning & Tools" hub featuring navigation cards into `Budgets` (`/app/budgets`) and `Savings Goals` (`/app/goals`), keeping route URLs and existing functionality fully intact.
- Reports page is modernized with a responsive CSS layout (eliminating hardcoded inline styles and problematic `span 2` mobile grid overflows), properly integrating `CategoryBreakdown` with `SpendDonutChart`, responsive 2x2 metric summary tiles, and clean payment mode tracks.

**Tech Stack:** React 19, React Router v7, Vanilla CSS with custom properties, Vitest, React Testing Library.

**Spec:** User request: "Lets simplify the bottom nav. Move the Budgets , Goals page to settings. Fix the ui in reports page."

## Global Constraints

- Never break existing URLs: `/app/budgets` and `/app/goals` must remain active and functional.
- Maintain INR currency formatting (`formatInr`) and Asia/Kolkata timezone standard.
- Responsive viewport support down to 320px width without horizontal scrollbars or cramped elements.
- Sandboxed git safety: execute git staging/commits with `BypassSandbox: true` to prevent Windows file lock conflicts.
- All test suites must remain 100% green (current baseline: 65 passing tests).

## Review Focus

1. **Compact Mobile Widths (< 360px):** Verify bottom nav items and report metric cards do not wrap or overflow the viewport.
2. **Settings Hub Deep Linking:** Verify clicking Budgets and Goals cards in Settings navigates smoothly to `/app/budgets` and `/app/goals`.
3. **Reports Donut & Breakdown Synchrony:** Verify that changing the period (All Time, Last 3 Months, This Month) synchronizes both Donut Chart and Category Breakdown.
4. **Desktop Sidebar Continuity:** Verify desktop navigation continues to allow direct access to all workspace views.
5. **No Regressions on Existing Tests:** Ensure routes, settings, transactions, and calculations tests all pass cleanly.

---

### Task 1: Simplify Bottom Navigation to 4 Core Tabs

**Files:**
- Modify: `src/components/layout/BottomNav.jsx`
- Modify: `src/styles/global.css`
- Test: `src/app/routes.test.jsx`

**Context & Decisions:**
- In `BottomNav.jsx`, remove `Budgets` and `Goals` from `mobileLinks`.
- Keep 4 core tabs:
  1. Overview (`/app`, `IconHome`)
  2. Activity (`/app/transactions`, `IconTransactions`)
  3. Reports (`/app/reports`, `IconReports`)
  4. Settings (`/app/settings`, `IconSettings`)
- In `global.css`, adjust `.bottom-nav a` to enjoy generous spacing:
  - `font-size: 0.75rem` (up from 0.6875rem)
  - `padding: var(--space-2) 0.5rem`
  - `min-width: 3.5rem`
  - `gap: 3px`

- [ ] **Step 1: Update `mobileLinks` in `BottomNav.jsx`**
  Remove `{ label: 'Budgets', ... }` and `{ label: 'Goals', ... }` from `mobileLinks`.
- [ ] **Step 2: Update `.bottom-nav a` styling in `src/styles/global.css`**
  Enhance padding, font size, and spacing for a 4-tab bar.
- [ ] **Step 3: Run routes tests to verify shell integrity**
  Run `npm test -- --run src/app/routes.test.jsx`.
- [ ] **Step 4: Commit changes**
  Commit message: `fix(nav): simplify mobile bottom nav to 4 core tabs`.

---

### Task 2: Add Financial Planning Hub (Budgets & Goals) in Settings Page

**Files:**
- Modify: `src/features/settings/SettingsPage.jsx`
- Modify: `src/features/settings/settings.css`
- Test: `src/features/settings/SettingsPage.test.jsx`

**Context & Decisions:**
- Add a new section `Financial Planning & Controls` in `SettingsPage.jsx` (accessible right below Financial Profile or Profile).
- Include two prominent interactive cards:
  1. **Budgets & Spending Limits**:
     - Heading: "Monthly Budgets"
     - Description: "Set category spending limits, track burn rates, and receive overspending alerts."
     - Action link: `Link` to `/app/budgets` with an arrow indicator `→`.
     - Icon: `IconBudgets`.
  2. **Savings & Financial Goals**:
     - Heading: "Savings Goals"
     - Description: "Track progress toward emergency funds, travel, big purchases, and milestones."
     - Action link: `Link` to `/app/goals` with an arrow indicator `→`.
     - Icon: `IconGoals`.
- In `settings.css`, style `.planning-hub-grid`, `.planning-card`, `.planning-card-header`, `.planning-card-icon`, and hover states with smooth transition and elevation.
- In `SettingsPage.test.jsx`, add assertions that Settings renders the Budgets and Savings Goals planning cards with links to `/app/budgets` and `/app/goals`.

- [ ] **Step 1: Add test in `SettingsPage.test.jsx` for Financial Planning hub**
  Expect `Monthly Budgets` and `Savings Goals` links to exist and point to `/app/budgets` and `/app/goals`.
- [ ] **Step 2: Update `SettingsPage.jsx` to render Financial Planning cards**
  Import `Link` from `react-router-dom` and `IconBudgets`, `IconGoals` from `../../components/icons/Icons`. Render the section with semantic headings and accessible links.
- [ ] **Step 3: Add CSS in `src/features/settings/settings.css`**
  Style the planning hub cards with modern border accents, hover elevation, and responsive grid.
- [ ] **Step 4: Run tests and verify**
  Run `npm test -- --run src/features/settings/SettingsPage.test.jsx`.
- [ ] **Step 5: Commit changes**
  Commit message: `feat(settings): add financial planning hub for budgets and goals`.

---

### Task 3: Fix & Modernize Reports Page UI

**Files:**
- Modify: `src/features/reports/ReportsPage.jsx`
- Modify: `src/features/budgets-goals-reports/features.css`
- Modify: `src/components/finance/SpendDonutChart.jsx`
- Test: `src/features/reports/ReportsPage.test.jsx` (create to ensure regression safety)

**Context & Decisions:**
- **Layout fixes in `ReportsPage.jsx`**:
  - Remove inline styles like `style={{ gridColumn: 'span 2' }}` and inline grid styles.
  - Create dedicated CSS classes:
    - `.report-summary-grid`: responsive 2-column on mobile (`repeat(2, 1fr)`), 4-column on desktop (`repeat(4, 1fr)`), cleanly preventing overflow.
    - `.report-grid`: grid for report cards with `@media (min-width: 48rem) { .report-card-wide { grid-column: span 2; } }`.
- **Integrate `CategoryBreakdown`**:
  - In `ReportsPage.jsx`, within the "Spend Distribution" section, render the `SpendDonutChart` alongside or directly followed by `CategoryBreakdown items={categoryItems}`.
  - Provide a clean stacked/side-by-side presentation: Donut Visual on top/left, Category breakdown bars with percentages below.
- **Payment Mode Enhancement**:
  - Replace hardcoded color hex values (`#2563eb`, `#059669`) with CSS tokens and sleek badges for Bank/UPI and Cash in Hand.
- **Period Filter Pills**:
  - Modernize `.report-period-pills` to match the polished feel of `TransactionFilters` scope pills.
- **Create `ReportsPage.test.jsx`**:
  - Test loading, empty state, period switching (All Time, Last 3 Months, This Month), and rendering of summary metrics, donut chart, category breakdown, and payment mode breakdown.

- [ ] **Step 1: Write `src/features/reports/ReportsPage.test.jsx`**
  Mock `useWorkspace` and `listReportTransactions`. Test period filters, summary metrics, and chart rendering.
- [ ] **Step 2: Update `src/features/reports/ReportsPage.jsx`**
  Implement the responsive layout, render `CategoryBreakdown`, and clean up inline styles into CSS classes.
- [ ] **Step 3: Update `src/features/budgets-goals-reports/features.css`**
  Add styles for `.report-summary-grid`, `.report-card-wide`, `.report-payment-card`, `.report-breakdown-wrapper`, and responsive mobile tweaks.
- [ ] **Step 4: Verify with vitest**
  Run `npm test -- --run src/features/reports`.
- [ ] **Step 5: Commit changes**
  Commit message: `fix(reports): responsive layout, category breakdown integration, and ui polish`.

---

### Task 4: Full System Verification & Push

**Files:**
- All touched files.

- [ ] **Step 1: Run full Vitest test suite**
  `npm test -- --run`
- [ ] **Step 2: Run production build**
  `npm run build`
- [ ] **Step 3: Push to origin/main**
  `git push origin main`
