const express = require('express');
const router = express.Router();
const checkListController = require('../controllers/checkListController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/permissionMiddleware');
const permissions = require('../permissions');

// Create a checklist (landlord only)
router.post('/', requireAuth, requirePermission(permissions['checklist:manage']), checkListController.createCheckList);

// List checklists (landlord/tenant)
router.get('/', requireAuth, requirePermission(permissions['checklist:manage']), checkListController.listCheckLists);

// Update checklist items/comments (landlord only)
router.put('/:id', requireAuth, requirePermission(permissions['checklist:manage']), checkListController.updateCheckList);

// Tenant signs checklist
router.post('/:id/tenant-sign', requireAuth, requirePermission(permissions['checklist:manage']), checkListController.tenantSignCheckList);

// Landlord signs checklist
router.post('/:id/landlord-sign', requireAuth, requirePermission(permissions['checklist:manage']), checkListController.landlordSignCheckList);

module.exports = router;
