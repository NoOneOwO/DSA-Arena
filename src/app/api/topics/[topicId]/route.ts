import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";
import { getAllTopicIds, getTopicName } from "@/lib/topics";
import {
  calculateXpFromCounts,
  calculateLevel,
  DAILY_STREAK_BONUS,
  isSameDay,
} from "@/lib/xp";

const BADGE_CONDITIONS: { condition: string; check: (ctx: BadgeContext) => boolean }[] = [
  { condition: "problems_1", check: (ctx) => ctx.totalSolved >= 1 },
  { condition: "problems_100", check: (ctx) => ctx.totalSolved >= 100 },
  { condition: "hard_50", check: (ctx) => ctx.totalHard >= 50 },
  { condition: "streak_7", check: (ctx) => ctx.streak >= 7 },
  { condition: "xp_100", check: (ctx) => ctx.xp >= 100 },
];

interface BadgeContext {
  totalSolved: number;
  totalHard: number;
  streak: number;
  xp: number;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const auth = getAuthPayload(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { topicId } = await params;

    if (!getAllTopicIds().includes(topicId)) {
      return NextResponse.json(
        { success: false, error: "Invalid topic ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const easySolved = body.easySolved as number | undefined;
    const mediumSolved = body.mediumSolved as number | undefined;
    const hardSolved = body.hardSolved as number | undefined;

    if (
      (easySolved !== undefined && (easySolved < 0 || !Number.isInteger(easySolved))) ||
      (mediumSolved !== undefined && (mediumSolved < 0 || !Number.isInteger(mediumSolved))) ||
      (hardSolved !== undefined && (hardSolved < 0 || !Number.isInteger(hardSolved)))
    ) {
      return NextResponse.json(
        { success: false, error: "Counts must be non-negative integers" },
        { status: 400 }
      );
    }

    const updateData: Record<string, number> = {};
    if (easySolved !== undefined) updateData.easySolved = easySolved;
    if (mediumSolved !== undefined) updateData.mediumSolved = mediumSolved;
    if (hardSolved !== undefined) updateData.hardSolved = hardSolved;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    const [, user] = await Promise.all([
      prisma.topicProgress.upsert({
        where: { userId_topicId: { userId: auth.userId, topicId } },
        create: {
          userId: auth.userId,
          topicId,
          easySolved: easySolved ?? 0,
          mediumSolved: mediumSolved ?? 0,
          hardSolved: hardSolved ?? 0,
        },
        update: updateData,
      }),
      prisma.user.findUnique({
        where: { id: auth.userId },
        select: {
          id: true,
          xp: true,
          level: true,
          currentStreak: true,
          longestStreak: true,
          lastSolvedAt: true,
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const allProgress = await prisma.topicProgress.findMany({
      where: { userId: auth.userId },
    });

    let totalEasy = 0;
    let totalMedium = 0;
    let totalHard = 0;
    for (const p of allProgress) {
      totalEasy += p.easySolved;
      totalMedium += p.mediumSolved;
      totalHard += p.hardSolved;
    }
    const totalSolved = totalEasy + totalMedium + totalHard;
    let newXp = calculateXpFromCounts(totalEasy, totalMedium, totalHard);

    const now = new Date();
    let newStreak = user.currentStreak;
    let newLongestStreak = user.longestStreak;
    const alreadyLoggedToday = user.lastSolvedAt && isSameDay(new Date(user.lastSolvedAt), now);

    if (!alreadyLoggedToday) {
      if (user.lastSolvedAt) {
        const last = new Date(user.lastSolvedAt);
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (isSameDay(last, yesterday)) {
          newStreak = user.currentStreak + 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
      newLongestStreak = Math.max(newLongestStreak, newStreak);
      newXp += DAILY_STREAK_BONUS;
    }

    const newLevel = calculateLevel(newXp);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: newXp,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        ...(!alreadyLoggedToday ? { lastSolvedAt: now } : {}),
      },
      select: {
        id: true,
        xp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        lastSolvedAt: true,
      },
    });

    const topicName = getTopicName(topicId);

    await prisma.activity.create({
      data: {
        userId: user.id,
        type: "PROGRESS_UPDATE",
        message: `Updated ${topicName} progress`,
        metadata: { topicId, easySolved, mediumSolved, hardSolved },
      },
    });

    if (newLevel > user.level) {
      await prisma.activity.create({
        data: {
          userId: user.id,
          type: "LEVEL_UP",
          message: `Reached level ${newLevel}!`,
          metadata: { level: newLevel },
        },
      });
    }

    const badgeContext: BadgeContext = {
      totalSolved,
      totalHard,
      streak: newStreak,
      xp: newXp,
    };

    const existingBadges = await prisma.userBadge.findMany({
      where: { userId: user.id },
      select: { badge: { select: { condition: true } } },
    });
    const earnedConditions = new Set(existingBadges.map((ub) => ub.badge.condition));

    const newBadges: { name: string; description: string; icon: string }[] = [];

    for (const bc of BADGE_CONDITIONS) {
      if (earnedConditions.has(bc.condition) || !bc.check(badgeContext)) continue;

      const badge = await prisma.badge.findFirst({
        where: { condition: bc.condition },
      });
      if (!badge) continue;

      await prisma.userBadge.create({
        data: { userId: user.id, badgeId: badge.id },
      });

      await prisma.activity.create({
        data: {
          userId: user.id,
          type: "BADGE_EARNED",
          message: `Earned badge: ${badge.name}`,
          metadata: { badgeId: badge.id, badgeName: badge.name },
        },
      });

      newBadges.push({
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        stats: {
          totalSolved,
          easySolved: totalEasy,
          mediumSolved: totalMedium,
          hardSolved: totalHard,
          xp: newXp,
          level: newLevel,
        },
        newBadges,
      },
    });
  } catch (error) {
    console.error("Update topic progress error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
