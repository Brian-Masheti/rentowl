const express = require('express');
const {
  createProperty,
  getLandlordProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  removeTenantFromProperty,
  assignCaretakerToProperty
} = require('../controllers/propertyController');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const requirePermission = require('../middleware/permissionMiddleware');
const permissions = require('../permissions');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Landlord routes
router.post(
  '/',
  requireAuth,
  requirePermission(permissions['property:create']),
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
  ]),
  createProperty
);
router.get('/', requireAuth, requirePermission(permissions['property:view']), getLandlordProperties);

// Assign caretaker to property (must be before any /:id route)
router.put('/:id/assign-caretaker', requireAuth, requirePermission(permissions['property:update']), assignCaretakerToProperty);

router.get('/:id', requireAuth, requirePermission(permissions['property:view']), getPropertyById);

router.put(
  '/:id',
  requireAuth,
  requirePermission(permissions['property:update']),
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
  ]),
  updateProperty
);
router.delete('/:id', requireAuth, requirePermission(permissions['property:delete']), deleteProperty);

// PATCH /api/properties/:propertyId/remove-tenant/:tenantId
router.patch('/:propertyId/remove-tenant/:tenantId', requireAuth, requirePermission(permissions['property:update']), removeTenantFromProperty);
// Assign tenant to unit
router.put('/:propertyId/units/:unitLabel/assign-tenant', requireAuth, requirePermission(permissions['property:update']), require('../controllers/propertyController').assignTenantToUnit);
// Remove tenant from unit
router.put('/:propertyId/units/:unitLabel/remove-tenant', requireAuth, requirePermission(permissions['property:update']), require('../controllers/propertyController').removeTenantFromUnit);

module.exports = router;
