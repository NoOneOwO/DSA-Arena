"use client";

import { useState, useCallback } from "react";
import { Minus, Plus, Save, Loader2, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TopicCardProps {
  topic: {
    id: string;
    name: string;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
  };
  onSave: (
    topicId: string,
    counts: { easySolved: number; mediumSolved: number; hardSolved: number }
  ) => Promise<void>;
}

const XP = { easy: 10, medium: 25, hard: 50 } as const;

const TOPIC_COLORS: Record<string, string> = {
  arrays: "from-blue-500/20 to-blue-600/5 border-blue-500/30",
  strings: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
  "linked-list": "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30",
  stack: "from-amber-500/20 to-amber-600/5 border-amber-500/30",
  queue: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/30",
  recursion: "from-pink-500/20 to-pink-600/5 border-pink-500/30",
  "binary-search": "from-sky-500/20 to-sky-600/5 border-sky-500/30",
  trees: "from-green-500/20 to-green-600/5 border-green-500/30",
  heap: "from-orange-500/20 to-orange-600/5 border-orange-500/30",
  hashing: "from-teal-500/20 to-teal-600/5 border-teal-500/30",
  graphs: "from-amber-500/20 to-amber-600/5 border-amber-500/30",
  "dynamic-programming": "from-rose-500/20 to-rose-600/5 border-rose-500/30",
  greedy: "from-lime-500/20 to-lime-600/5 border-lime-500/30",
  backtracking: "from-fuchsia-500/20 to-fuchsia-600/5 border-fuchsia-500/30",
  "sliding-window": "from-sky-500/20 to-sky-600/5 border-sky-500/30",
  "two-pointers": "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30",
  "bit-manipulation": "from-red-500/20 to-red-600/5 border-red-500/30",
};

const ACCENT_DOTS: Record<string, string> = {
  arrays: "bg-blue-500",
  strings: "bg-emerald-500",
  "linked-list": "bg-yellow-500",
  stack: "bg-amber-500",
  queue: "bg-cyan-500",
  recursion: "bg-pink-500",
  "binary-search": "bg-sky-500",
  trees: "bg-green-500",
  heap: "bg-orange-500",
  hashing: "bg-teal-500",
  graphs: "bg-amber-500",
  "dynamic-programming": "bg-rose-500",
  greedy: "bg-lime-500",
  backtracking: "bg-fuchsia-500",
  "sliding-window": "bg-sky-500",
  "two-pointers": "bg-yellow-500",
  "bit-manipulation": "bg-red-500",
};

interface CounterRowProps {
  label: string;
  count: number;
  onChange: (n: number) => void;
  colorClass: string;
  badgeClass: string;
}

function CounterRow({
  label,
  count,
  onChange,
  colorClass,
  badgeClass,
}: CounterRowProps) {
  return (
    <div className="flex items-center justify-between">
      <Badge variant="outline" className={cn("text-xs font-semibold", badgeClass)}>
        {label}
      </Badge>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className={cn("h-7 w-7 rounded-full", colorClass)}
          onClick={() => onChange(Math.max(0, count - 1))}
          disabled={count === 0}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center text-sm font-bold tabular-nums">
          {count}
        </span>
        <Button
          variant="outline"
          size="icon"
          className={cn("h-7 w-7 rounded-full", colorClass)}
          onClick={() => onChange(count + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function TopicCard({ topic, onSave }: TopicCardProps) {
  const [easy, setEasy] = useState(topic.easySolved);
  const [medium, setMedium] = useState(topic.mediumSolved);
  const [hard, setHard] = useState(topic.hardSolved);
  const [saving, setSaving] = useState(false);

  const hasChanges =
    easy !== topic.easySolved ||
    medium !== topic.mediumSolved ||
    hard !== topic.hardSolved;

  const totalSolved = easy + medium + hard;
  const xpEarned = easy * XP.easy + medium * XP.medium + hard * XP.hard;

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onSave(topic.id, {
        easySolved: easy,
        mediumSolved: medium,
        hardSolved: hard,
      });
    } finally {
      setSaving(false);
    }
  }, [topic.id, easy, medium, hard, onSave]);

  const gradientClass =
    TOPIC_COLORS[topic.id] ??
    "from-primary/20 to-primary/5 border-primary/30";
  const dotClass = ACCENT_DOTS[topic.id] ?? "bg-primary";

  return (
    <Card
      className={cn(
        "bg-gradient-to-br transition-shadow hover:shadow-md",
        gradientClass
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("h-2.5 w-2.5 rounded-full", dotClass)} />
            <CardTitle className="text-base">{topic.name}</CardTitle>
          </div>
          <Badge
            variant="secondary"
            className="tabular-nums gap-1 text-xs font-semibold"
          >
            <Zap className="h-3 w-3 text-yellow-500" />
            {xpEarned} XP
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <CounterRow
          label="Easy"
          count={easy}
          onChange={setEasy}
          colorClass="border-green-500/40 hover:bg-green-500/10"
          badgeClass="border-green-500/40 text-green-700 dark:text-green-400"
        />
        <CounterRow
          label="Medium"
          count={medium}
          onChange={setMedium}
          colorClass="border-yellow-500/40 hover:bg-yellow-500/10"
          badgeClass="border-yellow-500/40 text-yellow-700 dark:text-yellow-400"
        />
        <CounterRow
          label="Hard"
          count={hard}
          onChange={setHard}
          colorClass="border-red-500/40 hover:bg-red-500/10"
          badgeClass="border-red-500/40 text-red-700 dark:text-red-400"
        />
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-0">
        <span className="text-xs text-muted-foreground tabular-nums">
          {totalSolved} solved
        </span>
        {hasChanges && (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-1.5"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
