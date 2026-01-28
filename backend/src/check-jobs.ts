import mongoose from "mongoose";
import { JobModel } from "./models/job.model";
import { UserModel } from "./models/user.model";
import config from "./config/db/index";

async function checkJobs() {
    try {
        await mongoose.connect(config.database_url!);
        const email = "mayur.thakkar@akinolabs.com";
        const user = await UserModel.findOne({ email });

        if (!user) {
            console.log("User not found");
            return;
        }

        const jobCount = await JobModel.countDocuments({ userId: user._id });
        console.log(`User ${email} has ${jobCount} jobs.`);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

checkJobs();
