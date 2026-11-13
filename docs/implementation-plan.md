# Pocket Ledger — Implementation Plan

## 1. Architecture Overview

Pocket Ledger is a mobile-first, installable Progressive Web App (PWA) built on the MERN stack (MongoDB, Express, React with Vite, Node.js). It cleanly segregates two essential financial concepts:
1. **Mandatory Needs / Reserve Planning**: Dedicated allocations and virtual fund tracking for unavoidable obligations (e.g. laundry, haircut, toiletries, transport).
2. **Variable / Discretionary Expenses**: Daily university expenses (canteens, snacks, quick-commerce, etc.) with flexible budget tracking.

### High-Level Topology

```text
[ Mobile / Desktop Browser ] 
        | (PWA Service Worker / Cache / IndexedDB Offline Queue)
        v
[ React + Vite Client (SPA) ]
        | HTTPS / Cookies (SameSite=Lax, HttpOnly)
        v
[ Express Server & Security Middleware ]
  - Helmet, CORS, Rate Limiters, Origin/CSRF validation
  - Mongo Session Store (connect-mongo)
  - Ownership Enforcement Middleware
        v
[ Business Logic & Services ]
  - AuthService, NeedService, TransactionService,
    DashboardService, BudgetService, AdminService
        v
[ MongoDB Database (Mongoose) ]
  - Users, Categories, Needs, NeedContributions,
    Transactions, MonthlyBudgets, AdminAuditLogs
```

---

## 2. Data Flow & Calculations

### 2.1 Currency Representation
All financial amounts are represented and stored as **integer minor units (paise in INR)** to eliminate floating-point rounding errors (`1 INR = 100 paise`). Formatted via `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.

### 2.2 Core Calculation Rules
- **Monthly Reserve Target**:
  $$\text{monthlyReserveTarget} = \sum_{\text{active Needs}} \text{monthlyReserveAmountPaise}$$
- **Contributed This Month**:
  $$\text{contributedThisMonth} = \sum_{\text{contributions in month}} \text{amountPaise}$$
- **Remaining to Reserve**:
  $$\text{remainingToReserve} = \max(0, \text{monthlyReserveTarget} - \text{contributedThisMonth})$$
- **Virtual Fund Balance per Need**:
  $$\text{fundBalance} = \text{openingBalancePaise} + \sum \text{allContributions} - \sum \text{allLinkedExpenses}$$
- **Expense Classification**:
  - `Need-related Expenses`: Transactions with a valid `needId`. (Deducted from the Need virtual fund; strictly excluded from flexible spending).
  - `Flexible Expenses`: Transactions with no `needId` whose category has `countsTowardFlexibleBudget = true`.
  - `Total Expenses`: Sum of all expense transactions in the period.
- **Flexible Budget Tracking**:
  - `suggestedFlexibleBudget` = $\max(0, \text{monthlyAvailableFunds} - \text{monthlyReserveTarget})$
  - `flexibleBudgetRemaining` = $\text{configuredFlexibleBudget} - \text{flexibleExpenses}$

---

## 3. MongoDB Schemas & Indexes

1. **User**:
   - `displayName`, `email` (lowercase, trimmed, unique index), `passwordHash`, `role` (`user` | `admin`), `status` (`active` | `suspended`), `privileges` (`advancedAnalytics`, `betaFeatures`, `customDashboard`), `currency` (default `INR`), `timezone` (default `Asia/Kolkata`), `authProviders`, `lastActiveAt`, timestamps.
2. **Category**:
   - `userId`, `name`, `parentId`, `countsTowardFlexibleBudget` (boolean), `isArchived` (boolean), `sortOrder`, timestamps.
   - Indexes: `(userId, isArchived, sortOrder)`.
3. **Need**:
   - `userId`, `name`, `categoryId`, `notes`, `monthlyReserveAmountPaise`, `expectedCostPaise`, `frequency`, `nextDueDate`, `openingBalancePaise`, `isActive`, `isArchived`, timestamps.
   - Indexes: `(userId, isActive, isArchived)`.
4. **NeedContribution**:
   - `userId`, `needId`, `amountPaise`, `contributedAt`, `note`, timestamps.
   - Indexes: `(userId, needId, contributedAt)`.
5. **Transaction**:
   - `userId`, `type` (`expense` | `income`), `amountPaise`, `categoryId`, `needId`, `description`, `merchant`, `source` (`Blinkit` | `Instamart` | `Zepto` | `Other`), `mealPeriod` (`Breakfast` | `Lunch` | `Dinner` | `Late Night`), `paymentMethod` (`Cash` | `UPI` | `Card` | `Other`), `notes`, `occurredAt`, `clientTransactionId` (unique idempotency key per user), timestamps.
   - Indexes: `(userId, occurredAt)`, `(userId, clientTransactionId)` (unique), `(userId, categoryId)`, `(userId, needId)`.
6. **MonthlyBudget**:
   - `userId`, `month` (`YYYY-MM`), `monthlyAvailableFundsPaise`, `flexibleBudgetPaise`, `categoryLimits` (`[{ categoryId, limitPaise }]`), timestamps.
   - Unique index: `(userId, month)`.
7. **AdminAuditLog**:
   - `actorUserId`, `targetUserId`, `action`, `changedFields`, timestamp.
   - Indexes: `(timestamp)`, `(targetUserId)`.

---

## 4. API Specification

All endpoints are prefixed with `/api` and return standardized JSON `{ success: boolean, data?: any, error?: string, details?: any }`.

### Auth & User Profile
- `POST /api/auth/register` — display name, email, password, password confirmation
- `POST /api/auth/login` — email, password (rate-limited, generic error messages)
- `POST /api/auth/logout` — destroys session & clears cookie
- `GET /api/auth/me` — current session user profile
- `POST /api/auth/change-password` — current password, new password
- `GET /api/profile` & `PATCH /api/profile` — currency, timezone, display name

### Categories
- `GET /api/categories` — list user categories (with active / archived filter)
- `POST /api/categories` — create custom category
- `PATCH /api/categories/:id` — rename, toggle flexible budget flag, archive
- `DELETE /api/categories/:id` — safely archive or delete if unused

### Needs & Reserve Planning
- `GET /api/needs` — list user Needs with current month contribution and calculated fund balance
- `POST /api/needs` — create Need (name, monthlyReserveAmount, openingBalance, notes, etc.)
- `PATCH /api/needs/:id` — update Need details or toggle active status
- `DELETE /api/needs/:id` — archive Need
- `GET /api/needs/:id/contributions` — list contributions for Need
- `POST /api/needs/:id/contributions` — record a reserve contribution

### Transactions & Offline Sync
- `GET /api/transactions` — filtered list (month, date range, category, need, source, search, pagination)
- `POST /api/transactions` — quick add expense (amount, category, optional metadata, clientTransactionId)
- `POST /api/transactions/sync` — batch offline sync with idempotency check
- `PATCH /api/transactions/:id` — edit transaction
- `DELETE /api/transactions/:id` — delete transaction
- `GET /api/transactions/export` — export user transactions as CSV

### Dashboard & Budgets
- `GET /api/dashboard?month=YYYY-MM` — dashboard summary (reserves, contributions, flexible/need spending, category breakdown, recent items, daily trends)
- `GET /api/budgets/:month` & `PUT /api/budgets/:month` — manage monthly available allowance and category limits
- `GET /api/reports/summary?month=YYYY-MM` — historical comparison and analytics

### Admin (Strict Authorization)
- `GET /api/admin/overview` — counts of active/suspended users, total transaction count
- `GET /api/admin/users` — paginated user list with metadata only (no amounts or descriptions)
- `GET /api/admin/users/:id` — metadata detail
- `PATCH /api/admin/users/:id/status` — suspend or reactivate account
- `PATCH /api/admin/users/:id/privileges` — grant/revoke feature privileges
- `GET /api/admin/audit-logs` — audit logs of administrative actions

---

## 5. Security & Isolation Architecture

1. **User Isolation**:
   - Every user document has `userId`.
   - All controller queries use `req.session.userId`.
   - Foreign references (`categoryId`, `needId`) are verified to belong to `req.session.userId` prior to transaction creation.
2. **Admin Privacy**:
   - Zero access for admins to view user transaction amounts, items, or financial totals.
   - Admin routes explicitly projection-filter or aggregate counts only.
3. **Session Security**:
   - `express-session` with `connect-mongo`.
   - `httpOnly: true`, `sameSite: 'lax'`, `secure: process.env.NODE_ENV === 'production'`.
   - Session invalidation when suspended or on password change.
4. **Idempotency**:
   - Offline transactions queue assigns a `clientTransactionId` UUID.
   - MongoDB unique index prevents duplicate insertions upon reconnect/sync retries.

---

## 6. Frontend Design System & PWA

- **Palette**: Clean, modern financial utility theme. Neutral slate/stone dark or crisp light palette, muted indigo/emerald accents, distinct warning/danger badges.
- **Mobile First**:
  - Bottom navigation bar: Dashboard, Needs, Add (+), Transactions, More/Settings.
  - Floating action button / prominent bottom Add tab.
  - Quick-add screen optimized for phone numpad input.
- **PWA Capabilities**:
  - `manifest.webmanifest` with icons, standalone display mode, theme color.
  - Service worker caching static app shell (`vite-plugin-pwa` with Workbox).
  - IndexedDB storage for offline transactions (using Dexie).
  - Online/offline badge, pending transaction count indicator, explicit sync button.
  - Safe logout prompt warning about any unsynced offline records.

---

## 7. Phased Implementation Roadmap

- **Phase 0**: Project setup, `.gitignore`, `.env.example`, `docs/implementation-plan.md`.
- **Phase 1**: Backend setup (Express, Mongo, Session, Auth, Bootstrap Admin, Tests).
- **Phase 2**: Core Data & Business Logic (Categories, Needs, Contributions, Transactions, Dashboard, Budgets, CSV Export, Tests).
- **Phase 3**: Frontend UI & Design System (Components, Dashboard, Quick Add, History, Needs Planner, Budgets, Reports).
- **Phase 4**: PWA, Service Worker & Offline IndexedDB Sync.
- **Phase 5**: Admin Management Area & Privilege Enforcement.
- **Phase 6**: Verification, End-to-End Tests, Production Build, and Documentation.
