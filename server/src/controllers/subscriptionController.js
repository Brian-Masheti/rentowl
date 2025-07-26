const User = require('../models/User');

// Get current landlord's subscription status/countdown
const getMySubscriptionStatus = async (req, res) => {
  try {
    const landlord = await User.findById(req.user && req.user.id);
    if (!landlord) return res.status(404).json({ error: 'Landlord not found.' });
    if (landlord.role !== 'landlord') return res.status(403).json({ error: 'Not a landlord.' });
    let daysLeft = null;
    if (landlord.subscriptionDueDate) {
      const today = new Date();
      daysLeft = Math.ceil((landlord.subscriptionDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }
    res.json({
      status: landlord.subscriptionStatus,
      dueDate: landlord.subscriptionDueDate,
      daysLeft,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subscription status.' });
  }
};

module.exports = {
  getMySubscriptionStatus
};
