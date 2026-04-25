import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { isStreakActive } from "@/lib/xp";

const ALLOWED_USERS = ["prakhar", "taiyab", "satyam", "arham", "vivek"];
const ADMIN_USERS = ["taiyab", "satyam"];
const ADMIN_SECRET = "123";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, adminKey } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    const normalizedName = name.toLowerCase().trim();

    if (!ALLOWED_USERS.includes(normalizedName)) {
      return NextResponse.json(
        { success: false, error: "You're not in the squad!" },
        { status: 403 }
      );
    }

    if (ADMIN_USERS.includes(normalizedName)) {
      if (!adminKey || adminKey !== ADMIN_SECRET) {
        return NextResponse.json(
          { success: false, error: "Invalid secret key" },
          { status: 403 }
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: { username: normalizedName },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found in database. Please run the seed." },
        { status: 404 }
      );
    }

    if (!isStreakActive(user.lastSolvedAt)) {
      await prisma.user.update({
        where: { id: user.id },
        data: { currentStreak: 0 },
      });
      user.currentStreak = 0;
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const { password: _, ...userData } = user;

    const response = NextResponse.json({
      success: true,
      data: { user: userData },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
