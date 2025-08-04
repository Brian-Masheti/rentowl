const express = require('express');
const Property = require('../models/Property');
const router = express.Router();

router.get('/occupancy', async (req, res) => {
  try {
    const properties = await Property.find({});
    let totalUnits = 0, occupiedUnits = 0, vacantUnits = 0;
    properties.forEach(property => {
      (property.units || []).forEach(floorObj => {
        (floorObj.units || []).forEach(unit => {
          totalUnits++;
          if (unit.status === 'occupied') occupiedUnits++;
          else vacantUnits++;
        });
      });
    });
    res.json({
      data: { totalUnits, occupiedUnits, vacantUnits }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch occupancy stats.' });
  }
});

module.exports = router;
