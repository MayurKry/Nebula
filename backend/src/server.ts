import config from "./config/db";
import app from "./app";
import logger from "./utils/logger";
import initialUserCreation from "./utils/initialUserCreation";
import { connectDB } from "./config/db/db";

/**
 * server.ts
 * Entry point for LOCAL development.
 * Vercel uses api/index.ts instead.
 */

const startServer = async () => {
  try {
    // 1. Connect to Database WITHOUT buffering
    await connectDB();

    // 2. Start Express Server
    app.listen(config.port, () => {
      logger.info(`🚀 Server running locally at http://localhost:${config.port}`);
    });

    // 3. Run initial seed (only safely after DB is connected)
    await initialUserCreation();

  } catch (err) {
    logger.error("❌ Failed to start server: " + err);
    process.exit(1);
  }
};

// Only run if not on Vercel (local dev)
if (!process.env.VERCEL) {
  startServer();
}

export default app;
