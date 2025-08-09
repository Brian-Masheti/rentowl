const express = require('express');
const assignTenantRoutes = require('./assignTenantRoutes');

const router = express.Router();

router.use('/assign-tenant', assignTenantRoutes);

module.exports = router;
