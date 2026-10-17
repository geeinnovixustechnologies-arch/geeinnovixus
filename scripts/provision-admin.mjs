import { existsSync } from "node:fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const email = ADMIN_EMAIL?.trim().toLowerCase();

if (!MONGODB_URI || !email || !ADMIN_PASSWORD) {
  console.error(
    "Provisioning requires MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD."
  );
  process.exit(1);
}

if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(email)) {
  console.error("ADMIN_EMAIL must be a valid email address.");
  process.exit(1);
}

if (ADMIN_PASSWORD.length < 12) {
  console.error("ADMIN_PASSWORD must be at least 12 characters.");
  process.exit(1);
}

try {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  await User.init();

  const adminCount = await User.countDocuments({ role: "admin" });
  if (adminCount > 1) {
    throw Object.assign(new Error(), { code: "MULTIPLE_ADMINS" });
  }
  if (adminCount === 1) {
    throw Object.assign(new Error(), { code: "ADMIN_EXISTS" });
  }
  if (await User.exists({ email })) {
    throw Object.assign(new Error(), { code: "EMAIL_IN_USE" });
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.create({
    name: email.split("@")[0],
    email,
    passwordHash,
    role: "admin",
    isActive: true,
  });

  console.log("Administrator account provisioned.");
} catch (error) {
  const safeMessages = {
    MULTIPLE_ADMINS: "Multiple administrator accounts already exist; resolve them manually.",
    ADMIN_EXISTS: "An administrator already exists; provisioning will not reset its password.",
    EMAIL_IN_USE: "ADMIN_EMAIL is already assigned to another account.",
  };
  console.error(
    safeMessages[error.code] ||
      "Administrator provisioning failed; no credentials or database details were displayed."
  );
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
