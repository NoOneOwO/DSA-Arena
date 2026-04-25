import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Friends feature has been removed" },
    { status: 410 }
  );
}
