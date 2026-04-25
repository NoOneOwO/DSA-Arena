"use client";

import { CalendarDays, Flame } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";

interface ProfileHeaderProps {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  currentStreak: number;
  memberSince: string | Date;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

function getLevelTier(level: number) {
  if (level >= 20) return { label: "Grandmaster", color: "text-red-500 border-red-500/30" };
  if (level >= 15) return { label: "Master", color: "text-purple-500 border-purple-500/30" };
  if (level >= 10) return { label: "Expert", color: "text-blue-500 border-blue-500/30" };
  if (level >= 5) return { label: "Intermediate", color: "text-green-500 border-green-500/30" };
  return { label: "Beginner", color: "text-muted-foreground" };
}

export function ProfileHeader({
  username,
  displayName,
  avatarUrl,
  level,
  xp,
  currentStreak,
  memberSince,
  totalSolved,
  easySolved,
  mediumSolved,
  hardSolved,
}: ProfileHeaderProps) {
  const tier = getLevelTier(level);
  const joinDate = new Date(memberSince).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
            <AvatarFallback className="text-2xl font-bold">
              {getInitials(displayName || username)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-2xl font-bold">
                {displayName || username}
              </h1>
              <p className="text-muted-foreground">@{username}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Level {level}</Badge>
              <Badge variant="outline" className={tier.color}>
                {tier.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {xp.toLocaleString()} XP
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-500" />
                {currentStreak} day streak
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                Member since {joinDate}
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold tabular-nums">{totalSolved}</div>
            <div className="text-xs text-muted-foreground">Total Solved</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">
              {easySolved}
            </div>
            <div className="text-xs text-muted-foreground">Easy</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-yellow-600 dark:text-yellow-400">
              {mediumSolved}
            </div>
            <div className="text-xs text-muted-foreground">Medium</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-red-600 dark:text-red-400">
              {hardSolved}
            </div>
            <div className="text-xs text-muted-foreground">Hard</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
