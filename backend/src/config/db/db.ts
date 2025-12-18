import mongoose from "mongoose";
import logger from "../../utils/logger";
import config from "./index"; // Use the config object to get env vars reliably

const MONGODB_URI = config.database_url;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the DATABASE_URL environment variable inside .env"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless environments.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    logger.info("⚡ Using cached MongoDB connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering for Serverless
      serverSelectionTimeoutMS: 5000,
    };

    logger.info("⏳ Connecting to MongoDB...");

    cached.promise = mongoose.connect(MONGODB_URI as string, opts).then((mongoose) => {
      logger.info("✅ New MongoDB connection established");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

