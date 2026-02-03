require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    try {
        const dbUrl = process.env.DATABASE_URL || "mongodb+srv://mayurthakkarkry_db_user:mayurnebula@nebula.ckxsbqz.mongodb.net/nebula";
        await mongoose.connect(dbUrl);

        const email = "mayur.thakkar@akinolabs.com";
        const User = mongoose.model('User', new mongoose.Schema({ email: String, credits: Number }, { strict: false }));
        const Job = mongoose.model('Job', new mongoose.Schema({
            userId: mongoose.Types.ObjectId,
            creditsUsed: Number,
            status: String
        }, { strict: false }));

        const user = await User.findOne({ email });
        if (!user) { console.log("User not found"); return; }

        console.log(`Initial Balance: ${user.credits}`);

        // Find Stuck Job
        const stuckJob = await Job.findOne({
            userId: user._id,
            status: 'queued',
            module: 'text_to_video'
        });

        if (stuckJob) {
            console.log(`Found stuck job: ${stuckJob._id} | Credits Locked: ${stuckJob.creditsUsed}`);

            // Refund
            const refundAmount = stuckJob.creditsUsed || 30;

            await User.updateOne({ _id: user._id }, { $inc: { credits: refundAmount } });
            await Job.updateOne({ _id: stuckJob._id }, { $set: { status: 'cancelled', error: { message: 'Refunded by System' } } });

            const updatedUser = await User.findById(user._id);
            console.log(`Refunded ${refundAmount} credits. New Balance: ${updatedUser.credits}`);
        } else {
            console.log("No stuck queued jobs found.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
