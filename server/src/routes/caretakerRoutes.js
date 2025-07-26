const express = require('express');
const { getActiveCaretakers } = require('../controllers/caretakerController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/caretakers - get all active caretakers
router.get('/', requireAuth, getActiveCaretakers);

module.exports = router;
