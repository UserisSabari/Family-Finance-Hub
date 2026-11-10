# Family Finance Hub Revamp Design

## Intent

Rebuild Family Finance Hub as a polished, personal-first finance workspace with
optional family sharing. The current project proves the core concept but is a
multi-page vanilla frontend with duplicated UI logic and an inconsistent data
model. The revamp should make the product useful for everyday personal
tracking, presentable as a portfolio project, and structurally ready for
collaborative household finance.

## Goals

- Replace the independent HTML pages with one responsive React application.
- Preserve Firebase Authentication and Firestore as the backend foundation.
- Provide a reliable personal dashboard for income, expenses, savings, budgets,
  goals, and recent activity.
- Make transaction entry fast, validated, editable, and removable.
- Add useful summaries and visual reports rather than placeholder chart areas.
- Support an optional family workspace with invitations and member roles.
- Establish a consistent accessible visual system with responsive light and dark
  themes.
- Keep the codebase understandable and easy to extend.

## Non-goals

- No native mobile application in this phase.
- No bank-account aggregation, payment processing, or financial advice.
- No migration to a new backend service.
- No requirement that family members share every personal transaction.
- No attempt to preserve the old page structure as a public API.

## Anti-goals

- Do not add a large state-management framework before the app needs it.
- Do not build a visually impressive dashboard that hides missing data or
  silently invents financial totals.
- Do not expose family data through client-side checks alone; Firestore rules
  must enforce access.
- Do not store derived totals as the only source of truth.

## Constraints and defaults

- Use React, Vite, and JavaScript initially, retaining the repository's current
  Firebase project and Firestore database.
- Use a client-side routed single-page application with an authenticated app
  shell.
- Use Indian Rupees (INR) and `en-IN` formatting by default, with currency
  configurable in settings later.
- Treat the signed-in user's personal workspace as the default landing context.
- Treat family sharing as an explicit workspace that can be created or joined.
- Keep Firebase configuration in environment variables for the new app; do not
  expand or reuse hard-coded credentials in source files.
- Use a small, reusable component and CSS-token system rather than introducing
  a UI framework solely for decoration.
- Use INR only in this phase, with the Asia/Kolkata timezone and Monday-to-
  Sunday calendar weeks where weekly summaries are needed.

## Approaches considered

### 1. Modernize the existing vanilla app

This minimizes migration work and preserves the current pages, but leaves
shared state, navigation, validation, and UI behavior fragmented. It does not
fit the requested complete functionality and framework revamp.

### 2. React + Vite with the existing Firebase backend (chosen)

This creates a clean application shell, reusable components, typed boundaries
where useful, shared loading/error states, and a coherent design system while
preserving the working authentication and Firestore investment. It provides
the best balance of learning value, scope, and migration risk.

### 3. Next.js with Firebase

This could provide stronger server-side routing and future server features, but
the current product is primarily an authenticated client application. The
additional framework and deployment complexity would delay the user-facing
revamp without solving an immediate requirement.

## Product structure

### Public experience

- Landing page explaining the personal and family use cases.
- Login, registration, Google sign-in, and password recovery.
- Clear loading, validation, and authentication error states.

### Personal workspace

- **Overview:** current balance, income, expenses, savings rate, budget
  progress, goal progress, spending trend, and recent transactions.
- **Transactions:** searchable and filterable income/expense list with
  add/edit/delete flows, categories, notes, date, and optional workspace.
- **Budgets:** monthly category budgets, actual spend, remaining amount, and
  threshold indicators.
- **Goals:** named savings goals with target, current amount, deadline, and
  progress history.
- **Reports:** category breakdown, income-versus-expense trend, and period
  filtering with empty and insufficient-data states.
- **Settings:** profile, currency, theme, categories, and sign-out.

### Family workspace

- Workspace switcher between personal and family contexts.
- Family creation and invitation flow.
- Member list with owner/admin/member roles and pending invitation states.
- Shared transactions, budgets, and goals scoped to the selected family.
- Permission-aware controls and clear indication of who created an entry.

Family permissions are role-based: owners manage the workspace and all
membership; admins manage shared financial records and invitations; members
can view shared records and create their own entries, but cannot change
membership or delete another person's records. Owners and admins can edit or
delete shared records, with the creator retained for attribution.

## Data model

Use normalized Firestore collections with user and workspace scoping:

- `users/{uid}`: profile, preferences, created/updated timestamps.
- `workspaces/{workspaceId}`: kind (`personal` or `family`), name, owner, and
  timestamps.
- `workspaceMembers/{workspaceId_uid}`: workspace, user, role, status, and
  timestamps.
- `transactions/{transactionId}`: workspace, creator, type, amount, category,
  date, note, and timestamps.
- `budgets/{budgetId}`: workspace, month, category, limit, and timestamps.
- `goals/{goalId}`: workspace, name, target, saved amount, deadline, and
  timestamps.
- `goalContributions/{contributionId}`: goal, workspace, creator, amount, date,
  note, and timestamps.

Dashboard totals and reports are calculated from the source collections for
correctness. If performance later requires materialized summaries, those
summaries remain rebuildable from source records.

## Application architecture

- `src/app`: router, providers, route guards, and global error/loading states.
- `src/components`: reusable navigation, cards, charts, forms, dialogs, and
  feedback components.
- `src/features`: dashboard, transactions, budgets, goals, reports, family,
  auth, and settings modules.
- `src/lib`: Firebase initialization, Firestore repositories, formatting,
  validation, and date utilities.
- Feature modules own their queries and mutations; shared repositories prevent
  duplicated Firestore access patterns.
- Async operations expose explicit loading, success, and error states.
- Forms validate amounts, dates, required names, and workspace permissions
  before writes.
- Goal progress is derived from explicit contribution records, not a manually
  editable balance.

## Security and migration

- Add or update Firestore rules so a user can read/write only their own
  personal workspace and authorized family workspace records.
- Never rely on hidden UI controls as authorization.
- Start the new application with a clean schema and do not migrate legacy
  records; the old frontend and data remain outside the new product until a
  separate migration request is made.
- Use Firebase Cloud Functions/Admin SDK for invitation issuance, expiry,
  acceptance, revocation, and role changes where trusted server logic is
  required. Client writes remain protected by Firestore rules.
- Preserve existing authentication providers and route users into the new
  dashboard after sign-in.
- Keep the existing frontend available until the new app has passed a manual
  smoke test, then remove obsolete pages and scripts in a separate cleanup
  change.

## Delivery order

1. Scaffold React/Vite and configure Firebase through environment variables.
2. Build the app shell, authentication, route protection, theme, and profile
   loading.
3. Implement source-of-truth transactions and the personal overview.
4. Add budgets, goals, reports, and settings.
5. Add family workspaces, invitations, and permission-aware access.
6. Add migration support, Firestore rules, responsive polish, and cleanup.

## Verification

- Run the existing project checks and the new app build.
- Add focused tests for formatting, validation, derived financial calculations,
  route protection, and transaction/budget/goal mutations.
- Manually verify sign-up, login, Google sign-in, logout, refresh persistence,
  empty states, invalid forms, mobile layout, dark mode, and family permissions.
- Confirm that a user cannot read or write another user's personal data or an
  unauthorized family's data.

## Builder decisions left open

- Exact visual palette, typography, and chart library are implementation
  choices; choose a calm, high-contrast finance-oriented system and keep
  dependencies small.
- Exact Firestore query indexes should be added only when required by the
  chosen filters and validated against the emulator or project.
- Financial calculations use signed transaction types, positive stored
  amounts, explicit refunds/transfers, Asia/Kolkata date boundaries, and
  calendar-month budget periods. Refunds reverse expense totals; transfers do
  not count as income or spending; savings rate is savings contributions
  divided by income for the selected period.
- Invitations are email-based, can target existing or future accounts, expire
  after seven days, and support resend and revoke. Acceptance requires the
  authenticated email to match the invitation target.
