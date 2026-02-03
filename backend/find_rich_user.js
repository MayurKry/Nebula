require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    try {
        const dbUrl = process.env.DATABASE_URL || "mongodb+srv://mayurthakkarkry_db_user:mayurnebula@nebula.ckxsbqz.mongodb.net/nebula";
        await mongoose.connect(dbUrl);

        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            credits: Number,
            firstName: String,
            lastName: String
        }, { strict: false }));

        console.log("Searching for users with balance > 5000...");

        const richUsers = await User.find({ credits: { $gt: 5000 } });

        console.log(`Found ${richUsers.length} users:`);
        richUsers.forEach(u => {
            console.log(`- ${u.email} (${u.firstName} ${u.lastName}): ${u.credits} Credits`);
        });

        if (richUsers.length > 0) {
            const victim = richUsers[0];
            console.log(`\nChecking audit logs for ${victim.email}...`);

            const Job = mongoose.model('Job', new mongoose.Schema({
                userId: mongoose.Types.ObjectId,
                module: String,
                creditsUsed: Number,
                createdAt: Date,
                status: String,
                input: Object
            }, { strict: false }));

            const jobs = await Job.find({ userId: victim._id })
                .sort({ createdAt: -1 })
                .limit(20);

            jobs.forEach(j => {
                console.log(`[${j.createdAt.toISOString()}] Type: ${j.module} | Status: ${j.status} | Credits: ${j.creditsUsed}`);
            });
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
