import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb.js";
import { authOptions } from "@/lib/auth.js";
import LearningOffering from "@/models/LearningOffering.js";

const editableFields = [
  "title",
  "description",
  "shortDescription",
  "category",
  "level",
  "duration",
  "modules",
  "software",
  "features",
  "image",
  "isActive",
];

function validate(body, partial) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be an object";
  }
  for (const field of ["title", "description", "shortDescription", "category", "level", "duration"]) {
    if (!partial || body[field] !== undefined) {
      if (typeof body[field] !== "string" || !body[field].trim()) {
        return `${field} is required`;
      }
    }
  }
  if (body.title?.trim().length > 200) return "title must be at most 200 characters";
  if (body.description?.trim().length > 2000)
    return "description must be at most 2000 characters";
  if (body.shortDescription?.trim().length > 300)
    return "shortDescription must be at most 300 characters";
  if (body.duration?.trim().length > 100) return "duration is too long";
  if (
    body.category !== undefined &&
    !LearningOffering.schema.path("category").enumValues.includes(body.category)
  ) {
    return "category is not supported";
  }
  if (
    body.level !== undefined &&
    !LearningOffering.schema.path("level").enumValues.includes(body.level)
  ) {
    return "level is not supported";
  }
  for (const field of ["modules", "software", "features"]) {
    if (
      body[field] !== undefined &&
      (!Array.isArray(body[field]) ||
        body[field].some((value) => typeof value !== "string"))
    ) {
      return `${field} must be an array of text values`;
    }
  }
  if (body.isActive !== undefined && typeof body.isActive !== "boolean") {
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

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return { response: NextResponse.json({ message: "Authentication required" }, { status: 401 }) };
  if (session.user.role !== "admin") {
    return { response: NextResponse.json({ message: "Admin access required" }, { status: 403 }) };
  }
  return { session };
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Offering not found" }, { status: 404 });
    }
    await connectDB();
    const session = await getServerSession(authOptions);
    const query = { _id: id };
    if (session?.user?.role !== "admin") query.isActive = true;
    const offering = await LearningOffering.findOne(query).lean();
    if (!offering) return NextResponse.json({ message: "Offering not found" }, { status: 404 });
    return NextResponse.json({ offering });
  } catch (error) {
    console.error("Error fetching learning offering:", error);
    return NextResponse.json({ message: "Failed to fetch learning offering" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const access = await requireAdmin();
    if (access.response) return access.response;
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Offering not found" }, { status: 404 });
    }
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON request body" }, { status: 400 });
    }
    const validationError = validate(body, true);
    if (validationError) return NextResponse.json({ message: validationError }, { status: 400 });

    const update = Object.fromEntries(
      editableFields
        .filter((field) => body[field] !== undefined)
        .map((field) => [
          field,
          typeof body[field] === "string" &&
          ["title", "description", "shortDescription", "duration"].includes(field)
            ? body[field].trim()
            : body[field],
        ])
    );
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ message: "No supported fields to update" }, { status: 400 });
    }

    await connectDB();
    const offering = await LearningOffering.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!offering) return NextResponse.json({ message: "Offering not found" }, { status: 404 });
    return NextResponse.json({ offering });
  } catch (error) {
    console.error("Error updating learning offering:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to update learning offering" }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const access = await requireAdmin();
    if (access.response) return access.response;
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Offering not found" }, { status: 404 });
    }
    await connectDB();
    const offering = await LearningOffering.findByIdAndDelete(id);
    if (!offering) return NextResponse.json({ message: "Offering not found" }, { status: 404 });
    return NextResponse.json({ success: true, message: "Offering permanently deleted" });
  } catch (error) {
    console.error("Error deleting learning offering:", error);
    return NextResponse.json({ message: "Failed to delete learning offering" }, { status: 500 });
  }
}
