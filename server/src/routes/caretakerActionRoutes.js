const express = require('express');
const router = express.Router();
const {
  createCaretakerAction,
  getCaretakerActions,
  exportCaretakerActionsCSV
} = require('../controllers/caretakerActionController');
const { requireAuth } = require('../middleware/authMiddleware');
const caretakerActionLimiter = require('../middleware/rateLimiter');

/**
 * @swagger
 * tags:
 *   name: CaretakerActions
 *   description: API for caretaker activity logs
 */

/**
 * @swagger
 * /api/caretaker-actions:
 *   post:
 *     summary: Log a new caretaker action
 *     tags: [CaretakerActions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - caretaker
 *               - actionType
 *               - description
 *             properties:
 *               caretaker:
 *                 type: string
 *                 description: Caretaker ObjectId
 *               property:
 *                 type: string
 *                 description: Property ObjectId
 *               actionType:
 *                 type: string
 *                 enum: [maintenance_update, maintenance_resolved, announcement_sent, task_assigned, task_updated, other]
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [completed, pending, in_progress]
 *     responses:
 *       201:
 *         description: Action logged
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 *   get:
 *     summary: Fetch caretaker actions with filters
 *     tags: [CaretakerActions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: caretaker
 *         schema:
 *           type: string
 *         description: Caretaker ObjectId
 *       - in: query
 *         name: property
 *         schema:
 *           type: string
 *         description: Property ObjectId
 *       - in: query
 *         name: actionType
 *         schema:
 *           type: string
 *         description: Action type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date (ISO)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date (ISO)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit results
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Skip results
 *     responses:
 *       200:
 *         description: List of caretaker actions
 *       500:
 *         description: Server error
 * /api/caretaker-actions/export/csv:
 *   get:
 *     summary: Export caretaker actions as CSV
 *     tags: [CaretakerActions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: caretaker
 *         schema:
 *           type: string
 *         description: Caretaker ObjectId
 *       - in: query
 *         name: property
 *         schema:
 *           type: string
 *         description: Property ObjectId
 *       - in: query
 *         name: actionType
 *         schema:
 *           type: string
 *         description: Action type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date (ISO)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date (ISO)
 *     responses:
 *       200:
 *         description: CSV file
 *       500:
 *         description: Server error
 */

// Log a new caretaker action
router.post('/', requireAuth, caretakerActionLimiter, createCaretakerAction);

// Get caretaker actions (with filters)
router.get('/', requireAuth, caretakerActionLimiter, getCaretakerActions);

// Export caretaker actions as CSV
router.get('/export/csv', requireAuth, caretakerActionLimiter, exportCaretakerActionsCSV);

module.exports = router;
