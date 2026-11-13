import mongoose from 'mongoose';
import { Need } from '../models/Need.js';
import { NeedContribution } from '../models/NeedContribution.js';
import { Transaction } from '../models/Transaction.js';
import { Category } from '../models/Category.js';
import { MonthlyBudget } from '../models/MonthlyBudget.js';
import { getMonthDateRange, parseMonthString, getPreviousMonthString } from '../utils/dateUtils.js';

export class DashboardService {
  static async getDashboardData(userId, monthStr) {
    const month = parseMonthString(monthStr);
    const { start, end } = getMonthDateRange(month);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 1. Fetch active Needs for reserve target
    const activeNeeds = await Need.find({
      userId,
      isActive: true,
      isArchived: false,
    });

    const monthlyReserveTargetPaise = activeNeeds.reduce(
      (sum, n) => sum + (n.monthlyReserveAmountPaise || 0),
      0
    );

    // 2. Fetch contributions in the month
    const monthContributions = await NeedContribution.aggregate([
      {
        $match: {
          userId: userObjectId,
          contributedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$needId',
          totalContributedPaise: { $sum: '$amountPaise' },
        },
      },
    ]);

    const contribMap = new Map(
      monthContributions.map((c) => [c._id.toString(), c.totalContributedPaise])
    );
    const contributedThisMonthPaise = monthContributions.reduce(
      (sum, c) => sum + c.totalContributedPaise,
      0
    );

    const remainingToReservePaise = Math.max(
      0,
      monthlyReserveTargetPaise - contributedThisMonthPaise
    );
    const reserveProgressPercent =
      monthlyReserveTargetPaise > 0
        ? Math.min(100, Math.round((contributedThisMonthPaise / monthlyReserveTargetPaise) * 100))
        : 100;

    // Build per-need status
    const needsSummary = activeNeeds.map((need) => {
      const needIdStr = need._id.toString();
      const contributedPaise = contribMap.get(needIdStr) || 0;
      const targetPaise = need.monthlyReserveAmountPaise || 0;
      const remainingPaise = Math.max(0, targetPaise - contributedPaise);
      const progress = targetPaise > 0 ? Math.min(100, Math.round((contributedPaise / targetPaise) * 100)) : 100;
      return {
        id: need._id,
        name: need.name,
        targetPaise,
        contributedPaise,
        remainingPaise,
        progressPercent: progress,
      };
    });

    // 3. Fetch user categories to know countsTowardFlexibleBudget
    const userCategories = await Category.find({ userId });
    const categoryFlexibleMap = new Map(
      userCategories.map((c) => [c._id.toString(), c.countsTowardFlexibleBudget])
    );
    const categoryNameMap = new Map(userCategories.map((c) => [c._id.toString(), c.name]));

    // 4. Fetch all transactions in month
    const monthTransactions = await Transaction.find({
      userId,
      occurredAt: { $gte: start, $lte: end },
    })
      .populate('categoryId', 'name countsTowardFlexibleBudget')
      .populate('needId', 'name')
      .sort({ occurredAt: -1 });

    let totalExpensesPaise = 0;
    let needExpensesPaise = 0;
    let flexibleExpensesPaise = 0;
    let otherExpensesPaise = 0;
    let totalIncomePaise = 0;

    // Category breakdown accumulator
    const categorySpendMap = new Map();
    // Daily trend accumulator
    const dailySpendMap = new Map();

    for (const tx of monthTransactions) {
      if (tx.type === 'income') {
        totalIncomePaise += tx.amountPaise;
        continue;
      }

      totalExpensesPaise += tx.amountPaise;
      const catIdStr = tx.categoryId?._id ? tx.categoryId._id.toString() : tx.categoryId?.toString();
      const catName = tx.categoryId?.name || 'Uncategorized';
      const isFlexibleCat = tx.categoryId?.countsTowardFlexibleBudget ?? categoryFlexibleMap.get(catIdStr) ?? true;

      // Rule: If an expense is linked to a Need, treat as Need-related and EXCLUDE from flexible spending
      if (tx.needId) {
        needExpensesPaise += tx.amountPaise;
      } else if (isFlexibleCat) {
        flexibleExpensesPaise += tx.amountPaise;
      } else {
        otherExpensesPaise += tx.amountPaise;
      }

      // Add to category spend map
      if (catIdStr) {
        const cur = categorySpendMap.get(catIdStr) || {
          categoryId: catIdStr,
          categoryName: catName,
          amountPaise: 0,
          count: 0,
          countsTowardFlexibleBudget: isFlexibleCat,
        };
        cur.amountPaise += tx.amountPaise;
        cur.count += 1;
        categorySpendMap.set(catIdStr, cur);
      }

      // Add to daily trend map
      const dayKey = tx.occurredAt.toISOString().slice(0, 10); // YYYY-MM-DD
      const dayCur = dailySpendMap.get(dayKey) || {
        date: dayKey,
        totalPaise: 0,
        flexiblePaise: 0,
        needPaise: 0,
      };
      dayCur.totalPaise += tx.amountPaise;
      if (tx.needId) {
        dayCur.needPaise += tx.amountPaise;
      } else if (isFlexibleCat) {
        dayCur.flexiblePaise += tx.amountPaise;
      }
      dailySpendMap.set(dayKey, dayCur);
    }

    // 5. Fetch MonthlyBudget
    const budgetDoc = await MonthlyBudget.findOne({ userId, month });
    const categoryLimitMap = new Map(
      (budgetDoc?.categoryLimits || []).map((cl) => [cl.categoryId.toString(), cl.limitPaise])
    );

    // Format category breakdown with limits
    const categoryBreakdown = Array.from(categorySpendMap.values())
      .map((item) => {
        const limitPaise = categoryLimitMap.get(item.categoryId) || null;
        const remainingPaise = limitPaise !== null ? limitPaise - item.amountPaise : null;
        return {
          ...item,
          limitPaise,
          remainingPaise,
          percentageOfTotal:
            totalExpensesPaise > 0
              ? Math.round((item.amountPaise / totalExpensesPaise) * 100)
              : 0,
        };
      })
      .sort((a, b) => b.amountPaise - a.amountPaise);

    // Budget calculations
    const monthlyAvailableFundsPaise = budgetDoc?.monthlyAvailableFundsPaise ?? null;
    let configuredFlexibleBudgetPaise = budgetDoc?.flexibleBudgetPaise ?? null;
    let isBudgetSuggested = false;

    if (configuredFlexibleBudgetPaise === null && monthlyAvailableFundsPaise !== null) {
      // Planning suggestion: max(0, monthlyAvailableFunds - monthlyReserveTarget)
      configuredFlexibleBudgetPaise = Math.max(0, monthlyAvailableFundsPaise - monthlyReserveTargetPaise);
      isBudgetSuggested = true;
    }

    const flexibleBudgetRemainingPaise =
      configuredFlexibleBudgetPaise !== null
        ? configuredFlexibleBudgetPaise - flexibleExpensesPaise
        : null;

    const flexibleBudgetProgressPercent =
      configuredFlexibleBudgetPaise && configuredFlexibleBudgetPaise > 0
        ? Math.min(100, Math.round((flexibleExpensesPaise / configuredFlexibleBudgetPaise) * 100))
        : 0;

    // Daily trend array sorted by date
    const dailyTrends = Array.from(dailySpendMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    // Recent transactions (up to 8)
    const recentTransactions = monthTransactions.slice(0, 8);

    return {
      month,
      reserves: {
        monthlyReserveTargetPaise,
        contributedThisMonthPaise,
        remainingToReservePaise,
        progressPercent: reserveProgressPercent,
        needs: needsSummary,
      },
      spending: {
        totalExpensesPaise,
        needExpensesPaise,
        flexibleExpensesPaise,
        otherExpensesPaise,
        totalIncomePaise,
        transactionCount: monthTransactions.length,
      },
      budget: {
        monthlyAvailableFundsPaise,
        flexibleBudgetPaise: configuredFlexibleBudgetPaise,
        isBudgetSuggested,
        flexibleBudgetRemainingPaise,
        flexibleBudgetProgressPercent,
      },
      categoryBreakdown,
      dailyTrends,
      recentTransactions,
    };
  }

  static async getReportsSummary(userId, monthStr) {
    const month = parseMonthString(monthStr);
    const prevMonth = getPreviousMonthString(month);

    const [current, previous] = await Promise.all([
      this.getDashboardData(userId, month),
      this.getDashboardData(userId, prevMonth),
    ]);

    // Top platforms / sources
    const { start, end } = getMonthDateRange(month);
    const sourceBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          occurredAt: { $gte: start, $lte: end },
          type: 'expense',
          source: { $ne: null, $nin: ['', null] },
        },
      },
      {
        $group: {
          _id: '$source',
          totalPaise: { $sum: '$amountPaise' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalPaise: -1 } },
    ]);

    // Meal periods breakdown
    const mealPeriodBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          occurredAt: { $gte: start, $lte: end },
          type: 'expense',
          mealPeriod: { $ne: null, $nin: ['', null] },
        },
      },
      {
        $group: {
          _id: '$mealPeriod',
          totalPaise: { $sum: '$amountPaise' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalPaise: -1 } },
    ]);

    return {
      currentMonth: current,
      previousMonth: {
        month: prevMonth,
        totalExpensesPaise: previous.spending.totalExpensesPaise,
        flexibleExpensesPaise: previous.spending.flexibleExpensesPaise,
        needExpensesPaise: previous.spending.needExpensesPaise,
        monthlyReserveTargetPaise: previous.reserves.monthlyReserveTargetPaise,
        contributedPaise: previous.reserves.contributedThisMonthPaise,
      },
      sourceBreakdown: sourceBreakdown.map((s) => ({
        source: s._id,
        totalPaise: s.totalPaise,
        count: s.count,
      })),
      mealPeriodBreakdown: mealPeriodBreakdown.map((m) => ({
        mealPeriod: m._id,
        totalPaise: m.totalPaise,
        count: m.count,
      })),
    };
  }
}
