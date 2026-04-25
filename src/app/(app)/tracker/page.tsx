"use client";

import { useEffect, useState, useCallback } from "react";
import { Target, Zap, Trophy, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useConfetti } from "@/hooks/use-confetti";
import { TopicCard } from "@/components/problems/topic-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DSA_TOPICS } from "@/lib/topics";

interface TopicData {
  id: string;
  name: string;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSolved: number;
  xpEarned: number;
}

interface TopicTotals {
  easy: number;
  medium: number;
  hard: number;
  total: number;
  xp: number;
}

interface ApiResponse {
  success: boolean;
  data: {
    topics: TopicData[];
    totals: TopicTotals;
  };
}

function TrackerSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-52" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    </div>
  );
}

function StatBadge({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border bg-card p-3 text-center shadow-sm">
      <Icon className={`h-5 w-5 ${className ?? "text-muted-foreground"}`} />
      <span className="text-2xl font-bold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function TrackerPage() {
  const { isAuthenticated } = useAuth();
  const { fire } = useConfetti();
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [totals, setTotals] = useState<TopicTotals>({
    easy: 0,
    medium: 0,
    hard: 0,
    total: 0,
    xp: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTopics = useCallback(async () => {
    try {
      const res = await fetch("/api/topics");
      if (!res.ok) throw new Error("Failed to load topics");
      const json = await res.json();
      setTopics(json.data.topics);
      const t = json.data.totals || {};
      setTotals({
        easy: t.easySolved ?? t.easy ?? 0,
        medium: t.mediumSolved ?? t.medium ?? 0,
        hard: t.hardSolved ?? t.hard ?? 0,
        total: t.totalSolved ?? t.total ?? 0,
        xp: t.totalXp ?? t.xp ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchTopics();
  }, [isAuthenticated, fetchTopics]);

  const handleSave = useCallback(
    async (
      topicId: string,
      counts: { easySolved: number; mediumSolved: number; hardSolved: number }
    ) => {
      const res = await fetch(`/api/topics/${topicId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(counts),
      });
      if (!res.ok) throw new Error("Failed to save");
      fire();
      await fetchTopics();
    },
    [fire, fetchTopics]
  );

  if (loading) return <TrackerSkeleton />;

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  const topicMap = new Map(topics.map((t) => [t.id, t]));

  const buildCardTopic = (id: string, name: string) => ({
    id,
    name,
    easySolved: topicMap.get(id)?.easySolved ?? 0,
    mediumSolved: topicMap.get(id)?.mediumSolved ?? 0,
    hardSolved: topicMap.get(id)?.hardSolved ?? 0,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            DSA Tracker
          </h1>
          <p className="text-muted-foreground">
            Track your progress across all DSA topics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatBadge
          icon={TrendingUp}
          label="Total Solved"
          value={totals.total}
          className="text-primary"
        />
        <StatBadge
          icon={Target}
          label="Easy"
          value={totals.easy}
          className="text-green-500"
        />
        <StatBadge
          icon={Target}
          label="Medium"
          value={totals.medium}
          className="text-yellow-500"
        />
        <StatBadge
          icon={Target}
          label="Hard"
          value={totals.hard}
          className="text-red-500"
        />
        <div className="col-span-2 sm:col-span-1 flex flex-col items-center gap-1 rounded-xl border bg-card p-3 text-center shadow-sm">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <span className="text-2xl font-bold tabular-nums">
            {totals.xp.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">Total XP</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DSA_TOPICS.map((dsaTopic) => (
          <div key={dsaTopic.id} className="space-y-3">
            <TopicCard
              topic={buildCardTopic(dsaTopic.id, dsaTopic.name)}
              onSave={handleSave}
            />
            {dsaTopic.children && dsaTopic.children.length > 0 && (
              <div className="ml-4 space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <div className="h-px flex-1 bg-border" />
                  <Badge variant="outline" className="text-[10px]">
                    Subtopics
                  </Badge>
                  <div className="h-px flex-1 bg-border" />
                </div>
                {dsaTopic.children.map((child) => (
                  <TopicCard
                    key={child.id}
                    topic={buildCardTopic(child.id, child.name)}
                    onSave={handleSave}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
