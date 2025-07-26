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
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Landlord routes
router.post(
  '/',
  requireAuth,
  requireRole(['landlord']),
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
  ]),
  createProperty
);
router.get('/', requireAuth, requireRole(['landlord']), getLandlordProperties);

// Assign caretaker to property (must be before any /:id route)
router.put('/:id/assign-caretaker', requireAuth, requireRole(['landlord']), assignCaretakerToProperty);

router.get('/:id', requireAuth, requireRole(['landlord', 'caretaker', 'tenant']), getPropertyById);

router.put(
  '/:id',
  requireAuth,
  requireRole(['landlord']),
  (req, res, next) => {
    try {
      next();
    } catch (err) {
      console.error('Error in upload middleware:', err);
      res.status(500).json({ error: 'Upload middleware error', details: err });
    }
  },
  updateProperty
);
router.delete('/:id', requireAuth, requireRole(['landlord']), deleteProperty);

// PATCH /api/properties/:propertyId/remove-tenant/:tenantId
router.patch('/:propertyId/remove-tenant/:tenantId', requireAuth, requireRole(['landlord', 'super_admin']), removeTenantFromProperty);

module.exports = router;
