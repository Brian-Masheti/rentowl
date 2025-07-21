import { Router } from 'express';
import {
  createProperty,
  getLandlordProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
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
    { name: 'gallery', maxCount: 10 },
  ]),
  createProperty
);
router.get('/', requireAuth, requireRole(['landlord']), getLandlordProperties);
router.get('/:id', requireAuth, requireRole(['landlord', 'caretaker', 'tenant']), getPropertyById);
router.put('/:id', requireAuth, requireRole(['landlord']), updateProperty);
router.delete('/:id', requireAuth, requireRole(['landlord']), deleteProperty);

export default router;
