const mongoose = require('mongoose');
const Tenant = require('./src/models/Tenant');
const Property = require('./src/models/Property');
require('dotenv').config({ path: __dirname + '/.env' });

async function backfillTenantRentDeposit() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const tenants = await Tenant.find();
  let updated = 0;
  for (const tenant of tenants) {
    if ((!tenant.rent || !tenant.deposit) && tenant.property && tenant.unitLabel) {
      const property = await Property.findById(tenant.property);
      if (property && property.units) {
        for (const floorObj of property.units) {
          const unit = floorObj.units.find(u => u.label === tenant.unitLabel);
          if (unit && unit.rent) {
            tenant.rent = unit.rent;
            tenant.deposit = unit.rent;
            await tenant.save();
            updated++;
            console.log(`Backfilled rent/deposit for tenant ${tenant.firstName} ${tenant.lastName} (${tenant._id}) to ${unit.rent}`);
            break;
          }
        }
      }
    }
  }
  console.log(`Done. Backfilled ${updated} tenants.`);
  mongoose.disconnect();
}

backfillTenantRentDeposit();
