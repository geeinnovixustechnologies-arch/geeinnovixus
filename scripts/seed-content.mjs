import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import offerings from "../src/data/legacy-learning-offerings.json" with { type: "json" };
import { getGoogleDriveImageUrl } from "../src/lib/google-drive-image-url.js";

function readLocalMongoUri() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error("Missing .env.local. Configure the local development MONGODB_URI first.");
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

const [
  { default: connectDB },
  { default: Research },
  { default: Project },
  { default: Service },
  { default: LearningOffering },
  { default: GalleryImage },
  { default: User },
] = await Promise.all([
  import("../src/lib/mongodb.js"),
  import("../src/models/Research.js"),
  import("../src/models/Project.js"),
  import("../src/models/Service.js"),
  import("../src/models/LearningOffering.js"),
  import("../src/models/GalleryImage.js"),
  import("../src/models/User.js"),
]);

const sampleData = {
  research: [
    {
      title: "Applied Computer Vision Research Support",
      description:
        "Support for research planning, computer vision experiments, literature review, and preparation of clear technical reports.",
      category: "Research Support",
      domain: "Computer Vision",
      services: ["Literature review", "Experiment planning", "Technical editing"],
      features: ["Reproducible research workflow", "Publication-ready documentation"],
      deliveryTime: "2-4 weeks",
      popularity: 88,
      rating: 4.8,
      icon: "brain",
      color: "primary",
      isActive: true,
    },
    {
      title: "Sustainable Engineering Research",
      description:
        "Guidance for engineering studies focused on sustainable materials, efficient systems, and evidence-based evaluation.",
      category: "Engineering Research",
      domain: "Sustainable Engineering",
      services: ["Research design", "Data analysis", "Manuscript preparation"],
      features: ["Clear methodology", "Structured results and discussion"],
      deliveryTime: "3-6 weeks",
      popularity: 76,
      rating: 4.7,
      icon: "leaf",
      color: "success",
      isActive: true,
    },
  ],
  projects: [
    {
      title: "Smart Energy Monitoring Dashboard",
      description:
        "An engineering project that collects energy-use measurements and presents consumption trends through a responsive monitoring dashboard.",
      shortDescription:
        "Monitor energy use and explore consumption trends in a responsive dashboard.",
      category: "IoT",
      domain: ["IoT", "Data Analytics", "Frontend"],
      technologies: ["React", "Node.js", "MongoDB"],
      pricing: { basePrice: 250, currency: "USD", isOnSale: false },
      features: ["Live monitoring view", "Usage summaries", "Responsive dashboard"],
      difficulty: "intermediate",
      estimatedTime: "4-6 weeks",
      requirements: ["Basic JavaScript knowledge"],
      deliverables: ["Source code", "Project documentation"],
      isActive: true,
      isFeatured: true,
      tags: ["energy", "iot", "dashboard"],
    },
    {
      title: "Machine Learning Quality Classifier",
      description:
        "A sample machine learning project that prepares a labeled dataset, trains a classification model, and reports evaluation results.",
      shortDescription:
        "Build and evaluate a machine learning classifier with documented results.",
      category: "AI/ML",
      domain: ["Artificial Intelligence", "Machine Learning", "Data Analytics"],
      technologies: ["Python", "scikit-learn", "Jupyter"],
      pricing: { basePrice: 300, currency: "USD", isOnSale: false },
      features: ["Dataset preparation", "Model evaluation", "Reproducible notebook"],
      difficulty: "intermediate",
      estimatedTime: "3-5 weeks",
      requirements: ["Basic Python knowledge"],
      deliverables: ["Notebook", "Evaluation summary"],
      isActive: true,
      isFeatured: false,
      tags: ["machine-learning", "classification", "python"],
    },
  ],
  services: [
    {
      name: "Research Manuscript Preparation",
      description:
        "Editorial and structural support to help organize research manuscripts, improve clarity, and prepare submissions for academic review.",
      shortDescription:
        "Organize and refine an academic manuscript for a clear submission-ready draft.",
      category: "Research Publication",
      subcategory: "Manuscript Editing",
      pricing: { startingPrice: 150, currency: "USD", pricingModel: "fixed" },
      features: ["Structure and clarity review", "Citation consistency check"],
      deliveryTime: "1-2 weeks",
      requirements: ["A complete draft and target journal or conference"],
      deliverables: ["Edited manuscript", "Revision notes"],
      isActive: true,
      isPopular: true,
      tags: ["research", "manuscript", "editing"],
    },
    {
      name: "Engineering Project Consultation",
      description:
        "One-to-one project consultation for scoping engineering work, reviewing design choices, and planning practical implementation steps.",
      shortDescription:
        "Get structured guidance for planning and reviewing an engineering project.",
      category: "Consulting",
      subcategory: "Project Guidance",
      pricing: { startingPrice: 75, currency: "USD", pricingModel: "hourly" },
      features: ["Scope review", "Design feedback", "Actionable next steps"],
      deliveryTime: "By appointment",
      requirements: ["Project brief and current progress"],
      deliverables: ["Consultation summary"],
      isActive: true,
      isPopular: false,
      tags: ["engineering", "consulting", "project"],
    },
  ],
};

const galleryUrls = [
  process.env.SEED_GALLERY_IMAGE_URL_1,
  process.env.SEED_GALLERY_IMAGE_URL_2,
].filter(Boolean);

if (
  galleryUrls.some((url) => !getGoogleDriveImageUrl(url)) ||
  new Set(galleryUrls).size !== galleryUrls.length
) {
  throw new Error(
    "SEED_GALLERY_IMAGE_URL_1 and _2 must be different, publicly viewable Google Drive file URLs."
  );
}

const gallerySeed = galleryUrls.map((url, index) => ({
  url: url.trim(),
  altText:
    index === 0
      ? "Sample image for a learning and engineering event"
      : "Sample image for a course and project showcase",
  caption:
    index === 0
      ? "Sample gallery entry. Replace this caption with the real event details."
      : "Sample gallery entry. Replace this caption with the real course details.",
  category: index === 0 ? "event" : "course",
  isActive: true,
}));

async function validateSeedData() {
  const admin = await User.findOne({ role: "admin" }).select("_id");
  if (gallerySeed.length > 0 && !admin) {
    throw new Error(
      "Create the local admin with `npm run provision:admin` before seeding Gallery entries."
    );
  }

  for (const record of sampleData.research) await new Research(record).validate();
  for (const record of sampleData.projects) await new Project(record).validate();
  for (const record of sampleData.services) await new Service(record).validate();
  for (const record of offerings) await new LearningOffering(record).validate();
  for (const record of gallerySeed) {
    await new GalleryImage({ ...record, postedBy: admin._id }).validate();
  }

  return admin;
}

async function seedCollection(Model, records, collectionName, extra = () => ({})) {
  const existingCount = await Model.countDocuments();
  if (existingCount > 0) {
    console.log(`${collectionName}: skipped; already contains ${existingCount} record(s).`);
    return;
  }
  if (records.length === 0) {
    console.log(`${collectionName}: skipped; provide public Google Drive URL(s) to seed Gallery.`);
    return;
  }

  await Model.insertMany(records.map((record) => ({ ...record, ...extra() })), {
    ordered: true,
  });
  console.log(`${collectionName}: inserted ${records.length} sample record(s).`);
}

async function seed() {
  await connectDB();
  const admin = await validateSeedData();

  await seedCollection(Research, sampleData.research, "Research");
  await seedCollection(Project, sampleData.projects, "Projects");
  await seedCollection(Service, sampleData.services, "Services");
  await seedCollection(LearningOffering, offerings, "Learning Hub");
  await seedCollection(
    GalleryImage,
    gallerySeed,
    "Gallery",
    () => ({ postedBy: admin._id })
  );

  console.log("Local content seed complete.");
}

try {
  await seed();
} catch (error) {
  console.error("Local content seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
