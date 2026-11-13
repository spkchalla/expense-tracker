import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction.js';
import { Category } from '../models/Category.js';
import { Need } from '../models/Need.js';
import { getMonthDateRange } from '../utils/dateUtils.js';
import { formatCurrency, paiseToRupees } from '../utils/currency.js';

export class TransactionService {
  static async createTransaction(userId, data) {
    // 1. Verify Category ownership
    const category = await Category.findOne({ _id: data.categoryId, userId });
    if (!category) {
      const err = new Error('Invalid category or category does not belong to you.');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    // 2. If needId is provided, verify Need ownership
    if (data.needId) {
      const need = await Need.findOne({ _id: data.needId, userId });
      if (!need) {
        const err = new Error('Invalid need or need does not belong to you.');
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }
    }

    // 3. Check idempotency key clientTransactionId
    const existing = await Transaction.findOne({
      userId,
      clientTransactionId: data.clientTransactionId,
    });
    if (existing) {
      // Return existing without error to ensure idempotent retry
      return existing;
    }

    const transaction = await Transaction.create({
      userId,
      ...data,
      occurredAt: data.occurredAt ? new Date(data.occurredAt) : new Date(),
    });

    return transaction.populate([
      { path: 'categoryId', select: 'name countsTowardFlexibleBudget' },
      { path: 'needId', select: 'name' },
    ]);
  }

  static async syncTransactions(userId, transactions) {
    const results = [];
    for (const item of transactions) {
      try {
        const res = await this.createTransaction(userId, item);
        results.push({ clientTransactionId: item.clientTransactionId, status: 'synced', data: res });
      } catch (error) {
        results.push({
          clientTransactionId: item.clientTransactionId,
          status: 'failed',
          error: error.message,
        });
      }
    }
    return results;
  }

  static async getTransactions(
    userId,
    {
      monthStr,
      startDate,
      endDate,
      categoryId,
      needId,
      source,
      mealPeriod,
      paymentMethod,
      type,
      search,
      page = 1,
      limit = 30,
    } = {}
  ) {
    const filter = { userId };

    if (type) {
      filter.type = type;
    }

    if (monthStr) {
      const { start, end } = getMonthDateRange(monthStr);
      filter.occurredAt = { $gte: start, $lte: end };
    } else if (startDate || endDate) {
      filter.occurredAt = {};
      if (startDate) filter.occurredAt.$gte = new Date(startDate);
      if (endDate) filter.occurredAt.$lte = new Date(endDate);
    }

    if (categoryId) filter.categoryId = categoryId;
    if (needId) {
      if (needId === 'none') {
        filter.needId = null;
      } else {
        filter.needId = needId;
      }
    }
    if (source) filter.source = source;
    if (mealPeriod) filter.mealPeriod = mealPeriod;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ description: regex }, { merchant: regex }, { notes: regex }];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(100, Math.max(1, parseInt(limit, 10)));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('categoryId', 'name countsTowardFlexibleBudget')
        .populate('needId', 'name')
        .sort({ occurredAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    return {
      transactions,
      pagination: {
        page: parseInt(page, 10),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  static async getTransactionById(userId, transactionId) {
    const transaction = await Transaction.findOne({ _id: transactionId, userId })
      .populate('categoryId', 'name countsTowardFlexibleBudget')
      .populate('needId', 'name');

    if (!transaction) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }
    return transaction;
  }

  static async updateTransaction(userId, transactionId, data) {
    const transaction = await Transaction.findOne({ _id: transactionId, userId });
    if (!transaction) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    if (data.categoryId) {
      const category = await Category.findOne({ _id: data.categoryId, userId });
      if (!category) {
        const err = new Error('Invalid category');
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }
    }

    if (data.needId !== undefined) {
      if (data.needId) {
        const need = await Need.findOne({ _id: data.needId, userId });
        if (!need) {
          const err = new Error('Invalid need');
          err.statusCode = 400;
          err.isOperational = true;
          throw err;
        }
      }
    }

    Object.assign(transaction, data);
    if (data.occurredAt) {
      transaction.occurredAt = new Date(data.occurredAt);
    }
    await transaction.save();

    return transaction.populate([
      { path: 'categoryId', select: 'name countsTowardFlexibleBudget' },
      { path: 'needId', select: 'name' },
    ]);
  }

  static async deleteTransaction(userId, transactionId) {
    const transaction = await Transaction.findOneAndDelete({ _id: transactionId, userId });
    if (!transaction) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }
    return { success: true, id: transactionId };
  }

  static async exportToCsv(userId) {
    const transactions = await Transaction.find({ userId })
      .populate('categoryId', 'name')
      .populate('needId', 'name')
      .sort({ occurredAt: -1 });

    const headers = [
      'ID',
      'Date & Time',
      'Type',
      'Amount (INR)',
      'Category',
      'Need Linked',
      'Merchant / Shop',
      'Source / Platform',
      'Meal Period',
      'Payment Method',
      'Description',
      'Notes',
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = transactions.map((t) => [
      escapeCsv(t._id),
      escapeCsv(t.occurredAt ? t.occurredAt.toISOString() : ''),
      escapeCsv(t.type),
      escapeCsv(paiseToRupees(t.amountPaise).toFixed(2)),
      escapeCsv(t.categoryId?.name || ''),
      escapeCsv(t.needId?.name || 'None'),
      escapeCsv(t.merchant || ''),
      escapeCsv(t.source || ''),
      escapeCsv(t.mealPeriod || ''),
      escapeCsv(t.paymentMethod || ''),
      escapeCsv(t.description || ''),
      escapeCsv(t.notes || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    return csvContent;
  }
}
