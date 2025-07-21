import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI as string;

if (!mongoURI) {
  throw new Error('MONGO_URI is not set in your .env file');
}

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      // useNewUrlParser and useUnifiedTopology are default in Mongoose 6+
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};
