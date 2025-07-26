const cron = require('node-cron');
const Payment = require('../models/Payment');
const User = require('../models/User');

// This job runs every day at 8am
cron.schedule('0 8 * * *', async () => {
  const today = new Date();
  const payments = await Payment.find({ status: { $in: ['unpaid', 'overdue'] } });
  for (const payment of payments) {
    const daysLeft = Math.ceil((payment.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const tenant = await User.findById(payment.tenant);
    if (!tenant) continue;
    if (daysLeft <= 7 && daysLeft >= 0) {
      // Send reminder (for now, just log)
      console.log(`Reminder: Tenant ${tenant.username} rent due in ${daysLeft} day(s).`);
      payment.lastReminderSent = today;
      await payment.save();
    } else if (daysLeft < 0 && daysLeft >= -3) {
      // Escalation warning
      console.log(`Escalation: Tenant ${tenant.username} rent overdue by ${-daysLeft} day(s)!`);
      payment.status = 'overdue';
      payment.lastReminderSent = today;
      await payment.save();
    } else if (daysLeft < -3) {
      // Further action (e.g., notify landlord)
      console.log(`Tenant ${tenant.username} rent overdue by more than 3 days! Notify landlord.`);
      payment.status = 'overdue';
      payment.lastReminderSent = today;
      await payment.save();
    }
  }
});
