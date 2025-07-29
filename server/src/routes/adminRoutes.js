const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
const requirePermission = require('../middleware/permissionMiddleware');
const permissions = require('../permissions');
const {
  createAdmin,
  promoteToAdmin,
  demoteAdmin,
  updateAdminPermissions
} = require('../controllers/adminController');
const User = require('../models/User');

const router = express.Router();

// All routes require authentication and super_admin role
router.use(requireAuth, requireRole(['super_admin']));

// List all admins/support/devops/super_admin
router.get('/all', async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'support', 'devops', 'super_admin'] } });
    res.json({ admins });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admins.' });
  }
});

router.post('/create', requirePermission(permissions['admin:create']), createAdmin);
router.post('/promote', requirePermission(permissions['admin:promote']), promoteToAdmin);
router.post('/demote', requirePermission(permissions['admin:demote']), demoteAdmin);
router.post('/update-permissions', requirePermission(permissions['admin:update-permissions']), updateAdminPermissions);

module.exports = router;
