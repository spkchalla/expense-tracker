import { AdminService } from '../services/adminService.js';

export class AdminController {
  static async getOverview(req, res, next) {
    try {
      const data = await AdminService.getOverview();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const data = await AdminService.getUsers(req.query);
      res.json({ success: true, data: data.users, pagination: data.pagination });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const data = await AdminService.getUserById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req, res, next) {
    try {
      const { status } = req.body;
      const data = await AdminService.updateUserStatus(req.user._id, req.params.id, status);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserPrivileges(req, res, next) {
    try {
      const { privileges } = req.body;
      const data = await AdminService.updateUserPrivileges(
        req.user._id,
        req.params.id,
        privileges
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req, res, next) {
    try {
      const data = await AdminService.getAuditLogs(req.query);
      res.json({ success: true, data: data.logs, pagination: data.pagination });
    } catch (error) {
      next(error);
    }
  }
}
