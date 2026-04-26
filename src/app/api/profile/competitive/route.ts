import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function PATCH(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { leetcodeUsername, codeforcesUsername } = body;

    const updateData: Record<string, string | null> = {};

    if (leetcodeUsername !== undefined) {
      updateData.leetcodeUsername = leetcodeUsername?.trim() || null;
    }
    if (codeforcesUsername !== undefined) {
      updateData.codeforcesUsername = codeforcesUsername?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        leetcodeUsername: true,
        codeforcesUsername: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Update competitive profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
