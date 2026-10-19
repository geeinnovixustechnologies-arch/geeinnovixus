import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb.js";
import Service from "@/models/Service.js";
import { serviceValidation } from "@/lib/validations.js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";
import { createPublicContentCache, invalidatePublicContent } from "@/lib/content-cache.js";

const MAX_LIMIT = 100;
const SORT_FIELDS = new Set(["createdAt", "name", "orderCount", "rating.average"]);

function safeInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function loadServices({ page, limit, category, subcategory, popular, search, sortBy, sortOrder }) {
  await connectDB();
  const query = { isActive: true };
  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (popular === "true") query.isPopular = true;
  if (search) {
    const matcher = new RegExp(escapeRegex(search.trim()), "i");
    query.$or = [
      { name: matcher }, { description: matcher },
      { shortDescription: matcher }, { tags: { $in: [matcher] } },
    ];
  }
  const sortObj = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const [services, totalServices] = await Promise.all([
    Service.find(query).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
    Service.countDocuments(query),
  ]);
  const totalPages = Math.ceil(totalServices / limit);
  return { services, totalServices, page, limit, totalPages,
    hasNextPage: page < totalPages, hasPrevPage: page > 1 };
}

const getCachedServices = createPublicContentCache("public-services-v1", "public-services", loadServices);

// GET /api/services - Get all services
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = safeInteger(searchParams.get("page"), 1);
    const limit = Math.min(safeInteger(searchParams.get("limit"), 12), MAX_LIMIT);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const popular = searchParams.get("popular");
    const search = searchParams.get("search");
    const requestedSort = searchParams.get("sortBy") || "createdAt";
    const sortBy = SORT_FIELDS.has(requestedSort) ? requestedSort : "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Check if this is an admin request
    const session = await getServerSession(authOptions);
    const isAdmin = session && session.user.role === "admin";

    const options = { page, limit, category, subcategory, popular, search, sortBy, sortOrder };
    let data;
    if (isAdmin) {
      await connectDB();
      const query = {};
      if (category) query.category = category;
      if (subcategory) query.subcategory = subcategory;
      if (popular === "true") query.isPopular = true;
      if (search) {
        const matcher = new RegExp(escapeRegex(search.trim()), "i");
        query.$or = [
          { name: matcher }, { description: matcher },
          { shortDescription: matcher }, { tags: { $in: [matcher] } },
        ];
      }
      const sortObj = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
      const [services, totalServices] = await Promise.all([
        Service.find(query).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
        Service.countDocuments(query),
      ]);
      const totalPages = Math.ceil(totalServices / limit);
      data = { services, totalServices, page, limit, totalPages,
        hasNextPage: page < totalPages, hasPrevPage: page > 1 };
    } else {
      data = await getCachedServices(options);
    }

    return NextResponse.json(
      data,
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch services" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

// POST /api/services - Create new service (Admin only)
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
    const validation = serviceValidation.create.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (validation.error) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          })),
        },
        { status: 400 }
      );
    }

    const service = new Service(validation.value);
    await service.save();
    invalidatePublicContent("public-services");

    return NextResponse.json(
      {
        success: true,
        message: "Service created successfully",
        data: service,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create service" },
      { status: 500 }
    );
  }
}
