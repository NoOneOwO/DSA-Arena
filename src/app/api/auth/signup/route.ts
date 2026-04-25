import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Signup is disabled. Use the name-based login." },
    { status: 410 }
  );
}
