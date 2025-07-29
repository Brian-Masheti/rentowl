const express = require('express');
const multer = require('multer');
const path = require('path');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const requirePermission = require('../middleware/permissionMiddleware');
const permissions = require('../permissions');
const {
  uploadDocument,
  listDocuments,
  downloadDocument,
  deleteDocument,
  signDocument
} = require('../controllers/legalDocumentController');

const router = express.Router();

// Multer setup for /uploads/legal/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/legal'));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Upload a legal document (landlord or super_admin)
router.post('/upload', requireAuth, requirePermission(permissions['document:upload']), upload.single('file'), uploadDocument);
// List documents (all authenticated users)
router.get('/', requireAuth, requirePermission(permissions['document:view']), listDocuments);
// Download document (all authenticated users)
router.get('/download/:id', requireAuth, requirePermission(permissions['document:view']), downloadDocument);
// Delete document (uploader or super_admin)
router.delete('/:id', requireAuth, requirePermission(permissions['document:upload']), deleteDocument);
// Tenant signs a document
router.post('/:id/sign', requireAuth, requirePermission(permissions['document:view']), signDocument);

module.exports = router;
