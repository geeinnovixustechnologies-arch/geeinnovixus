import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Research from "@/models/Research";
import { validateResearchBody } from "@/lib/research-validation";
import { createPublicContentCache, invalidatePublicContent } from "@/lib/content-cache.js";

function isAdmin(session) {
  return session?.user?.role === "admin";
}

async function loadPublicResearch() {
  await connectDB();
  return Research.find({ isActive: true }).sort({ createdAt: -1 }).lean();
}

const getCachedResearch = createPublicContentCache(
  "public-research-v1", "public-research", loadPublicResearch
);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    let research;
    if (isAdmin(session)) {
      await connectDB();
      research = await Research.find({}).sort({ createdAt: -1 }).lean();
    } else {
      research = await getCachedResearch();
    }
    return NextResponse.json(
      { research },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching research:", error);
    return NextResponse.json(
      { message: "Failed to fetch research." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!isAdmin(session)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const validationError = validateResearchBody(body);
    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }
    await connectDB();
    const research = await Research.create(body);
    invalidatePublicContent("public-research");
    return NextResponse.json({ research }, { status: 201 });
  } catch (error) {
    console.error("Error creating research:", error);
    return NextResponse.json(
      { message: "Failed to create research." },
      { status: 500 }
    );
  }
}
