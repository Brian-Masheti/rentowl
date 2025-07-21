import { Router } from 'express';
import { getMySubscriptionStatus } from '../controllers/subscriptionController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Landlord: get subscription status/countdown
router.get('/my-status', requireAuth, requireRole(['landlord']), getMySubscriptionStatus);

export default router;
