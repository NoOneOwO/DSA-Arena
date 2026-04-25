import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { flattenTopics } from "@/lib/topics";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { username } = await params;

    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        xp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const [topicProgress, userBadges, allBadges, activities] = await Promise.all([
      prisma.topicProgress.findMany({
        where: { userId: targetUser.id },
      }),
      prisma.userBadge.findMany({
        where: { userId: targetUser.id },
        include: {
          badge: {
            select: { id: true, name: true, description: true, icon: true },
          },
        },
        orderBy: { earnedAt: "desc" },
      }),
      prisma.badge.findMany({
        select: { id: true, name: true, description: true, icon: true },
      }),
      prisma.activity.findMany({
        where: { userId: targetUser.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const progressMap = new Map(
      topicProgress.map((p) => [p.topicId, p])
    );

    let totalSolved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    for (const p of topicProgress) {
      easySolved += p.easySolved;
      mediumSolved += p.mediumSolved;
      hardSolved += p.hardSolved;
    }
    totalSolved = easySolved + mediumSolved + hardSolved;

    const allTopics = flattenTopics();
    const topicBreakdown = allTopics.map((t) => {
      const progress = progressMap.get(t.id);
      return {
        id: t.id,
        name: t.name,
        parent: t.parent,
        easySolved: progress?.easySolved ?? 0,
        mediumSolved: progress?.mediumSolved ?? 0,
        hardSolved: progress?.hardSolved ?? 0,
        totalSolved: (progress?.easySolved ?? 0) + (progress?.mediumSolved ?? 0) + (progress?.hardSolved ?? 0),
      };
    });

    const earnedBadges = userBadges.map((ub) => ({
      ...ub.badge,
      earnedAt: ub.earnedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        user: targetUser,
        stats: {
          totalSolved,
          easySolved,
          mediumSolved,
          hardSolved,
        },
        topicBreakdown,
        earnedBadges,
        allBadges,
        recentActivity: activities,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
