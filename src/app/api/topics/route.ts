import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthPayload } from "@/lib/auth";
import { flattenTopics } from "@/lib/topics";
import { calculateXpFromCounts } from "@/lib/xp";

export async function GET(request: Request) {
  try {
    const auth = getAuthPayload(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const progressRecords = await prisma.topicProgress.findMany({
      where: { userId: auth.userId },
    });

    const progressMap = new Map(
      progressRecords.map((p) => [p.topicId, p])
    );

    const allTopics = flattenTopics();

    let grandTotalEasy = 0;
    let grandTotalMedium = 0;
    let grandTotalHard = 0;
    let grandTotalXp = 0;

    const topics = allTopics.map((topic) => {
      const progress = progressMap.get(topic.id);
      const easySolved = progress?.easySolved ?? 0;
      const mediumSolved = progress?.mediumSolved ?? 0;
      const hardSolved = progress?.hardSolved ?? 0;
      const totalSolved = easySolved + mediumSolved + hardSolved;
      const xpEarned = calculateXpFromCounts(easySolved, mediumSolved, hardSolved);

      grandTotalEasy += easySolved;
      grandTotalMedium += mediumSolved;
      grandTotalHard += hardSolved;
      grandTotalXp += xpEarned;

      return {
        id: topic.id,
        name: topic.name,
        parent: topic.parent,
        easySolved,
        mediumSolved,
        hardSolved,
        totalSolved,
        xpEarned,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        topics,
        totals: {
          easySolved: grandTotalEasy,
          mediumSolved: grandTotalMedium,
          hardSolved: grandTotalHard,
          totalSolved: grandTotalEasy + grandTotalMedium + grandTotalHard,
          totalXp: grandTotalXp,
        },
      },
    });
  } catch (error) {
    console.error("Get topics error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
