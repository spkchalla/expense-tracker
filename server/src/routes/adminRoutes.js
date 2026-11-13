import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

// Strict authorization guard for all admin routes
router.use(requireAuth, requireAdmin);

router.get('/overview', AdminController.getOverview);
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUserById);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.patch('/users/:id/privileges', AdminController.updateUserPrivileges);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
