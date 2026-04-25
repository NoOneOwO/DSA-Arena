"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Trophy,
  Zap,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TopicData {
  id: string;
  name: string;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  totalSolved: number;
  xpEarned: number;
  children?: TopicData[];
}

interface TopicProgressProps {
  topics: TopicData[];
  totals: {
    easy: number;
    medium: number;
    hard: number;
    total: number;
    xp: number;
  };
}

const TARGET_PER_TOPIC = 20;

function DifficultyPill({
  label,
  count,
  className,
}: {
  label: string;
  count: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}: {count}
    </span>
  );
}

function TopicRow({
  topic,
  depth = 0,
}: {
  topic: TopicData;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = topic.children && topic.children.length > 0;
  const pct = Math.min(100, (topic.totalSolved / TARGET_PER_TOPIC) * 100);

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/40",
          depth > 0 && "ml-6 border-dashed"
        )}
      >
        <div className="flex items-center gap-3">
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </Button>
          ) : (
            <div className="w-6 shrink-0" />
          )}

          <span className="text-sm font-semibold flex-shrink-0 min-w-[130px]">
            {topic.name}
          </span>

          <div className="flex-1 min-w-0">
            <Progress value={pct} className="h-2" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
              {topic.totalSolved} solved
            </span>
            <Badge variant="secondary" className="text-xs tabular-nums">
              <Zap className="mr-1 h-3 w-3" />
              {topic.xpEarned}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-9">
          <DifficultyPill
            label="Easy"
            count={topic.easySolved}
            className="bg-green-500/10 text-green-700 dark:text-green-400"
          />
          <DifficultyPill
            label="Medium"
            count={topic.mediumSolved}
            className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
          />
          <DifficultyPill
            label="Hard"
            count={topic.hardSolved}
            className="bg-red-500/10 text-red-700 dark:text-red-400"
          />
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="space-y-2 mt-2">
          {topic.children!.map((child) => (
            <TopicRow key={child.id} topic={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </>
  );
}

export function TopicProgress({ topics, totals }: TopicProgressProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Topic Overview</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <div className="text-2xl font-bold tabular-nums">
              {totals.total}
            </div>
            <div className="text-xs text-muted-foreground">Total Solved</div>
          </div>
          <div className="rounded-lg border bg-green-500/5 p-3 text-center">
            <div className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">
              {totals.easy}
            </div>
            <div className="text-xs text-muted-foreground">Easy</div>
          </div>
          <div className="rounded-lg border bg-yellow-500/5 p-3 text-center">
            <div className="text-2xl font-bold tabular-nums text-yellow-600 dark:text-yellow-400">
              {totals.medium}
            </div>
            <div className="text-xs text-muted-foreground">Medium</div>
          </div>
          <div className="rounded-lg border bg-red-500/5 p-3 text-center">
            <div className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
              {totals.hard}
            </div>
            <div className="text-xs text-muted-foreground">Hard</div>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-lg border bg-primary/5 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold tabular-nums text-primary">
              <Trophy className="h-5 w-5" />
              {totals.xp.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total XP</div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          {topics.map((topic) => (
            <TopicRow key={topic.id} topic={topic} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
