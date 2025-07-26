const express = require('express');
const { getFinancialReports, getMonthlyIncome, getRentArrears, getOccupancyStats } = require('../controllers/financialController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/reports', requireAuth, requireRole(['landlord']), getFinancialReports);
router.get('/monthly-income', requireAuth, requireRole(['landlord']), getMonthlyIncome);
router.get('/rent-arrears', requireAuth, requireRole(['landlord']), getRentArrears);
router.get('/occupancy', requireAuth, requireRole(['landlord']), getOccupancyStats);

module.exports = router;
