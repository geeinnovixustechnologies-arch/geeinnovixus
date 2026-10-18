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

function validateMongoUri(value, allowRemote) {
  let uri;
  try {
    uri = new URL(value);
  } catch {
    throw new Error("MONGODB_URI is not a valid MongoDB connection URI.");
  }

  const isLoopback = ["127.0.0.1", "localhost", "[::1]"].includes(uri.hostname);
  const databaseName = decodeURIComponent(uri.pathname.slice(1));
  if (!["mongodb:", "mongodb+srv:"].includes(uri.protocol) || !databaseName) {
    throw new Error("MONGODB_URI must be a valid MongoDB URI with a database name.");
  }

  if (!allowRemote && (uri.protocol !== "mongodb:" || !isLoopback || uri.username || uri.password || databaseName !== "geeinnovixus_dev")) {
    throw new Error(
      "Seed blocked: MONGODB_URI must target the local geeinnovixus_dev database without credentials."
    );
  }

  if (allowRemote && isLoopback) {
    throw new Error("--allow-remote requires a non-local MongoDB URI.");
  }

  return value;
}

const args = process.argv.slice(2);
const allowRemote = args.includes("--allow-remote");
if (args.some((arg) => arg !== "--allow-remote")) {
  throw new Error("Usage: node scripts/seed-content.mjs [--allow-remote]");
}

const mongoUri = validateMongoUri(readLocalMongoUri(), allowRemote);
process.env.MONGODB_URI = mongoUri;
if (allowRemote) {
  const databaseName = decodeURIComponent(new URL(mongoUri).pathname.slice(1));
  console.warn(`Remote seeding enabled for database "${databaseName}". Verify the target before continuing.`);
}

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
    {
      title: "Research Publication Support",
      description:
        "Structured support for literature reviews, research design, data interpretation, and preparing a clear manuscript for journal or conference submission.",
      category: "Research Publication",
      domain: "Multidisciplinary Research",
      services: ["Literature review", "Research methodology", "Manuscript preparation"],
      features: ["Citation and structure review", "Journal-ready formatting", "Revision guidance"],
      deliveryTime: "2-4 weeks",
      popularity: 82,
      rating: 4.8,
      icon: "book-open",
      color: "info",
      isActive: true,
    },
    {
      title: "AI and Data Science Research",
      description:
        "Practical research support for data preparation, model selection, evaluation, and reproducible reporting in AI and data science projects.",
      category: "Applied Research",
      domain: "Artificial Intelligence",
      services: ["Dataset review", "Model evaluation", "Statistical analysis"],
      features: ["Reproducible notebooks", "Transparent evaluation", "Readable technical reports"],
      deliveryTime: "3-6 weeks",
      popularity: 79,
      rating: 4.7,
      icon: "brain",
      color: "primary",
      isActive: true,
    },
    {
      title: "Prototype and Product Development",
      description:
        "Early-stage technical guidance to turn a defined engineering or software concept into a scoped, testable prototype plan.",
      category: "Product Development",
      domain: "Engineering Design",
      services: ["Requirements review", "Prototype planning", "Design iteration"],
      features: ["Milestone-based scope", "Design review", "Prototype documentation"],
      deliveryTime: "2-8 weeks",
      popularity: 73,
      rating: 4.6,
      icon: "lightbulb",
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
    {
      title: "Computer Vision Quality Inspection",
      description:
        "A demonstration project that uses an image dataset to classify common product defects and summarizes model performance for review.",
      shortDescription: "Explore an image classification workflow for quality inspection.",
      category: "AI/ML",
      domain: ["Artificial Intelligence", "Computer Vision", "Machine Learning"],
      technologies: ["Python", "OpenCV", "PyTorch", "Jupyter"],
      pricing: { basePrice: 350, currency: "USD", isOnSale: false },
      features: ["Dataset preparation", "Model evaluation", "Documented inference workflow"],
      difficulty: "advanced",
      estimatedTime: "5-7 weeks",
      requirements: ["Python fundamentals", "Sample image dataset"],
      deliverables: ["Source code", "Reproducible notebook", "Technical report"],
      isActive: true,
      isFeatured: true,
      tags: ["computer-vision", "quality-inspection", "python"],
    },
    {
      title: "Secure Research Data Portal",
      description:
        "A starter web application concept for organizing research datasets with role-aware access, metadata, and a searchable catalog.",
      shortDescription: "Organize research datasets in a searchable, access-aware portal.",
      category: "Web Development",
      domain: ["Full Stack", "Backend", "Frontend"],
      technologies: ["Next.js", "Node.js", "MongoDB"],
      pricing: { basePrice: 400, currency: "USD", isOnSale: false },
      features: ["Dataset catalog", "Role-aware access concept", "Responsive interface"],
      difficulty: "intermediate",
      estimatedTime: "4-6 weeks",
      requirements: ["Project brief", "Sample metadata fields"],
      deliverables: ["Source code", "Setup guide", "Project documentation"],
      isActive: true,
      isFeatured: false,
      tags: ["research", "web-app", "data-management"],
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
    {
      name: "Patent Search and Drafting Support",
      description:
        "Early-stage support for organizing an invention disclosure, reviewing search results, and preparing materials for discussion with a qualified patent professional.",
      shortDescription: "Organize invention details and prepare for a professional IP review.",
      category: "Consulting",
      subcategory: "Intellectual Property",
      pricing: { startingPrice: 200, currency: "USD", pricingModel: "per_project", customPricing: true },
      features: ["Invention disclosure checklist", "Prior-art search summary", "Drafting coordination"],
      deliveryTime: "2-4 weeks",
      requirements: ["Invention summary", "Relevant drawings or background materials"],
      deliverables: ["Organized disclosure document", "Search summary", "Next-step checklist"],
      isActive: true,
      isPopular: false,
      tags: ["patent", "intellectual-property", "research"],
    },
    {
      name: "Academic Similarity and Citation Review",
      description:
        "A pre-submission review of citation consistency, quotation practices, and text similarity indicators to help authors identify passages that need attention.",
      shortDescription: "Review citations and similarity flags before academic submission.",
      category: "Research Publication",
      subcategory: "Quality Assurance",
      pricing: { startingPrice: 40, currency: "USD", pricingModel: "per_project" },
      features: ["Citation consistency review", "Similarity report interpretation", "Actionable revision notes"],
      deliveryTime: "1-3 business days",
      requirements: ["Editable manuscript", "Required citation style"],
      deliverables: ["Review notes", "Citation checklist"],
      isActive: true,
      isPopular: true,
      tags: ["academic-writing", "citations", "quality-review"],
    },
    {
      name: "Manuscript Structure and Editing",
      description:
        "Editorial support to improve the organization, clarity, and consistency of a research manuscript while preserving the authors' technical meaning.",
      shortDescription: "Improve manuscript structure, readability, and submission readiness.",
      category: "Research Publication",
      subcategory: "Writing and Editing",
      pricing: { startingPrice: 120, currency: "USD", pricingModel: "per_project", customPricing: true },
      features: ["Section structure review", "Language and clarity edits", "Formatting checklist"],
      deliveryTime: "1-3 weeks",
      requirements: ["Complete draft", "Target journal or conference guidelines"],
      deliverables: ["Edited draft", "Revision notes", "Submission checklist"],
      isActive: true,
      isPopular: true,
      tags: ["manuscript", "editing", "publication"],
    },
    {
      name: "Engineering Prototype Planning",
      description:
        "A scoped planning service for engineering prototypes, covering requirements, material or software choices, test criteria, and staged milestones.",
      shortDescription: "Turn an early engineering idea into a practical prototype plan.",
      category: "Academic Projects",
      subcategory: "Prototyping",
      pricing: { startingPrice: 180, currency: "USD", pricingModel: "per_project", customPricing: true },
      features: ["Requirements breakdown", "Prototype milestone plan", "Test and documentation outline"],
      deliveryTime: "2-4 weeks",
      requirements: ["Project brief", "Constraints and intended use"],
      deliverables: ["Prototype plan", "Milestone checklist", "Design review notes"],
      isActive: true,
      isPopular: false,
      tags: ["engineering", "prototype", "design"],
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
  if (records.length === 0) {
    console.log(`${collectionName}: skipped; provide public Google Drive URL(s) to seed Gallery.`);
    return;
  }

  let inserted = 0;
  let present = 0;
  for (const record of records) {
    const identity = record.title
      ? { title: record.title }
      : record.name
        ? { name: record.name }
        : { url: record.url };
    const result = await Model.updateOne(
      identity,
      { $setOnInsert: { ...record, ...extra() } },
      { upsert: true, runValidators: true }
    );
    if (result.upsertedCount) inserted += 1;
    else present += 1;
  }
  console.log(`${collectionName}: ${inserted} added, ${present} already present.`);
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

  console.log("Local starter content seed complete. Review sample copy before publishing it.");
}

try {
  await seed();
} catch (error) {
  console.error("Local content seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
