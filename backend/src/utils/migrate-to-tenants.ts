import mongoose from "mongoose";
import { UserModel } from "../models/user.model";
import { TenantModel } from "../models/tenant.model";
import { CreditTransactionModel } from "../models/credit-transaction.model";
import logger from "./logger";

/**
 * Migration script to convert existing users to multi-tenant architecture
 * Run this once after deploying the tenant system
 */
export async function migrateToTenants() {
    try {
        logger.info("Starting tenant migration...");

        // Find all users without a tenantId
        const usersWithoutTenant = await UserModel.find({
            tenantId: { $exists: false }
        });

        logger.info(`Found ${usersWithoutTenant.length} users to migrate`);

        for (const user of usersWithoutTenant) {
            // Create an individual tenant for each user
            const tenant = await TenantModel.create({
                name: `${user.firstName} ${user.lastName}'s Workspace`,
                type: "INDIVIDUAL",
                ownerUserId: user._id,
                plan: {
                    id: "FREE",
                    isCustom: false
                },
                credits: {
                    balance: user.credits || 100,
                    lifetimeIssued: user.credits || 100,
                    lifetimeConsumed: 0
                },
                status: "ACTIVE"
            });

            // Create initial credit transaction
            await CreditTransactionModel.create({
                tenantId: tenant._id,
                type: "GRANT",
                amount: user.credits || 100,
                balanceBefore: 0,
                balanceAfter: user.credits || 100,
                reason: "Migration from user credits to tenant credits"
            });

            // Update user to link to tenant and set as owner
            user.tenantId = tenant._id as any;
            user.role = "tenant_owner";
            await user.save();

            logger.info(`Migrated user ${user.email} to tenant ${tenant._id}`);
        }

        logger.info("Tenant migration completed successfully");
        return {
            success: true,
            migratedCount: usersWithoutTenant.length
        };

    } catch (error: any) {
        logger.error("Tenant migration failed:", error);
        throw error;
    }
}

/**
 * Rollback migration (use with caution)
 */
export async function rollbackTenantMigration() {
    try {
        logger.warn("Starting tenant migration rollback...");

        // Find all individual tenants created during migration
        const individualTenants = await TenantModel.find({
            type: "INDIVIDUAL"
        });

        for (const tenant of individualTenants) {
            // Find the owner user
            const user = await UserModel.findById(tenant.ownerUserId);

            if (user) {
                // Restore credits to user
                user.credits = tenant.credits.balance;
                user.tenantId = undefined;
                user.role = "user";
                await user.save();
            }

            // Delete tenant and transactions
            await CreditTransactionModel.deleteMany({ tenantId: tenant._id });
            await TenantModel.findByIdAndDelete(tenant._id);

            logger.info(`Rolled back tenant ${tenant._id}`);
        }

        logger.warn("Tenant migration rollback completed");
        return {
            success: true,
            rolledBackCount: individualTenants.length
        };

    } catch (error: any) {
        logger.error("Tenant migration rollback failed:", error);
        throw error;
    }
}
