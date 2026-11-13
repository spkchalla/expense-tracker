import mongoose from 'mongoose';
import { Need } from '../models/Need.js';
import { NeedContribution } from '../models/NeedContribution.js';
import { Transaction } from '../models/Transaction.js';
import { getMonthDateRange } from '../utils/dateUtils.js';

export class NeedService {
  /**
   * List all needs for a user with calculated progress and virtual fund balances
   */
  static async getNeeds(userId, { monthStr, includeArchived = false } = {}) {
    const { start, end } = getMonthDateRange(monthStr);

    const filter = { userId };
    if (!includeArchived) {
      filter.isArchived = false;
    }

    const needs = await Need.find(filter)
      .populate('categoryId', 'name')
      .sort({ isActive: -1, createdAt: -1 });

    const needIds = needs.map((n) => n._id);

    // Aggregate contributions for this month
    const monthlyContribs = await NeedContribution.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          needId: { $in: needIds },
          contributedAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$needId',
          totalMonthContributedPaise: { $sum: '$amountPaise' },
        },
      },
    ]);

    // Aggregate all-time contributions for fund balance
    const allTimeContribs = await NeedContribution.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          needId: { $in: needIds },
        },
      },
      {
        $group: {
          _id: '$needId',
          totalAllTimeContributedPaise: { $sum: '$amountPaise' },
        },
      },
    ]);

    // Aggregate all-time linked expenses for fund balance
    const allTimeExpenses = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          needId: { $in: needIds },
          type: 'expense',
        },
      },
      {
        $group: {
          _id: '$needId',
          totalAllTimeSpentPaise: { $sum: '$amountPaise' },
        },
      },
    ]);

    const monthContribMap = new Map(
      monthlyContribs.map((c) => [c._id.toString(), c.totalMonthContributedPaise])
    );
    const allContribMap = new Map(
      allTimeContribs.map((c) => [c._id.toString(), c.totalAllTimeContributedPaise])
    );
    const allExpenseMap = new Map(
      allTimeExpenses.map((e) => [e._id.toString(), e.totalAllTimeSpentPaise])
    );

    return needs.map((need) => {
      const idStr = need._id.toString();
      const contributedThisMonthPaise = monthContribMap.get(idStr) || 0;
      const targetPaise = need.isActive ? need.monthlyReserveAmountPaise : 0;
      const remainingThisMonthPaise = Math.max(0, targetPaise - contributedThisMonthPaise);
      const progressPercent =
        targetPaise > 0
          ? Math.min(100, Math.round((contributedThisMonthPaise / targetPaise) * 100))
          : 100;

      const totalAllTimeContributedPaise = allContribMap.get(idStr) || 0;
      const totalAllTimeSpentPaise = allExpenseMap.get(idStr) || 0;
      // Virtual fund balance: openingBalance + contributions - expenses
      const virtualFundBalancePaise =
        need.openingBalancePaise + totalAllTimeContributedPaise - totalAllTimeSpentPaise;

      return {
        ...need.toObject(),
        contributedThisMonthPaise,
        remainingThisMonthPaise,
        progressPercent,
        totalAllTimeContributedPaise,
        totalAllTimeSpentPaise,
        virtualFundBalancePaise,
      };
    });
  }

  static async getNeedById(userId, needId, monthStr) {
    const need = await Need.findOne({ _id: needId, userId }).populate('categoryId', 'name');
    if (!need) {
      const err = new Error('Need not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    const { start, end } = getMonthDateRange(monthStr);

    const [monthlyContrib, allContrib, allExpense] = await Promise.all([
      NeedContribution.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            needId: need._id,
            contributedAt: { $gte: start, $lte: end },
          },
        },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } },
      ]),
      NeedContribution.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            needId: need._id,
          },
        },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            needId: need._id,
            type: 'expense',
          },
        },
        { $group: { _id: null, total: { $sum: '$amountPaise' } } },
      ]),
    ]);

    const contributedThisMonthPaise = monthlyContrib[0]?.total || 0;
    const targetPaise = need.isActive ? need.monthlyReserveAmountPaise : 0;
    const remainingThisMonthPaise = Math.max(0, targetPaise - contributedThisMonthPaise);
    const progressPercent =
      targetPaise > 0
        ? Math.min(100, Math.round((contributedThisMonthPaise / targetPaise) * 100))
        : 100;

    const totalAllTimeContributedPaise = allContrib[0]?.total || 0;
    const totalAllTimeSpentPaise = allExpense[0]?.total || 0;
    const virtualFundBalancePaise =
      need.openingBalancePaise + totalAllTimeContributedPaise - totalAllTimeSpentPaise;

    return {
      ...need.toObject(),
      contributedThisMonthPaise,
      remainingThisMonthPaise,
      progressPercent,
      totalAllTimeContributedPaise,
      totalAllTimeSpentPaise,
      virtualFundBalancePaise,
    };
  }

  static async createNeed(userId, data) {
    return Need.create({
      userId,
      ...data,
    });
  }

  static async updateNeed(userId, needId, data) {
    const need = await Need.findOne({ _id: needId, userId });
    if (!need) {
      const err = new Error('Need not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    Object.assign(need, data);
    await need.save();
    return need;
  }

  static async archiveNeed(userId, needId) {
    const need = await Need.findOne({ _id: needId, userId });
    if (!need) {
      const err = new Error('Need not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    need.isArchived = true;
    need.isActive = false;
    await need.save();
    return need;
  }

  static async addContribution(userId, needId, { amountPaise, contributedAt, note }) {
    const need = await Need.findOne({ _id: needId, userId, isArchived: false });
    if (!need) {
      const err = new Error('Active Need not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    const contribution = await NeedContribution.create({
      userId,
      needId,
      amountPaise,
      contributedAt: contributedAt ? new Date(contributedAt) : new Date(),
      note: note || '',
    });

    return contribution;
  }

  static async getContributions(userId, needId) {
    // Verify ownership of the need
    const need = await Need.findOne({ _id: needId, userId });
    if (!need) {
      const err = new Error('Need not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    return NeedContribution.find({ userId, needId }).sort({ contributedAt: -1 });
  }

  static async deleteContribution(userId, needId, contributionId) {
    const contribution = await NeedContribution.findOneAndDelete({
      _id: contributionId,
      userId,
      needId,
    });
    if (!contribution) {
      const err = new Error('Contribution not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }
    return { success: true, id: contributionId };
  }
}
