import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { xpToNextLevel } from "@/lib/xp";
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

    const [topicProgress, todayActivities, weeklyActivities] = await Promise.all([
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

    const allActivities = await prisma.activity.findMany({
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const levelInfo = xpToNextLevel(user.xp);

    const recentActivity = allActivities.map((a) => ({
      id: a.id,
      userId: a.userId,
      username: a.user.username,
      displayName: a.user.displayName,
      avatarUrl: a.user.avatarUrl,
      type: a.type,
      message: a.message,
      createdAt: a.createdAt,
    }));

    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        xp: true,
        level: true,
        currentStreak: true,
      },
      orderBy: { xp: "desc" },
    });

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
        squad: allUsers,
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
