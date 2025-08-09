const Tenant = require('../models/Tenant');
const Property = require('../models/Property');

// Assign a self-registered tenant to a property/unit and set rent, deposit, and leaseType automatically
const assignTenant = async (req, res) => {
  try {
    const { tenantId, propertyId, unitLabel, unitType, floor, leaseType, leaseStart, leaseEnd } = req.body;
    let rent = undefined;
    let deposit = undefined;
    let foundUnitType = unitType;

    // Look up the property and unit to get the rent and deposit (just like createTenant)
    const property = await Property.findById(propertyId);
    if (property && property.units) {
      for (const floorObj of property.units) {
        const unit = floorObj.units.find(u => u.label === unitLabel);
        if (unit && unit.rent) {
          rent = unit.rent;
          deposit = unit.rent; // Deposit = rent by default for new tenants
          foundUnitType = unit.type || foundUnitType;
          break;
        }
      }
    }

    if (rent === undefined) {
      return res.status(400).json({ error: 'Could not find rent for the selected unit. Please check property/unit data.' });
    }

    // Always update rent, deposit, and leaseType on assignment
    const update = {
      property: propertyId,
      unitLabel,
      unitType: foundUnitType,
      floor,
      leaseType: leaseType || undefined,
      leaseStart: leaseStart || undefined,
      leaseEnd: leaseEnd || undefined,
      rent,
      deposit,
    };

    const updatedTenant = await Tenant.findByIdAndUpdate(tenantId, update, { new: true });
    res.json(updatedTenant);
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign tenant.', details: err.message });
  }
};

module.exports = assignTenant;
