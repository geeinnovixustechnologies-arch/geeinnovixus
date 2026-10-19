import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb.js";
import Project from "@/models/Project.js";
import { projectValidation, validateData } from "@/lib/validations.js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createPublicContentCache,
  invalidatePublicContent,
} from "@/lib/content-cache.js";

const MAX_LIMIT = 100;
const SORT_FIELDS = new Set([
  "createdAt",
  "title",
  "pricing.basePrice",
  "views",
  "rating.average",
]);

function safeInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function loadProjects({ page, limit, category, domain, technology, difficulty, search, featured, sortBy, sortOrder }) {
  await connectDB();
  const query = { isActive: true };
  if (category) query.category = category;
  if (domain) query.domain = { $in: [domain] };
  if (technology) query.technologies = { $in: [technology] };
  if (difficulty) query.difficulty = difficulty;
  if (featured === "true") query.isFeatured = true;
  if (search) {
    const matcher = new RegExp(escapeRegex(search.trim()), "i");
    query.$or = [
      { title: matcher },
      { shortDescription: matcher },
      { description: matcher },
      { tags: { $in: [matcher] } },
    ];
  }
  const sortObj = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const [projects, total] = await Promise.all([
    Project.find(query).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
    Project.countDocuments(query),
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    projects,
    totalProjects: total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

const getCachedProjects = createPublicContentCache(
  "public-projects-v1",
  "public-projects",
  loadProjects
);

// GET /api/projects - Get all projects
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = safeInteger(searchParams.get("page"), 1);
    const limit = Math.min(safeInteger(searchParams.get("limit"), 12), MAX_LIMIT);
    const category = searchParams.get("category");
    const domain = searchParams.get("domain");
    const technology = searchParams.get("technology");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const requestedSort = searchParams.get("sortBy") || "createdAt";
    const sortBy = SORT_FIELDS.has(requestedSort) ? requestedSort : "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Check if this is an admin request
    const session = await getServerSession(authOptions);
    const isAdmin = session && session.user.role === "admin";

    const options = {
      page, limit, category, domain, technology, difficulty, search,
      featured, sortBy, sortOrder,
    };
    const data = isAdmin
      ? await (async () => {
          await connectDB();
          const query = {};
          if (category) query.category = category;
          if (domain) query.domain = { $in: [domain] };
          if (technology) query.technologies = { $in: [technology] };
          if (difficulty) query.difficulty = difficulty;
          if (featured === "true") query.isFeatured = true;
          if (search) {
            const matcher = new RegExp(escapeRegex(search.trim()), "i");
            query.$or = [
              { title: matcher }, { shortDescription: matcher },
              { description: matcher }, { tags: { $in: [matcher] } },
            ];
          }
          const sortObj = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
          const [projects, total] = await Promise.all([
            Project.find(query).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
            Project.countDocuments(query),
          ]);
          const totalPages = Math.ceil(total / limit);
          return { projects, totalProjects: total, page, limit, totalPages,
            hasNextPage: page < totalPages, hasPrevPage: page > 1 };
        })()
      : await getCachedProjects(options);

    return NextResponse.json(
      data,
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch projects" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

// POST /api/projects - Create new project (Admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    // Validate data
    const validation = validateData(body, projectValidation.create);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const project = new Project(validation.data);
    await project.save();
    invalidatePublicContent("public-projects");

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        data: project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create project" },
      { status: 500 }
    );
  }
}
