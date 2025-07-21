import { Request, Response } from 'express';
import Payment from '../models/Payment';

// Get current tenant's payment status/countdown
export const getMyPaymentStatus = async (req: Request, res: Response) => {
  try {
    const tenant = req.user?.id;
    const payment = await Payment.findOne({ tenant, status: { $in: ['unpaid', 'overdue'] } }).sort({ dueDate: 1 });
    if (!payment) return res.json({ status: 'paid' });
    const today = new Date();
    const daysLeft = Math.ceil((payment.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    res.json({
      status: payment.status,
      dueDate: payment.dueDate,
      daysLeft,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment status.' });
  }
};
