"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { WeeklyGraph } from "@/components/dashboard/weekly-graph";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  currentStreak: number;
  longestStreak: number;
  xp: number;
  level: number;
  levelProgress: number;
  nextLevelXp: number;
  problemsToday: number;
  totalSolved: number;
  weeklyData: { day: string; count: number }[];
  recentActivity: {
    id: string;
    userId: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    type: string;
    message: string;
    createdAt: string;
  }[];
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Skeleton className="h-80 lg:col-span-3" />
        <Skeleton className="h-80 lg:col-span-2" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to load dashboard");
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, {user?.displayName || user?.username}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your DSA progress overview.
        </p>
      </div>

      {data && (
        <>
          <StatsOverview
            currentStreak={data.currentStreak}
            longestStreak={data.longestStreak}
            xp={data.xp}
            level={data.level}
            levelProgress={data.levelProgress}
            nextLevelXp={data.nextLevelXp}
            solvedToday={data.problemsToday}
          />

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <WeeklyGraph data={data.weeklyData} />
            </div>
            <div className="lg:col-span-2">
              <ActivityFeed activities={data.recentActivity} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
