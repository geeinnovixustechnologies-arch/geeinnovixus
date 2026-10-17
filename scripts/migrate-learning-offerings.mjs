import connectDB from "../src/lib/mongodb.js";
import LearningOffering from "../src/models/LearningOffering.js";
import mongoose from "mongoose";
import offerings from "../src/data/legacy-learning-offerings.json" with { type: "json" };

try {
  await connectDB();
  let inserted = 0;
  let alreadyPresent = 0;

  for (const offering of offerings) {
    const result = await LearningOffering.updateOne(
      { title: offering.title, category: offering.category },
      {
        $setOnInsert: {
          title: offering.title,
          description: offering.description,
          shortDescription: offering.shortDescription,
          category: offering.category,
          level: offering.level,
          duration: offering.duration,
          modules: offering.modules,
          software: offering.software,
          features: offering.features,
          isActive: true,
        },
      },
      { upsert: true }
    );
    if (result.upsertedCount) inserted += 1;
    else alreadyPresent += 1;
  }

  console.log(
    `Learning offering migration complete: ${inserted} inserted, ${alreadyPresent} already present.`
  );
} catch (error) {
  console.error("Learning offering migration failed:", error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
