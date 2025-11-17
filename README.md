Couple Expense Tracker (PWA Demo) + Firebase Backend

Overview
- Mobile-first web app with a cute pastel couple theme and smooth micro-animations
- Real-time sync via Firestore
- Google Sign-In
- Create/Join couple with a 6-digit code
- Add expenses with emoji and notes
- Cloud Functions for monthly balance recalculation and expense notifications
- Firestore security rules included
- Seed JSON for demo data
- Premium page layout aligned with RevenueCat tiers

What’s included
- Web app (Vite + React + Tailwind)
- Firebase initialization (Auth, Firestore, Functions, optional FCM)
- Cloud Functions (TypeScript): recalcBalances, sendNotificationOnExpense
- Firestore Rules
- Seed Firestore JSON
- Basic unit tests suggestion (see below)

Quick start
1) Install frontend deps
   npm install

2) Configure Firebase web app
   Create a project in Firebase Console, add a Web App, and copy the config to .env

   .env (example)
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_MEASUREMENT_ID=...

3) Run the dev server
   npm run dev

Firebase setup (Functions + Rules)
1) Install Firebase CLI
   npm i -g firebase-tools
   firebase login
   firebase init (choose Firestore, Functions, Emulators; use existing project)

2) Deploy rules
   firebase deploy --only firestore:rules

3) Install and build functions
   cd functions
   npm install
   npm run build
   firebase deploy --only functions

Firestore seed
- Import seed.firestore.json using the Firestore import tool or write a small script.

RevenueCat notes
- Create an app in RevenueCat, add products (monthly $1.49, yearly $9.99),
  and connect to Play/App Store (for the PWA demo, display a paywall placeholder).
- In Flutter/React Native production, use the RevenueCat SDK for purchases.

Basic unit tests for calc logic (outline)
- Test monthly aggregation and net balance from expenses list
- Test edge cases: empty list, single payer, alternating payers
- Example pseudo-test:
  const expenses = [ {paidBy:'A', amount:1000}, {paidBy:'B', amount:2000} ]
  expect(calcTotals(expenses)).toEqual({totalA:1000, totalB:2000, netBalance:-1000})

Branding & store listing copy
- Title: Couple Expense Tracker — Split & Sync
- Short description: Track shared expenses in real-time. Fair splits, cute design.
- Long description: Keep your finances fair and stress-free. Real-time sync for couples, automatic split calculation, delightful micro-animations, and a minimalist pastel theme. Add expenses in seconds, see who owes who, and reach shared goals together. Upgrade to Premium for unlimited categories and goals, exports, and custom themes.
- Keywords: couples, split bills, expense tracker, shared budget, finance, money, splitwise, goals

Assets
- Use a soft pastel palette: pink (#ec4899), purple (#8b5cf6), off-white (#faf5ff), dark mode backgrounds (#0b0712, #140d22).
- Export app icons in 1x/2x/3x.
- Use the provided Spline scene as a landing cover.

Notes
- This PWA is a demo. For production mobile apps (Android/iOS) with subscriptions, build the Flutter app using the same data model and Functions included here.
