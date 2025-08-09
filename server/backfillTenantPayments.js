// Script to backfill Payment and lease fields for all existing tenants, with detailed logging
require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Tenant = require('./src/models/Tenant');
const Property = require('./src/models/Property');
const Payment = require('./src/models/Payment');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rentowldb';

async function backfill() {
  console.log('Using MONGO_URI:', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  const total = await Tenant.countDocuments();
  console.log('Total tenants in collection:', total);
  const tenants = await Tenant.find({ property: { $exists: true, $ne: null }, unitLabel: { $exists: true, $ne: null } });
  console.log(`Found tenants: ${tenants.length}`);
  if (tenants.length > 0) {
    console.log('Example tenant:', tenants[0]);
  }
  let updated = 0;
  for (const tenant of tenants) {
    console.log(`Checking tenant: ${tenant.firstName} ${tenant.lastName} (${tenant._id})`);
    // Set default leaseStart if missing
    let changed = false;
    if (!tenant.leaseStart) {
      tenant.leaseStart = new Date();
      changed = true;
      console.log('  - Added leaseStart');
    }
    if (changed) await tenant.save();
    // Check for existing payments
    const paymentCount = await Payment.countDocuments({ tenant: tenant._id });
    if (paymentCount === 0) {
      // Find rent amount from property/unit
      const property = await Property.findById(tenant.property);
      let rentAmount = null;
      if (property) {
        let allLabels = [];
        for (const floorObj of property.units) {
          if (Array.isArray(floorObj.units)) {
            for (const unit of floorObj.units) {
              allLabels.push(unit.label);
              if (unit.label === tenant.unitLabel) {
                rentAmount = unit.rent;
              }
            }
          }
        }
        console.log(`  - Property ${property.name} units: [${allLabels.join(', ')}]`);
      }
      if (rentAmount) {
        // Set rent and deposit on tenant if missing
        if (!tenant.rent || !tenant.deposit) {
          tenant.rent = rentAmount;
          tenant.deposit = rentAmount;
          await tenant.save();
          console.log('  - Set tenant.rent and tenant.deposit');
        }
        // Create deposit payment (type: 'deposit')
        await Payment.create({
          tenant: tenant._id,
          property: tenant.property,
          amount: rentAmount,
          dueDate: tenant.leaseStart,
          status: 'unpaid',
          type: 'deposit',
        });
        // Create one rent payment (type: 'rent')
        await Payment.create({
          tenant: tenant._id,
          property: tenant.property,
          amount: rentAmount,
          dueDate: tenant.leaseStart,
          status: 'unpaid',
          type: 'rent',
        });
        updated++;
        console.log('  - Created deposit and rent payments (one each)');
      } else {
        console.log(`  - Skipped: Could not determine rent amount for unitLabel '${tenant.unitLabel}' in property '${property ? property.name : tenant.property}'`);
      }
    } else {
      console.log('  - Skipped: Payments already exist');
    }
  }
  console.log(`Backfill complete. Updated ${updated} tenants with missing payments/lease fields.`);
  await mongoose.disconnect();
}

backfill().catch(err => {
  console.error('Backfill error:', err);
  process.exit(1);
});
