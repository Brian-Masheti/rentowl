const express = require('express');
const router = express.Router();
const checkListController = require('../controllers/checkListController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Create a checklist (landlord only)
router.post('/', requireAuth, requireRole(['landlord']), checkListController.createCheckList);

// List checklists (landlord/tenant)
router.get('/', requireAuth, checkListController.listCheckLists);

// Update checklist items/comments (landlord only)
router.put('/:id', requireAuth, requireRole(['landlord']), checkListController.updateCheckList);

// Tenant signs checklist
router.post('/:id/tenant-sign', requireAuth, requireRole(['tenant']), checkListController.tenantSignCheckList);

// Landlord signs checklist
router.post('/:id/landlord-sign', requireAuth, requireRole(['landlord']), checkListController.landlordSignCheckList);

module.exports = router;
