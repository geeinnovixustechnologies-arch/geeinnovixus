import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
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
    const searchTerm = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    let query = {};

    // Search functionality
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by status
    if (status) {
      query.isActive = status === "active";
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
      case "name":
        sortOptions.name = sortOrder === "asc" ? 1 : -1;
        break;
      case "email":
        sortOptions.email = sortOrder === "asc" ? 1 : -1;
        break;
      case "role":
        sortOptions.role = sortOrder === "asc" ? 1 : -1;
        break;
      case "lastLogin":
        sortOptions.lastLogin = sortOrder === "asc" ? 1 : -1;
        break;
      default:
        sortOptions.createdAt = sortOrder === "asc" ? 1 : -1;
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-passwordHash")
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json(
      {
        users,
        totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Error fetching users", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();

    // Basic validation
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      typeof body.name !== "string" ||
      !body.name.trim() ||
      typeof body.email !== "string" ||
      !body.email.trim()
    ) {
      return NextResponse.json(
        { message: "Name and email are required" },
        { status: 400 }
      );
    }
    if (body.role === "admin") {
      return NextResponse.json(
        { message: "Administrator accounts must be provisioned locally" },
        { status: 403 }
      );
    }
    if (body.role !== undefined && !["client", "editor"].includes(body.role)) {
      return NextResponse.json({ message: "Invalid user role" }, { status: 400 });
    }
    if (
      body.isActive !== undefined &&
      typeof body.isActive !== "boolean"
    ) {
      return NextResponse.json({ message: "isActive must be a boolean" }, { status: 400 });
    }
    const email = body.email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const newUser = await User.create({
      name: body.name,
      email,
      phone: body.phone || "",
      role: body.role || "client",
      isActive: body.isActive !== undefined ? body.isActive : true,
      preferences: {
        notifications: {
          email:
            body.emailNotifications !== undefined
              ? body.emailNotifications
              : true,
          sms:
            body.smsNotifications !== undefined ? body.smsNotifications : false,
        },
        theme: body.theme || "system",
      },
    });

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating user", error: error.message },
      { status: 500 }
    );
  }
}
