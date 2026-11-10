# Family Finance Hub

Personal-first family finance workspace built with React, Vite, Firebase Authentication, Firestore, and Cloud Functions.

## Local setup

Requirements: Node.js 20 and npm.

```powershell
npm ci
Copy-Item .env.example .env.local
# Fill the VITE_FIREBASE_* values in .env.local
npm run dev
```

The app uses INR (`₹`) and Asia/Kolkata calendar rules in this phase. Never commit `.env.local`; Vite exposes only variables prefixed with `VITE_`.

## Firebase setup

Create a Firebase web app and put its web configuration in `.env.local`:
`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
`VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, and
`VITE_FIREBASE_APP_ID`.

Deploy Firestore rules/indexes and Cloud Functions from the repository root:

```powershell
firebase login
firebase use YOUR_PROJECT_ID
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only functions
```

Install the Functions dependencies with `Set-Location functions; npm ci` before
deploying if they are not already installed.

## Checks and production build

```powershell
npm test -- --run
npm run build
```

The GitHub Pages workflow builds `dist` with the six `VITE_FIREBASE_*` repository
secrets and publishes it. Add those secrets in repository Settings → Secrets and
variables → Actions before enabling deployment.

## Smoke test

With Firebase configured, sign up, sign in, refresh, and verify the session persists.
Check dashboard, transaction CRUD, budgets, goals/contributions, reports, family
workspace/invitation controls, settings profile/category/theme persistence, and sign
out. Confirm a second account cannot read or change the first account's workspace.

For local Firebase testing, start the configured emulators and run the same flow:

```powershell
firebase emulators:start
```

Browser and Firebase emulator smoke tests require a configured Firebase project,
credentials, and a browser session; automated CI runs the unit/component suite and
production build only.
