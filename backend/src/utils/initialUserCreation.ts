import { UserModel } from "../models/user.model";
import logger from "./logger";
import bcrypt from "bcryptjs";

const initialUserCreation = async () => {
  try {
    const superAdminEmail = "janu@gmail.com";
    const superAdminPassword = "Password@1";
    const superAdminFirstName = "Super";
    const superAdminLastName = "Admin";
    const superAdminRole = "superAdmin";

    // Check if super admin already exists
    const existingAdmin = await UserModel.findOne({ email: superAdminEmail });

    if (existingAdmin) {
      logger.info("Super Admin already exists. Skipping creation.");
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
    const existingDevUser = await UserModel.findById(devUserId);

    if (!existingDevUser) {
      const devUser = new UserModel({
        _id: devUserId,
        firstName: "Development",
        lastName: "User",
        email: "dev@nebula.com",
        password: await bcrypt.hash("password", 10),
        role: "user",
        credits: 1000,
        onboardingCompleted: true
      });
      await devUser.save();
      logger.info("Dev User created successfully for bypass mode!");
    } else {
      // Reset credits for dev user on restart
      existingDevUser.credits = 1000;
      await existingDevUser.save();
      logger.info("Dev User credits reset to 1000.");
    }

  } catch (err) {
    logger.error("Failed to run seed: " + err);
  }
};
export default initialUserCreation;