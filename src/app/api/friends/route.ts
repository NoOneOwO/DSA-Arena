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

    const friendships = await prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: user.id }, { addresseeId: user.id }],
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            xp: true,
            level: true,
            currentStreak: true,
            topicProgress: true,
          },
        },
        addressee: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            xp: true,
            level: true,
            currentStreak: true,
            topicProgress: true,
          },
        },
      },
    });

    const friends = friendships.map((f) => {
      const friend =
        f.requesterId === user.id ? f.addressee : f.requester;

      const totalSolved = friend.topicProgress.reduce(
        (sum, tp) => sum + tp.easySolved + tp.mediumSolved + tp.hardSolved,
        0
      );

      const { topicProgress: _, ...friendData } = friend;

      return {
        friendshipId: f.id,
        ...friendData,
        problemsSolved: totalSolved,
      };
    });

    return NextResponse.json({
      success: true,
      data: { friends },
    });
  } catch (error) {
    console.error("Get friends error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
