"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakCard({ currentStreak, longestStreak }: StreakCardProps) {
  const isActive = currentStreak > 0;
  const isOnFire = currentStreak >= 7;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-shadow",
        isOnFire && "shadow-lg shadow-orange-500/20 border-orange-500/30"
      )}
    >
      {isOnFire && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 pointer-events-none" />
      )}
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Streak</CardTitle>
        <span className={cn("text-2xl", isActive ? "grayscale-0" : "grayscale opacity-40")}>
          🔥
        </span>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-3xl font-bold tabular-nums",
            !isActive && "text-muted-foreground"
          )}
        >
          {currentStreak}
        </div>
        <p className={cn("text-xs", isActive ? "text-muted-foreground" : "text-muted-foreground/60")}>
          {isActive ? "day streak" : "no active streak"}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Longest: {longestStreak} days
        </p>
      </CardContent>
    </Card>
  );
}
