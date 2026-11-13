import { MonthlyBudget } from '../models/MonthlyBudget.js';
import { Category } from '../models/Category.js';

export class BudgetService {
  static async getBudget(userId, month) {
    const budget = await MonthlyBudget.findOne({ userId, month }).populate(
      'categoryLimits.categoryId',
      'name'
    );
    if (!budget) {
      return {
        userId,
        month,
        monthlyAvailableFundsPaise: null,
        flexibleBudgetPaise: null,
        categoryLimits: [],
      };
    }
    return budget;
  }

  static async setBudget(userId, month, data) {
    // If categoryLimits provided, verify that each category belongs to user
    if (data.categoryLimits && data.categoryLimits.length > 0) {
      const catIds = data.categoryLimits.map((cl) => cl.categoryId);
      const userCategories = await Category.find({ _id: { $in: catIds }, userId });
      if (userCategories.length !== catIds.length) {
        const err = new Error('One or more categories in budget limit do not belong to you');
        err.statusCode = 400;
        err.isOperational = true;
        throw err;
      }
    }

    const budget = await MonthlyBudget.findOneAndUpdate(
      { userId, month },
      {
        userId,
        month,
        monthlyAvailableFundsPaise: data.monthlyAvailableFundsPaise ?? null,
        flexibleBudgetPaise: data.flexibleBudgetPaise ?? null,
        categoryLimits: data.categoryLimits || [],
      },
      { new: true, upsert: true, runValidators: true }
    ).populate('categoryLimits.categoryId', 'name');

    return budget;
  }
}
