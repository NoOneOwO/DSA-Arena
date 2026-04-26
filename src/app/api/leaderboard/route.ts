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
    const sortBy = searchParams.get("sortBy") || "xp";

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        xp: true,
        level: true,
        currentStreak: true,
        topicProgress: {
          select: { easySolved: true, mediumSolved: true, hardSolved: true },
        },
      },
    });

    const usersWithStats = users.map((u) => {
      let totalSolved = 0;
      for (const p of u.topicProgress) {
        totalSolved += p.easySolved + p.mediumSolved + p.hardSolved;
      }
      const { topicProgress: _, ...rest } = u;
      return { ...rest, totalSolved };
    });

    if (sortBy === "solved") {
      usersWithStats.sort((a, b) => b.totalSolved - a.totalSolved);
    } else if (sortBy === "streak") {
      usersWithStats.sort((a, b) => b.currentStreak - a.currentStreak);
    } else {
      usersWithStats.sort((a, b) => b.xp - a.xp);
    }

    const leaderboard = usersWithStats.map((u, index) => ({
      rank: index + 1,
      userId: u.id,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      level: u.level,
      xp: u.xp,
      totalSolved: u.totalSolved,
      streak: u.currentStreak,
      isCurrentUser: u.id === user.id,
    }));

    const response = NextResponse.json({
      success: true,
      data: { leaderboard, sortBy },
    });
    response.headers.set(
      "Cache-Control",
      "private, s-maxage=30, stale-while-revalidate=60"
    );
    return response;
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
