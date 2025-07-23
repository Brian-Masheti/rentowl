import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import propertyRoutes from './routes/propertyRoutes';
import maintenanceRoutes from './routes/maintenanceRoutes';
import paymentRoutes from './routes/paymentRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import financialRoutes from './routes/financialRoutes';
import { setupSocket } from './socket';
// Start payment reminder cron job
import './utils/paymentReminderJob';
import './utils/subscriptionReminderJob';

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const allowedOrigins = ['http://localhost:5173', 'http://192.168.100.7:5173'];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
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
import { checkLandlordSubscription } from './middleware/landlordSubscriptionMiddleware';

app.use('/api/payments', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/financial', financialRoutes);

// Block expired landlords for all protected landlord routes
app.use('/api/properties', checkLandlordSubscription);
app.use('/api/maintenance', checkLandlordSubscription);

app.get('/', (req, res) => {
  res.json({ message: 'RentOwl backend is running!' });
});

setupSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
