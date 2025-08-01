// Dashboard controller for landlord overview stats
const Property = require('../models/Property');
const Tenant = require('../models/Tenant');
const Caretaker = require('../models/Caretaker');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Payment = require('../models/Payment');
// const Notification = require('../models/Notification'); // Notification model not present, so skip for now

/**
 * GET /api/landlord/overview
 * Returns key stats for the logged-in landlord's dashboard
 */
exports.getLandlordOverview = async (req, res) => {
  try {
    const landlordId = req.user && req.user.id;
    if (!landlordId || !req.user.role || req.user.role.toLowerCase() !== 'landlord') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Properties managed by landlord
    const properties = await Property.find({ landlord: landlordId, isDeleted: { $ne: true } }).select('_id');
    const propertyIds = properties.map(p => p._id);

    // Tenants in landlord's properties
    const tenants = await Tenant.find({ property: { $in: propertyIds } }).select('_id');

    // Caretakers assigned to landlord's properties (unique)
    const caretakers = await Caretaker.find({ properties: { $in: propertyIds }, isActive: true }).select('_id');

    // Open maintenance requests for landlord's properties
    const openMaintenance = await MaintenanceRequest.countDocuments({ property: { $in: propertyIds }, status: { $in: ['pending', 'in_progress'] } });

    // Total arrears (sum of unpaid/overdue payments for landlord's properties)
    const arrearsAgg = await Payment.aggregate([
      { $match: { property: { $in: propertyIds }, status: { $in: ['unpaid', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const arrears = arrearsAgg.length > 0 ? arrearsAgg[0].total : 0;

    // Unread notifications/messages for landlord (if Notification model exists)
    // Notification model not present, so always return 0 for now
    let unreadNotifications = 0;

    res.json({
      properties: properties.length,
      tenants: tenants.length,
      caretakers: caretakers.length,
      openMaintenance,
      arrears,
      unreadNotifications
    });
  } catch (err) {
    console.error('Error in getLandlordOverview:', err);
    res.status(500).json({ error: 'Failed to fetch landlord overview.' });
  }
};
