import { existsSync } from "node:fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const email = ADMIN_EMAIL?.trim().toLowerCase();
const args = process.argv.slice(2);
const replaceAdmin = args.includes("--replace-admin");

if (args.some((arg) => arg !== "--replace-admin")) {
  console.error("Usage: node scripts/provision-admin.mjs [--replace-admin]");
  process.exit(1);
}

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

if (ADMIN_PASSWORD.length < 9) {
  console.error("ADMIN_PASSWORD must be at least 9 characters.");
  process.exit(1);
}

let phase = "connecting to MongoDB";
try {
  // Keep Mongoose from building the unique admin index before the optional
  // replacement cleanup has removed duplicate admin documents.
  await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
    autoIndex: false,
  });

  if (replaceAdmin) {
    phase = "checking whether ADMIN_EMAIL belongs to a non-admin user";
    if (await User.exists({ email, role: { $ne: "admin" } })) {
      throw Object.assign(new Error(), { code: "EMAIL_IN_USE" });
    }

    phase = "removing existing administrator accounts as requested";
    const result = await User.deleteMany({ role: "admin" });
    console.log(`Removed ${result.deletedCount} existing administrator account(s).`);
  }

  phase = "initializing the User collection indexes";
  await User.init();
  await User.createIndexes();

  phase = "checking for an existing administrator or email";
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

  phase = "hashing the administrator password";
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  phase = "creating the administrator account";
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
  if (safeMessages[error.code]) {
    console.error(safeMessages[error.code]);
  } else {
    const safeCategory =
      error?.name === "MongoServerSelectionError"
        ? "MongoDB server was unreachable (check the URI format, Atlas IP access list, and network access)."
        : error?.name === "MongoServerError" && error?.code === 18
          ? "MongoDB authentication failed (check the database username, password, and authentication database)."
          : error?.code === 11000
            ? "A unique index rejected a duplicate record; check for an existing user or conflicting admin data."
            : error?.name === "ValidationError"
              ? "A database model validation failed; check the configured admin email and User schema requirements."
              : `Unexpected ${error?.name || "error"}${typeof error?.code === "number" ? ` (code ${error.code})` : ""}.`;
    console.error(`Provisioning failed while ${phase}. ${safeCategory}`);
  }
  process.exitCode = 1;
} finally {
  try {
    await mongoose.disconnect();
  } catch {
    console.error("MongoDB connection cleanup failed.");
    process.exitCode = 1;
  }
}
