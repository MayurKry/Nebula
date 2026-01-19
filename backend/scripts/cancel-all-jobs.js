/**
 * Script to cancel all processing and queued jobs
 * Usage: node scripts/cancel-all-jobs.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nebula';

async function cancelAllJobs() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Import the Job model
        const { JobModel } = await import('../src/models/job.model.js');

        // Find all processing/queued jobs
        const jobs = await JobModel.find({
            status: { $in: ['queued', 'processing', 'retrying'] }
        });

        console.log(`Found ${jobs.length} jobs to cancel`);

        if (jobs.length === 0) {
            console.log('No jobs to cancel');
            await mongoose.connection.close();
            return;
        }

        // Update all jobs to cancelled
        const result = await JobModel.updateMany(
            { status: { $in: ['queued', 'processing', 'retrying'] } },
            {
                $set: {
                    status: 'cancelled',
                    error: {
                        message: 'System is under maintenance',
                        code: 'MAINTENANCE_MODE',
                        timestamp: new Date()
                    }
                }
            }
        );

        console.log(`Successfully cancelled ${result.modifiedCount} jobs`);
        console.log('Jobs cancelled:', jobs.map(j => ({
            id: j._id.toString(),
            module: j.module,
            status: j.status
        })));

        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error cancelling jobs:', error);
        process.exit(1);
    }
}

cancelAllJobs().then(() => {
    console.log('Done!');
    process.exit(0);
});
