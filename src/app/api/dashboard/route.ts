import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { xpToNextLevel } from "@/lib/xp";
import { getTopicName } from "@/lib/topics";
import { format, subDays } from "date-fns";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = subDays(todayStart, 6);

    const [
      topicProgress,
      todayActivities,
      weeklyActivities,
      friendships,
    ] = await Promise.all([
      prisma.topicProgress.findMany({
        where: { userId: user.id },
      }),
      prisma.activity.count({
        where: {
          userId: user.id,
          type: "PROGRESS_UPDATE",
          createdAt: { gte: todayStart },
        },
      }),
      prisma.activity.findMany({
        where: {
          userId: user.id,
          type: "PROGRESS_UPDATE",
          createdAt: { gte: weekAgo },
        },
        select: { createdAt: true },
      }),
      prisma.friendship.findMany({
        where: {
          status: "ACCEPTED",
          OR: [{ requesterId: user.id }, { addresseeId: user.id }],
        },
        select: { requesterId: true, addresseeId: true },
      }),
    ]);

    let totalSolved = 0;
    for (const p of topicProgress) {
      totalSolved += p.easySolved + p.mediumSolved + p.hardSolved;
    }

    const weeklyData: { day: string; count: number }[] = [];
    const dayCountMap = new Map<string, number>();

    for (const a of weeklyActivities) {
      const key = format(a.createdAt, "yyyy-MM-dd");
      dayCountMap.set(key, (dayCountMap.get(key) ?? 0) + 1);
    }

    for (let i = 6; i >= 0; i--) {
      const date = subDays(todayStart, i);
      const key = format(date, "yyyy-MM-dd");
      const dayLabel = format(date, "EEE");
      weeklyData.push({ day: dayLabel, count: dayCountMap.get(key) ?? 0 });
    }

    const friendIds = friendships.map((f) =>
      f.requesterId === user.id ? f.addresseeId : f.requesterId
    );

    let friendActivities: {
      id: string;
      userId: string;
      type: string;
      message: string;
      createdAt: Date;
      user: { id: string; username: string; displayName: string | null; avatarUrl: string | null };
    }[] = [];

    if (friendIds.length > 0) {
      friendActivities = await prisma.activity.findMany({
        where: { userId: { in: friendIds } },
        include: {
          user: {
            select: { id: true, username: true, displayName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    }

    const topicSummary = topicProgress
      .map((p) => ({
        id: p.topicId,
        name: getTopicName(p.topicId),
        totalSolved: p.easySolved + p.mediumSolved + p.hardSolved,
      }))
      .sort((a, b) => b.totalSolved - a.totalSolved)
      .slice(0, 3);

    const levelInfo = xpToNextLevel(user.xp);

    const recentActivity = friendActivities.map((a) => ({
      id: a.id,
      userId: a.userId,
      username: a.user.username,
      displayName: a.user.displayName,
      avatarUrl: a.user.avatarUrl,
      type: a.type,
      message: a.message,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        levelProgress: levelInfo.progress,
        nextLevelXp: levelInfo.nextLevelXp,
        problemsToday: todayActivities,
        totalSolved,
        weeklyData,
        recentActivity,
        topicSummary,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
