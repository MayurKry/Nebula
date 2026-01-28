import mongoose from "mongoose";
import { TenantModel } from "./models/tenant.model";
import config from "./config/db/index";

async function listTenants() {
    try {
        await mongoose.connect(config.database_url!);
        const tenants = await TenantModel.find({}, "name _id");
        console.log("Tenants found:", JSON.stringify(tenants, null, 2));
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
}

listTenants();
