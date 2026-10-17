import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import Research from "@/models/Research";
import { validateResearchBody } from "@/lib/research-validation";

function isAdmin(session) {
  return session?.user?.role === "admin";
}

export async function GET() {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const query = isAdmin(session) ? {} : { isActive: true };
    const research = await Research.find(query).sort({ createdAt: -1 }).lean();
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
    return NextResponse.json({ research }, { status: 201 });
  } catch (error) {
    console.error("Error creating research:", error);
    return NextResponse.json(
      { message: "Failed to create research." },
      { status: 500 }
    );
  }
}
