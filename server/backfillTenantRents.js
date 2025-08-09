// Run this script with: node server/backfillTenantRents.js
// It will update all tenants to ensure tenant.rent is set from their assigned unit or unit type/floor

const mongoose = require('mongoose');
const Tenant = require('./src/models/Tenant');
const Property = require('./src/models/Property');
require('dotenv').config({ path: __dirname + '/.env' });
console.log('MONGO_URI:', process.env.MONGO_URI);

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const tenants = await Tenant.find();
  let updated = 0;
  let skipped = [];
  for (const tenant of tenants) {
    if (tenant.rent) continue; // Already set
    let propertyId = tenant.property;
    if (propertyId && propertyId._id) propertyId = propertyId._id; // handle populated
    const property = await Property.findById(propertyId);
    if (!property || !property.units) {
      skipped.push({ tenant, reason: 'No property or units found' });
      continue;
    }
    let matchedUnit = null;
    // 1. Try to match by label (case-insensitive, trimmed)
    for (const floorObj of property.units) {
      for (const unit of floorObj.units) {
        if (
          String(unit.label || '').trim().toLowerCase() === String(tenant.unitLabel || '').trim().toLowerCase()
        ) {
          matchedUnit = unit;
          break;
        }
      }
      if (matchedUnit) break;
    }
    // 2. Fallback: match by BOTH unitType and floor
    if (!matchedUnit) {
      for (const floorObj of property.units) {
        if (String(floorObj.floor || '').trim().toLowerCase() === String(tenant.floor || '').trim().toLowerCase()) {
          for (const unit of floorObj.units) {
            if (
              String(unit.type || '').trim().toLowerCase() === String(tenant.unitType || '').trim().toLowerCase()
            ) {
              matchedUnit = unit;
              break;
            }
          }
        }
        if (matchedUnit) break;
      }
    }
    // 3. Fallback: match by unitType only (any floor), ONLY if property.isUniform === true
    if (!matchedUnit && property.isUniform === true) {
      for (const floorObj of property.units) {
        for (const unit of floorObj.units) {
          if (
            String(unit.type || '').trim().toLowerCase() === String(tenant.unitType || '').trim().toLowerCase()
          ) {
            matchedUnit = unit;
            break;
          }
        }
        if (matchedUnit) break;
      }
    }
    if (matchedUnit && matchedUnit.rent) {
      tenant.rent = matchedUnit.rent;
      await tenant.save();
      updated++;
      console.log(`Updated rent for tenant ${tenant.firstName} ${tenant.lastName} (${tenant._id}) to ${matchedUnit.rent}`);
    } else {
      skipped.push({ tenant, reason: 'No matching unit found' });
      console.warn(`SKIPPED: No matching unit found for tenant ${tenant.firstName} ${tenant.lastName} (${tenant._id}) in property ${property.name} (${property._id})`);
    }
  }
  console.log(`\nDone. Updated ${updated} tenants.`);
  if (skipped.length > 0) {
    console.log(`\nThe following tenants were skipped and not updated:`);
    skipped.forEach(({ tenant, reason }) => {
      console.log(`- ${tenant.firstName} ${tenant.lastName} (${tenant._id}): ${reason}`);
    });
  }
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
