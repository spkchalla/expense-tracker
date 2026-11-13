# Pocket Ledger — Personal Expense Tracker & Reserve Planner PWA

Pocket Ledger is a mobile-first, installable Progressive Web App (PWA) built on the MERN stack (MongoDB, Express, React with Vite, Node.js).

Designed specifically to solve university budgeting needs, it strictly segregates two financial realities:
1. **Mandatory Needs / Reserve Planning**: Dedicated allocations and virtual fund tracking for unavoidable obligations (laundry, haircut, toiletries, transport).
2. **Variable / Discretionary Expenses**: Daily expenses (canteens, snacks, quick-commerce orders from Blinkit/Instamart/Zepto) with flexible budget monitoring.

---

## 🌟 Key Features

- **Strict Reserve vs. Flexible Segregation**: Mandatory needs targets and contributions are never mixed into discretionary flexible spending.
- **Mobile-First & PWA**: Installable to Android, iOS, and desktop browsers with offline app-shell caching.
- **Offline Expense Capture & Idempotent Sync**: Queue expenses while offline (via IndexedDB / Dexie). Queued entries carry client UUID idempotency keys and sync automatically or on-demand without duplicates.
- **Zero-Floating-Point Currency Precision**: All currency amounts are represented and stored as integer minor units (paise in INR) and displayed with `Intl.NumberFormat`.
- **Privacy-Guaranteed Admin Area**: Administrative dashboard allows role and privilege management (`advancedAnalytics`, `betaFeatures`, `customDashboard`) with complete privacy protection: admins can **never** view transaction amounts, descriptions, Needs, or personal financial summaries.
- **CSV Data Export**: Authenticated users can export their complete transaction history as a CSV spreadsheet anytime.
- **Undo Expense Action**: Immediate 8-second undo option when recording an expense.

---

## 🏗️ Architecture & Project Structure

```text
expense-tracker/
├── client/                     # Frontend (React 18, Vite, Plain CSS Design System)
│   ├── public/                 # Icons, manifest, PWA assets
│   ├── src/
│   │   ├── app/                # App root & main layout router
│   │   ├── components/         # Shared UI (Button, Card, Input, Modal, Badge, etc.)
│   │   ├── features/           # Auth, Dashboard, Needs, Transactions, Budgets, Reports, Admin
│   │   ├── hooks/              # Offline sync & connectivity hooks
│   │   ├── lib/                # API client, Dexie database, formatters
│   │   └── styles/             # Design tokens & global stylesheet
│   └── vite.config.js          # Vite configuration with vite-plugin-pwa (Workbox)
├── server/                     # Backend (Node.js, Express, MongoDB/Mongoose)
│   ├── src/
│   │   ├── config/             # DB & environment configuration
│   │   ├── controllers/        # Express route handlers
│   │   ├── middleware/         # Auth, admin, rate-limit, validation, error handler
│   │   ├── models/             # Mongoose schemas (User, Category, Need, Transaction, etc.)
│   │   ├── routes/             # REST API endpoints
│   │   ├── services/           # Core calculations & business logic
│   │   ├── utils/              # Currency (paise) & date utilities
│   │   ├── validators/         # Zod schemas for input validation
│   │   ├── app.js              # Express app factory
│   │   └── server.js           # Server entry point
│   ├── scripts/                # Development & seed scripts
│   └── tests/                  # Vitest API integration & calculation tests
├── docs/                       # Implementation plan & architecture documentation
├── .env.example                # Example environment configuration
└── package.json                # Root monorepo workspace configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node.js v26)
- **MongoDB**: MongoDB 6.0+ instance (local or MongoDB Atlas connection URI)

### 2. Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

Configure the following variables in `.env`:
```env
APP_NAME=Pocket Ledger
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/pocket_ledger

# Authentication & Sessions
SESSION_SECRET=replace_with_a_secure_random_string_min_32_chars
SESSION_MAX_AGE_MS=604800000
COOKIE_SECURE=false

# Bootstrap Admin Account
BOOTSTRAP_ADMIN_EMAIL=admin@example.com
ALLOW_PUBLIC_REGISTRATION=true
```

### 3. Installation
Install all dependencies across both client and server:
```bash
npm install
```

### 4. Running the Development Server
Run both the Express backend (port 5000) and the Vite development server (port 5173) concurrently:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Testing

Pocket Ledger includes automated test coverage for:
- Calculation logic: Reserve targets, contributions, virtual fund balances, and flexible vs need separation.
- Security & User Isolation: User A cannot read, update, or delete User B's records.
- Admin Privacy: Admin endpoints return management metadata only and never reveal transaction amounts or descriptions.
- Offline Idempotency: Retried sync requests with duplicate `clientTransactionId` values do not create duplicate database records.
- Input Validation: Negative amounts, invalid references, and malformed payloads are safely rejected.

Run all tests:
```bash
npm test
```

Run server tests:
```bash
npm run test:server
```

Run client tests:
```bash
npm run test --workspace=client
```

---

## 📦 Production Build & Deployment

1. **Build the Client PWA**:
   ```bash
   npm run build
   ```
   This generates the production bundle and service worker in `client/dist/`.

2. **Start the Production Server**:
   ```bash
   npm run start --workspace=server
   ```
   In production (`NODE_ENV=production`), the Express server automatically serves the built PWA from `client/dist` and handles client-side routing.

---

## 🛡️ First Admin Bootstrap

To bootstrap your administrative account:
1. Set `BOOTSTRAP_ADMIN_EMAIL` in `.env` to your email address (e.g. `BOOTSTRAP_ADMIN_EMAIL=admin@example.com`).
2. When an account with this email registers, it is automatically assigned the `admin` role and granted all feature privileges.
3. Alternatively, run the seed script:
   ```bash
   node server/scripts/seed.js
   ```

---

## 📱 PWA & Offline Usage

- **Installation**: When accessing from Chrome, Edge, or supported Android browsers, click "Install PWA" from the Profile menu or the browser install icon in the URL bar.
- **Offline Recording**: If you lose network connection while recording an expense, the app automatically saves the record into local IndexedDB storage.
- **Syncing**: Once internet connectivity is restored, the app automatically syncs queued transactions. You can also tap the "Sync now" button in the status banner.
- **Safe Logout**: If you try to log out while offline transactions are pending, the app explicitly alerts you to ensure you don't lose unsynced records.
