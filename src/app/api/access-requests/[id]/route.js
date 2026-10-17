import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb.js";
import AccessRequest from "@/models/AccessRequest.js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";

// GET /api/access-requests/[id] - Get single access request
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    // Await params before using its properties
    const { id } = await params;

    const accessRequest = await AccessRequest.findById(id)
      .populate("user", "name email")
      .populate("project", "title category pricing")
      .populate("approvedBy", "name")
      .lean();

    if (!accessRequest) {
      return NextResponse.json(
        { success: false, message: "Access request not found" },
        { status: 404 }
      );
    }

    // Check if user can view this request (owner or admin)
    if (
      accessRequest.user._id.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: accessRequest,
    });
  } catch (error) {
    console.error("Error fetching access request:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch access request" },
      { status: 500 }
    );
  }
}
