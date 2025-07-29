/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         role:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *         isActive:
 *           type: boolean
 */
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

/**
 * @swagger
 * /api/admin/all:
 *   get:
 *     summary: List all admin, support, devops, and super_admin users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admin/support/devops/super_admin users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 admins:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Failed to fetch admins
 */
router.get('/all', async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'support', 'devops', 'super_admin'] } });
    res.json({ admins });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admins.' });
  }
});

/**
 * @swagger
 * /api/admin/create:
 *   post:
 *     summary: Create a new admin/support/devops user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               username: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [admin, support, devops] }
 *               permissions:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201:
 *         description: Admin/support/devops user created
 *       400:
 *         description: Invalid admin role
 *       409:
 *         description: User already exists
 *       500:
 *         description: Failed to create admin
 */
router.post('/create', requirePermission(permissions['admin:create']), createAdmin);

/**
 * @swagger
 * /api/admin/promote:
 *   post:
 *     summary: Promote an existing user to admin/support/devops
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier: { type: string, description: 'Email or username' }
 *               role: { type: string, enum: [admin, support, devops] }
 *               permissions:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200:
 *         description: User promoted
 *       400:
 *         description: Invalid admin role
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to promote user
 */
router.post('/promote', requirePermission(permissions['admin:promote']), promoteToAdmin);

/**
 * @swagger
 * /api/admin/demote:
 *   post:
 *     summary: Demote an admin/support/devops to regular user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier: { type: string, description: 'Email or username' }
 *               newRole: { type: string, description: 'New role (e.g., tenant)' }
 *     responses:
 *       200:
 *         description: User demoted
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to demote admin
 */
router.post('/demote', requirePermission(permissions['admin:demote']), demoteAdmin);

/**
 * @swagger
 * /api/admin/update-permissions:
 *   post:
 *     summary: Update permissions for an admin/support/devops user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier: { type: string, description: 'Email or username' }
 *               permissions:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       200:
 *         description: Permissions updated
 *       404:
 *         description: User not found
 *       403:
 *         description: Super admin cannot remove their own permissions
 *       500:
 *         description: Failed to update permissions
 */
router.post('/update-permissions', requirePermission(permissions['admin:update-permissions']), updateAdminPermissions);

module.exports = router;
