import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const friendsOnly = searchParams.get("friendsOnly") === "true";
    const before = searchParams.get("before");
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const friendships = await prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: user.id }, { addresseeId: user.id }],
      },
      select: { requesterId: true, addresseeId: true },
    });

    const friendIds = friendships.map((f) =>
      f.requesterId === user.id ? f.addresseeId : f.requesterId
    );

    const userIds = friendsOnly ? friendIds : [user.id, ...friendIds];

    if (userIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { activities: [], nextCursor: null },
      });
    }

    const where: Record<string, unknown> = {
      userId: { in: userIds },
    };

    if (before) {
      where.createdAt = { lt: new Date(before) };
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
    });

    const hasMore = activities.length > limit;
    const items = hasMore ? activities.slice(0, limit) : activities;
    const nextCursor = hasMore
      ? items[items.length - 1].createdAt.toISOString()
      : null;

    return NextResponse.json({
      success: true,
      data: { activities: items, nextCursor },
    });
  } catch (error) {
    console.error("Get activities error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
