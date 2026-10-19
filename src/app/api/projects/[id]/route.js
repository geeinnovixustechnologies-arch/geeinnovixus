import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb.js";
import Project from "@/models/Project.js";
import { projectValidation } from "@/lib/validations.js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";

// GET /api/projects/[id] - Get single project
export async function GET(request, { params }) {
  try {
    await connectDB();

    // Await params before using its properties
    const { id } = await params;

    const project = await Project.findOne({
      _id: id,
      isActive: true,
    }).lean();

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await Project.findByIdAndUpdate(id, {
      $inc: { views: 1 },
    });

    return NextResponse.json(
      {
        success: true,
        data: project,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch project" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

// PUT /api/projects/[id] - Update project (Admin only)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Await params before using its properties
    const { id } = await params;

    const body = await request.json();

    // Validate data
    const validation = projectValidation.update.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (validation.error || Object.keys(validation.value || {}).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.error?.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          })) || [{ message: "At least one supported field is required." }],
        },
        { status: 400 }
      );
    }

    const project = await Project.findByIdAndUpdate(id, validation.value, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project (Admin only)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Await params before using its properties
    const { id } = await params;

    const project = await Project.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete project" },
      { status: 500 }
    );
  }
}
