import app from "../src/app";
import { connectDB } from "../src/config/db/db";

// Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
    try {
        // Set CORS headers explicitly for Vercel
        const origin = req.headers.origin;
        const allowedOrigins = [
            "https://nebula-fe.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000",
        ];

        if (allowedOrigins.includes(origin)) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Access-Control-Allow-Credentials", "true");
        }

        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        );
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization, X-Requested-With, Accept, Origin"
        );

        // Handle preflight requests
        if (req.method === "OPTIONS") {
            res.statusCode = 204;
            res.end();
            return;
        }

        // 1. Ensure DB connection is ready before processing ANY request
        await connectDB();

        // 2. Delegate to Express app
        return app(req, res);
    } catch (error: any) {
        console.error("❌ Vercel Handler Error:", error);

        // Use proper Node.js response methods
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
            error: "Internal Server Error",
            details: error.message || "Unknown error occurred"
        }));
    }
}
