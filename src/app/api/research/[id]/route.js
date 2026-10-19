import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Research from "@/models/Research";
import { validateResearchBody } from "@/lib/research-validation";
import { invalidatePublicContent } from "@/lib/content-cache.js";

function isAdmin(session) {
  return session?.user?.role === "admin";
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid research ID." }, { status: 400 });
    }
    await connectDB();
    const session = await getServerSession(authOptions);
    const query = { _id: id, ...(isAdmin(session) ? {} : { isActive: true }) };
    const research = await Research.findOne(query).lean();
    if (!research) {
      return NextResponse.json({ message: "Research not found." }, { status: 404 });
    }
    return NextResponse.json(
      { research },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching research:", error);
    return NextResponse.json({ message: "Failed to fetch research." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid research ID." }, { status: 400 });
    }
    const body = await request.json();
    const validationError = validateResearchBody(body, true);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }
    await connectDB();
    const research = await Research.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!research) {
      return NextResponse.json({ message: "Research not found." }, { status: 404 });
    }
    invalidatePublicContent("public-research");
    return NextResponse.json({ research });
  } catch (error) {
    console.error("Error updating research:", error);
    return NextResponse.json({ message: "Failed to update research." }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid research ID." }, { status: 400 });
    }
    await connectDB();
    const research = await Research.findByIdAndDelete(id);
    if (!research) {
      return NextResponse.json({ message: "Research not found." }, { status: 404 });
    }
    invalidatePublicContent("public-research");
    return NextResponse.json({ message: "Research permanently deleted." });
  } catch (error) {
    console.error("Error deleting research:", error);
    return NextResponse.json({ message: "Failed to remove research." }, { status: 500 });
  }
}
