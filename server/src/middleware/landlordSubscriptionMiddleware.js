const User = require('../models/User');

// Middleware to block expired landlords
async function checkLandlordSubscription(req, res, next) {
  // TEMPORARY: Allow all landlords through for development/testing
  return next();
}

module.exports = { checkLandlordSubscription };
