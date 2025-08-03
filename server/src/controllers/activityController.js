const Activity = require('../models/Activity');

// Fetch recent activities for the logged-in landlord
const getRecentActivities = async (req, res) => {
  try {
    const landlordId = req.user && req.user.id;
    if (!landlordId) return res.status(403).json({ error: 'Access denied.' });
    const activities = await Activity.find({ landlord: landlordId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ activities });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent activities.' });
  }
};

module.exports = { getRecentActivities };
