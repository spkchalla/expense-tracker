import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { AdminAuditLog } from '../models/AdminAuditLog.js';
import { config } from '../config/env.js';

export class AdminService {
  static async getOverview() {
    const [totalUsers, activeUsers, suspendedUsers, totalTxCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'suspended' }),
      Transaction.countDocuments(), // Metadata count only!
    ]);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalTransactionCount: totalTxCount,
    };
  }

  static async getUsers({ page = 1, limit = 20, search } = {}) {
    const filter = {};
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ displayName: regex }, { email: regex }];
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(100, Math.max(1, parseInt(limit, 10)));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('_id displayName email role status privileges lastActiveAt createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter),
    ]);

    // Aggregate transaction counts for these users (Count only, NO amounts or descriptions!)
    const userIds = users.map((u) => u._id);
    const txCounts = await Transaction.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);
    const txCountMap = new Map(txCounts.map((t) => [t._id.toString(), t.count]));

    const usersWithMeta = users.map((u) => ({
      id: u._id.toString(),
      displayName: u.displayName,
      email: u.email,
      role: u.role,
      status: u.status,
      privileges: u.privileges || [],
      lastActiveAt: u.lastActiveAt,
      createdAt: u.createdAt,
      transactionCount: txCountMap.get(u._id.toString()) || 0,
      isBootstrapAdmin:
        Boolean(config.bootstrapAdminEmail) && u.email.toLowerCase() === config.bootstrapAdminEmail,
    }));

    return {
      users: usersWithMeta,
      pagination: {
        page: parseInt(page, 10),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  static async getUserById(userId) {
    const user = await User.findById(userId).select(
      '_id displayName email role status privileges lastActiveAt createdAt'
    );
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    const txCount = await Transaction.countDocuments({ userId: user._id });

    return {
      id: user._id.toString(),
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      status: user.status,
      privileges: user.privileges || [],
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      transactionCount: txCount,
      isBootstrapAdmin:
        Boolean(config.bootstrapAdminEmail) && user.email.toLowerCase() === config.bootstrapAdminEmail,
    };
  }

  static async updateUserStatus(actorUserId, targetUserId, newStatus) {
    if (!['active', 'suspended'].includes(newStatus)) {
      const err = new Error('Invalid status value');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    // Protect bootstrap admin
    if (
      config.bootstrapAdminEmail &&
      targetUser.email.toLowerCase() === config.bootstrapAdminEmail
    ) {
      const err = new Error('The bootstrap administrator account cannot be suspended');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    // Prevent suspending oneself
    if (actorUserId.toString() === targetUserId.toString()) {
      const err = new Error('You cannot suspend your own account');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    const oldStatus = targetUser.status;
    targetUser.status = newStatus;
    await targetUser.save();

    // Log admin audit
    await AdminAuditLog.create({
      actorUserId,
      targetUserId,
      action: 'status_change',
      changedFields: { previousStatus: oldStatus, newStatus },
      timestamp: new Date(),
    });

    return {
      id: targetUser._id.toString(),
      displayName: targetUser.displayName,
      email: targetUser.email,
      status: targetUser.status,
    };
  }

  static async updateUserPrivileges(actorUserId, targetUserId, privileges) {
    if (!Array.isArray(privileges)) {
      const err = new Error('Privileges must be an array of privilege keys');
      err.statusCode = 400;
      err.isOperational = true;
      throw err;
    }

    const allowedPrivileges = ['advancedAnalytics', 'betaFeatures', 'customDashboard'];
    const validPrivileges = privileges.filter((p) => allowedPrivileges.includes(p));

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      const err = new Error('User not found');
      err.statusCode = 404;
      err.isOperational = true;
      throw err;
    }

    // Protect bootstrap admin
    if (
      config.bootstrapAdminEmail &&
      targetUser.email.toLowerCase() === config.bootstrapAdminEmail
    ) {
      const err = new Error('Privileges of bootstrap administrator cannot be altered');
      err.statusCode = 403;
      err.isOperational = true;
      throw err;
    }

    const oldPrivileges = targetUser.privileges;
    targetUser.privileges = validPrivileges;
    await targetUser.save();

    await AdminAuditLog.create({
      actorUserId,
      targetUserId,
      action: 'privilege_change',
      changedFields: { previousPrivileges: oldPrivileges, newPrivileges: validPrivileges },
      timestamp: new Date(),
    });

    return {
      id: targetUser._id.toString(),
      displayName: targetUser.displayName,
      email: targetUser.email,
      privileges: targetUser.privileges,
    };
  }

  static async getAuditLogs({ page = 1, limit = 50 } = {}) {
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(100, Math.max(1, parseInt(limit, 10)));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [logs, total] = await Promise.all([
      AdminAuditLog.find()
        .populate('actorUserId', 'displayName email')
        .populate('targetUserId', 'displayName email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum),
      AdminAuditLog.countDocuments(),
    ]);

    return {
      logs,
      pagination: {
        page: parseInt(page, 10),
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }
}
