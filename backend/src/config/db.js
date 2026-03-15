import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("Connected to MongoDB");
    }
    catch (err) {
      console.error("MongoDB connection error:", err.message);
      process.exit(1);
    }
}

export default connectDB;