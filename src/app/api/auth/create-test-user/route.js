import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Public account creation is not available." },
    { status: 410 }
  );
}
