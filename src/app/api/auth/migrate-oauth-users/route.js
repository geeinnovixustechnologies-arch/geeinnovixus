import { NextResponse } from "next/server";

function unavailable() {
  return NextResponse.json(
    { message: "This legacy migration endpoint is disabled." },
    { status: 410 }
  );
}

export const GET = unavailable;
export const POST = unavailable;
