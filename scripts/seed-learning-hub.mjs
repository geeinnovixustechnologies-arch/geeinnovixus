import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import offerings from "../src/data/legacy-learning-offerings.json" with { type: "json" };

function readLocalMongoUri() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error("Missing .env.local. Add the local development MONGODB_URI first.");
  }

  const assignment = fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*(?:export\s+)?MONGODB_URI\s*=\s*(.*?)\s*$/))
    .find(Boolean);

  if (!assignment) {
    throw new Error(".env.local does not define MONGODB_URI.");
  }

  return assignment[1].replace(/^(['"])(.*)\1$/, "$2");
}

function assertDevelopmentUri(value) {
  let uri;
  try {
    uri = new URL(value);
  } catch {
    throw new Error("MONGODB_URI is not a valid MongoDB connection URI.");
  }

  const isLoopback = ["127.0.0.1", "localhost", "[::1]"].includes(uri.hostname);
  const databaseName = decodeURIComponent(uri.pathname.slice(1));
  if (
    uri.protocol !== "mongodb:" ||
    !isLoopback ||
    uri.username ||
    uri.password ||
    databaseName !== "geeinnovixus_dev"
  ) {
    throw new Error(
      "Seed blocked: MONGODB_URI must target the local geeinnovixus_dev database without credentials."
    );
  }

  return value;
}

const mongoUri = assertDevelopmentUri(readLocalMongoUri());
process.env.MONGODB_URI = mongoUri;

const [{ default: connectDB }, { default: LearningOffering }] = await Promise.all([
  import("../src/lib/mongodb.js"),
  import("../src/models/LearningOffering.js"),
]);

async function seed() {
  for (const offering of offerings) {
    await new LearningOffering(offering).validate();
  }

  await connectDB();
  let inserted = 0;
  let alreadyPresent = 0;

  for (const offering of offerings) {
    const result = await LearningOffering.updateOne(
      { title: offering.title, category: offering.category },
      { $setOnInsert: offering },
      { upsert: true, runValidators: true }
    );
    if (result.upsertedCount) inserted += 1;
    else alreadyPresent += 1;
  }

  console.log(
    `Local Learning Hub seed complete: ${inserted} inserted, ${alreadyPresent} already present.`
  );
}

try {
  await seed();
} catch (error) {
  console.error("Local Learning Hub seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
