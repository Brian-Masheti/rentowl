import mongoose from 'mongoose';
import Property from '../models/Property';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rentowl';

async function migrateTenants() {
  await mongoose.connect(MONGO_URI);
  const properties = await Property.find({});
  let updatedCount = 0;
  for (const property of properties) {
    let changed = false;
    const newTenants = (property.tenants || []).map((t: any) => {
      // If t is just an ObjectId or buffer, convert to { tenant: t, unitType: '' }
      if (t && (typeof t === 'string' || t instanceof mongoose.Types.ObjectId || t.buffer)) {
        changed = true;
        return { tenant: t, unitType: '' };
      }
      // If t.tenant is missing or null, remove this entry
      if (!t || !t.tenant || typeof t.tenant !== 'object' && typeof t.tenant !== 'string') {
        changed = true;
        return null;
      }
      // If already correct format, keep as is
      return t;
    }).filter(Boolean);
    if (changed) {
      property.tenants = newTenants;
      await property.save();
      updatedCount++;
      console.log(`Updated property ${property._id}`);
    }
  }
  console.log(`Migration complete. Updated ${updatedCount} properties.`);
  process.exit(0);
}

migrateTenants().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
