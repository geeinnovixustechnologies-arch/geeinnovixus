import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb.js";
import AccessRequest from "@/models/AccessRequest.js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth.js";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const query = { user: session.user.id };
    if (projectId) query.project = projectId;

    const accessRequests = await AccessRequest.find(query)
      .populate("project", "title category pricing")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: accessRequests });
  } catch (error) {
    console.error("Error fetching access request history:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch access request history" },
      { status: 500 }
    );
  }
}
