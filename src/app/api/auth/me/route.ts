import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { xpToNextLevel } from "@/lib/xp";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const levelInfo = xpToNextLevel(user.xp);

    return NextResponse.json({
      success: true,
      data: { user: { ...user, levelInfo } },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
