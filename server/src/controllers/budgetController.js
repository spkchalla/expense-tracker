import { BudgetService } from '../services/budgetService.js';
import { parseMonthString } from '../utils/dateUtils.js';

export class BudgetController {
  static async getBudget(req, res, next) {
    try {
      const month = parseMonthString(req.params.month);
      const budget = await BudgetService.getBudget(req.user._id, month);
      res.json({ success: true, data: budget });
    } catch (error) {
      next(error);
    }
  }

  static async setBudget(req, res, next) {
    try {
      const month = parseMonthString(req.params.month);
      const budget = await BudgetService.setBudget(req.user._id, month, req.body);
      res.json({ success: true, data: budget });
    } catch (error) {
      next(error);
    }
  }
}
