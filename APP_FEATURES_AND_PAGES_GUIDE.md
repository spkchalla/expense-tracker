# Pocket Ledger — Complete Feature Breakdown & User Manual

Welcome to the definitive guide and comprehensive feature breakdown for **Pocket Ledger** (Expense Tracker PWA). This document details every page, interface element, modal, button, input field, and on-screen instruction across the entire application—from initial authentication to administrative auditing.

---

## Table of Contents

1. [Core Mental Model & Financial Architecture](#1-core-mental-model--financial-architecture)
2. [Public Pages (Authentication)](#2-public-pages-authentication)
   - 2.1 [Sign In / Login Page (`LoginPage`)](#21-sign-in--login-page-loginpage)
   - 2.2 [Create Account / Register Page (`RegisterPage`)](#22-create-account--register-page-registerpage)
3. [Global Shell & Navigation](#3-global-shell--navigation)
   - 3.1 [Top Navigation Bar (`Navbar`)](#31-top-navigation-bar-navbar)
   - 3.2 [Offline & Sync Status Banner (`OfflineBanner`)](#32-offline--sync-status-banner-offlinebanner)
   - 3.3 [Mobile Bottom Navigation Bar (`BottomNav`)](#33-mobile-bottom-navigation-bar-bottomnav)
   - 3.4 [Floating Quick-Add Action](#34-floating-quick-add-action)
4. [Dashboard Page (`DashboardPage`)](#4-dashboard-page-dashboardpage)
   - 4.1 [Month Selector & Refresh Bar](#41-month-selector--refresh-bar)
   - 4.2 [Quick-Undo Notification Banner](#42-quick-undo-notification-banner)
   - 4.3 [Mandatory Reserves Card (`ReservesCard`)](#43-mandatory-reserves-card-reservescard)
   - 4.4 [Flexible Spending Card (`FlexibleBudgetCard`)](#44-flexible-spending-card-flexiblebudgetcard)
   - 4.5 [Daily Spending Trend Chart (`SpendingTrendChart`)](#45-daily-spending-trend-chart-spendingtrendchart)
   - 4.6 [Category Breakdown Card (`CategoryBreakdown`)](#46-category-breakdown-card-categorybreakdown)
   - 4.7 [Recent Expenses Card (`RecentTransactions`)](#47-recent-expenses-card-recenttransactions)
5. [Mandatory Needs / Reserve Planner (`NeedsPage`)](#5-mandatory-needs--reserve-planner-needspage)
   - 5.1 [Header & Reserve Summary Banner](#51-header--reserve-summary-banner)
   - 5.2 [Active Needs List Cards](#52-active-needs-list-cards)
   - 5.3 [Need Contextual Action Menu](#53-need-contextual-action-menu)
   - 5.4 [Create / Edit Need Modal (`AddNeedModal`)](#54-create--edit-need-modal-addneedmodal)
   - 5.5 [Set Aside / Reserve Allocation Modal (`AddContributionModal`)](#55-set-aside--reserve-allocation-modal-addcontributionmodal)
   - 5.6 [Need Details & Virtual Fund Ledger Modal (`NeedDetailModal`)](#56-need-details--virtual-fund-ledger-modal-needdetailmodal)
   - 5.7 [Paused & Archived Needs Section](#57-paused--archived-needs-section)
6. [Quick-Add Expense Modal (`QuickAddModal`)](#6-quick-add-expense-modal-quickaddmodal)
   - 6.1 [Amount Input & Quick Category Chips](#61-amount-input--quick-category-chips)
   - 6.2 [Category & Need Link Selectors](#62-category--need-link-selectors)
   - 6.3 [Smart Contextual Helpers (Canteen Meals & Quick Commerce)](#63-smart-contextual-helpers-canteen-meals--quick-commerce)
   - 6.4 [Expandable Extra Details](#64-expandable-extra-details)
7. [Transaction History & Filtering (`TransactionListPage`)](#7-transaction-history--filtering-transactionlistpage)
   - 7.1 [Header & CSV Export Action](#71-header--csv-export-action)
   - 7.2 [Multi-Filter & Search Bar](#72-multi-filter--search-bar)
   - 7.3 [Transaction List & Line Item Cards](#73-transaction-list--line-item-cards)
   - 7.4 [Pagination Controls](#74-pagination-controls)
   - 7.5 [Edit & Delete Expense Modal](#75-edit--delete-expense-modal)
8. [Budget & Limit Settings (`BudgetSettingsPage`)](#8-budget--limit-settings-budgetsettingspage)
   - 8.1 [Allowance & Flexible Budget Planning Card](#81-allowance--flexible-budget-planning-card)
   - 8.2 [Category Spending Limits Grid](#82-category-spending-limits-grid)
   - 8.3 [Calculation & Suggestion Automation Rules](#83-calculation--suggestion-automation-rules)
9. [Spending Analytics & Reports (`ReportsPage`)](#9-spending-analytics--reports-reportspage)
   - 9.1 [Month-over-Month Shift Comparison](#91-month-over-month-shift-comparison)
   - 9.2 [Quick-Commerce & Delivery Platform Analysis](#92-quick-commerce--delivery-platform-analysis)
   - 9.3 [Canteen Meal Period Distribution](#93-canteen-meal-period-distribution)
10. [Profile & App Settings (`ProfilePage`)](#10-profile--app-settings-profilepage)
    - 10.1 [PWA Home Screen Install Banner](#101-pwa-home-screen-install-banner)
    - 10.2 [Account Overview & Feature Privileges](#102-account-overview--feature-privileges)
    - 10.3 [Edit Display Name Card](#103-edit-display-name-card)
    - 10.4 [Change Password Card](#104-change-password-card)
    - 10.5 [Sign Out Action](#105-sign-out-action)
11. [Administration Area (`AdminPage`)](#11-administration-area-adminpage)
    - 11.1 [Strict Privacy Safeguards](#111-strict-privacy-safeguards)
    - 11.2 [System Metric Cards](#112-system-metric-cards)
    - 11.3 [User Search & Directory Cards](#113-user-search--directory-cards)
    - 11.4 [Account Status Controls (Suspend & Reactivate)](#114-account-status-controls-suspend--reactivate)
    - 11.5 [Feature Privileges Toggles](#115-feature-privileges-toggles)
12. [Administrative Audit Trail (`AdminAuditPage`)](#12-administrative-audit-trail-adminauditpage)
    - 12.1 [Audit Log Ledger Cards](#121-audit-log-ledger-cards)
13. [Offline Engine & Progressive Web App (PWA)](#13-offline-engine--progressive-web-app-pwa)
14. [Calculation Reference & Glossary Cheatsheet](#14-calculation-reference--glossary-cheatsheet)

---

## 1. Core Mental Model & Financial Architecture

Before exploring individual screens, it is essential to understand the design philosophy that governs Pocket Ledger. The application divides personal finance into two separate streams:

```text
                                  ┌────────────────────────────────────────────────────────┐
                                  │            Total Monthly Money Available               │
                                  └──────────────────────────┬─────────────────────────────┘
                                                             │
                             ┌───────────────────────────────┴───────────────────────────────┐
                             ▼                                                               ▼
        ┌─────────────────────────────────────────┐                     ┌─────────────────────────────────────────┐
        │       1. Mandatory Reserve Needs        │                     │      2. Variable / Flexible Spend       │
        │  (Unavoidable recurring obligations)    │                     │   (Day-to-day discretionary spending)   │
        └────────────────────┬────────────────────┘                     └────────────────────┬────────────────────┘
                             │                                                               │
     • Laundry, Grooming, Toiletries, Transport.                • Canteens, tea, coffee, late-night snacks.
     • Monthly Reserve Target set explicitly by user.           • Quick commerce: Blinkit, Instamart, Zepto.
     • Fund balance increases via "Set Aside" contributions.    • Governed by Flexible Spending Budget.
     • Linked expenses are deducted from the virtual fund.      • Any expense NOT linked to a Need counts here.
     • NEVER counted as flexible spending.                      • Exceeding budget alerts with warnings.
```

### Key Principles:
1. **Integer Minor Units (Paise)**: All money is stored as an integer number of paise (`₹1.00 = 100 paise`) in MongoDB. This eliminates floating-point rounding errors and ensures arithmetic precision.
2. **Virtual Tracker Balance vs. Bank Account**: The application is an intentional planning and tracking tool. It does not initiate real bank transfers or move real money. "Setting aside" an amount means recording an intentional allocation.
3. **Segregated Calculations**:
   - Setting aside money for a Need is a **contribution**, not an expense. It does not inflate monthly spending.
   - An expense linked to a Need is deducted from that Need's virtual fund and excluded from flexible spending.
4. **Privacy-by-Design**: Administrative users can manage accounts and feature flags, but can never view another user's expense descriptions, amounts, or personal budgets.

---

## 2. Public Pages (Authentication)

### 2.1 Sign In / Login Page (`LoginPage`)

The entry point for returning users.

```text
┌────────────────────────────────────────┐
│             [ Wallet Icon ]            │
│              Pocket Ledger             │
│  Personal reserve planner & tracker    │
├────────────────────────────────────────┤
│ Sign In                                │
│                                        │
│ Email Address                          │
│ [ you@example.com                    ] │
│                                        │
│ Password                               │
│ [ ••••••••••                         ] │
│                                        │
│ [             Sign In                ] │
│                                        │
│ Don't have an account? Create one      │
└────────────────────────────────────────┘
```

#### Elements & Meanings:
- **Header Icon & Title**: Displays the Pocket Ledger wallet glyph and brand subtitle.
- **Error Banner**: Appears conditionally if invalid credentials are submitted or if the account has been suspended by an administrator.
  - *Instruction/Message*: `"Login failed. Please check your credentials."` or `"Your account has been suspended. Please contact an administrator."` (Generic messages are used to prevent email enumeration).
- **Email Address (`Input`)**: 
  - *Label*: `"Email Address"`
  - *Placeholder*: `"you@example.com"`
  - *Purpose*: Standard normalized email input. Automatically converts characters to lowercase and strips surrounding whitespace.
- **Password (`Input`)**: 
  - *Label*: `"Password"`
  - *Placeholder*: `"••••••••••"`
  - *Type*: Masked password field. Requires the account password.
- **Sign In Button (`Button`)**:
  - *Type*: Primary full-width button.
  - *Behavior*: Submits credentials to `POST /api/auth/login`. Sets an HTTP-only, secure, `SameSite=Lax` session cookie upon success. Shows a spinning loader while waiting.
- **"Don't have an account? Create one" link**:
  - Switches view to the `RegisterPage` without reloading the page.

---

### 2.2 Create Account / Register Page (`RegisterPage`)

The registration form for new users.

```text
┌────────────────────────────────────────┐
│             [ Wallet Icon ]            │
│              Pocket Ledger             │
│ Start managing your mandatory reserves │
├────────────────────────────────────────┤
│ Create Account                         │
│                                        │
│ Your Name or Nickname                  │
│ [ e.g. Rahul Sharma                  ] │
│                                        │
│ Email Address                          │
│ [ you@example.com                    ] │
│                                        │
│ Password (min. 10 characters)          │
│ [ ••••••••••                         ] │
│                                        │
│ Confirm Password                       │
│ [ ••••••••••                         ] │
│                                        │
│ [        Register & Setup            ] │
│                                        │
│ Already have an account? Sign in       │
└────────────────────────────────────────┘
```

#### Elements & Meanings:
- **Your Name or Nickname (`Input`)**:
  - *Label*: `"Your Name or Nickname"`
  - *Placeholder*: `"e.g. Rahul Sharma"`
  - *Purpose*: The user's preferred display name, shown in the navigation bar, profile header, and admin directory.
- **Email Address (`Input`)**:
  - *Label*: `"Email Address"`
  - *Placeholder*: `"you@example.com"`
  - *Validation*: Validated on client and server; enforces unique index in MongoDB.
- **Password (min. 10 characters) (`Input`)**:
  - *Label*: `"Password (min. 10 characters)"`
  - *Validation Rule*: Enforces a minimum length of 10 characters to protect accounts against credential stuffing.
  - *Error on breach*: `"Password must be at least 10 characters long."`
- **Confirm Password (`Input`)**:
  - *Label*: `"Confirm Password"`
  - *Validation Rule*: Must match the password field character-for-character.
  - *Error on mismatch*: `"Passwords do not match."`
- **Register & Setup Button (`Button`)**:
  - *Action*: Calls `POST /api/auth/register`. Hashes passwords with bcrypt (12 salt rounds).
  - *Automatic Seeding*: Upon registration, 10 default university categories are created for the new user (`Canteen / Meals`, `Tea / Coffee`, `Late-night Snacks`, `Groceries / Hostel Snacks`, `Quick Commerce`, `Transport`, `Laundry`, `Personal Care / Toiletries`, `Haircut / Grooming`, `Miscellaneous`).
  - *Bootstrap Admin Detection*: If the registered email matches the server's `BOOTSTRAP_ADMIN_EMAIL`, the account is automatically granted `admin` role and feature flags.

---

## 3. Global Shell & Navigation

Once authenticated, the app shell wraps every screen in a unified layout containing the top navbar, offline indicator banner, and mobile bottom navigation.

### 3.1 Top Navigation Bar (`Navbar`)

Positioned at the top of the viewport on all devices.

```text
┌─────────────────────────────────────────────────────────────┐
│ [Wallet] Pocket Ledger         [Offline] [Admin] [Profile]  │
└─────────────────────────────────────────────────────────────┘
```

#### Elements & Meanings:
- **Brand / Logo**: Clicking the wallet icon or "Pocket Ledger" title immediately navigates to the **Dashboard** view (`currentTab = 'dashboard'`).
- **Offline Mode Pill**:
  - Appears with a yellow alert badge when the device loses network connectivity.
  - *Label*: `[WifiOff] Offline`
  - *Tooltip*: `"Offline mode"`
- **Pending Sync Badge**:
  - Appears when online and local unsynced offline records exist in IndexedDB.
  - *Label*: `[RefreshCw] {count} to sync`
  - *Tooltip*: `"{count} pending offline items. Click to sync."`
  - *Interaction*: Clicking triggers immediate background batch synchronization.
- **Admin Tab Button**:
  - *Visibility*: Rendered only if the signed-in user has `role === 'admin'`.
  - *Icon*: Shield alert icon. Clicking navigates to the Administration Panel.
- **Profile / Account Button**:
  - *Icon*: User avatar icon. Displays the user's first name on desktop screens.
  - *Tooltip*: `"Signed in as {displayName}"`
  - *Interaction*: Navigates to the Profile & App Settings screen.

---

### 3.2 Offline & Sync Status Banner (`OfflineBanner`)

A full-width contextual alert strip below the top navigation bar. It is completely hidden when the device is online and fully synced.

```text
┌─────────────────────────────────────────────────────────────┐
│ [WifiOff] You are offline. 2 expense(s) saved locally.      │
└─────────────────────────────────────────────────────────────┘
  - or -
┌─────────────────────────────────────────────────────────────┐
│ [RefreshCw] 2 offline expense(s) pending sync.   [Sync now] │
└─────────────────────────────────────────────────────────────┘
```

#### States & Instructions:
1. **Offline State (`offline-state`)**:
   - *Message*: `"You are offline. {count} expense(s) saved locally."` or `"You are offline. New entries will be queued."`
   - *Explanation*: The user is informed that transactions recorded right now will not be lost—they are being saved locally into their browser's IndexedDB database.
2. **Online Pending State (`sync-state`)**:
   - *Message*: `"{count} offline expense(s) pending sync."`
   - *Action Button*: `"Sync now"` — Clicking immediately sends queued transactions to `POST /api/transactions/sync` and removes them from IndexedDB upon server acknowledgment.
3. **Sync Error State**:
   - *Message*: `"Sync error: {error_details}"` — Displays failure reason if the sync API rejected the payload.

---

### 3.3 Mobile Bottom Navigation Bar (`BottomNav`)

Fixed to the bottom of the screen on mobile devices.

```text
┌─────────────────────────────────────────────────────────────┐
│  [Dashboard]    [Needs]     ( + )    [History]    [Reports] │
│   Dashboard      Needs       Add      History      Reports  │
└─────────────────────────────────────────────────────────────┘
```

#### Tabs & Destination:
- **Dashboard (`LayoutDashboard` icon)**: Navigates to the main balance overview.
- **Needs (`ShieldCheck` icon)**: Navigates to the Mandatory Reserve Needs planner.
- **Center Add Button (`+` Plus icon)**: A prominent elevated primary action button. Tapping opens the **Quick-Add Expense Modal** from anywhere in the app.
- **History (`History` icon)**: Navigates to the full transaction log and search interface.
- **Reports (`BarChart3` icon)**: Navigates to monthly comparisons and categorical charts.

---

## 4. Dashboard Page (`DashboardPage`)

The central control room of Pocket Ledger. It answers both primary questions simultaneously: *What must I reserve?* and *How is my discretionary budget holding up?*

```text
┌─────────────────────────────────────────────────────────────┐
│  < [   November 2026   ] >                              [↻] │
├─────────────────────────────────────────────────────────────┤
│ Expense recorded: ₹45                                [Undo] │
├─────────────────────────────────────────────────────────────┤
│ [Shield] Mandatory Reserves                        View all >│
│ Unavoidable needs reserve planner                           │
│ ┌───────────────────┬───────────────────┬─────────────────┐ │
│ │ Target to Reserve │    Contributed    │ Remaining to Set│ │
│ │     ₹3,500        │      ₹2,000       │     ₹1,500      │ │
│ └───────────────────┴───────────────────┴─────────────────┘ │
│ Monthly Reserve Funded: 57%                                 │
│ [=====================>                  ]                  │
│ • Laundry: ₹1,000 / ₹1,500                                  │
│ • Haircut: ₹500 / ₹500                                      │
├─────────────────────────────────────────────────────────────┤
│ [Utensils] Flexible Spending                       [Budget] │
│ Daily university food, snacks & quick commerce              │
│ ┌───────────────────┬───────────────────┬─────────────────┐ │
│ │  Flexible Spent   │  Flexible Budget  │    Remaining    │ │
│ │      ₹4,250       │      ₹6,500       │     ₹2,250      │ │
│ └───────────────────┴───────────────────┴─────────────────┘ │
│ Budget Used: 65%                                            │
│ [=========================>              ]                  │
│ Total Spent this month: ₹5,750 (Needs: ₹1,500 | Flex: ₹4,250)│
├─────────────────────────────────────────────────────────────┤
│ Daily Spending Trend                                        │
│ Day-by-day flexible vs mandatory expense distribution       │
│ [Bars by Day 1..30: ■ Flexible  ■ Need-related]             │
├─────────────────────────────────────────────────────────────┤
│ Spending by Category                                        │
│ Ranked spending and category budget progress                │
│ • Canteen / Meals       [Flexible]        ₹2,400 (42%)      │
│ • Quick Commerce        [Flexible]        ₹1,200 (21%)      │
├─────────────────────────────────────────────────────────────┤
│ Recent Expenses                                   View all >│
│ • Nescafe (Tea / Coffee)                  -₹30   UPI        │
│ • Instamart [Instamart] (Snacks)         -₹240   UPI        │
└─────────────────────────────────────────────────────────────┘
```

### 4.1 Month Selector & Refresh Bar
- **Left / Right Chevron Buttons (`<`, `>`)**: Navigates back or forward by one calendar month.
- **Month Title (`formatMonthName`)**: Displays the formatted active month and year (e.g. "November 2026").
- **Reload Button (`RotateCcw`)**: Refetches current month calculations from the backend.

### 4.2 Quick-Undo Notification Banner
- Appears for 8 seconds immediately after recording an expense.
- *Text*: `"Expense recorded: ₹{amount}"`
- *Action*: **"Undo" button** — Deletes the newly added transaction from the server and instantly recalculates dashboard balances.

### 4.3 Mandatory Reserves Card (`ReservesCard`)
- **Header**: Icon, title `"Mandatory Reserves"`, and subtitle `"Unavoidable needs reserve planner"`.
- **"View all" action link**: Redirects directly to the `NeedsPage`.
- **Metrics Grid**:
  1. **Target to Reserve**: Sum of monthly reserve targets for all active, unarchived Needs ($\sum \text{monthlyReserveAmountPaise}$).
  2. **Contributed**: Total allocations set aside for active Needs in the selected calendar month ($\sum \text{contributions}$). Displayed in green.
  3. **Remaining to Set Aside**: $\max(0, \text{Target} - \text{Contributed})$. Displayed in purple when money is still owed; turns green when target is fulfilled.
- **Monthly Reserve Funded Progress Bar**: Percentage of target funded ($(\text{Contributed} / \text{Target}) \times 100$).
- **Mini Needs List**: Displays top 3 Needs with current progress (e.g., `Laundry: ₹1,000 / ₹1,500`).

### 4.4 Flexible Spending Card (`FlexibleBudgetCard`)
- **Header**: Utensils icon, title `"Flexible Spending"`, and subtitle `"Daily university food, snacks & quick commerce"`.
- **"Budget" settings button (`Settings` icon)**: Opens the Budget & Limit Settings page.
- **Metrics Grid**:
  1. **Flexible Spent**: Total of all expense transactions that have **no Need link** and whose category is marked as flexible. Displayed in blue.
  2. **Flexible Budget / Suggested Budget**: The target configured by the user, or automatically suggested from monthly allowance ($\text{Allowance} - \text{Reserves}$). Displays `"Not set"` if no allowance/budget exists.
  3. **Remaining**: Flexible budget minus flexible spent. If spending exceeds budget, displays negative amount in danger red (e.g., `-₹350`).
- **Budget Used Progress Bar**:
  - Green when below 80%.
  - Warning yellow between 80% and 100%.
  - Danger red with alert text `"Budget Exceeded!"` when above 100%.
- **Spend Split Row**:
  - *Summary*: `"Total Spent this month: ₹{total}"`
  - *Breakdown*: `"(Needs: ₹{needExpenses} | Flexible: ₹{flexibleExpenses})"`

### 4.5 Daily Spending Trend Chart (`SpendingTrendChart`)
- **Title**: `"Daily Spending Trend"`
- **Subtitle**: `"Day-by-day flexible vs mandatory expense distribution"`
- **Interactive Stacked Bars**: Represents each day of the month (1 to 28/30/31).
  - Blue segment: Flexible discretionary spending on that day.
  - Purple segment: Need-related expenses on that day.
  - Hovering / tapping displays exact date and day's spend.
- **Color Legend**: `Flexible` (blue dot) and `Need-related` (purple dot).

### 4.6 Category Breakdown Card (`CategoryBreakdown`)
- **Title**: `"Spending by Category"`
- **Subtitle**: `"Ranked spending and category budget progress"`
- **List Items**:
  - Category Name with badge: `[Flexible]` or `[Need / Fixed]`.
  - Amount spent and percentage of total monthly expenses (`% of Total`).
  - Proportional visual fill bar.
  - If a category limit is configured in Budget Settings: Displays `"Limit: ₹{limit}"` and `"₹{remaining} left"` or `"Exceeded by ₹{over}"`.

### 4.7 Recent Expenses Card (`RecentTransactions`)
- **Title**: `"Recent Expenses"`
- **"View all" action link**: Navigates to the full transaction history.
- **List Items**:
  - Category / Merchant / Platform glyph (`ShoppingBag`, `Zap`, `Utensils`).
  - Merchant / description line with platform badges (e.g. `[Blinkit]`, `[Dinner]`).
  - Date and category subtitle with optional purple `[Need]` badge if linked to a Need.
  - Negative amount in bold monospace font and payment method tag (`UPI`, `Cash`, `Card`).

---

## 5. Mandatory Needs / Reserve Planner (`NeedsPage`)

The dedicated space for managing recurring obligations.

```text
┌─────────────────────────────────────────────────────────────┐
│ Mandatory Reserves                             [+ New Need] │
│ Set aside money for unavoidable needs (laundry, grooming...)│
├─────────────────────────────────────────────────────────────┤
│ ┌───────────────────┬───────────────────┬─────────────────┐ │
│ │   Monthly Target  │ Funded This Month │Remaining Reserve│ │
│ │      ₹3,500       │      ₹2,000       │     ₹1,500      │ │
│ └───────────────────┴───────────────────┴─────────────────┘ │
│ Overall Reserve Target Funded: 57%                          │
│ [===================>                    ]                  │
├─────────────────────────────────────────────────────────────┤
│ [Shield] Laundry                     [Laundry] (monthly) [⋮]│
│ Target: ₹1,500 / mo      Contributed: ₹1,000 (67%)          │
│ [============================>           ]                  │
│ Virtual Tracker Balance: ₹1,200        [Details] [+ Set Aside]
├─────────────────────────────────────────────────────────────┤
│ [Shield] Haircut & Grooming       [Personal Care] (monthly) │
│ Target: ₹500 / mo        Contributed: ₹500 (100%)           │
│ [========================================]                  │
│ Virtual Tracker Balance: ₹500          [Details] [+ Set Aside]
├─────────────────────────────────────────────────────────────┤
│ > Show Paused / Archived (1)                                │
└─────────────────────────────────────────────────────────────┘
```

### 5.1 Header & Reserve Summary Banner
- **Header Title**: `"Mandatory Reserves"`
- **Header Subtitle**: `"Set aside money for unavoidable needs (laundry, haircut, transport, toiletries)"`
- **"+ New Need" Button (`Button`)**: Launches the `AddNeedModal` to create a new reserve category.
- **Summary Banner**: Displays cumulative Monthly Target, Funded This Month, and Remaining to Reserve across all active obligations with a combined progress bar.

---

### 5.2 Active Needs List Cards
Each active Need renders an informative card with real-time tracking metrics:
- **Need Name**: The title given by the user (e.g. "Laundry", "Hostel Wi-Fi", "Monthly Train Pass").
- **Category Badge**: Associated category if selected (e.g. `[Personal Care / Toiletries]`).
- **Frequency Tag**: Obligation interval (`(monthly)`, `(weekly)`, `(quarterly)`, `(yearly)`, or `(irregular)`).
- **Three-Dot Menu (`MoreVertical` icon)**: Opens the contextual action menu (see 5.3).
- **Target vs. Contributed Metrics**:
  - `Target: ₹{monthlyReserveAmountPaise} / mo`
  - `Contributed: ₹{contributedThisMonthPaise} ({progressPercent}%)`
- **Progress Bar**: Fills with purple; turns vibrant green when funded $\ge 100\%$.
- **Virtual Tracker Balance**:
  - *Display*: `"Virtual Tracker Balance: ₹{virtualFundBalancePaise}"`
  - *Formula*: $\text{Opening Balance} + \sum \text{All-time Contributions} - \sum \text{All-time Linked Expenses}$.
  - *Instruction/Meaning*: This is your virtual reserve fund. Every time you record an expense linked to this Need, money is spent out of this fund.
- **Card Actions**:
  - **"Details" Button**: Opens `NeedDetailModal` showing full ledger history.
  - **"+ Set Aside" Button**: Opens `AddContributionModal` to record an allocation.

---

### 5.3 Need Contextual Action Menu
Clicking the three vertical dots (`⋮`) on any Need card exposes:
1. **History & Balances (`List` icon)**: Opens `NeedDetailModal`.
2. **Edit Target (`Edit2` icon)**: Opens `AddNeedModal` in edit mode. Target updates apply to current/future months without rewriting past history.
3. **Pause Need (`Pause` icon)**: Temporarily excludes this Need from future monthly reserve targets while preserving all historical contributions and expenses. Can be resumed anytime.
4. **Archive (`Archive` icon)**: Retires the Need with confirmation prompt: `"Archive '{name}'? Historical contributions and expenses will be preserved."`

---

### 5.4 Create / Edit Need Modal (`AddNeedModal`)

```text
┌────────────────────────────────────────┐
│ Create Reserve Need                [X] │
├────────────────────────────────────────┤
│ Need Name                              │
│ [ e.g. Laundry, Haircut, Transport   ] │
│                                        │
│ Monthly Reserve Target (INR)           │
│ ₹ [ 1500                             ] │
│ (The explicit amount you want to set   │
│  aside every month for this need)      │
│                                        │
│ Opening Virtual Balance (Optional)     │
│ ₹ [ 0                                ] │
│ (Starting balance already set aside in │
│  your tracker fund)                    │
│                                        │
│ Category (Optional)                    │
│ [ Laundry                            ▼]│
│                                        │
│ Obligation Frequency                   │
│ [ Monthly                            ▼]│
│                                        │
│ Notes (Optional)                       │
│ [ e.g. 3 loads per week, ₹120 each   ] │
│                                        │
│ [   Cancel   ] [     Save Need       ] │
└────────────────────────────────────────┘
```

#### Fields & Instructions:
- **Need Name (`Input`, Required)**:
  - *Placeholder*: `"e.g. Laundry, Haircut, Transport, Phone Recharge"`
  - *Purpose*: Identifies the specific obligation.
- **Monthly Reserve Target (INR) (`Input`, Required)**:
  - *Prefix*: `₹`
  - *Helper Text*: `"The explicit amount you want to set aside every month for this need."`
  - *Explanation*: The user must explicitly state their reserve target. The app never guesses or forces targets based on past spending.
- **Opening Virtual Balance (Optional) (`Input`)**:
  - *Prefix*: `₹` (Default `0`)
  - *Helper Text*: `"Starting balance already set aside in your tracker fund."`
  - *Note*: Only shown on creation. Represents pre-existing savings allocated to this obligation before starting with Pocket Ledger.
- **Category (Optional) (`Select`)**:
  - Links this Need to an expense category (e.g. "Laundry", "Personal Care").
- **Obligation Frequency (`Select`)**:
  - *Options*: `Monthly`, `Weekly`, `Quarterly`, `Yearly`, `Irregular / Ad-hoc`.
- **Notes (Optional) (`Input`)**:
  - *Placeholder*: `"e.g. 3 loads per week, ₹120 each"`
  - *Purpose*: Personal notes, breakdown reminders, or due date annotations.

---

### 5.5 Set Aside / Reserve Allocation Modal (`AddContributionModal`)

Triggered by tapping **"+ Set Aside"** on any Need card.

```text
┌────────────────────────────────────────┐
│ Set Aside Money for Laundry        [X] │
├────────────────────────────────────────┤
│ [i] Virtual Reserve Allocation:        │
│ This records that you have set aside   │
│ money into your virtual reserve fund.  │
│ It is NOT counted as an expense and    │
│ will not inflate your spending totals. │
│                                        │
│ Remaining to reserve this month: ₹500  │
│                                        │
│ Amount to Set Aside (INR)              │
│ ₹ [ 500                              ] │
│                                        │
│ Note (Optional)                        │
│ [ e.g. From pocket money / allowance ] │
│                                        │
│ [   Cancel   ] [ [Shield] Record Alloc]│
└────────────────────────────────────────┘
```

#### On-Screen Instructions & Elements:
- **Educational Alert Box**:
  - *Text*: `"Virtual Reserve Allocation: This records that you have set aside money into your virtual reserve fund. It is not counted as an expense and will not inflate your spending totals."`
  - *Instruction*: Crucial user education preventing confusion between *allocating money to savings* and *spending money*.
- **Remaining Indicator**:
  - Displays `"Remaining to reserve this month: ₹{remainingThisMonthPaise}"` for fast reference.
- **Amount to Set Aside (INR) (`Input`, Required)**:
  - The sum of money being marked as reserved.
- **Note (Optional) (`Input`)**:
  - *Placeholder*: `"e.g. Set aside from pocket money / allowance"`
- **"Record Allocation" Button (`Button`)**:
  - Saves the contribution record into `NeedContribution` collection and immediately updates the monthly progress bar.

---

### 5.6 Need Details & Virtual Fund Ledger Modal (`NeedDetailModal`)

Triggered by tapping **"Details"** on any Need card.

```text
┌────────────────────────────────────────┐
│ Laundry Details                    [X] │
├────────────────────────────────────────┤
│ Virtual Fund Tracker Balance           │
│ (Not a bank account)                   │
│ ₹1,200                                 │
│ ────────────────────────────────────── │
│ Opening: ₹0 | + Contribs: ₹2,000 |     │
│             - Spent: ₹800              │
├────────────────────────────────────────┤
│ Note: 3 loads per week                 │
├────────────────────────────────────────┤
│ Contribution Records             [+Add]│
│ • +₹1,000   15 Nov   Pocket money  [🗑]│
│ • +₹1,000    1 Nov   Allowance     [🗑]│
├────────────────────────────────────────┤
│ [               Close                ] │
└────────────────────────────────────────┘
```

#### Elements & Explanations:
- **Virtual Fund Tracker Balance Box**:
  - Displays total balance in large bold green font.
  - Subtitle: `"(Not a bank account)"` reinforces financial clarity.
  - Formula Strip: `Opening: ₹{opening} | + Contribs: ₹{totalContribs} | - Spent: ₹{totalSpent}`.
- **Contribution Records List**:
  - Shows every past contribution date, amount, and note.
  - **Trash Can Icon (`Trash2`)**: Allows deleting an erroneous contribution record after a confirmation prompt.
- **"+ Add" Button**: Shortcut to add a new contribution directly from this ledger view.

---

### 5.7 Paused & Archived Needs Section
- Positioned below the active needs list.
- **Toggle Button**: `"Show Paused / Archived ({count})"` / `"Hide Paused / Archived ({count})"`.
- **List Items**: Semi-transparent cards displaying the obligation's name, target, and current virtual balance.
- **"Resume" Button (`Play` icon)**: Instantly unpauses the Need and returns it to active monthly tracking.

---

## 6. Quick-Add Expense Modal (`QuickAddModal`)

Accessible globally from anywhere in the application by tapping the bottom nav `+` button or dashboard triggers. Designed for 5-second entry on mobile devices.

```text
┌────────────────────────────────────────┐
│ Add Expense                        [X] │
├────────────────────────────────────────┤
│                                        │
│         ₹ [ 65                       ] │
│                                        │
│ Recent: [Canteen] [Tea] [Blinkit]      │
│                                        │
│ Category                               │
│ [ Tea / Coffee (Flexible)            ▼]│
│                                        │
│ Link to Reserve Need (Optional)        │
│ [ None (Discretionary / General)     ▼]│
│ (Leave unlinked for discretionary      │
│  spending)                             │
│                                        │
│ Meal: [Breakfast] [Lunch] [Dinner]     │
│       [Late Night]                     │
│                                        │
│ Platform: [Blinkit] [Instamart] [Zepto]│
│                                        │
│ > + Add merchant, description, notes   │
│                                        │
│ [   Cancel   ] [ [✓] Save Expense    ] │
└────────────────────────────────────────┘
```

### 6.1 Amount Input & Quick Category Chips
- **Amount Field**:
  - Extra-large monospace numeric input with currency symbol prefix `₹`. Automatically focused when the modal opens.
- **Recent Category Chips**:
  - Remembers the user's 4 most frequently/recently used categories from `localStorage`.
  - Tapping a chip (e.g. `[Canteen]`, `[Tea]`) selects it with a single tap.

### 6.2 Category & Need Link Selectors
- **Category Selector (`Select`, Required)**:
  - Lists all user categories with indicator if it counts toward flexible budget (e.g. `Canteen / Meals (Flexible)`).
- **Link to Reserve Need (Optional) (`Select`)**:
  - *Default*: `"None (Discretionary / General Expense)"`
  - *Helper Instructions*:
    - If unlinked: `"Leave unlinked for discretionary spending."`
    - If a Need is selected: `"Paid from this Need's virtual fund. Excluded from flexible spend."`
  - *Critical Rule*: Linking an expense to a Need tags it with `needId`. The backend deducts it from the Need's virtual fund balance and excludes it from the flexible budget.

### 6.3 Smart Contextual Helpers
The modal dynamically inspects the selected category:
- **Canteen / Meals detected**:
  - Displays one-tap meal period buttons: `[Breakfast]`, `[Lunch]`, `[Dinner]`, `[Late Night]`.
- **Quick Commerce / Grocery detected**:
  - Displays one-tap platform buttons: `[Blinkit]`, `[Instamart]`, `[Zepto]`, `[Other]`.

### 6.4 Expandable Extra Details
Clicking `"+ Add merchant, description, notes"` expands optional metadata:
- **Merchant / Shop / Canteen (`Input`)**: e.g. `"Canteen 2"`, `"Nescafe"`, `"Local Chemist"`.
- **Description / Items (`Input`)**: e.g. `"Bread omelette + tea"`. Single orders do not require line-item entry.
- **Payment Method (`Select`)**: `UPI` (default in India), `Cash`, `Card`, `Other`.
- **"Save Expense" Button**:
  - Offline: Queues record in IndexedDB with client-generated UUID.
  - Online: Saves to MongoDB via `POST /api/transactions`.
  - On return to dashboard: Displays the 8-second Quick-Undo toast.

---

## 7. Transaction History & Filtering (`TransactionListPage`)

A searchable, filterable, and editable log of all transactions.

```text
┌─────────────────────────────────────────────────────────────┐
│ Transaction History                           [Export CSV]  │
│ 142 recorded expense(s)                                     │
├─────────────────────────────────────────────────────────────┤
│ [Search description, shop, notes...                       ] │
│ ┌──────────────────────┬──────────────────────┬───────────┐ │
│ │ All Categories      ▼│ All Types (Flex/Need)▼│ Platforms ▼│
│ └──────────────────────┴──────────────────────┴───────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [Bag] Nescafe                                 -₹30   UPI    │
│ 15 Nov, 02:30 PM • Tea / Coffee                             │
│ Tea with friends                                            │
├─────────────────────────────────────────────────────────────┤
│ [Zap] Instamart [Instamart]                  -₹180   UPI    │
│ 14 Nov, 11:15 PM • Groceries / Hostel Snacks                │
│ Midnight chips & biscuits                                   │
├─────────────────────────────────────────────────────────────┤
│ [Utensils] Laundry Service [Need]            -₹240   Cash   │
│ 13 Nov, 10:00 AM • Laundry                                  │
├─────────────────────────────────────────────────────────────┤
│ [Previous]          Page 1 of 6                     [Next]  │
└─────────────────────────────────────────────────────────────┘
```

### 7.1 Header & CSV Export Action
- **Header**: Shows total number of matched records (e.g. `"142 recorded expense(s)"`).
- **"Export CSV" Button (`Download` icon)**: Calls `GET /api/transactions/export` to generate and download a scoped RFC 4180 CSV spreadsheet of the user's transactions.

### 7.2 Multi-Filter & Search Bar
- **Text Search (`Input`)**: Searches description, merchant/shop name, and notes in real time.
- **Category Filter (`Select`)**: Filter by specific category or view all.
- **Type Filter (`Select`)**:
  - `All Types (Flexible & Need)`
  - `Flexible Spending Only` (excludes Need-linked records)
  - `Need-Related Only` (isolates expenses paid from reserve funds)
- **Platform Filter (`Select`)**: Filter by `Blinkit`, `Instamart`, `Zepto`, or `Other`.

### 7.3 Transaction List & Line Item Cards
Each transaction displays:
- Categorical icon (`ShoppingBag`, `Zap`, `Utensils`).
- Merchant or Category title with platform tags.
- Full date, timestamp, category name, and purple `[Need]` badge if linked.
- Amount in monospace bold with payment method indicator.
- Tapping any card opens the **Edit / Delete Expense Modal**.

### 7.4 Pagination Controls
- Displays current page and total pages (`Page X of Y`).
- `"Previous"` and `"Next"` buttons navigate cleanly without unbounded memory leaks.

### 7.5 Edit & Delete Expense Modal
Allows full editing of previously entered transactions:
- Amount in INR, Category, Linked Need, Merchant, Description, and Payment Method.
- **"Delete" Button (`Trash2` icon)**: Deletes transaction permanently with confirmation prompt.
- **"Save Changes" Button**: Updates the record in MongoDB.

---

## 8. Budget & Limit Settings (`BudgetSettingsPage`)

The planning configuration screen where monthly allowances and category caps are defined.

```text
┌─────────────────────────────────────────────────────────────┐
│ Budget & Limit Settings                                     │
│ Configure allowance planning and category limits for 2026-11│
├─────────────────────────────────────────────────────────────┤
│ Monthly Allowance & Flexible Budget                         │
│ [i] If you leave Flexible Spending Budget empty, the app    │
│ will automatically suggest a budget equal to your:          │
│ Monthly Allowance minus Mandatory Reserves.                 │
│                                                             │
│ Total Monthly Allowance / Available Funds (INR)             │
│ ₹ [ 10000                            ]                      │
│ (Your estimated total money for the month)                  │
│                                                             │
│ Flexible Spending Budget Override (INR)                     │
│ ₹ [ 6500                             ]                      │
│ (Explicit target for canteen, snacks, and grocery spend)    │
├─────────────────────────────────────────────────────────────┤
│ Category Spending Limits (Optional)                         │
│ Set spending limits for individual categories               │
│ ┌───────────────────────────┬─────────────────────────────┐ │
│ │ Canteen / Meals           │ Tea / Coffee                │ │
│ │ ₹ [ 3000                ] │ ₹ [ 800                   ] │ │
│ ├───────────────────────────┼─────────────────────────────┤ │
│ │ Late-night Snacks         │ Quick Commerce              │ │
│ │ ₹ [ 1000                ] │ ₹ [ 1500                  ] │ │
│ └───────────────────────────┴─────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [ [✓] Save Budget Settings                                ] │
└─────────────────────────────────────────────────────────────┘
```

### 8.1 Allowance & Flexible Budget Planning Card
- **Educational Notice Box**:
  - *Instruction*: `"If you leave Flexible Spending Budget empty, the app will automatically suggest a budget equal to your Monthly Allowance minus Mandatory Reserves."`
  - *Explanation*: Clarifies that this is a mathematical suggestion for planning, not an actual bank balance.
- **Total Monthly Allowance / Available Funds (INR) (`Input`)**:
  - Expected total funds for the month (allowance, stipend, or pocket money).
- **Flexible Spending Budget Override (INR) (`Input`)**:
  - Optional explicit ceiling for discretionary spending. If left blank, the app computes $\max(0, \text{Allowance} - \text{Mandatory Reserves})$.

### 8.2 Category Spending Limits Grid
- Displays inputs for every user category.
- Setting an amount (e.g. ₹3,000 for Canteen) creates a visual progress bar on the Dashboard under Category Breakdown and alerts if exceeded.

---

## 9. Spending Analytics & Reports (`ReportsPage`)

Descriptive reporting comparing current spending against historical trends.

```text
┌─────────────────────────────────────────────────────────────┐
│ Spending Analytics & Comparison                             │
│ Comparing November 2026 against October 2026                │
├─────────────────────────────────────────────────────────────┤
│ Month-over-Month Shift                                      │
│ ┌───────────────────┬───────────────────┬─────────────────┐ │
│ │   October 2026    │   November 2026   │   Difference    │ │
│ │      ₹5,200       │      ₹5,750       │  [▲] +₹550      │ │
│ └───────────────────┴───────────────────┴─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Quick-Commerce & Delivery Platforms                         │
│ Orders from Blinkit, Instamart, Zepto, etc.                 │
│ • [Zap] Blinkit           (4 orders)                ₹680    │
│ • [Zap] Instamart         (3 orders)                ₹520    │
├─────────────────────────────────────────────────────────────┤
│ Canteen Meal Periods                                        │
│ Breakfast, Lunch, Dinner, Late Night distribution           │
│ • [Utensils] Dinner       (14 meals)              ₹1,120    │
│ • [Utensils] Lunch        (10 meals)                ₹800    │
│ • [Utensils] Late Night    (6 meals)                ₹480    │
└─────────────────────────────────────────────────────────────┘
```

### 9.1 Month-over-Month Shift Comparison
- Compares total expenses of the selected month against the previous calendar month.
- Displays difference with color-coded direction indicator:
  - Green `TrendingDown` icon: Spending reduced compared to last month.
  - Red `TrendingUp` icon: Spending increased compared to last month.

### 9.2 Quick-Commerce & Delivery Platform Analysis
- Aggregates orders tagged with `Blinkit`, `Instamart`, `Zepto`, or `Other`.
- Shows order count and total amount spent per platform.

### 9.3 Canteen Meal Period Distribution
- Aggregates meal tags (`Breakfast`, `Lunch`, `Dinner`, `Late Night`).
- Reveals canteen spending habits and late-night snacking tendencies.

---

## 10. Profile & App Settings (`ProfilePage`)

Account security, PWA installation, and personal profile management.

```text
┌─────────────────────────────────────────────────────────────┐
│ Profile & App Settings                                      │
│ Manage your account credentials and app preferences         │
├─────────────────────────────────────────────────────────────┤
│ Install Pocket Ledger App                     [Install PWA] │
│ Install on your home screen for quick offline access        │
├─────────────────────────────────────────────────────────────┤
│ Account Overview                                            │
│ • Email:              rahul@example.com                     │
│ • Account Role:       [USER]                                │
│ • Feature Privileges: [advancedAnalytics] [betaFeatures]    │
├─────────────────────────────────────────────────────────────┤
│ Edit Display Name                                           │
│ Display Name: [ Rahul Sharma                              ] │
│ [ Save Name ]                                               │
├─────────────────────────────────────────────────────────────┤
│ Change Password                                             │
│ Current Password:               [ ••••••••••              ] │
│ New Password (min 10 chars):    [ ••••••••••              ] │
│ [ [Key] Update Password ]                                   │
├─────────────────────────────────────────────────────────────┤
│ [ [LogOut] Sign Out                                       ] │
└─────────────────────────────────────────────────────────────┘
```

### 10.1 PWA Home Screen Install Banner
- Automatically surfaces when the browser supports the `beforeinstallprompt` PWA event.
- **"Install PWA" Button (`Sparkles` icon)**: Triggers native OS installation onto the Android/iOS home screen or desktop launcher.

### 10.2 Account Overview & Feature Privileges
- Displays registered email, current role badge (`[USER]` or `[ADMIN]`), and any active administrative feature privilege badges (`advancedAnalytics`, `betaFeatures`, `customDashboard`).

### 10.3 Edit Display Name Card
- Allows editing the user's display name without altering the email login.

### 10.4 Change Password Card
- Enforces current password verification before updating.
- Validates that new passwords satisfy the 10-character minimum length requirement.

### 10.5 Sign Out Action
- Destroys server-side session and clears authentication cookies.

---

## 11. Administration Area (`AdminPage`)

A protected management module accessible only to users with `role === 'admin'`.

```text
┌─────────────────────────────────────────────────────────────┐
│ [Shield] Administration Area                   [Audit Logs] │
│ Friend privileges & user management (Privacy Enforced)      │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┬────────────┐ │
│ │ Total Users  │ Active Accts │  Suspended   │ System Tx  │ │
│ │      8       │      7       │      1       │    542     │ │
│ └──────────────┴──────────────┴──────────────┴────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [Search registered users by name or email...              ] │
├─────────────────────────────────────────────────────────────┤
│ Rahul Sharma  [active] [admin] [Bootstrap Admin]            │
│ rahul@example.com                                           │
│ ─────────────────────────────────────────────────────────── │
│ Joined: 1 Nov 2026 | Last Active: 15 Nov | Tx Logged: 142   │
│ Feature Privileges:                                         │
│ [advancedAnalytics ✓] [betaFeatures ✓] [customDashboard ✓]  │
├─────────────────────────────────────────────────────────────┤
│ Amit Verma  [active] [user]                       [Suspend] │
│ amit@example.com                                            │
│ ─────────────────────────────────────────────────────────── │
│ Joined: 5 Nov 2026 | Last Active: 14 Nov | Tx Logged: 68    │
│ Feature Privileges:                                         │
│ [advancedAnalytics +] [betaFeatures +] [customDashboard +]  │
└─────────────────────────────────────────────────────────────┘
```

### 11.1 Strict Privacy Safeguards
> [!IMPORTANT]
> **Admins can NEVER see user financial data.**
> The backend server enforces strict MongoDB projection filters on administrative endpoints. Admins cannot see expense amounts, merchant names, item descriptions, Need names, or personal budgets. Only system metadata (registration date, last active timestamp, and transaction count) is exposed.

### 11.2 System Metric Cards
- **Total Users**: Total registered accounts.
- **Active Accounts**: Unrestricted active users.
- **Suspended**: Accounts blocked from signing in.
- **System Transactions**: Cumulative count of transactions logged system-wide.

### 11.3 User Search & Directory Cards
- Allows searching user accounts by name or email.
- Displays account role, status, creation date, last active date, and total transaction count.

### 11.4 Account Status Controls (Suspend & Reactivate)
- **Suspend Button (`Lock` icon)**: Blocks an ordinary user account immediately. All active sessions are invalidated.
- **Reactivate Button (`Unlock` icon)**: Restores account access.
- *Protected Bootstrap Account*: The bootstrap admin account is protected and cannot be suspended or demoted by other admins.

### 11.5 Feature Privileges Toggles
Interactive toggle chips for feature-gating:
- `advancedAnalytics`: Grants access to advanced reporting.
- `betaFeatures`: Unlocks pre-release capabilities.
- `customDashboard`: Enables customized dashboard layouts.
- Clicking a chip immediately grants or revokes the privilege and writes an entry to the audit log.

---

## 12. Administrative Audit Trail (`AdminAuditPage`)

Accessed via the **"Audit Logs"** button in the administration panel.

```text
┌─────────────────────────────────────────────────────────────┐
│ < Back to Admin                                             │
│ Administrative Audit Trail                                  │
│ Immutable log of role, suspension, and privilege mutations  │
├─────────────────────────────────────────────────────────────┤
│ USER_PRIVILEGES_UPDATED                 15 Nov 2026, 11:20 AM│
│ Actor: Rahul Sharma (admin) → Target: Amit Verma (user)     │
│ {                                                           │
│   "privileges": ["advancedAnalytics"]                       │
│ }                                                           │
├─────────────────────────────────────────────────────────────┤
│ USER_STATUS_UPDATED                     14 Nov 2026, 04:15 PM│
│ Actor: Rahul Sharma (admin) → Target: Rohan Das (user)      │
│ {                                                           │
│   "status": "suspended"                                     │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
```

### 12.1 Audit Log Ledger Cards
- Records every administrative change permanently in MongoDB (`AdminAuditLog` collection).
- **Action Type**: e.g. `USER_STATUS_UPDATED`, `USER_PRIVILEGES_UPDATED`, `USER_ROLE_UPDATED`.
- **Timestamp**: Formatted date and time of the event.
- **Actor vs. Target**: Identifies which administrator performed the action and which user account was modified.
- **JSON Diff**: Exact serialized snapshot of the fields that changed.

---

## 13. Offline Engine & Progressive Web App (PWA)

Pocket Ledger includes a robust offline engine powered by IndexedDB and Workbox service workers:

```text
                             [ Add Expense Action ]
                                       │
                         Is the browser online?
                                ╱      ╲
                              YES       NO
                              ╱          ╲
                             ▼            ▼
             [ POST /api/transactions ]   [ Store in IndexedDB (Dexie) ]
                             │            [ Assign Client UUID         ]
                             ▼            [ Show Offline Banner        ]
                  [ Server Acknowledged ]         │
                                           Device comes back online
                                                  │
                                                  ▼
                                      [ Auto-sync / Sync Now ]
                                      [ POST /api/transactions/sync ]
                                                  │
                                                  ▼
                                      [ Remove from IndexedDB ]
```

### Offline Features:
1. **PWA App Shell Caching**: Vite PWA and Workbox precache HTML, CSS, JavaScript, and static icons. The application boots instantly even in Airplane Mode.
2. **Local Transaction Storage**: If an expense is added while offline, it is written to IndexedDB table `pendingTransactions`.
3. **Idempotency Guarantee**: Every queued transaction is tagged with a `clientTransactionId` UUID. If network instability causes retries, the backend's unique MongoDB index prevents duplicate records.
4. **Session Isolation**: Queued transactions are tagged with `userId`. Unsynced records belonging to one user can never be synced into another user's account upon login.

---

## 14. Calculation Reference & Glossary Cheatsheet

| Concept / Formula | Mathematical Definition | Explanation |
| :--- | :--- | :--- |
| **Monthly Reserve Target** | $\sum_{\text{active Needs}} \text{targetPaise}$ | Sum of all active, unarchived Need reserve targets for the month. |
| **Funded This Month** | $\sum_{\text{month}} \text{contributionPaise}$ | Total manual allocations set aside for active Needs in the selected month. |
| **Remaining to Reserve** | $\max(0, \text{Target} - \text{Funded})$ | Unfunded reserve gap. Reaching ₹0 means all monthly obligations are covered. |
| **Virtual Tracker Balance** | $\text{Opening} + \sum \text{Contribs} - \sum \text{NeedExpenses}$ | The current balance in a Need's virtual fund. Deducted when expenses link to this Need. |
| **Flexible Spent** | $\sum_{\text{no Need}} \text{amountPaise}$ | Total spent on items not linked to a Need whose category has flexible enabled. |
| **Total Spent** | $\text{Flexible Spent} + \text{Need Expenses}$ | Cumulative expense total for the calendar month. |
| **Suggested Flexible Budget** | $\max(0, \text{Monthly Allowance} - \text{Reserve Target})$ | Suggested discretionary ceiling calculated automatically when no override is set. |
| **Flexible Budget Remaining**| $\text{Flexible Budget} - \text{Flexible Spent}$ | Remaining discretionary money. Negative numbers indicate budget overrun. |

---

*Pocket Ledger — Designed for clarity, privacy, and dependable financial planning.*
