import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb.js";
import AccessRequest from "@/models/AccessRequest.js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";

// POST /api/access-requests - Create new access request
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      projectId,
      paymentProof,
      paymentMethod,
      paymentAmount,
      paymentCurrency,
      transactionId,
      message,
    } = body;

    // Validate required fields
    if (
      !projectId ||
      !paymentProof ||
      !paymentMethod ||
      !paymentAmount ||
      !transactionId
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already has an approved request for this project
    const existingApprovedRequest = await AccessRequest.hasActiveAccess(
      session.user.id,
      projectId
    );

    if (existingApprovedRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "You already have approved access to this project",
        },
        { status: 400 }
      );
    }

    // Check if user has a pending request for this project
    const existingPendingRequest = await AccessRequest.findOne({
      user: session.user.id,
      project: projectId,
      status: "pending",
    });

    if (existingPendingRequest) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You already have a pending request for this project. Please wait for admin review or contact us on WhatsApp.",
        },
        { status: 400 }
      );
    }

    // Create new access request
    const accessRequest = new AccessRequest({
      user: session.user.id,
      project: projectId,
      paymentProof,
      paymentMethod,
      paymentAmount,
      paymentCurrency: paymentCurrency || "USD",
      transactionId,
      message,
    });

    await accessRequest.save();

    // Populate the response
    await accessRequest.populate([
      { path: "user", select: "name email" },
      { path: "project", select: "title category" },
    ]);

    return NextResponse.json({
      success: true,
      message: "Access request submitted successfully",
      data: accessRequest,
    });
  } catch (error) {
    console.error("Error creating access request:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create access request" },
      { status: 500 }
    );
  }
}
