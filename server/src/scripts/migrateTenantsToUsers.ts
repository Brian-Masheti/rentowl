import mongoose from 'mongoose';
import User from '../models/User';
import Tenant from '../models/Tenant';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rentowl';

async function migrateTenantsToUsers() {
  await mongoose.connect(MONGO_URI);
  const tenants = await Tenant.find({});
  let createdCount = 0;
  for (const t of tenants) {
    const exists = await User.findOne({ $or: [
      { email: t.email },
      { username: t.username },
      { phone: t.phone }
    ] });
    if (!exists) {
      await User.create({
        firstName: t.firstName,
        lastName: t.lastName,
        username: t.username,
        email: t.email,
        phone: t.phone,
        passwordHash: t.passwordHash,
        role: 'tenant',
        isActive: t.isActive,
      });
      createdCount++;
      console.log(`Created User for tenant ${t.email}`);
    }
  }
  console.log(`Migration complete. Created ${createdCount} User documents for tenants.`);
  process.exit(0);
}

migrateTenantsToUsers().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
