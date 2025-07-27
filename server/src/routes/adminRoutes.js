const express = require('express');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');
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

// List all admins/support/super_admin
router.get('/all', async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'support', 'super_admin'] } });
    res.json({ admins });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admins.' });
  }
});

router.post('/create', createAdmin);
router.post('/promote', promoteToAdmin);
router.post('/demote', demoteAdmin);
router.post('/update-permissions', updateAdminPermissions);

module.exports = router;
