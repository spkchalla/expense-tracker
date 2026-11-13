import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', DashboardController.getDashboard);
router.get('/reports', DashboardController.getReports);

export default router;
