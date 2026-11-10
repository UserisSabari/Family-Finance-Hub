# Adaptive Financial Profiles Architecture & Implementation Plan

> **Goal:** Transform Family Finance Hub into an adaptive personal finance engine where the user selects their financial lifestyle (**Student**, **Salaried**, **Freelancer**, **Family**, **Custom**), and the app automatically tailors its dashboard insights, transaction presets, budgeting paradigms, income sources, and specialized tools — without bloating or fracturing the codebase.

---

## Architecture Overview

```
                      ┌──────────────────────────────┐
                      │    User Profile / Settings   │
                      │   (role: student | salaried  │
                      │    | freelancer | family)    │
                      └──────────────┬───────────────┘
                                     │
               ┌─────────────────────┼─────────────────────┐
               ▼                     ▼                     ▼
      ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
      │ Preset Registry │   │ Spend Pace Calc │   │ Active Features │
      │  (Categories,   │   │  (Pocket money, │   │ (Splits, Inflow │
      │ Quick Amounts,  │   │  Monthly salary,│   │ Types, Pass-    │
      │ Payment Modes)  │   │  Irregular fee) │   │ through Fees)   │
      └─────────────────┘   └─────────────────┘   └─────────────────┘
```

---

## Iteration 0: Foundation & Modular Profile Engine (Highest Priority)

### Objectives
1. Audit current repository data structures (`users/{uid}`, `workspaces/{workspaceId}`, `transactions`).
2. Establish a modular, decoupled configuration system (`src/lib/profiles/profileConfig.js`).
3. Ensure 100% backward compatibility: existing users without a profile default gracefully to `'salaried'` or `'general'` with zero data loss or migration errors.

### Implementation Tasks
- [ ] **Step 0.1**: Define profile configuration matrix in `src/lib/profiles/profileConfig.js`:
  - Profile metadata: id, label, description, icon/emoji.
  - Quick amount presets (e.g. Student: `[1, 10, 50, 100, 200, 500]`, Salaried: `[100, 200, 500, 1000, 2000, 5000]`).
  - Income sources (e.g. Student: Pocket Money, Scholarship, Part-time, Gift vs. Salaried: Salary, Bonus, Dividend).
  - Expense categories (e.g. Student: Chai/Snacks, Mess/Food, Travel, Printouts/Books, Hostel vs. Salaried: Rent, Utilities, Groceries, Dining, EMI).
- [ ] **Step 0.2**: Update user profile repository (`src/lib/users/userRepository.js` and `src/features/settings/settingsRepository.js`) to support reading/updating `financialProfile`.
- [ ] **Step 0.3**: Expose `financialProfile` via `WorkspaceProvider` and custom hook `useFinancialProfile()`.
- [ ] **Step 0.4**: Write unit tests verifying profile resolution, default fallback, and immutability.

---

## Iteration 1: Financial Profiles & Adaptive UI

### Objectives
1. Add interactive Profile Selection in **Settings** & initial prompt for new users.
2. Dynamically bind `TransactionForm` chips, quick amount buttons, and default category suggestions to the user's active financial profile.
3. Adapt the **Overview (Dashboard)** metrics & daily spend pace according to the profile lifestyle:
   - **Student**: Days left in month vs. Remaining Pocket Money (survival pace).
   - **Salaried**: Monthly income vs. fixed bills & discretionary runway.
   - **Freelancer**: Rolling income buffer & tax/emergency reserves.

### Implementation Tasks
- [ ] **Step 1.1**: Build `ProfileSelector` component in `src/features/settings/ProfileSelector.jsx` with instant preview cards and one-click switching.
- [ ] **Step 1.2**: Update `TransactionForm.jsx` to dynamically render profile-specific quick amounts and category chips while still allowing custom entries.
- [ ] **Step 1.3**: Update `DashboardPage.jsx` to tailor financial pulse insights based on active profile.
- [ ] **Step 1.4**: Run Vitest test suite and build verification.

---

## Iteration 2: Student Finance Superpowers

### Objectives
1. **Pocket Money & Survival Pace Tracker**:
   - Track monthly pocket money allowance separately from institutional academic fees (college tuition, exam fees).
   - Show exact safe daily limit (e.g., "₹95/day left for next 14 days").
2. **Friends & Roommates Split Ledger**:
   - Tag transaction with "Split / Owed by friend" (e.g. Paid ₹400 for dinner, ₹300 owed by 3 friends).
   - Lightweight tracker showing "Money Lent to Friends" with one-click "Settled via UPI".
3. **Scholarship & Irregular Inflow Milestones**:
   - Track pending scholarship disbursements and semester grant targets.

### Implementation Tasks
- [ ] **Step 2.1**: Implement `splitWith` / `isLent` metadata on transactions in `transactionForm.js`.//Not needed for now(future implementation)
- [ ] **Step 2.2**: Build lightweight "Peer Splits & Lent Money" widget in student dashboard view.//Not needed for now(future implementation)
- [ ] **Step 2.3**: Add "Pass-through Academic Fee" toggle in Transaction Form so institutional payments do not artificially skew daily living pace.//Not needed for now(future implementation)
- [ ] **Step 2.4**: Full unit & integration testing.

---

## Verification & Safeguards
- All 47 existing tests in `npm test -- --run` must remain passing at every step.
- Zero breaking changes to Firestore rules or existing workspace structures.
- Strict INR (`₹`) formatting and Asia/Kolkata date consistency preserved.

