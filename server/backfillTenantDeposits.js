const mongoose = require('mongoose');
const Tenant = require('./src/models/Tenant');
const Property = require('./src/models/Property');
require('dotenv').config({ path: __dirname + '/.env' });

async function updateTenantDepositsAndRent() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const tenants = await Tenant.find();
  let updated = 0;
  for (const tenant of tenants) {
    let needsUpdate = false;
    let rent = tenant.rent;
    let deposit = tenant.deposit;
    if ((!rent || !deposit) && tenant.property && tenant.unitLabel) {
      const property = await Property.findById(tenant.property);
      if (property && property.units) {
        for (const floorObj of property.units) {
          const unit = floorObj.units.find(u => u.label === tenant.unitLabel);
          if (unit && unit.rent) {
            rent = unit.rent;
            deposit = unit.rent;
            needsUpdate = true;
            break;
          }
        }
      }
    }
    if (needsUpdate) {
      tenant.rent = rent;
      tenant.deposit = deposit;
      await tenant.save();
      updated++;
      console.log(`Updated rent/deposit for tenant ${tenant.firstName} ${tenant.lastName} (${tenant._id}) to ${rent}`);
    }
  }
  console.log(`Done. Updated ${updated} tenants.`);
  mongoose.disconnect();
}

updateTenantDepositsAndRent();
