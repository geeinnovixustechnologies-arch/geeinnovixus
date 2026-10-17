import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const user = await User.findById(id).select("-passwordHash");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Error fetching user", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Request body must be an object" }, { status: 400 });
    }

    const existingUser = await User.findById(id).select("role");
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (
      (body.role === "admin" && existingUser.role !== "admin") ||
      (existingUser.role === "admin" && body.role !== "admin") ||
      (existingUser.role === "admin" && body.isActive === false)
    ) {
      return NextResponse.json(
        { message: "Administrator accounts must be provisioned locally" },
        { status: 403 }
      );
    }
    if (
      body.role !== undefined &&
      !["admin", "client", "editor"].includes(body.role)
    ) {
      return NextResponse.json({ message: "Invalid user role" }, { status: 400 });
    }

    const allowedFields = [
      "name",
      "email",
      "phone",
      "role",
      "isActive",
      "preferences",
      "avatar",
    ];
    const updateData = Object.fromEntries(
      allowedFields
        .filter((field) => Object.hasOwn(body, field))
        .map((field) => [field, body[field]])
    );
    if (typeof updateData.email === "string") {
      updateData.email = updateData.email.trim().toLowerCase();
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Error updating user", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const userToDelete = await User.findById(id).select("role");
    if (!userToDelete) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (userToDelete.role === "admin") {
      return NextResponse.json(
        { message: "The administrator account cannot be deleted here" },
        { status: 403 }
      );
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user", error: error.message },
      { status: 500 }
    );
  }
}
