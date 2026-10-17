import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb.js";
import { authOptions } from "@/lib/auth.js";
import LearningOffering from "@/models/LearningOffering.js";

const MAX_LIMIT = 100;

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateOffering(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be an object";
  }
  const required = [
    "title",
    "description",
    "shortDescription",
    "category",
    "level",
    "duration",
  ];
  for (const field of required) {
    if (typeof body[field] !== "string" || !body[field].trim()) {
      return `${field} is required`;
    }
  }
  if (body.title.trim().length > 200) return "title must be at most 200 characters";
  if (body.description.trim().length > 2000)
    return "description must be at most 2000 characters";
  if (body.shortDescription.trim().length > 300)
    return "shortDescription must be at most 300 characters";
  if (body.duration.trim().length > 100) return "duration is too long";
  if (!LearningOffering.schema.path("category").enumValues.includes(body.category))
    return "category is not supported";
  if (!LearningOffering.schema.path("level").enumValues.includes(body.level))
    return "level is not supported";
  for (const field of ["modules", "software", "features"]) {
    if (body[field] !== undefined && !Array.isArray(body[field])) {
      return `${field} must be an array`;
    }
    if (
      Array.isArray(body[field]) &&
      body[field].some((value) => typeof value !== "string")
    ) {
      return `${field} must contain only text values`;
    }
  }
  if (
    body.isActive !== undefined &&
    typeof body.isActive !== "boolean"
  ) {
    return "isActive must be a boolean";
  }
  if (
    body.image !== undefined &&
    (typeof body.image !== "object" ||
      body.image === null ||
      (body.image.url !== undefined && typeof body.image.url !== "string") ||
      (body.image.altText !== undefined &&
        typeof body.image.altText !== "string"))
  ) {
    return "image must contain text url and altText values";
  }
  return null;
}

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "admin";
    const includeInactive = isAdmin && searchParams.get("includeInactive") === "true";
    const page = positiveInteger(searchParams.get("page"), 1);
    const limit = Math.min(
      positiveInteger(searchParams.get("limit"), 12),
      MAX_LIMIT
    );
    const query = includeInactive ? {} : { isActive: true };
    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category");
    const level = searchParams.get("level");

    if (search) {
      const matcher = new RegExp(escapeRegex(search), "i");
      query.$or = [
        { title: matcher },
        { description: matcher },
        { shortDescription: matcher },
      ];
    }
    if (category && category !== "all") query.category = category;
    if (level && level !== "all") query.level = level;

    const [offerings, total] = await Promise.all([
      LearningOffering.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      LearningOffering.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        offerings,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching learning offerings:", error);
    return NextResponse.json(
      { message: "Failed to fetch learning offerings" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON request body" }, { status: 400 });
    }
    const validationError = validateOffering(body);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    await connectDB();
    const offering = await LearningOffering.create({
      title: body.title.trim(),
      description: body.description.trim(),
      shortDescription: body.shortDescription.trim(),
      category: body.category,
      level: body.level,
      duration: body.duration.trim(),
      modules: body.modules || [],
      software: body.software || [],
      features: body.features || [],
      image: body.image,
      isActive: body.isActive ?? true,
    });

    return NextResponse.json({ offering }, { status: 201 });
  } catch (error) {
    console.error("Error creating learning offering:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Failed to create learning offering" },
      { status: 500 }
    );
  }
}
