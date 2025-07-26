const express = require('express');
const {
  listCaretakers,
  getCaretakerById,
  createCaretaker,
  updateCaretaker,
  deactivateCaretaker,
  deleteCaretaker,
  getCaretakerAssignments
} = require('../controllers/caretakerController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// List all caretakers (optionally filter by active)
router.get('/', requireAuth, listCaretakers);
// Get caretaker by ID
router.get('/:id', requireAuth, getCaretakerById);
// Create caretaker
router.post('/', requireAuth, createCaretaker);
// Update caretaker
router.put('/:id', requireAuth, updateCaretaker);
// Deactivate caretaker (soft delete)
router.patch('/:id/deactivate', requireAuth, deactivateCaretaker);
// Hard delete caretaker
router.delete('/:id', requireAuth, deleteCaretaker);
// Get properties assigned to caretaker
router.get('/:id/assignments', requireAuth, getCaretakerAssignments);

module.exports = router;
