"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { CalendarDays, ExternalLink, Flame } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface TopicStat {
  id: string;
  name: string;
  totalSolved: number;
}

interface ProfileSummary {
  user: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
    level: number;
    xp: number;
    currentStreak: number;
    createdAt: string;
  };
  stats: {
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
  };
  topicBreakdown: TopicStat[];
}

interface UserHoverCardProps {
  username: string;
  children: React.ReactNode;
}

const profileCache = new Map<string, ProfileSummary>();

export function UserHoverCard({ username, children }: UserHoverCardProps) {
  const [data, setData] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const fetchedRef = useRef(false);

  const handleOpen = useCallback(
    (open: boolean) => {
      if (!open || fetchedRef.current) return;

      const cached = profileCache.get(username);
      if (cached) {
        setData(cached);
        fetchedRef.current = true;
        return;
      }

      fetchedRef.current = true;
      setLoading(true);
      setError(false);

      fetch(`/api/profile/${username}`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((json) => {
          const summary: ProfileSummary = json.data;
          profileCache.set(username, summary);
          setData(summary);
        })
        .catch(() => {
          setError(true);
          fetchedRef.current = false;
        })
        .finally(() => setLoading(false));
    },
    [username]
  );

  const topTopics = data?.topicBreakdown
    ?.filter((t) => t.totalSolved > 0)
    .sort((a, b) => b.totalSolved - a.totalSolved)
    .slice(0, 5);

  return (
    <HoverCard openDelay={300} closeDelay={200} onOpenChange={handleOpen}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-80" side="right" align="start">
        {loading && <HoverCardSkeleton />}
        {error && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Failed to load profile.
          </p>
        )}
        {data && !loading && (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                {data.user.avatarUrl && (
                  <AvatarImage
                    src={data.user.avatarUrl}
                    alt={data.user.username}
                  />
                )}
                <AvatarFallback className="text-xs">
                  {getInitials(
                    data.user.displayName || data.user.username
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {data.user.displayName || data.user.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{data.user.username}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Lv. {data.user.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {data.user.xp.toLocaleString()} XP
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                {data.user.currentStreak}d streak
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {new Date(data.user.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center rounded-md bg-muted/50 p-2">
              <div>
                <div className="text-sm font-bold tabular-nums">
                  {data.stats.totalSolved}
                </div>
                <div className="text-[10px] text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-sm font-bold tabular-nums text-green-600 dark:text-green-400">
                  {data.stats.easySolved}
                </div>
                <div className="text-[10px] text-muted-foreground">Easy</div>
              </div>
              <div>
                <div className="text-sm font-bold tabular-nums text-yellow-600 dark:text-yellow-400">
                  {data.stats.mediumSolved}
                </div>
                <div className="text-[10px] text-muted-foreground">Medium</div>
              </div>
              <div>
                <div className="text-sm font-bold tabular-nums text-red-600 dark:text-red-400">
                  {data.stats.hardSolved}
                </div>
                <div className="text-[10px] text-muted-foreground">Hard</div>
              </div>
            </div>

            {topTopics && topTopics.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Top Topics
                </p>
                {topTopics.map((topic) => (
                  <div key={topic.id} className="flex items-center gap-2">
                    <span className="text-xs truncate flex-1">
                      {topic.name}
                    </span>
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {topic.totalSolved} solved
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Link
              href={`/profile/${data.user.username}`}
              className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              View Full Profile
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}

function HoverCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-14 w-full rounded-md" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}
