const Property = require('../models/Property');
const Payment = require('../models/Payment');

// Real aggregation for landlord financial reports
const getFinancialReports = async (req, res) => {
  try {
    const landlordId = req.user && req.user.id;
    if (!landlordId) return res.status(401).json({ error: 'Unauthorized' });

    // Fetch all properties for this landlord
    const properties = await Property.find({ landlord: landlordId, isDeleted: { $ne: true } });
    const propertyIds = properties.map(p => p._id);

    // Fetch all payments for these properties
    const payments = await Payment.find({ property: { $in: propertyIds } });

    // Aggregate per property
    const report = properties.map(property => {
      // Expected rent per month (sum of all unit rents * count)
      const expectedRent = property.units.reduce((sum, unit) => sum + (unit.rent * unit.count), 0);
      // Payments for this property
      const propertyPayments = payments.filter(p => p.property.toString() === property._id.toString());
      const receivedRent = propertyPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
      const outstandingRent = expectedRent - receivedRent;
      return {
        propertyId: property._id,
        propertyName: property.name,
        expectedRent,
        receivedRent,
        outstandingRent,
        unitSummary: property.units.map(u => ({ type: u.type, count: u.count, rent: u.rent })),
      };
    });

    // Overall totals
    const totalExpected = report.reduce((sum, r) => sum + r.expectedRent, 0);
    const totalReceived = report.reduce((sum, r) => sum + r.receivedRent, 0);
    const totalOutstanding = report.reduce((sum, r) => sum + r.outstandingRent, 0);

    res.json({
      summary: {
        totalExpected,
        totalReceived,
        totalOutstanding,
      },
      perProperty: report,
    });
  } catch (err) {
    console.error('Error in getFinancialReports:', err);
    res.status(500).json({ error: 'Failed to generate financial report.' });
  }
};

// Placeholders for other endpoints
const getMonthlyIncome = async (req, res) => {
  try {
    const landlordId = req.user && req.user.id;
    if (!landlordId) return res.status(401).json({ error: 'Unauthorized' });

    // Fetch all properties for this landlord
    const properties = await Property.find({ landlord: landlordId, isDeleted: { $ne: true } });
    const propertyIds = properties.map(p => p._id);
    const propertyMap = properties.reduce((acc, p) => {
      acc[p._id.toString()] = p.name;
      return acc;
    }, {});

    // Aggregate payments by property and month
    const payments = await Payment.aggregate([
      { $match: {
          property: { $in: propertyIds },
          status: 'paid'
        }
      },
      { $group: {
          _id: {
            property: '$property',
            year: { $year: '$dueDate' },
            month: { $month: '$dueDate' }
          },
          totalIncome: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Format result
    const result = payments.map(p => ({
      propertyId: p._id.property,
      propertyName: propertyMap[p._id.property.toString()] || 'Unknown',
      year: p._id.year,
      month: p._id.month,
      totalIncome: p.totalIncome
    }));

    res.json({
      data: result
    });
  } catch (err) {
    console.error('Error in getMonthlyIncome:', err);
    res.status(500).json({ error: 'Failed to generate monthly income report.' });
  }
};

const getRentArrears = async (req, res) => {
  try {
    const landlordId = req.user && req.user.id;
    if (!landlordId) return res.status(401).json({ error: 'Unauthorized' });

    // Fetch all properties for this landlord
    const properties = await Property.find({ landlord: landlordId, isDeleted: { $ne: true } });
    const propertyIds = properties.map(p => p._id);
    const propertyMap = properties.reduce((acc, p) => {
      acc[p._id.toString()] = p.name;
      return acc;
    }, {});

    // Find all unpaid or overdue payments for these properties
    const payments = await Payment.find({
      property: { $in: propertyIds },
      status: { $in: ['unpaid', 'overdue'] }
    })
      .populate({
        path: 'tenant',
        select: 'firstName lastName email phone unitType floor unitLabel',
        model: 'Tenant'
      })
      .populate('property', 'name');

    // Format arrears list
    const arrears = payments.map(p => ({
      paymentId: p._id,
      tenantName: p.tenant ? `${p.tenant.firstName} ${p.tenant.lastName}` : 'Unknown',
      tenantEmail: p.tenant ? p.tenant.email : '',
      tenantPhone: p.tenant ? p.tenant.phone : '',
      propertyId: p.property ? p.property._id : '',
      propertyName: p.property ? p.property.name : '',
      unitType: p.tenant ? p.tenant.unitType : '',
      floor: p.tenant ? p.tenant.floor : '',
      unitLabel: p.tenant ? p.tenant.unitLabel : '',
      amount: p.amount,
      amountPaid: p.amountPaid,
      dueDate: p.dueDate,
      status: p.status,
    }));

    res.json({
      data: arrears
    });
  } catch (err) {
    console.error('Error in getRentArrears:', err);
    res.status(500).json({ error: 'Failed to fetch rent arrears.' });
  }
};

const getOccupancyStats = async (req, res) => {
  res.json({
    message: 'Occupancy stats endpoint is working.',
    data: [],
  });
};

module.exports = {
  getFinancialReports,
  getMonthlyIncome,
  getRentArrears,
  getOccupancyStats
};
