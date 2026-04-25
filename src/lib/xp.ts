export const XP_PER_EASY = 10;
export const XP_PER_MEDIUM = 25;
export const XP_PER_HARD = 50;
export const DAILY_STREAK_BONUS = 5;
export const FIRST_LOG_BONUS = 10;

export function calculateLevel(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(xp / 100)));
}

export function xpForLevel(level: number): number {
  return level * level * 100;
}

export function xpToNextLevel(currentXp: number): {
  currentLevel: number;
  nextLevelXp: number;
  progress: number;
} {
  const currentLevel = calculateLevel(currentXp);
  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  const progress =
    ((currentXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  return {
    currentLevel,
    nextLevelXp,
    progress: Math.min(100, Math.max(0, progress)),
  };
}

export function calculateXpFromCounts(easy: number, medium: number, hard: number): number {
  return easy * XP_PER_EASY + medium * XP_PER_MEDIUM + hard * XP_PER_HARD;
}

export function isStreakActive(lastSolvedAt: Date | null): boolean {
  if (!lastSolvedAt) return false;
  const now = new Date();
  const last = new Date(lastSolvedAt);
  const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
  return diffHours < 48;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
