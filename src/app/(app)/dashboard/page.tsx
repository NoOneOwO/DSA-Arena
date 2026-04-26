"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/use-auth";
import { StatsOverview } from "@/components/dashboard/stats-overview";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Skeleton } from "@/components/ui/skeleton";

const WeeklyGraph = dynamic(
  () => import("@/components/dashboard/weekly-graph").then((m) => m.WeeklyGraph),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[280px] w-full rounded-lg" />,
  }
);
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Flame, Trophy } from "lucide-react";

interface SquadMember {
  id: string;
  username: string;
  displayName: string | null;
  xp: number;
  level: number;
  currentStreak: number;
}

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
  squad: SquadMember[];
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
          Welcome back,{" "}
          <span className="gradient-text">
            {user?.displayName || user?.username}
          </span>
          !
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

          {data.squad && data.squad.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-primary" />
                  The Squad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {data.squad.map((member, idx) => {
                    const isCurrentUser = member.username === user?.username;
                    return (
                      <div
                        key={member.id}
                        className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                          isCurrentUser
                            ? "border-primary/30 bg-primary/5"
                            : "border-border bg-card"
                        }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {idx === 0 ? (
                            <Crown className="h-4 w-4" />
                          ) : (
                            (member.displayName || member.username)[0]
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {member.displayName || member.username}
                            {isCurrentUser && (
                              <span className="text-primary ml-1">(you)</span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Lv.{member.level}</span>
                            <span>&middot;</span>
                            <span>{member.xp} XP</span>
                            {member.currentStreak > 0 && (
                              <>
                                <span>&middot;</span>
                                <span className="flex items-center gap-0.5">
                                  <Flame className="h-3 w-3 text-orange-500" />
                                  {member.currentStreak}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

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
