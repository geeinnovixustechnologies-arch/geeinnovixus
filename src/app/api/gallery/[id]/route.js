import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb.js";
import { authOptions } from "@/lib/auth.js";
import GalleryImage from "@/models/GalleryImage.js";
import {
  getGoogleDriveImageProxyUrl,
  getGoogleDriveImageUrl,
} from "@/lib/google-drive-image-url.js";

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Gallery image not found" }, { status: 404 });
    }
    const body = await request.json();
    const fields = ["url", "altText", "caption", "category"];
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).some((field) => !fields.includes(field))
    ) {
      return NextResponse.json({ message: "Invalid gallery update." }, { status: 400 });
    }
    const url = body.url;
    const altText = body.altText;
    const caption = body.caption;
    const category = body.category;
    if (
      (url !== undefined && !getGoogleDriveImageUrl(url)) ||
      (altText !== undefined &&
        (typeof altText !== "string" || !altText.trim() || altText.trim().length > 300)) ||
      (caption !== undefined &&
        (typeof caption !== "string" || !caption.trim() || caption.trim().length > 500)) ||
      (category !== undefined && !["event", "course"].includes(category)) ||
      Object.keys(body).length === 0
    ) {
      return NextResponse.json(
        { message: "Provide valid Google Drive image metadata." },
        { status: 400 }
      );
    }

    const update = {
      ...body,
      ...(typeof url === "string" ? { url: url.trim() } : {}),
      ...(typeof altText === "string" ? { altText: altText.trim() } : {}),
      ...(typeof caption === "string" ? { caption: caption.trim() } : {}),
    };
    await connectDB();
    const image = await GalleryImage.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select("-postedBy");
    if (!image) {
      return NextResponse.json({ message: "Gallery image not found" }, { status: 404 });
    }
    const result = image.toObject();
    result.displayUrl = getGoogleDriveImageProxyUrl(result.url);
    return NextResponse.json({ image: result });
  } catch (error) {
    console.error("Error updating gallery image:", error);
    return NextResponse.json(
      { message: "Failed to update gallery image" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Gallery image not found" }, { status: 404 });
    }
    await connectDB();
    const image = await GalleryImage.findById(id);
    if (!image) {
      return NextResponse.json({ message: "Gallery image not found" }, { status: 404 });
    }

    await GalleryImage.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Gallery entry removed" });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return NextResponse.json(
      { message: "Failed to delete gallery image" },
      { status: 500 }
    );
  }
}
