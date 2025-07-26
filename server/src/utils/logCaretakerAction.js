const CaretakerAction = require('../models/CaretakerAction');

/**
 * Helper to log a caretaker action
 * @param {Object} params
 * @param {string} params.caretaker - Caretaker ObjectId
 * @param {string} [params.property] - Property ObjectId
 * @param {string} params.actionType - Action type
 * @param {string} params.description - Description
 * @param {string} [params.status] - Status (default: 'completed')
 */
async function logCaretakerAction({ caretaker, property, actionType, description, status = 'completed' }) {
  try {
    await CaretakerAction.create({
      caretaker,
      property,
      actionType,
      description,
      status,
    });
  } catch (err) {
    // Optionally log error to a file or monitoring system
    console.error('Failed to log caretaker action:', err);
  }
}

module.exports = logCaretakerAction;
