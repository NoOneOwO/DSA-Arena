"use client";

import { StreakCard } from "./streak-card";
import { XpCard } from "./xp-card";
import { LevelCard } from "./level-card";
import { ProblemsTodayCard } from "./problems-today-card";

interface StatsOverviewProps {
  currentStreak: number;
  longestStreak: number;
  xp: number;
  level: number;
  levelProgress: number;
  nextLevelXp: number;
  solvedToday: number;
}

export function StatsOverview({
  currentStreak,
  longestStreak,
  xp,
  level,
  levelProgress,
  nextLevelXp,
  solvedToday,
}: StatsOverviewProps) {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <StreakCard currentStreak={currentStreak} longestStreak={longestStreak} />
      <XpCard
        xp={xp}
        level={level}
        progress={levelProgress}
        nextLevelXp={nextLevelXp}
      />
      <LevelCard level={level} xp={xp} />
      <ProblemsTodayCard count={solvedToday} />
    </div>
  );
}
