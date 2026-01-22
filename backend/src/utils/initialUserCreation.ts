import { UserModel } from "../models/user.model";
import logger from "./logger";
import bcrypt from "bcryptjs";

const initialUserCreation = async () => {
  try {
    const superAdminEmail = "janu@gmail.com";
    const superAdminPassword = "Password@1";
    const superAdminFirstName = "Super";
    const superAdminLastName = "Admin";
    const superAdminRole = "super_admin"; // Fixed: Use snake_case to match schema

    // Check if super admin already exists
    const existingAdmin = await UserModel.findOne({ email: superAdminEmail });

    if (existingAdmin) {
      // Update existing user to ensure they have super_admin role
      if (existingAdmin.role !== "super_admin") {
        existingAdmin.role = "super_admin";
        await existingAdmin.save();
        logger.info("Updated existing user to Super Admin role.");
      } else {
        logger.info("Super Admin already exists with correct role.");
      }
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

      // Create new super admin
      const newAdmin = new UserModel({
        firstName: superAdminFirstName,
        lastName: superAdminLastName,
        email: superAdminEmail,
        password: hashedPassword,
        role: superAdminRole,
      });

      await newAdmin.save();
      logger.info("Super Admin account created successfully!");
    }

    // --- Dev User Creation (Always Check) ---
    const devUserId = "507f1f77bcf86cd799439011";

    // Ensure Dev Tenant Exists
    const devTenantId = "507f1f77bcf86cd799439012";
    const existingDevTenant = await import("../models/tenant.model").then(m => m.TenantModel.findById(devTenantId));

    if (!existingDevTenant) {
      const TenantModel = (await import("../models/tenant.model")).TenantModel;
      await TenantModel.create({
        _id: devTenantId,
        name: "Dev Team",
        type: "ORGANIZATION",
        ownerUserId: devUserId,
        plan: {
          id: "TEAM",
          isCustom: false
        },
        credits: {
          balance: 5000,
          lifetimeIssued: 5000,
          lifetimeConsumed: 0
        },
        status: "ACTIVE"
      });
      logger.info("Dev Tenant created.");
    }

    const existingDevUser = await UserModel.findById(devUserId);

    if (!existingDevUser) {
      const devUser = new UserModel({
        _id: devUserId,
        firstName: "Development",
        lastName: "User",
        email: "dev@nebula.com",
        password: await bcrypt.hash("password", 10),
        role: "tenant_owner", // Dev user is an owner
        tenantId: devTenantId,
        onboardingCompleted: true
      });
      await devUser.save();
      logger.info("Dev User created successfully for bypass mode!");
    } else {
      // Allow re-linking if missing
      if (!existingDevUser.tenantId) {
        existingDevUser.tenantId = (devTenantId as any);
        existingDevUser.role = "tenant_owner";
        await existingDevUser.save();
        logger.info("fixed dev user tenant linkage");
      }
      // Reset credits for dev user on restart (Legacy support) but mainly rely on Tenant Credits now
      existingDevUser.credits = 1000;
      await existingDevUser.save();
      logger.info("Dev User verification complete.");
    }

  } catch (err) {
    logger.error("Failed to run seed: " + err);
  }
};
export default initialUserCreation;