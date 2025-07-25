import { Router } from 'express';
import {
  createProperty,
  getLandlordProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  removeTenantFromProperty,
} from '../controllers/propertyController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

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
router.get('/:id', requireAuth, requireRole(['landlord', 'caretaker', 'tenant']), getPropertyById);

router.put(
  '/:id',
  requireAuth,
  requireRole(['landlord']),
  (req, res, next) => {
    try {
      // Dummy middleware for debugging multer issue
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

export default router;
