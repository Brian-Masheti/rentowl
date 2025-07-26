const express = require('express');
const { updateTenant, getAllLandlordTenants, createTenant, assignTenantsBulk } = require('../controllers/tenantController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/tenants - get all tenants for current landlord
router.get('/', requireAuth, requireRole(['landlord']), getAllLandlordTenants);
// POST /api/tenants - create tenant for current landlord
router.post('/', requireAuth, requireRole(['landlord']), createTenant);
// POST /api/tenants/assign-bulk - bulk assign tenants to property/unit
router.post('/assign-bulk', requireAuth, requireRole(['landlord', 'super_admin']), assignTenantsBulk);
// PATCH /api/tenants/:id - update tenant details
router.patch('/:id', requireAuth, requireRole(['landlord', 'super_admin']), updateTenant);

module.exports = router;
