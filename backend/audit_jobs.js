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
            module: String,
            creditsUsed: Number,
            createdAt: Date,
            status: String,
            input: Object
        }, { strict: false }));

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return;
        }

        console.log(`Checking jobs for user: ${user._id}`);
        console.log(`Current Balance: ${user.credits}`);

        const jobs = await Job.find({
            userId: user._id
        })
            .sort({ createdAt: -1 })
            .limit(50);

        console.log(`\nFound ${jobs.length} recent ALL jobs:`);

        let calculatedTotal = 0;
        jobs.forEach(j => {
            console.log(`[${j.createdAt.toISOString()}] Type: ${j.module} | Status: ${j.status} | Credits: ${j.creditsUsed}`);
            if (j.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
                calculatedTotal += (j.creditsUsed || 0);
            }
        });

        console.log(`\nTotal Credits deducted in last 24h according to Job History: ${calculatedTotal}`);


    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
