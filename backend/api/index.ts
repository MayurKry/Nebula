import app from "../src/app";
import { connectDB } from "../src/config/db/db";

// Vercel Serverless Function Handler
export default async function handler(req, res) {
    try {
        // 1. Ensure DB connection is ready before processing ANY request
        await connectDB();

        // 2. Delegate to Express app
        return app(req, res);
    } catch (error) {
        console.error("❌ Vercel Handler Error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            details: error.message
        });
    }
}
