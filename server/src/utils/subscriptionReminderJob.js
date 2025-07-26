const cron = require('node-cron');
const User = require('../models/User');

// This job runs every day at 8am
cron.schedule('0 8 * * *', async () => {
  const today = new Date();
  const landlords = await User.find({ role: 'landlord' });
  for (const landlord of landlords) {
    if (!landlord.subscriptionDueDate) continue;
    const daysLeft = Math.ceil((landlord.subscriptionDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7 && daysLeft > 0) {
      // Send reminder (for now, just log)
      console.log(`Landlord ${landlord.username} subscription expires in ${daysLeft} day(s).`);
      landlord.subscriptionStatus = 'expiring';
      landlord.lastSubscriptionReminderSent = today;
      await landlord.save();
    } else if (daysLeft <= 0 && daysLeft > -3) {
      // Grace period
      console.log(`Landlord ${landlord.username} subscription expired. Grace period: ${-daysLeft} day(s).`);
      landlord.subscriptionStatus = 'grace';
      landlord.lastSubscriptionReminderSent = today;
      await landlord.save();
    } else if (daysLeft <= -3) {
      // Lockout
      console.log(`Landlord ${landlord.username} subscription expired and grace period is over. Locking out.`);
      landlord.subscriptionStatus = 'expired';
      landlord.lastSubscriptionReminderSent = today;
      await landlord.save();
    } else {
      // Active
      landlord.subscriptionStatus = 'active';
      await landlord.save();
    }
  }
});
