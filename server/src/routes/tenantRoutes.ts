import { Router } from 'express';
import { updateTenant, getAllLandlordTenants, createTenant } from '../controllers/tenantController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

// GET /api/tenants - get all tenants for current landlord
router.get('/', requireAuth, requireRole(['landlord']), getAllLandlordTenants);
// POST /api/tenants - create tenant for current landlord
router.post('/', requireAuth, requireRole(['landlord']), createTenant);
// POST /api/tenants/assign-bulk - bulk assign tenants to property/unit
import { assignTenantsBulk } from '../controllers/tenantController';
router.post('/assign-bulk', requireAuth, requireRole(['landlord', 'super_admin']), assignTenantsBulk);
// PATCH /api/tenants/:id - update tenant details
router.patch('/:id', requireAuth, requireRole(['landlord', 'super_admin']), updateTenant);

export default router;
