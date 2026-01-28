/**
 * Script to set up default tenant for test users
 * Run with: npx ts-node src/scripts/setup-test-users.ts
 */

import mongoose from "mongoose";
import { UserModel } from "../models/user.model";
import { TenantModel } from "../models/tenant.model";
import config from "../config/db/index";

const TEST_USERS = [
    "mayur.thakkar@akinolabs.com",
    "mayur@gmail.com"
];

async function setupTestUsers() {
    try {
        // Connect to database
        console.log("Connecting to database...");
        await mongoose.connect(config.database_url!);
        console.log("✅ Connected to database");

        // Find or create a default tenant
        let tenant = await TenantModel.findOne({ name: "Nebula Test Tenant" });

        if (!tenant) {
            console.log("Creating default test tenant...");

            // First, we need to get one of the test users to be the owner
            const ownerUser = await UserModel.findOne({ email: TEST_USERS[0] });

            if (!ownerUser) {
                console.log(`❌ Owner user not found: ${TEST_USERS[0]}`);
                console.log(`   Please create this user first through the registration flow.`);
                return;
            }

            tenant = await TenantModel.create({
                name: "Nebula Test Tenant",
                type: "ORGANIZATION",
                ownerUserId: ownerUser._id,
                status: "ACTIVE",
                plan: {
                    id: "FREE",
                    isCustom: false
                },
                credits: {
                    balance: 1000,
                    lifetimeIssued: 1000,
                    lifetimeConsumed: 0
                },
                featureOverrides: []
            });
            console.log(`✅ Created tenant: ${tenant.name} (ID: ${tenant._id})`);
        } else {
            console.log(`✅ Found existing tenant: ${tenant.name} (ID: ${tenant._id})`);
        }

        // Update test users with tenant
        for (const email of TEST_USERS) {
            const user = await UserModel.findOne({ email });

            if (!user) {
                console.log(`⚠️  User not found: ${email}`);
                console.log(`   Please create this user first through the registration flow.`);
                continue;
            }

            // Update user with tenantId
            user.tenantId = tenant._id as mongoose.Types.ObjectId;
            await user.save();

            console.log(`✅ Updated user: ${email}`);
            console.log(`   - Tenant ID: ${tenant._id}`);
            console.log(`   - Tenant Name: ${tenant.name}`);
        }

        console.log("\n🎉 Test users setup complete!");
        console.log("\nYou can now log in with:");
        TEST_USERS.forEach(email => {
            console.log(`  - ${email}`);
        });

    } catch (error) {
        console.error("❌ Error setting up test users:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\n✅ Disconnected from database");
    }
}

// Run the script
setupTestUsers();
