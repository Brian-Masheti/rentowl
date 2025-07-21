import { Router } from 'express';
import { getMyPaymentStatus } from '../controllers/paymentController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Tenant: get payment status/countdown
router.get('/my-status', requireAuth, requireRole(['tenant']), getMyPaymentStatus);

export default router;
