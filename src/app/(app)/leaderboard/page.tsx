"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

type SortBy = "xp" | "solved" | "streak";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  totalSolved: number;
  streak: number;
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-96" />
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("xp");

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/leaderboard?sortBy=${sortBy}`);
        if (!res.ok) throw new Error("Failed to load leaderboard");
        const json = await res.json();
        const entries = (json.data.leaderboard || []).map(
          (e: Record<string, unknown>) => ({
            rank: e.rank,
            userId: e.userId ?? e.id,
            username: e.username,
            displayName: e.displayName,
            avatarUrl: e.avatarUrl,
            xp: e.xp,
            level: e.level,
            totalSolved: e.totalSolved,
            streak: e.streak,
          })
        );
        setData(entries);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [sortBy]);

  if (loading && data.length === 0) return <LeaderboardSkeleton />;

  const tableEntries = data.map((e) => ({
    rank: e.rank,
    userId: e.userId,
    username: e.username,
    displayName: e.displayName,
    avatarUrl: e.avatarUrl,
    xp: e.xp,
    level: e.level,
    problemsSolved: e.totalSolved,
    streak: e.streak,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            See how you stack up against other arena warriors.
          </p>
        </div>
      </div>

      <Tabs
        value={sortBy}
        onValueChange={(v) => setSortBy(v as SortBy)}
      >
        <TabsList>
          <TabsTrigger value="xp">XP</TabsTrigger>
          <TabsTrigger value="solved">Problems Solved</TabsTrigger>
          <TabsTrigger value="streak">Streak</TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <LeaderboardTable entries={tableEntries} currentUserId={user?.id || ""} />
    </div>
  );
}
