import { Router } from 'express';
import {
  createRequest,
  getTenantRequests,
  getCaretakerRequests,
  updateRequestStatus,
  escalateUnresolved,
} from '../controllers/maintenanceController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// Tenant: create request (with images)
router.post(
  '/',
  requireAuth,
  requireRole(['tenant']),
  upload.fields([{ name: 'images', maxCount: 5 }]),
  createRequest
);

// Tenant: list own requests
router.get('/my', requireAuth, requireRole(['tenant']), getTenantRequests);

// Caretaker: list assigned requests
router.get('/assigned', requireAuth, requireRole(['caretaker']), getCaretakerRequests);

// Caretaker: update status, add resolution, add images
router.put(
  '/:id',
  requireAuth,
  requireRole(['caretaker']),
  upload.fields([{ name: 'images', maxCount: 5 }]),
  updateRequestStatus
);

// Admin/system: escalate unresolved requests (could be on a cron job)
router.post('/escalate', escalateUnresolved);

export default router;
