const express = require('express');
const {
  createRequest,
  getTenantRequests,
  getCaretakerRequests,
  updateRequestStatus,
  escalateUnresolved,
} = require('../controllers/maintenanceController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

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

module.exports = router;
