import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb.js";
import Service from "@/models/Service.js";
import { serviceValidation } from "@/lib/validations.js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";

// GET /api/services/[id] - Get single service
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const service = await Service.findOne({
      _id: id,
      isActive: true,
    }).lean();

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: service,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch service" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

// PUT /api/services/[id] - Update service (Admin only)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const validation = serviceValidation.update.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (validation.error || Object.keys(validation.value || {}).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error
            ? validation.error.details.map((detail) => detail.message).join(", ")
            : "At least one supported field is required.",
        },
        { status: 400 }
      );
    }

    const service = await Service.findByIdAndUpdate(id, validation.value, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update service" },
      { status: 500 }
    );
  }
}

// DELETE /api/services/[id] - Delete service (Admin only)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const service = await Service.findByIdAndDelete(id);

    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service permanently deleted",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete service" },
      { status: 500 }
    );
  }
}
