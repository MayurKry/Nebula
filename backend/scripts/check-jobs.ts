
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import { JobModel } from '../src/models/job.model';

// Load env
const envPath = path.resolve(process.cwd(), '.env');
console.log("Loading .env from:", envPath);
dotenv.config({ path: envPath });

async function checkJobs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("Connected to MongoDB");

        const jobs = await JobModel.find().sort({ createdAt: -1 }).limit(5);

        console.log("\n--- Recent Jobs ---");
        jobs.forEach(job => {
            console.log(`\nJob ID: ${job._id}`);
            console.log(`Module: ${job.module}`);
            console.log(`Status: ${job.status}`);
            console.log(`Updated At: ${job.updatedAt}`);
            if (job.status === 'failed') {
                console.log(`Error:`, JSON.stringify(job.error, null, 2));
            }
            if (job.output && job.output.length > 0) {
                console.log(`Output:`, JSON.stringify(job.output, null, 2));
            } else {
                console.log("Output: []");
            }
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

checkJobs();
