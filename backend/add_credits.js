require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    try {
        // Force the specific database URL seen in .env if dotenv fails or just to be sure,
        // but try process.env first.
        const dbUrl = process.env.DATABASE_URL || "mongodb+srv://mayurthakkarkry_db_user:mayurnebula@nebula.ckxsbqz.mongodb.net/nebula";

        console.log("Connecting to DB...");
        await mongoose.connect(dbUrl);
        console.log("Connected.");

        const email = "mayur.thakkar@akinolabs.com";
        // Define a minimal schema to interact with the collection
        // strict: false allows us to not define every field
        const User = mongoose.model('User', new mongoose.Schema({
            email: String,
            credits: Number
        }, { strict: false }));

        const user = await User.findOne({ email: email });
        if (!user) {
            console.log(`User with email ${email} not found!`);
            // List some users to verify
            const users = await User.find({}).limit(5);
            console.log("Some users found in DB:", users.map(u => u.email));
        } else {
            console.log(`User found. Current Credits: ${user.credits}`);
            const previous = user.credits || 0;
            const newCredits = previous + 500;

            // Validate we are actually updating
            const result = await User.updateOne(
                { _id: user._id },
                { $set: { credits: newCredits } }
            );

            console.log(`Update Result:`, result);
            console.log(`Successfully added 500 credits. Old: ${previous}, New: ${newCredits}`);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
