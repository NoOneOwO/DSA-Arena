import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

interface LeetCodeStats {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
}

interface CodeforcesStats {
  username: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  contribution: number;
}

async function fetchLeetCodeStats(
  username: string
): Promise<LeetCodeStats | null> {
  try {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query userProfile($username: String!) {
          matchedUser(username: $username) {
            profile { ranking }
            submitStatsGlobal {
              acSubmissionNum { difficulty count }
            }
          }
        }`,
        variables: { username },
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const json = await res.json();
    const user = json?.data?.matchedUser;
    if (!user) return null;

    const stats = user.submitStatsGlobal?.acSubmissionNum || [];
    const getCount = (diff: string) =>
      stats.find((s: { difficulty: string; count: number }) => s.difficulty === diff)?.count ?? 0;

    return {
      username,
      totalSolved: getCount("All"),
      easySolved: getCount("Easy"),
      mediumSolved: getCount("Medium"),
      hardSolved: getCount("Hard"),
      ranking: user.profile?.ranking ?? 0,
    };
  } catch {
    return null;
  }
}

async function fetchCodeforcesStats(
  username: string
): Promise<CodeforcesStats | null> {
  try {
    const res = await fetch(
      `https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`,
      { signal: AbortSignal.timeout(8000) }
    );

    if (!res.ok) return null;
    const json = await res.json();
    if (json.status !== "OK" || !json.result?.[0]) return null;

    const u = json.result[0];
    return {
      username,
      rating: u.rating ?? 0,
      maxRating: u.maxRating ?? 0,
      rank: u.rank ?? "unrated",
      maxRank: u.maxRank ?? "unrated",
      contribution: u.contribution ?? 0,
    };
  } catch {
    return null;
  }
}

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
    const leetcodeUsername = searchParams.get("leetcode");
    const codeforcesUsername = searchParams.get("codeforces");

    const [leetcode, codeforces] = await Promise.all([
      leetcodeUsername ? fetchLeetCodeStats(leetcodeUsername) : null,
      codeforcesUsername ? fetchCodeforcesStats(codeforcesUsername) : null,
    ]);

    return NextResponse.json({
      success: true,
      data: { leetcode, codeforces },
    });
  } catch (error) {
    console.error("Competitive stats error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
