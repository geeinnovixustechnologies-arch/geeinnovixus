import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb.js";
import { authOptions } from "@/lib/auth.js";
import GalleryImage from "@/models/GalleryImage.js";
import {
  getGoogleDriveImageProxyUrl,
  getGoogleDriveImageUrl,
} from "@/lib/google-drive-image-url.js";

const MAX_LIMIT = 100;

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const includeInactive =
      session?.user?.role === "admin" &&
      searchParams.get("includeInactive") === "true";
    const page = positiveInteger(searchParams.get("page"), 1);
    const limit = Math.min(
      positiveInteger(searchParams.get("limit"), 24),
      MAX_LIMIT
    );
    const query = includeInactive ? {} : { isActive: true };
    const [images, total] = await Promise.all([
      GalleryImage.find(query)
        .select("-postedBy")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      GalleryImage.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        images: images.map((image) => ({
          ...image,
          displayUrl: getGoogleDriveImageProxyUrl(image.url),
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json(
      { message: "Failed to fetch gallery images" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }
    if (!session.user.id) {
      return NextResponse.json({ message: "Admin identity is unavailable" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: "Invalid JSON request body" }, { status: 400 });
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Request body must be an object" }, { status: 400 });
    }
    const { url, altText, caption, category } = body;
    if (
      !getGoogleDriveImageUrl(url) ||
      typeof altText !== "string" ||
      !altText.trim() ||
      typeof caption !== "string" ||
      !caption.trim() ||
      !["event", "course"].includes(category)
    ) {
      return NextResponse.json(
        {
          message:
            "A valid HTTPS Google Drive image URL, alt text, caption, and category are required",
        },
        { status: 400 }
      );
    }
    if (altText.trim().length > 300 || caption.trim().length > 500) {
      return NextResponse.json(
        { message: "Alt text must be at most 300 characters and caption at most 500" },
        { status: 400 }
      );
    }
    await connectDB();
    const image = await GalleryImage.create({
      url: url.trim(),
      altText: altText.trim(),
      caption: caption.trim(),
      category,
      postedBy: session.user.id,
      isActive: true,
    });
    const publicImage = image.toObject();
    delete publicImage.postedBy;
    publicImage.displayUrl = getGoogleDriveImageProxyUrl(publicImage.url);
    return NextResponse.json({ image: publicImage }, { status: 201 });
  } catch (error) {
    console.error("Error creating gallery entry:", error);
    if (error.name === "ValidationError") {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Failed to add gallery entry" },
      { status: 500 }
    );
  }
}
