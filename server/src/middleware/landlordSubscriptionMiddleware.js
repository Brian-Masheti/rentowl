const User = require('../models/User');

// Middleware to block expired landlords
async function checkLandlordSubscription(req, res, next) {
  try {
    if (req.user && req.user.role !== 'landlord') return next();
    const landlord = await User.findById(req.user.id);
    if (!landlord) return res.status(401).json({ error: 'Unauthorized' });
    if (landlord.subscriptionStatus === 'expired') {
      return res.status(403).json({
        error: 'Your subscription has expired. Please contact developer Brian at brianmasheti@outlook.com or WhatsApp +254741754002 to renew your access.'
      });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Subscription check failed.' });
  }
}

module.exports = { checkLandlordSubscription };
