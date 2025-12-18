import mongoose from "mongoose";
import logger from "../../utils/logger";

const MONGODB_URI = process.env.DATABASE_URL as string;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined");
}

// global cache for Vercel
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false, // IMPORTANT
        serverSelectionTimeoutMS: 30000,
      })
      .then((mongoose) => {
        logger.info("✅ MongoDB connected");
        return mongoose;
      })
      .catch((err) => {
        logger.error("❌ MongoDB connection error", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
