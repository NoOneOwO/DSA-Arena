"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type SortBy = "xp" | "solved" | "streak";

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "xp", label: "XP" },
  { value: "solved", label: "Problems Solved" },
  { value: "streak", label: "Streak" },
];

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
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("xp");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    async function fetchLeaderboard() {
      if (data.length > 0) setSwitching(true);
      else setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/leaderboard?sortBy=${sortBy}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load leaderboard");
        const json = await res.json();
        const entries = (json.data?.leaderboard || []).map(
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
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setSwitching(false);
        }
      }
    }

    fetchLeaderboard();
    return () => controller.abort();
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

      <div className="flex items-center gap-2">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSortBy(opt.value)}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                sortBy === opt.value
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:bg-background/50 hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {switching && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className={cn(switching && "opacity-60 transition-opacity")}>
        <LeaderboardTable
          entries={tableEntries}
          currentUserId={user?.id || ""}
        />
      </div>
    </div>
  );
}
