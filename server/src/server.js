const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const financialRoutes = require('./routes/financialRoutes');
const tenantRoutes = require('./routes/tenantRoutes');
const caretakerRoutes = require('./routes/caretakerRoutes');
const caretakerActionRoutes = require('./routes/caretakerActionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const legalDocumentRoutes = require('./routes/legalDocumentRoutes');
const checkListRoutes = require('./routes/checkListRoutes');
const { setupSocket } = require('./socket');
const { checkLandlordSubscription } = require('./middleware/landlordSubscriptionMiddleware');
const errorHandler = require('./middleware/errorHandler');
const setupSwagger = require('./swagger');
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const allowedOrigins = ['http://localhost:5173', 'http://192.168.100.7:5173'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/caretakers', caretakerRoutes);
app.use('/api/caretaker-actions', caretakerActionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/legal-documents', legalDocumentRoutes);
app.use('/api/checklists', checkListRoutes);

// Block expired landlords for all protected landlord routes
app.use('/api/properties', checkLandlordSubscription);
app.use('/api/maintenance', checkLandlordSubscription);

// Swagger API docs
setupSwagger(app);

app.get('/', (req, res) => {
  res.json({ message: 'RentOwl backend is running!' });
});

// Centralized error handler
app.use(errorHandler);

const io = setupSocket(server);
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
