import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30d";
    const now = new Date();
    const startDate = new Date(now);

    switch (range) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case "30d":
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);

    const [
      totalUsers,
      totalProjects,
      usersBeforeLastMonth,
      projectsBeforeLastMonth,
      chartData,
      topProjects,
      recentActivity,
    ] = await Promise.all([
        User.countDocuments(),
        Project.countDocuments(),
        User.countDocuments({ createdAt: { $lt: lastMonth } }),
        Project.countDocuments({ createdAt: { $lt: lastMonth } }),
        getChartData(startDate, now),
        Project.find({ isActive: true })
          .sort({ views: -1 })
          .limit(5)
          .select("title views")
          .lean(),
        getRecentActivity(),
      ]);

    return NextResponse.json(
      {
        overview: {
          totalUsers,
          totalProjects,
          monthlyGrowth: {
            users:
              usersBeforeLastMonth > 0
                ? ((totalUsers - usersBeforeLastMonth) /
                    usersBeforeLastMonth) *
                  100
                : 0,
            projects:
              projectsBeforeLastMonth > 0
                ? ((totalProjects - projectsBeforeLastMonth) /
                    projectsBeforeLastMonth) *
                  100
                : 0,
          },
        },
        charts: {
          ...chartData,
          topProjects: topProjects.map((project) => ({
            name: project.title,
            views: project.views || 0,
          })),
        },
        recentActivity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { message: "Error fetching analytics", error: error.message },
      { status: 500 }
    );
  }
}

async function getChartData(startDate, endDate) {
  const [userGrowth, projectViews] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]),
    Project.aggregate([
      { $match: { updatedAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" },
            day: { $dayOfMonth: "$updatedAt" },
          },
          totalViews: { $sum: "$views" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]),
  ]);

  const formatDate = ({ _id }) =>
    `${_id.year}-${String(_id.month).padStart(2, "0")}-${String(
      _id.day
    ).padStart(2, "0")}`;

  return {
    userGrowth: userGrowth.map((item) => ({
      date: formatDate(item),
      users: item.count,
    })),
    projectViews: projectViews.map((item) => ({
      date: formatDate(item),
      views: item.totalViews,
    })),
  };
}

async function getRecentActivity() {
  const [recentUsers, recentProjects] = await Promise.all([
    User.find().sort({ createdAt: -1 }).limit(3).lean(),
    Project.find().sort({ createdAt: -1 }).limit(3).lean(),
  ]);

  return [
    ...recentUsers.map((user) => ({
      type: "user",
      message: `New user registration: ${user.name}`,
      timestamp: user.createdAt,
    })),
    ...recentProjects.map((project) => ({
      type: "project",
      message: `Project '${project.title}' published`,
      timestamp: project.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
}
