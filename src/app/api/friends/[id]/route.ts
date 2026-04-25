import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json(
    { success: false, error: "Friends feature has been removed" },
    { status: 410 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Friends feature has been removed" },
    { status: 410 }
  );
}
