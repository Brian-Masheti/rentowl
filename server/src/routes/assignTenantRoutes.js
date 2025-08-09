const express = require('express');
const router = express.Router();
const assignTenant = require('../controllers/assignTenantController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// POST /api/assign-tenant
router.post(
  '/',
  requireAuth,
  requireRole(['landlord', 'super_admin', 'caretaker']),
  assignTenant
);

module.exports = router;
