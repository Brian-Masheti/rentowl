import { Request, Response } from 'express';
import Property from '../models/Property';
import Payment from '../models/Payment';
import mongoose from 'mongoose';

// Real aggregation for landlord financial reports
export const getFinancialReports = async (req: Request, res: Response) => {
  try {
    const landlordId = req.user?.id;
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
export const getMonthlyIncome = async (req: Request, res: Response) => {
  res.json({
    message: 'Monthly income endpoint is working.',
    data: [],
  });
};

export const getRentArrears = async (req: Request, res: Response) => {
  res.json({
    message: 'Rent arrears endpoint is working.',
    data: [],
  });
};

export const getOccupancyStats = async (req: Request, res: Response) => {
  res.json({
    message: 'Occupancy stats endpoint is working.',
    data: [],
  });
};
