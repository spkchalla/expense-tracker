import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { Category } from '../src/models/Category.js';
import { Need } from '../src/models/Need.js';
import { NeedContribution } from '../src/models/NeedContribution.js';
import { Transaction } from '../src/models/Transaction.js';
import { MonthlyBudget } from '../src/models/MonthlyBudget.js';
import { NeedService } from '../src/services/needService.js';
import { DashboardService } from '../src/services/dashboardService.js';

describe('Financial Calculations and Business Rules', () => {
  let user;
  let foodCategory;
  let transportCategory;
  const currentMonth = '2026-11';

  beforeEach(async () => {
    user = await User.create({
      displayName: 'Test User',
      email: 'test@example.com',
      passwordHash: 'dummyhash',
      role: 'user',
      status: 'active',
    });

    foodCategory = await Category.create({
      userId: user._id,
      name: 'Canteen / Meals',
      countsTowardFlexibleBudget: true,
      sortOrder: 1,
    });

    transportCategory = await Category.create({
      userId: user._id,
      name: 'Transport',
      countsTowardFlexibleBudget: false,
      sortOrder: 2,
    });
  });

  it('calculates monthly reserve target and remaining-to-reserve correctly', async () => {
    // 2 active Needs, 1 paused Need
    const need1 = await Need.create({
      userId: user._id,
      name: 'Laundry',
      monthlyReserveAmountPaise: 150000, // 1500 INR
      isActive: true,
    });

    const need2 = await Need.create({
      userId: user._id,
      name: 'Haircut',
      monthlyReserveAmountPaise: 30000, // 300 INR
      isActive: true,
    });

    await Need.create({
      userId: user._id,
      name: 'Paused Gym',
      monthlyReserveAmountPaise: 200000, // 2000 INR
      isActive: false, // Paused -> excluded from reserve target!
    });

    // Make contribution to Need 1: 500 INR (50000 paise) in November 2026
    await NeedContribution.create({
      userId: user._id,
      needId: need1._id,
      amountPaise: 50000,
      contributedAt: new Date('2026-11-05T10:00:00Z'),
    });

    const dashboard = await DashboardService.getDashboardData(user._id, currentMonth);

    // Target = 1500 + 300 = 1800 INR (180000 paise)
    expect(dashboard.reserves.monthlyReserveTargetPaise).toBe(180000);
    // Contributed = 500 INR (50000 paise)
    expect(dashboard.reserves.contributedThisMonthPaise).toBe(50000);
    // Remaining = 1800 - 500 = 1300 INR (130000 paise)
    expect(dashboard.reserves.remainingToReservePaise).toBe(130000);
  });

  it('calculates virtual fund balance per Need accurately (opening + contribs - linked expenses)', async () => {
    const laundryNeed = await Need.create({
      userId: user._id,
      name: 'Laundry',
      monthlyReserveAmountPaise: 100000, // 1000 INR
      openingBalancePaise: 20000, // 200 INR opening virtual balance
      isActive: true,
    });

    // Contribution of 1000 INR
    await NeedContribution.create({
      userId: user._id,
      needId: laundryNeed._id,
      amountPaise: 100000,
      contributedAt: new Date('2026-11-02T10:00:00Z'),
    });

    // Linked expense of 450 INR paid from Laundry
    await Transaction.create({
      userId: user._id,
      type: 'expense',
      amountPaise: 45000,
      categoryId: transportCategory._id,
      needId: laundryNeed._id, // linked to Need!
      clientTransactionId: 'tx-laundry-01',
      occurredAt: new Date('2026-11-04T12:00:00Z'),
    });

    const needs = await NeedService.getNeeds(user._id, { monthStr: currentMonth });
    const needSummary = needs.find((n) => n._id.toString() === laundryNeed._id.toString());

    // Virtual fund balance = 20000 + 100000 - 45000 = 75000 paise (750 INR)
    expect(needSummary.virtualFundBalancePaise).toBe(75000);
    expect(needSummary.totalAllTimeContributedPaise).toBe(100000);
    expect(needSummary.totalAllTimeSpentPaise).toBe(45000);
  });

  it('strictly separates Need-related and flexible expenses', async () => {
    const need = await Need.create({
      userId: user._id,
      name: 'Toiletries',
      monthlyReserveAmountPaise: 50000,
      isActive: true,
    });

    // 1. Flexible expense: Canteen meal (countsTowardFlexibleBudget = true, no needId)
    await Transaction.create({
      userId: user._id,
      type: 'expense',
      amountPaise: 12000, // 120 INR
      categoryId: foodCategory._id,
      clientTransactionId: 'tx-01',
      occurredAt: new Date('2026-11-03T09:00:00Z'),
    });

    // 2. Need-linked expense: Soap purchase linked to Toiletries (EVEN IF category had flexible flag)
    await Transaction.create({
      userId: user._id,
      type: 'expense',
      amountPaise: 6500, // 65 INR
      categoryId: foodCategory._id, // category has countsTowardFlexibleBudget=true
      needId: need._id, // linked to Need -> MUST be excluded from flexible expenses!
      clientTransactionId: 'tx-02',
      occurredAt: new Date('2026-11-04T11:00:00Z'),
    });

    // 3. Non-flexible category expense: Transport without needId
    await Transaction.create({
      userId: user._id,
      type: 'expense',
      amountPaise: 5000, // 50 INR
      categoryId: transportCategory._id,
      clientTransactionId: 'tx-03',
      occurredAt: new Date('2026-11-05T14:00:00Z'),
    });

    const dashboard = await DashboardService.getDashboardData(user._id, currentMonth);

    // Total expenses = 120 + 65 + 50 = 235 INR (23500 paise)
    expect(dashboard.spending.totalExpensesPaise).toBe(23500);
    // Need expenses = 65 INR (6500 paise)
    expect(dashboard.spending.needExpensesPaise).toBe(6500);
    // Flexible expenses = 120 INR (12000 paise)
    expect(dashboard.spending.flexibleExpensesPaise).toBe(12000);
    // Other (non-flexible category without need) = 50 INR (5000 paise)
    expect(dashboard.spending.otherExpensesPaise).toBe(5000);
  });

  it('calculates flexible budget and remaining budget properly', async () => {
    // Need with 2000 INR target
    await Need.create({
      userId: user._id,
      name: 'Hostel Fees / Rent Reserve',
      monthlyReserveAmountPaise: 200000,
      isActive: true,
    });

    // Set budget: monthly available funds = 10000 INR
    await MonthlyBudget.create({
      userId: user._id,
      month: currentMonth,
      monthlyAvailableFundsPaise: 1000000, // 10000 INR
      flexibleBudgetPaise: null, // Let system suggest budget: max(0, 10000 - 2000) = 8000 INR
    });

    // Record flexible expense: 2500 INR
    await Transaction.create({
      userId: user._id,
      type: 'expense',
      amountPaise: 250000,
      categoryId: foodCategory._id,
      clientTransactionId: 'tx-flex-01',
      occurredAt: new Date('2026-11-06T15:00:00Z'),
    });

    const dashboard = await DashboardService.getDashboardData(user._id, currentMonth);

    // Suggested flexible budget = 10000 - 2000 = 8000 INR (800000 paise)
    expect(dashboard.budget.flexibleBudgetPaise).toBe(800000);
    expect(dashboard.budget.isBudgetSuggested).toBe(true);
    // Flexible remaining = 8000 - 2500 = 5500 INR (550000 paise)
    expect(dashboard.budget.flexibleBudgetRemainingPaise).toBe(550000);
  });
});
