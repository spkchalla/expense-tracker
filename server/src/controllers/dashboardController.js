import { DashboardService } from '../services/dashboardService.js';
import { getCurrentMonthString } from '../utils/dateUtils.js';

export class DashboardController {
  static async getDashboard(req, res, next) {
    try {
      const month = req.query.month || getCurrentMonthString();
      const data = await DashboardService.getDashboardData(req.user._id, month);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getReports(req, res, next) {
    try {
      const month = req.query.month || getCurrentMonthString();
      const data = await DashboardService.getReportsSummary(req.user._id, month);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
