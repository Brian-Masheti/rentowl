import { Router } from 'express';
import { getFinancialReports, getMonthlyIncome, getRentArrears, getOccupancyStats } from '../controllers/financialController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/reports', requireAuth, requireRole(['landlord']), getFinancialReports);
router.get('/monthly-income', requireAuth, requireRole(['landlord']), getMonthlyIncome);
router.get('/rent-arrears', requireAuth, requireRole(['landlord']), getRentArrears);
router.get('/occupancy', requireAuth, requireRole(['landlord']), getOccupancyStats);

export default router;
