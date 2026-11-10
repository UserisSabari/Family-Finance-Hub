# Family Finance Hub Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Family Finance Hub as a personal-first React/Vite finance workspace with optional, permission-controlled family sharing on Firebase.

**Architecture:** Replace the independent HTML pages with a client-side React application organized by features behind an authenticated app shell. Keep Firebase Authentication and Firestore, add trusted Firebase server functionality for invitations and membership changes, and use source transaction/contribution records as the financial truth.

**Tech Stack:** React, Vite, JavaScript, Firebase Auth, Firestore, Firebase Cloud Functions/Admin SDK, React Router, Vitest, React Testing Library, CSS custom properties.

**Spec:** `docs/superpowers/specs/2026-11-08-family-finance-hub-revamp-design.md`

## Global Constraints

- "Use React, Vite, and JavaScript initially, retaining the repository's current Firebase project and Firestore database."
- "Use INR only in this phase, with the Asia/Kolkata timezone and Monday-to-Sunday calendar weeks where weekly summaries are needed."
- "Treat the signed-in user's personal workspace as the default landing context."
- "Treat family sharing as an explicit workspace that can be created or joined."
- "Keep Firebase configuration in environment variables for the new app."
- "Do not migrate legacy records"; the old frontend and data remain outside the new product.
- "Never rely on hidden UI controls as authorization."
- "Goal progress is derived from explicit contribution records, not a manually editable balance."

## Review Focus

- Empty, partial, and malformed legacy-shaped records must not produce `NaN`, fake totals, or broken screens; test repository normalization and dashboard calculations in Task 2.
- Asia/Kolkata month boundaries and dates near midnight must be assigned to the expected calendar period; test date utilities in Task 2.
- Duplicate submissions, negative/zero amounts, and invalid dates must be rejected without creating records; test transaction and contribution validation in Tasks 3 and 5.
- A family member must not see or mutate another workspace's records, regardless of UI state; test callable functions and Firestore rules in Task 6.
- Slow, failed, and empty Firebase reads must show explicit loading, empty, or error states rather than stale success-shaped content; test feature data states in Tasks 3-5.

---

### Task 1: Scaffold the React application shell

**Files:**
- Modify: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `.env.example`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/app/AppProviders.jsx`
- Create: `src/app/routes.jsx`
- Create: `src/app/ProtectedRoute.jsx`
- Create: `src/components/layout/AppShell.jsx`
- Create: `src/components/layout/Sidebar.jsx`
- Create: `src/components/layout/MobileHeader.jsx`
- Create: `src/components/feedback/LoadingState.jsx`
- Create: `src/components/feedback/ErrorState.jsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/test/setup.js`
- Create: `vitest.config.js`
- Test: `src/app/routes.test.jsx`

**Interfaces:**
- Produces `AppProviders`, `ProtectedRoute`, and route entries for public auth routes plus protected `/app/*` routes.
- Produces CSS tokens for color, spacing, typography, focus, light mode, and dark mode.

- [x] **Step 1: Write the failing route-shell test** named `redirects anonymous users from protected routes and renders the app shell for authenticated users`, asserting the protected route behavior with mocked auth state.
- [x] **Step 2: Run `npm test -- --run src/app/routes.test.jsx` and verify it fails because the Vite app and route modules do not exist.**
- [x] **Step 3: Add the Vite/React scripts and dependencies, configure Firebase environment variable loading, and implement the route shell with explicit loading and error boundaries.**
- [x] **Step 4: Add responsive navigation and theme tokens; persist the light/dark preference without hiding content or reducing contrast.**
- [x] **Step 5: Run `npm test -- --run src/app/routes.test.jsx` and `npm run build`; both must pass.**
- [x] **Step 6: Commit with `git add package.json vite.config.js index.html .env.example src vite.config.js vitest.config.js && git commit -m "feat: scaffold React finance app shell"`.**

### Task 2: Add Firebase boundaries, user profiles, and financial calculation utilities

**Files:**
- Create: `src/lib/firebase.js`
- Create: `src/lib/auth/authRepository.js`
- Create: `src/lib/users/userRepository.js`
- Create: `src/lib/workspaces/workspaceRepository.js`
- Create: `src/lib/format/currency.js`
- Create: `src/lib/format/dates.js`
- Create: `src/lib/finance/calculations.js`
- Create: `src/lib/finance/validation.js`
- Create: `src/hooks/useAuth.js`
- Create: `src/hooks/useWorkspace.js`
- Create: `src/features/auth/AuthProvider.jsx`
- Create: `src/features/workspaces/WorkspaceProvider.jsx`
- Test: `src/lib/finance/calculations.test.js`
- Test: `src/lib/format/dates.test.js`
- Test: `src/lib/finance/validation.test.js`

**Interfaces:**
- `formatInr(amount): string`, `getMonthRange(year, month): { start: Date, end: Date }`, and `calculateSummary(transactions, contributions): Summary`.
- `validateTransaction(input): ValidationResult` and `validateContribution(input): ValidationResult`.
- Repositories expose `getUserProfile(uid)`, `ensurePersonalWorkspace(uid)`, and workspace-scoped reads without embedding UI behavior.

- [x] **Step 1: Write failing tests for INR formatting, Asia/Kolkata month selection, signed income/expense/refund handling, transfer exclusion, savings rate, malformed records, and validation of zero/negative/invalid values.**
- [x] **Step 2: Run `npm test -- --run src/lib/finance src/lib/format` and verify the new tests fail.**
- [x] **Step 3: Implement the pure formatting, date, validation, and calculation functions with positive stored amounts and explicit transaction types.**
- [x] **Step 4: Implement Firebase initialization from `VITE_FIREBASE_*` variables and repository boundaries for users and workspaces.**
- [x] **Step 5: Implement auth/workspace providers that load profile and personal workspace state, exposing loading/error/authenticated values to the app shell.**
- [x] **Step 6: Run the focused tests and `npm run build`; all must pass.**
- [x] **Step 7: Commit with `git add src/lib src/hooks src/features/auth src/features/workspaces && git commit -m "feat: add Firebase boundaries and finance calculations"`.**

### Task 3: Implement authentication and the personal overview

**Files:**
- Create: `src/features/auth/LoginPage.jsx`
- Create: `src/features/auth/RegisterPage.jsx`
- Create: `src/features/auth/ForgotPasswordPage.jsx`
- Create: `src/features/auth/auth.css`
- Create: `src/features/dashboard/DashboardPage.jsx`
- Create: `src/features/dashboard/dashboardRepository.js`
- Create: `src/features/dashboard/dashboard.css`
- Create: `src/components/finance/MetricCard.jsx`
- Create: `src/components/finance/ProgressBar.jsx`
- Create: `src/components/finance/TransactionPreview.jsx`
- Test: `src/features/auth/auth.test.jsx`
- Test: `src/features/dashboard/DashboardPage.test.jsx`

**Interfaces:**
- Auth pages call the provider methods for email/password and Google sign-in and display Firebase errors as user-readable messages.
- `DashboardPage` consumes the active workspace and `calculateSummary`, and renders metric, budget, goal, trend, recent-transaction, loading, empty, and error states.

- [x] **Step 1: Write failing tests for registration/login validation, auth error display, dashboard empty state, INR summary rendering, and failed-read error rendering.**
- [x] **Step 2: Run the focused auth/dashboard tests and verify failure.**
- [x] **Step 3: Implement the auth pages and provider calls, including password recovery and sign-out behavior.**
- [x] **Step 4: Implement dashboard repository reads and the personal overview using source records, never stored totals as the only truth.**
- [x] **Step 5: Add accessible metric cards, progress indicators, and recent activity with keyboard/focus states.**
- [x] **Step 6: Run focused tests and `npm run build`; all must pass.**
- [x] **Step 7: Commit with `git add src/features/auth src/features/dashboard src/components/finance && git commit -m "feat: add authentication and personal overview"`.**

### Task 4: Implement transaction management

**Files:**
- Create: `src/features/transactions/TransactionsPage.jsx`
- Create: `src/features/transactions/transactionRepository.js`
- Create: `src/features/transactions/transactionForm.js`
- Create: `src/features/transactions/transactions.css`
- Create: `src/components/transactions/TransactionForm.jsx`
- Create: `src/components/transactions/TransactionTable.jsx`
- Create: `src/components/transactions/TransactionFilters.jsx`
- Test: `src/features/transactions/transactionForm.test.js`
- Test: `src/features/transactions/TransactionsPage.test.jsx`

**Interfaces:**
- `transactionRepository` exposes `listTransactions(workspaceId, filters)`, `createTransaction(workspaceId, input)`, `updateTransaction(id, input)`, and `deleteTransaction(id)`.
- Transaction input contains `type`, `amount`, `category`, `date`, `note`, and optional `transferId`; stored amounts are positive.

- [x] **Step 1: Write failing tests for filtering, valid creation, edit/delete permissions, duplicate-submit protection, refund/transfer input, and invalid amount/date rejection.**
- [x] **Step 2: Run the focused transaction tests and verify failure.**
- [x] **Step 3: Implement repository methods and form normalization/validation with explicit Firestore timestamps.**
- [x] **Step 4: Implement the table, filters, add/edit dialog, delete confirmation, and explicit loading/empty/error/success feedback.**
- [x] **Step 5: Run focused tests and `npm run build`; all must pass.**
- [x] **Step 6: Commit with `git add src/features/transactions src/components/transactions && git commit -m "feat: add transaction management"`.**

### Task 5: Implement budgets, savings goals, contributions, and reports

**Files:**
- Create: `src/features/budgets/BudgetsPage.jsx`
- Create: `src/features/budgets/budgetRepository.js`
- Create: `src/features/budgets/budgetCalculations.js`
- Create: `src/features/goals/GoalsPage.jsx`
- Create: `src/features/goals/goalRepository.js`
- Create: `src/features/goals/goalCalculations.js`
- Create: `src/features/reports/ReportsPage.jsx`
- Create: `src/features/reports/reportCalculations.js`
- Create: `src/components/finance/CategoryBreakdown.jsx`
- Create: `src/components/finance/TrendChart.jsx`
- Create: `src/features/budgets-goals-reports/features.css`
- Test: `src/features/budgets/budgetCalculations.test.js`
- Test: `src/features/goals/goalCalculations.test.js`
- Test: `src/features/reports/reportCalculations.test.js`

**Interfaces:**
- Budget calculations return actual spend, remaining amount, percentage used, and threshold state for a calendar month.
- Goal repositories expose `listGoals(workspaceId)`, `createGoal(input)`, `updateGoal(id, input)`, and `addContribution(goalId, input)`; progress sums contribution records.
- Reports consume normalized transactions and return category totals and period trends with no-data-safe results.

- [x] **Step 1: Write failing tests for budget month boundaries, overspending thresholds, goal contribution totals, target/deadline validation, category breakdowns, and no-data reports.**
- [x] **Step 2: Run the focused tests and verify failure.**
- [x] **Step 3: Implement budget, goal/contribution, and report repositories and pure calculation modules.**
- [x] **Step 4: Implement pages and forms with the shared workspace scope, INR display, and accessible charts/tables; use a small chart dependency only if needed by the selected visualization.**
- [x] **Step 5: Run focused tests and `npm run build`; all must pass.**
- [x] **Step 6: Commit with `git add src/features/budgets src/features/goals src/features/reports src/components/finance && git commit -m "feat: add budgets goals and reports"`.**

### Task 6: Add professional family workspaces and secure invitations

**Files:**
- Create: `functions/package.json`
- Create: `functions/src/index.js`
- Create: `functions/src/invitations.js`
- Create: `src/features/family/FamilyPage.jsx`
- Create: `src/features/family/familyRepository.js`
- Create: `src/features/family/InviteMemberDialog.jsx`
- Create: `src/features/family/family.css`
- Create: `firestore.rules`
- Create: `firestore.indexes.json`
- Test: `functions/src/invitations.test.js`
- Test: `src/features/family/FamilyPage.test.jsx`
- Test: `firestore.rules.test.js`

**Interfaces:**
- Callable functions expose `createInvitation`, `resendInvitation`, `revokeInvitation`, `acceptInvitation`, and `changeMemberRole`.
- Roles are owner, admin, and member: owners manage workspace/membership; admins manage shared records and invitations; members view shared records and create their own entries but cannot manage membership or delete another person's records.
- Invitations target an email, expire after seven days, support resend/revoke, and acceptance requires the authenticated email to match.

- [x] **Step 1: Write failing function and rules tests for role permissions, invitation expiry, email matching, resend/revoke, and cross-workspace access denial.**
- [x] **Step 2: Run the functions/rules tests and verify failure.**
- [x] **Step 3: Implement callable invitation and role operations with server-side authentication, role checks, and idempotent membership writes.**
- [x] **Step 4: Implement Firestore rules and required indexes for personal and family workspace records.**
- [x] **Step 5: Implement family creation, workspace switching, member list, pending invitation states, and role-aware controls.**
- [x] **Step 6: Run rules/functions tests, focused UI tests, and `npm run build`; all must pass.**
- [x] **Step 7: Commit with `git add functions firestore.rules firestore.indexes.json src/features/family && git commit -m "feat: add secure family workspaces"`.**

### Task 7: Add settings, categories, deployment configuration, and cleanup

**Files:**
- Create: `src/features/settings/SettingsPage.jsx`
- Create: `src/features/settings/settingsRepository.js`
- Create: `src/features/settings/settings.css`
- Modify: `src/app/routes.jsx`
- Modify: `src/components/layout/AppShell.jsx`
- Modify: `.github/workflows/gh-pages.yml`
- Modify: `README.md`
- Test: `src/features/settings/SettingsPage.test.jsx`
- Delete after smoke-test confirmation: `index.html`, `frontend/`

**Interfaces:**
- Settings expose profile updates, INR display, theme preference, category management, and sign-out.
- The production build must use Firebase environment secrets supplied by the deployment environment and must not require the deleted legacy pages.

- [x] **Step 1: Write failing tests for settings persistence, theme persistence, INR-only display, category validation, and sign-out.**
- [x] **Step 2: Run the focused settings tests and verify failure.**
- [x] **Step 3: Implement settings repository/page and wire all protected routes and navigation labels.**
- [x] **Step 4: Update GitHub Pages deployment to build the Vite app with environment configuration; update README with local setup, Firebase setup, rules/functions deployment, and smoke-test steps.**
- [x] **Step 5: Run the complete test suite, `npm run build`, and the deployment build command; all must pass.**
- [x] **Step 6: Manually smoke-test sign-up, login, Google sign-in, refresh persistence, transaction CRUD, budgets, goals, reports, dark mode, mobile layout, invitations, and permission denial before deleting the legacy frontend.**
- [x] **Step 7: Delete only the confirmed obsolete `index.html` and `frontend/` paths, run the full suite and build again, then commit with `git add -A && git commit -m "chore: finish React app migration"`.**

## Final verification

- Run `npm test -- --run`.
- Run `npm run build`.
- Run Firebase emulator tests for Auth/Firestore rules/functions where configured.
- Confirm no hard-coded Firebase configuration remains in application source.
- Confirm unauthorized users cannot read or write personal or family records.
- Confirm the old data is not modified or silently migrated.
