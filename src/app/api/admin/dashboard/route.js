import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import {
  User,
  Project,
  Service,
  Inquiry,
} from "@/models";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Get all statistics in parallel
    const [
      totalProjects,
      totalServices,
      totalUsers,
      totalInquiries,
      pendingInquiries,
    ] = await Promise.all([
      Project.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: "pending" }),
    ]);

    const recentInquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(5);
    const recentActivity = recentInquiries.map((inquiry) => ({
      id: inquiry._id,
      type: "inquiry",
      title: "New inquiry submitted",
      description: inquiry.subject,
      timestamp: inquiry.createdAt,
    }));

    const stats = {
      totalProjects,
      totalServices,
      totalUsers,
      totalInquiries,
      pendingInquiries,
    };

    return NextResponse.json({ stats, recentActivity }, { status: 200 });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { message: "Error fetching dashboard data", error: error.message },
      { status: 500 }
    );
  }
}
